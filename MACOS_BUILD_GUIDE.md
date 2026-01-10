# 🍎 macOS Build Guide

## Build Commands

### Option 1: Build for macOS Only (Recommended)

```bash
npm run electron:build:mac
```

**Builds:**
- Universal app (Intel + Apple Silicon)
- .dmg installer
- .zip portable version

**Build time:** 5-10 minutes

### Option 2: Build for Both macOS + Windows

```bash
npm run electron:build:all
```

**Builds:**
- macOS .dmg and .zip
- Windows .exe and .zip

**Build time:** 15-20 minutes

---

## 📦 Build Output

After building, check `dist-electron/` folder:

```
dist-electron/
├── AutoJobzy-1.0.0-arm64.dmg         ← Apple Silicon Mac (M1/M2/M3)
├── AutoJobzy-1.0.0-x64.dmg           ← Intel Mac
├── AutoJobzy-1.0.0-arm64-mac.zip     ← Portable (Apple Silicon)
├── AutoJobzy-1.0.0-x64-mac.zip       ← Portable (Intel)
└── [Windows files if built with :all]
```

---

## 🎯 Testing on Mac

### Method 1: DMG File (Recommended)

1. **Open the DMG:**
   ```bash
   open dist-electron/AutoJobzy-1.0.0-arm64.dmg
   ```

2. **Drag to Applications:**
   - A window opens with AutoJobzy icon
   - Drag to Applications folder
   - Or run directly from DMG

3. **Launch the app:**
   ```bash
   open /Applications/AutoJobzy.app
   ```

### Method 2: ZIP File (Portable)

1. **Extract:**
   ```bash
   cd dist-electron
   unzip AutoJobzy-1.0.0-arm64-mac.zip
   ```

2. **Run:**
   ```bash
   open AutoJobzy.app
   ```

---

## 🔒 Security & Gatekeeper

### First Launch Warning

When you open the app for the first time, macOS will say:

> "AutoJobzy" can't be opened because it is from an unidentified developer.

**Solution:**

**Option 1: Right-click Method**
1. Right-click `AutoJobzy.app`
2. Select "Open"
3. Click "Open" in the dialog
4. App will run (only need to do this once)

**Option 2: System Settings**
1. Go to System Settings → Privacy & Security
2. Scroll down to "Security"
3. Click "Open Anyway" next to AutoJobzy
4. Click "Open" in the dialog

**Option 3: Command Line**
```bash
# Remove quarantine flag
xattr -cr /Applications/AutoJobzy.app

# Then open normally
open /Applications/AutoJobzy.app
```

---

## 🎨 App Icon (Optional)

For a proper macOS icon, you need `.icns` format:

### Create .icns from PNG

1. **Get a 1024x1024 PNG image** (your logo)

2. **Create iconset:**
   ```bash
   mkdir build/icon.iconset

   # Create different sizes (use sips or any image editor)
   sips -z 16 16     icon.png --out build/icon.iconset/icon_16x16.png
   sips -z 32 32     icon.png --out build/icon.iconset/icon_16x16@2x.png
   sips -z 32 32     icon.png --out build/icon.iconset/icon_32x32.png
   sips -z 64 64     icon.png --out build/icon.iconset/icon_32x32@2x.png
   sips -z 128 128   icon.png --out build/icon.iconset/icon_128x128.png
   sips -z 256 256   icon.png --out build/icon.iconset/icon_128x128@2x.png
   sips -z 256 256   icon.png --out build/icon.iconset/icon_256x256.png
   sips -z 512 512   icon.png --out build/icon.iconset/icon_256x256@2x.png
   sips -z 512 512   icon.png --out build/icon.iconset/icon_512x512.png
   sips -z 1024 1024 icon.png --out build/icon.iconset/icon_512x512@2x.png
   ```

3. **Convert to .icns:**
   ```bash
   iconutil -c icns build/icon.iconset -o build/icon.icns
   ```

4. **Rebuild:**
   ```bash
   npm run electron:build:mac
   ```

