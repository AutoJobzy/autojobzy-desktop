# 🗄️ SQLite Setup for Desktop App Distribution

## Why SQLite for Desktop?

**Desktop apps need self-contained databases:**
- Users don't have MySQL installed
- AWS RDS not accessible from user machines
- Need zero-configuration setup

**SQLite benefits:**
- ✅ No installation needed
- ✅ Single file database
- ✅ Works offline
- ✅ Perfect for desktop apps
- ✅ Auto-created on first run

---

## Installation

```bash
npm install sqlite3
```

**Note:** sqlite3 already works with Sequelize!

---

## Configuration Changes

### Step 1: Detect Desktop Mode

Update `electron/server.js`:

```javascript
// Add environment variable
serverProcess = spawn(process.execPath, [serverPath], {
  cwd: workingDir,
  env: {
    ...process.env,
    NODE_ENV: isDev ? 'development' : 'production',
    ELECTRON_RUN_AS_NODE: '1',
    IS_DESKTOP_APP: '1',  // ← NEW: Mark as desktop
  },
  stdio: ['inherit', 'inherit', 'inherit'],
});
```

### Step 2: Update Database Config

**File: `server/db/config.js`**

```javascript
import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Check if running in desktop app
const IS_DESKTOP = process.env.IS_DESKTOP_APP === '1';

let sequelize;

if (IS_DESKTOP) {
  // Desktop mode: Use SQLite
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const dbPath = path.join(__dirname, '../../data/autojobzy.db');

  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log('📦 Desktop mode: Using SQLite database');
  console.log('📁 Database file:', dbPath);

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  });
} else {
  // Web/Production mode: Use MySQL
  const DB_NAME = process.env.DB_NAME || 'jobautomate';
  const DB_USER = process.env.DB_USER || 'admin';
  const DB_PASSWORD = process.env.DB_PASSWORD || 'YsjlUaX5yFJGtZqjmrSj';
  const DB_HOST = process.env.DB_HOST || 'database-1.c72i2s6muax7.ap-south-1.rds.amazonaws.com';
  const DB_PORT = process.env.DB_PORT || 3306;

  console.log('☁️  Web mode: Using MySQL database');

  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      connectTimeout: 60000,
      ssl: {
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  });
}

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: false });
    console.log('✅ Database tables synced');

    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize;
```

---

## Model Compatibility

**Good News:** Your existing Sequelize models work with SQLite!

**Changes needed:** None! Sequelize automatically adapts.

**SQLite limitations (minor):**
- No BIGINT (uses INTEGER instead)
- No ENUM (uses TEXT with validation)
- Sequelize handles this automatically!

---

## Data Location

**Database file stored in:**

**Mac:**
```
~/Library/Application Support/autojobzy/data/autojobzy.db
```

**Windows:**
```
C:\Users\[Username]\AppData\Roaming\autojobzy\data\autojobzy.db
```

**Linux:**
```
~/.config/autojobzy/data/autojobzy.db
```

---

## Testing

### Test Development Mode (MySQL):

```bash
npm run electron:dev
# Should use MySQL (AWS RDS)
```

### Test Production Mode (SQLite):

```bash
npm run electron:build:mac
open dist-electron/AutoJobzy-1.0.0-arm64.dmg
# Should use SQLite
```

**Check logs:**
```
📦 Desktop mode: Using SQLite database
📁 Database file: /Users/.../autojobzy.db
✅ Database connection established successfully
```

---

## Build Configuration

Update `electron-builder.yml`:

```yaml
# Include sqlite3 native module
asarUnpack:
  - "**/*.node"
  - "**/node_modules/puppeteer/**/*"
  - "**/node_modules/sqlite3/**/*"  # ← Add this
  - "server/**/*"
  - "node_modules/**/*"
  - ".env"

# Create data directory
extraResources:
  - from: server
    to: server
    filter:
      - "**/*"
  - from: node_modules/puppeteer/.local-chromium
    to: .local-chromium
    filter:
      - "**/*"
```

---

## Advantages

### For Users:
- ✅ Install app → Works immediately
- ✅ No database setup needed
- ✅ No configuration required
- ✅ Data stays private (local machine)
- ✅ Works offline

### For You:
- ✅ Easier distribution
- ✅ No AWS RDS costs for users
- ✅ Simpler support
- ✅ Cross-platform compatible

---

## Hybrid Approach (Best of Both)

**For Desktop App:** SQLite (local data)
**For Web App:** MySQL (centralized data)
**Optional:** Sync to cloud when online

**Architecture:**
```
Desktop App → SQLite (primary)
     ↓ (optional sync)
Your API Server → MySQL (backup/cloud)
```

---

## Migration Path

**If users want to sync data:**

1. Desktop app saves to SQLite (fast, offline)
2. Background sync sends data to your API
3. Your API saves to MySQL (cloud backup)
4. Admin panel shows aggregated data

**Benefits:**
- Works offline
- Data backed up in cloud
- Best of both worlds

---

## Complete Setup Commands

```bash
# 1. Install SQLite
npm install sqlite3

# 2. Update config files (code above)

# 3. Test development
npm run electron:dev

# 4. Build for production
npm run electron:build:mac

# 5. Test built app
open dist-electron/AutoJobzy-1.0.0-arm64.dmg

# 6. Check database created
ls -la ~/Library/Application\ Support/autojobzy/data/
```

---

## Troubleshooting

### Issue: "Cannot find module 'sqlite3'"

```bash
npm install sqlite3 --save
npm rebuild sqlite3
```

### Issue: Database not created

Check permissions:
```bash
# Mac/Linux
chmod -R 755 ~/Library/Application\ Support/autojobzy/

# Windows
# Folder should be automatically writable
```

### Issue: sqlite3 native module error

```bash
# Rebuild for Electron
npm install --save-dev electron-rebuild
npx electron-rebuild
```

---

## Summary

**Current Setup (Web):**
```
App → AWS RDS MySQL ❌ (Won't work for desktop users)
```

**New Setup (Desktop):**
```
App → SQLite file ✅ (Works for everyone!)
```

**Distribution:**
1. User installs app
2. App starts → Backend starts automatically
3. Backend creates SQLite database automatically
4. Everything works!

**Zero configuration needed from user!** 🎉
