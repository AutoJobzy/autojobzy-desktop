# ⚡ Electron Desktop Conversion - Quick Start

## 🎯 What You Need to Do

**3 Simple Steps:**

1. Install dependencies
2. Update package.json
3. Build the EXE

**Time Required:** 15-30 minutes

---

## 📋 Quick Commands

### 1. Install Dependencies

```bash
npm install --save-dev electron electron-builder wait-on cross-env
```

### 2. Update package.json

Add these scripts to your `package.json`:

```json
{
  "main": "electron/main.js",
  "scripts": {
    "electron:dev": "cross-env NODE_ENV=development concurrently \"npm run server\" \"vite --config vite.config.electron.ts\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "vite build --config vite.config.electron.ts && electron-builder --config electron-builder.yml",
    "electron:build:win": "vite build --config vite.config.electron.ts && electron-builder --win --config electron-builder.yml"
  },
  "build": {
    "appId": "com.autojobzy.app",
    "productName": "AutoJobzy",
    "extends": "electron-builder.yml"
  }
}
```

### 3. Create Icon (Optional but Recommended)

```bash
mkdir build
# Add icon.ico file to build/ folder (256x256px recommended)
```

### 4. Test in Development

```bash
npm run electron:dev
```

### 5. Build Production EXE

```bash
npm run electron:build:win
```

**Output:** `dist-electron/AutoJobzy-Setup-1.0.0.exe`

---

## 📁 Files Already Created

All necessary files have been created in your project:

✅ **electron/main.js** - Main Electron process
✅ **electron/preload.js** - IPC bridge
✅ **electron/server.js** - Backend manager
✅ **electron-builder.yml** - Build configuration
✅ **vite.config.electron.ts** - Electron-compatible Vite config
✅ **electron.d.ts** - TypeScript definitions

---

## 🔧 Configuration Files

### Vite Config

Use `vite.config.electron.ts` for Electron builds:

```bash
vite --config vite.config.electron.ts
```

Key differences from regular Vite config:
- `base: './'` - Relative paths for Electron
- Port 5173 for dev server

### Electron Builder Config

Configuration is in `electron-builder.yml`:
- Windows installer (NSIS)
- Includes all server files
- Bundles Puppeteer Chromium
- Creates desktop shortcuts

---

## 🚀 Development Workflow

### Start Development Mode

```bash
npm run electron:dev
```

This starts:
1. Express backend (port 5000)
2. Vite dev server (port 5173)
3. Electron window

**Hot reload works** - Changes to React code refresh automatically.

### Debug

- **Backend logs:** Check terminal where `npm run electron:dev` runs
- **Frontend logs:** Open DevTools (F12) in Electron window
- **Electron logs:** Check terminal for main process logs

---

## 📦 Production Build Workflow

### Windows Build

```bash
# Build React UI
npm run build

# OR use combined command:
npm run electron:build:win
```

### Build Output

```
dist-electron/
├── AutoJobzy-Setup-1.0.0.exe    ← Installer
├── win-unpacked/                ← Unpacked app files
└── builder-effective-config.yaml
```

### Distribution

**Option 1: Direct Distribution**
- Share `AutoJobzy-Setup-1.0.0.exe` with users
- Users download and install
- App runs fully locally

**Option 2: With Remote Server**
- Update `.env` with remote server URL
- Rebuild: `npm run electron:build:win`
- App syncs data to your server
- Admin panel accessible via web

---

## ⚙️ Environment Configuration

### Desktop App .env

```env
# Local server port
PORT=5000

# Remote API (optional)
VITE_API_BASE_URL=http://localhost:5000

# Database (local MySQL)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=jobautomate

# JWT Secret
JWT_SECRET=your_jwt_secret

# API Keys (optional)
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

### For Connected Mode (Remote Server)

```env
VITE_API_BASE_URL=https://your-production-server.com
```

---

## 🧪 Testing Checklist

### Development Testing

- [ ] `npm run electron:dev` starts without errors
- [ ] Window opens and loads UI
- [ ] Backend server responds (check console)
- [ ] Authentication works
- [ ] Puppeteer automation works
- [ ] Database connections work
- [ ] All features functional

### Production Testing

- [ ] Build completes: `npm run electron:build:win`
- [ ] Installer runs without errors
- [ ] Desktop shortcut created
- [ ] Installed app launches
- [ ] All features work in installed app
- [ ] App can be uninstalled cleanly

---

## 🐛 Troubleshooting

### "Cannot find module 'electron'"

```bash
npm install electron --save-dev
```

### "electron-builder command not found"

```bash
npm install electron-builder --save-dev
```

### Puppeteer doesn't work in built app

Check `electron-builder.yml` includes:

```yaml
extraResources:
  - from: node_modules/puppeteer/.local-chromium
    to: .local-chromium
```

### Build fails on Mac/Linux

Install Wine for Windows cross-compilation:

```bash
# macOS
brew install wine-stable

# Ubuntu/Debian
sudo apt-get install wine64
```

### App crashes on startup

1. Check logs in development mode
2. Verify `.env` file exists and is valid
3. Ensure MySQL is running (if using local DB)
4. Check Node.js version (18+ recommended)

---

## 📊 Architecture Summary

```
┌─────────────────────────────────────┐
│     Electron Desktop App (EXE)     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Main Process (Node.js)    │   │
│  │   - Window management       │   │
│  │   - Backend lifecycle       │   │
│  │   - IPC handling            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Backend (Express+Puppeteer)│   │
│  │  - All existing logic       │   │
│  │  - No changes required      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Renderer (React UI)       │   │
│  │   - All existing components │   │
│  │   - No changes required     │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎯 Zero Changes Required

**Your existing code works as-is:**

✅ React components - NO CHANGES
✅ Backend routes - NO CHANGES
✅ Database logic - NO CHANGES
✅ Puppeteer automation - NO CHANGES
✅ Business logic - NO CHANGES

**Only additions:**
- Electron wrapper files (provided)
- Build configuration (provided)
- Updated npm scripts (provided)

---

## 📚 Documentation Files

All guides have been created:

1. **ELECTRON_CONVERSION_GUIDE.md** - Complete overview
2. **ELECTRON_BUILD_STEPS.md** - Step-by-step build instructions
3. **ELECTRON_QUICK_START.md** - This file (quick reference)
4. **ELECTRON_API_USAGE_EXAMPLE.tsx** - Optional Electron API usage
5. **REMOTE_SERVER_SETUP.md** - Server integration guide

---

## 🚢 Ready to Ship

Once you've completed the steps above, you'll have:

✅ Working Windows desktop application (.exe)
✅ Local backend server bundled in the app
✅ All Puppeteer automation working
✅ Professional installer with shortcuts
✅ Optional server sync capability
✅ Admin panel integration ready

**Your application is now a desktop app!**

---

## 📞 Next Steps

1. Review `ELECTRON_BUILD_STEPS.md` for detailed instructions
2. Run `npm run electron:dev` to test
3. Build production EXE: `npm run electron:build:win`
4. Test the installer
5. Distribute to users

**Questions?** Check the detailed guides or contact support.