### Skip Icon (Temporary)

If you don't have an icon yet, remove the icon line from config:

Edit `electron-builder.yml`:
```yaml
mac:
  target:
    - target: dmg
  # icon: build/icon.icns  ← Comment this out
```

Default Electron icon will be used.

---

## 📋 Testing Checklist

When you open the app:

- [ ] App launches without security errors ✓
- [ ] Window opens with your UI ✓
- [ ] DevTools shows no errors ✓
- [ ] Backend server starts (check console) ✓
- [ ] Can login/signup ✓
- [ ] All features work ✓
- [ ] Puppeteer automation works ✓

---

## 🚀 Distribution

### Option 1: Direct Download (Simple)

**Share the DMG file:**
- Upload to Google Drive/Dropbox
- Users download and open
- Drag to Applications

**Users will see Gatekeeper warning** - they need to right-click → Open

### Option 2: Code Signing (Professional)

**Requires:**
- Apple Developer Account ($99/year)
- Developer ID certificate

**Benefits:**
- No Gatekeeper warnings
- Users can double-click to install
- Notarized by Apple

**Setup:**
```bash
# After getting Developer ID certificate
npm install electron-builder electron-notarize

# Update electron-builder.yml
mac:
  identity: "Developer ID Application: Your Name (TEAM_ID)"
  hardenedRuntime: true
  gatekeeperAssess: true
  notarize:
    teamId: YOUR_TEAM_ID
```

### Option 3: Mac App Store

Submit to Mac App Store for official distribution.

---

## 🔧 Architecture Support

Your build creates **Universal apps** that work on:

✅ **Intel Macs** (x64)
- MacBook Pro (pre-2020)
- MacBook Air (pre-2020)
- iMac, Mac Mini (Intel)

✅ **Apple Silicon Macs** (arm64)
- MacBook Pro M1/M2/M3/M4
- MacBook Air M1/M2/M3
- iMac M1/M3/M4
- Mac Mini M1/M2/M4
- Mac Studio M1/M2

**Universal binary** = Single app runs on both!

---

## 📊 File Sizes

Expected sizes:

- **DMG:** ~200-400 MB (includes Chromium)
- **ZIP:** ~150-350 MB (compressed)
- **Installed app:** ~300-500 MB

Size includes:
- Your React app
- Node.js backend
- Puppeteer + Chromium
- All dependencies

---

## ⚡ Quick Start

**Just want to test quickly?**

```bash
# Build for macOS
npm run electron:build:mac

# Open the DMG
open dist-electron/AutoJobzy-1.0.0-arm64.dmg

# Drag to Applications and run
# Right-click → Open (first time only)
```

---

## 🐛 Troubleshooting

### Build fails with "No identity found"

**Problem:** Trying to code sign without certificate

**Solution:** Disable code signing in `electron-builder.yml`:
```yaml
mac:
  identity: null
  hardenedRuntime: false
```

### App crashes on startup

**Solution:** Same as Windows - check DevTools and log files:
```bash
# Log file location on Mac
~/Library/Application Support/autojobzy/logs/
```

### "Damaged and can't be opened"

**Problem:** Gatekeeper blocking the app

**Solution:**
```bash
xattr -cr /Applications/AutoJobzy.app
```

### Build is too slow

**Solution:** Build for specific architecture only:
```bash
# Apple Silicon only
electron-builder --mac --arm64

# Intel only
electron-builder --mac --x64
```

---

## 📝 Summary

**To build for macOS:**

```bash
npm run electron:build:mac
```

**To test:**

```bash
open dist-electron/AutoJobzy-1.0.0-arm64.dmg
# Right-click AutoJobzy → Open
```

**To distribute:**

Share the `.dmg` file with users!

---

## 🎉 Success!

Your Node.js + React app is now:
- ✅ Windows desktop app (.exe)
- ✅ macOS desktop app (.dmg)
- ✅ Fully working with Puppeteer
- ✅ Ready to distribute!

**Zero changes to your business logic!** 🚀
