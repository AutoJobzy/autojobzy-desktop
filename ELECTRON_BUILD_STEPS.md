# Electron Desktop Build Instructions

## 🎯 Complete Step-by-Step Guide to Build Windows EXE

---

## Prerequisites

1. **Node.js** installed (v18+ recommended)
2. **npm** or **yarn** package manager
3. Windows machine OR cross-compile tools (for building .exe on Mac/Linux)

---

## Step 1: Install Dependencies

```bash
npm install
```

Install Electron-specific dependencies:

```bash
npm install --save-dev electron electron-builder wait-on cross-env
```

---

## Step 2: Update package.json

Replace your current `package.json` scripts section with:

```json
{
  "name": "autojobzy",
  "version": "1.0.0",
  "description": "AutoJobzy Desktop Application",
  "author": "Your Name",
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build --config vite.config.electron.ts",
    "preview": "vite preview",
    "server": "node server/index.js",
    "dev:full": "concurrently \"npm run server\" \"npm run dev\"",

    "electron:dev": "cross-env NODE_ENV=development concurrently \"npm run server\" \"vite --config vite.config.electron.ts\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder --config electron-builder.yml",
    "electron:build:win": "npm run build && electron-builder --win --config electron-builder.yml",
    "electron:start": "electron ."
  }
}
```

Add this `build` configuration to package.json (top-level, after dependencies):

```json
"build": {
  "appId": "com.autojobzy.app",
  "productName": "AutoJobzy",
  "extends": "electron-builder.yml"
}
```

---

## Step 3: Create Icon File

1. Create a `build/` folder in your project root
2. Add an icon file named `icon.ico` (256x256px minimum)
3. If you don't have an icon, use a placeholder or generate one

**Option A: Create icon online**
- Go to https://convertio.co/png-ico/
- Upload your logo/image
- Download as `icon.ico`

**Option B: Use placeholder**
```bash
mkdir build
# Copy any .ico file to build/icon.ico
```

---

## Step 4: Environment Configuration

Create `.env` file in project root (if not exists):

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=jobautomate

# Server Configuration
PORT=5000

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Naukri Credentials (optional for users)
NAUKRI_EMAIL=
NAUKRI_PASSWORD=

# Razorpay (if using payments)
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

# OpenAI/Gemini API (if using AI features)
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key

# API Base URL (for remote server communication)
VITE_API_BASE_URL=http://localhost:5000
```

---

## Step 5: Development Testing

Test the Electron app in development mode:

```bash
npm run electron:dev
```

This will:
1. Start the backend server (Express + Puppeteer)
2. Start Vite dev server (React UI)
3. Launch Electron window

**Verify:**
- ✅ App window opens
- ✅ UI loads correctly
- ✅ Backend server responds (check console logs)
- ✅ All features work as expected

---

## Step 6: Build Production EXE

### On Windows:

```bash
npm run electron:build:win
```

### On Mac/Linux (cross-compile):

Install Wine (for Windows builds on Mac):
```bash
# macOS
brew install wine-stable

# Linux
sudo apt-get install wine64
```

Then build:
```bash
npm run electron:build:win
```

**Build Output:**
- Location: `dist-electron/`
- File: `AutoJobzy-Setup-1.0.0.exe`

---

## Step 7: Test the EXE

1. Navigate to `dist-electron/`
2. Double-click `AutoJobzy-Setup-1.0.0.exe`
3. Follow installer prompts
4. Launch the installed application

**Testing checklist:**
- ✅ Installation completes without errors
- ✅ Desktop shortcut created
- ✅ App launches successfully
- ✅ Backend server starts (check Task Manager for node.exe process)
- ✅ UI loads and is responsive
- ✅ All features work (authentication, automation, etc.)
- ✅ Database connection works
- ✅ Puppeteer automation works

---

## Step 8: Distribution

### Option A: Direct Distribution
- Share the `.exe` file directly with users
- Users download and install on their Windows machines

### Option B: Server Integration
- Users install the desktop app
- App communicates with your remote server via APIs
- Server stores all data (no local database required in this mode)

**For server integration:**
1. Update `.env`:
```env
VITE_API_BASE_URL=https://your-production-server.com
```

2. Rebuild:
```bash
npm run electron:build:win
```

---

## Troubleshooting

### Issue: "Electron not found"
```bash
npm install electron --save-dev
```

### Issue: "electron-builder not found"
```bash
npm install electron-builder --save-dev
```

### Issue: Puppeteer doesn't work in built app
- Puppeteer bundling is handled in `electron-builder.yml`
- Ensure `.local-chromium` is included in `extraResources`

### Issue: Database connection fails
- Check MySQL is running on user's machine OR
- Configure app to use remote database server

### Issue: App crashes on startup
- Check console logs in development mode
- Verify all environment variables are set
- Ensure Node.js version compatibility

---

## Architecture Overview

```
Desktop App (Electron)
├── Main Process (electron/main.js)
│   ├── Creates application window
│   ├── Manages backend server lifecycle
│   └── Handles IPC communication
│
├── Backend Server (server/index.js) - UNCHANGED
│   ├── Express API server
│   ├── Puppeteer automation
│   ├── MySQL database connection
│   └── All existing business logic
│
└── Renderer Process (React UI) - UNCHANGED
    ├── All existing React components
    ├── All existing pages
    ├── All existing services
    └── Communicates with backend via HTTP

Data Flow:
1. User interacts with React UI
2. UI makes API calls to local backend (http://localhost:5000)
3. Backend processes requests (Puppeteer, DB, etc.)
4. Backend optionally syncs data to remote server
5. Remote admin panel reads data from server
```

---

## Key Points

✅ **Zero changes to existing business logic**
✅ **All React components work as-is**
✅ **All backend routes work as-is**
✅ **Puppeteer automation works as-is**
✅ **Database connections work as-is**

Only additions:
- Electron wrapper (main.js, preload.js, server.js)
- Build configuration (electron-builder.yml)
- Updated package.json scripts

---

## Next Steps After Build

1. Test EXE thoroughly on Windows machines
2. Create user documentation
3. Set up auto-update mechanism (optional)
4. Configure remote server for data sync
5. Distribute to users

---

## Support

For issues:
1. Check console logs: `npm run electron:dev` (shows all logs)
2. Verify environment variables in `.env`
3. Test backend separately: `npm run server`
4. Test frontend separately: `npm run dev`
