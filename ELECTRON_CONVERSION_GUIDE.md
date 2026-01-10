# Electron Desktop Conversion Guide

## Overview
This guide converts your existing Node.js + React application into a Windows desktop EXE using Electron.js.

**No code changes to existing business logic** - This is purely platform conversion.

---

## Step 1: Install Electron Dependencies

Run this command in your project root:

```bash
npm install --save-dev electron electron-builder concurrently wait-on cross-env
```

### What these do:
- `electron` - Desktop app framework
- `electron-builder` - Package app as .exe
- `concurrently` - Run multiple processes (already installed)
- `wait-on` - Wait for server to start before launching app
- `cross-env` - Cross-platform environment variables

---

## Step 2: Update package.json

Add these scripts and configurations to your existing `package.json`:

```json
{
  "name": "autojobzy",
  "version": "1.0.0",
  "description": "AutoJobzy Desktop Application",
  "author": "Your Name",
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "server": "node server/index.js",
    "dev:full": "concurrently \"npm run server\" \"npm run dev\"",

    "electron:dev": "concurrently \"npm run server\" \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:start": "electron ."
  },
  "build": {
    "appId": "com.autojobzy.app",
    "productName": "AutoJobzy",
    "directories": {
      "output": "dist-electron",
      "buildResources": "build"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "server/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "extraResources": [
      {
        "from": "server",
        "to": "server",
        "filter": ["**/*"]
      }
    ],
    "win": {
      "target": ["nsis"],
      "icon": "build/icon.ico",
      "artifactName": "AutoJobzy-Setup-${version}.${ext}"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "AutoJobzy"
    }
  }
}
```

---

## Step 3: Project Structure

Create this folder structure:

```
Job_automate-main/
├── electron/
│   ├── main.js          (Electron entry point)
│   ├── preload.js       (IPC bridge)
│   └── server.js        (Backend process handler)
├── build/
│   └── icon.ico         (App icon)
├── server/              (Existing backend - NO CHANGES)
├── components/          (Existing React components - NO CHANGES)
├── pages/               (Existing React pages - NO CHANGES)
└── [rest of your existing files]
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                 Electron Main Process               │
│  ┌─────────────────┐      ┌─────────────────┐      │
│  │  main.js        │──────│  server.js      │      │
│  │  (Window Mgmt)  │      │  (Backend Fork) │      │
│  └────────┬────────┘      └────────┬────────┘      │
│           │                        │                │
│           │      IPC Bridge        │                │
│           │    (preload.js)        │                │
└───────────┼────────────────────────┼────────────────┘
            │                        │
            │                        │
            ▼                        ▼
┌─────────────────────────────────────────────────────┐
│          Renderer Process (React UI)                │
│  ┌─────────────────────────────────────────┐        │
│  │  Existing React App (NO CHANGES)       │        │
│  │  - Components, Pages, Services         │        │
│  │  - Communicates with local server      │        │
│  └─────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────┘
                        │
                        │ HTTP Requests
                        ▼
            ┌───────────────────────┐
            │   Remote API Server   │
            │   (Data Storage)      │
            └───────────────────────┘
```

---

## Key Files Needed

### 1. electron/main.js
### 2. electron/preload.js
### 3. electron/server.js
### 4. vite.config.ts (update)
### 5. build/icon.ico (create/download)

All files will be provided in the next steps.

---

## No Code Changes Required

Your existing files remain untouched:
- ✅ All React components stay the same
- ✅ All backend routes stay the same
- ✅ All business logic stays the same
- ✅ All Puppeteer automation stays the same
- ✅ API endpoints stay the same

Only additions:
- ➕ Electron wrapper files
- ➕ Build configuration
- ➕ Desktop window management

---

## Next Steps
Proceed to create the required Electron files.
