# 🐛 Debug Version Guide

## Problem Solved
App was opening and closing immediately on Windows. Now it will:
1. **Show errors** in a dialog box
2. **Keep the window open** with DevTools showing errors
3. **Create log files** you can check later

## What Changed

### 1. DevTools Auto-Open ✅
- DevTools (F12) opens automatically in production
- You can see all errors in the Console tab

### 2. Error Dialogs ✅
- If backend fails to start, a popup shows the error
- Shows log file location
- App stays open so you can investigate

### 3. Log Files ✅
- All console output saved to files
- Location: `C:\Users\[YourName]\AppData\Roaming\autojobzy\logs\`
- Files named: `autojobzy-2026-01-09T16-30-00.log`

## How to Use

### Step 1: Rebuild

```bash
npm run electron:build:win
```

### Step 2: Test on Windows

1. Copy `AutoJobzy-1.0.0.zip` to Windows
2. Extract the ZIP file
3. Double-click `AutoJobzy.exe`

### Step 3: Check for Errors

**When app opens:**

✅ **DevTools Opens Automatically**
- Left side: Your app window
- Right side: DevTools console

✅ **Look for Error Messages**
- Red text in console = errors
- Check "Console" tab for details

✅ **If App Crashes**
- A dialog box will show the error
- Note the log file location
- DevTools stays open

### Step 4: Find Log Files

**On Windows:**

1. Press `Win + R`
2. Type: `%APPDATA%\autojobzy\logs`
3. Press Enter
4. Open the latest `.log` file
5. Send me the log file contents

## Common Errors & Solutions

### Error: "Cannot find module 'X'"

**Problem:** Missing dependencies

**Solution:**
- Check if `node_modules` folder is in the app folder
- Rebuild with: `npm install && npm run electron:build:win`

### Error: "ENOENT: no such file or directory, open 'index.html'"

**Problem:** React build files missing

**Solution:**
- Check `dist` folder exists
- Rebuild React: `npm run build`
- Rebuild Electron: `npm run electron:build:win`

### Error: "Address already in use :::5000"

**Problem:** Port 5000 is taken

**Solution:**
- Close any running servers
- Restart Windows
- Try again

### Error: "Cannot connect to database"

**Problem:** Database not accessible

**Solution:**
- Check if database is running
- Update `.env` with correct database credentials
- Rebuild app

## Testing Checklist

When you open the app:

- [ ] Window opens (doesn't close immediately) ✓
- [ ] DevTools visible on right side ✓
- [ ] Console tab shows logs ✓
- [ ] No red errors in console ✓
- [ ] Backend server starts (see "✅ Backend server started" in console) ✓
- [ ] UI loads (React app visible on left) ✓
- [ ] Can interact with app ✓

## Sending Debug Info

If app still doesn't work, send me:

1. **Screenshot** of DevTools console (with errors visible)
2. **Log file** from `%APPDATA%\autojobzy\logs\`
3. **Error dialog** screenshot (if it appears)

## Disabling Debug Mode (Production)

Once everything works, to create a clean production version:

1. Edit `electron/main.js`
2. Find line: `mainWindow.webContents.openDevTools();`
3. Comment it out: `// mainWindow.webContents.openDevTools();`
4. Rebuild: `npm run electron:build:win`

Production version will have no DevTools.

## Log File Example

A good log file should show:

```
[2026-01-09T16:30:00.000Z] AutoJobzy started
[2026-01-09T16:30:00.100Z] [LOG] 🚀 Electron app starting...
[2026-01-09T16:30:01.200Z] [LOG] 🔄 Starting backend server...
[2026-01-09T16:30:02.300Z] [LOG] ✅ Backend server started on http://localhost:5000
[2026-01-09T16:30:02.400Z] [LOG] Loading index.html from: C:\Program Files\AutoJobzy\dist\index.html
```

A problematic log will show errors:

```
[2026-01-09T16:30:00.000Z] AutoJobzy started
[2026-01-09T16:30:00.100Z] [LOG] 🚀 Electron app starting...
[2026-01-09T16:30:01.200Z] [LOG] 🔄 Starting backend server...
[2026-01-09T16:30:02.300Z] [ERROR] ❌ Failed to start backend server: Error: Cannot find module 'express'
```

## Next Steps

1. **Rebuild** with debug version
2. **Test** on Windows
3. **Check logs** and DevTools
4. **Send me** error details if needed
5. I'll help fix the specific issue!
