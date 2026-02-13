# AutoJobzy Installation Guide

## 📦 System Requirements

### Windows
- Windows 10 or later (64-bit)
- 4 GB RAM minimum
- 500 MB free disk space
- Internet connection (for first-time setup)

### macOS
- macOS 10.13 (High Sierra) or later
- Apple Silicon (M1/M2/M3) or Intel processor
- 4 GB RAM minimum
- 500 MB free disk space
- Internet connection (for first-time setup)

---

## 🪟 Windows Installation

### Step 1: Download
Download `AutoJobzy-1.0.0.exe` from the releases page.

### Step 2: Install

1. **Double-click** the installer
2. **Windows Defender SmartScreen** may show a warning:
   - Click **"More info"**
   - Click **"Run anyway"**

3. **Follow the installer** steps:
   - Choose installation directory (default: `C:\Program Files\AutoJobzy`)
   - Create desktop shortcut (recommended)
   - Click "Install"

### Step 3: Launch
- Double-click the **AutoJobzy** desktop icon
- Or search for "AutoJobzy" in Start Menu

### Common Windows Issues

#### ❌ Antivirus blocks the app
**Solution:** Add AutoJobzy to your antivirus exclusions:
```
C:\Program Files\AutoJobzy\
C:\Users\[YourName]\AppData\Local\AutoJobzy\
```

#### ❌ App crashes on startup
**Solution:** Install Visual C++ Redistributable:
- Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
- Install and restart your computer

#### ❌ Chrome automation doesn't work
**Solution:**
1. Make sure Chrome is bundled (it should be automatically)
2. If not, the app will download Chrome on first run
3. Check your firewall/antivirus isn't blocking Chrome download

---

## 🍎 macOS Installation

### Step 1: Download
Download the appropriate version:
- **Apple Silicon (M1/M2/M3):** `AutoJobzy-1.0.0-arm64.dmg`
- **Intel Mac:** `AutoJobzy-1.0.0-x64.dmg`

### Step 2: Install

1. **Double-click** the `.dmg` file
2. **Drag AutoJobzy** to the Applications folder
3. **Eject** the disk image

### Step 3: First Launch

**Important:** macOS will block the app on first launch because it's not signed.

#### Method 1: Right-Click Open (Easiest)
1. Open **Finder** → **Applications**
2. **Right-click** on AutoJobzy
3. Click **"Open"**
4. In the dialog, click **"Open"** again

#### Method 2: Remove Quarantine (Terminal)
```bash
xattr -cr /Applications/AutoJobzy.app
```

#### Method 3: System Preferences
1. Try to open AutoJobzy (it will be blocked)
2. Open **System Preferences** → **Security & Privacy** → **General**
3. Click **"Open Anyway"**
4. Try opening AutoJobzy again

### Common macOS Issues

#### ❌ "App is damaged and can't be opened"
**Solution:** Remove quarantine attribute:
```bash
xattr -cr /Applications/AutoJobzy.app
```

#### ❌ "AutoJobzy cannot be opened because the developer cannot be verified"
**Solution:**
1. Right-click app → Open → Open
2. OR use Terminal: `xattr -d com.apple.quarantine /Applications/AutoJobzy.app`

#### ❌ App doesn't launch (no error)
**Solution:** Check permissions:
```bash
chmod +x /Applications/AutoJobzy.app/Contents/MacOS/AutoJobzy
```

---

## ✅ First Run Setup

After successfully opening AutoJobzy for the first time:

1. **Create Account** or **Login**
2. **Configure Job Settings:**
   - Add your Naukri.com credentials
   - Set your job preferences
   - Upload your resume

3. **Test Automation:**
   - Go to "Start Automation" tab
   - Click "Start Automation"
   - Browser window will open (this is normal!)
   - Watch the automation run

4. **Chrome Browser:**
   - Chrome is bundled with the app (no download needed)
   - If you see any Chrome errors, restart the app

---

## 🔧 Troubleshooting

### App won't start

**Windows:**
```
1. Check Task Manager - close any existing AutoJobzy processes
2. Run as Administrator (right-click → "Run as administrator")
3. Reinstall the app
4. Check Windows Event Viewer for error logs
```

**macOS:**
```bash
# Check Console.app for error logs
# Run from Terminal to see errors:
/Applications/AutoJobzy.app/Contents/MacOS/AutoJobzy
```

### Automation doesn't work

1. **Check credentials:**
   - Make sure Naukri credentials are correct
   - Test login manually on Naukri.com

2. **Check internet connection:**
   - Automation requires internet to access Naukri

3. **Check antivirus/firewall:**
   - Some security software blocks browser automation
   - Add AutoJobzy to exclusions

### Database errors

If you see database connection errors:
- The app uses a remote database at `api.autojobzy.com`
- Check your internet connection
- Check if firewall is blocking the connection

---

## 🆘 Still Need Help?

1. **Check Logs:**
   - Windows: `%APPDATA%\AutoJobzy\logs`
   - macOS: `~/Library/Logs/AutoJobzy`

2. **Report Issue:**
   - Include your OS version
   - Include error message/screenshot
   - Include log files if possible

3. **Contact Support:**
   - Email: support@autojobzy.com
   - GitHub Issues: https://github.com/your-repo/issues

---

## 🚀 Quick Start Video

[Coming Soon] - Video tutorial for first-time setup

---

## 📋 Checklist for New Users

- [ ] Download correct version for your OS
- [ ] Install the app
- [ ] Bypass security warnings (follow guide above)
- [ ] Create account / Login
- [ ] Add Naukri credentials
- [ ] Configure job preferences
- [ ] Test automation with 1-2 pages first
- [ ] Check Application History for saved results

---

## 🔐 Security Note

AutoJobzy is safe to use:
- ✅ Chrome browser is included (version 143.0.7499.42)
- ✅ No data is sent to third parties
- ✅ Naukri credentials are stored securely
- ✅ App works offline (except for Naukri automation)
- ⚠️ App is not code-signed (hence security warnings)
- ⚠️ We recommend using app on trusted devices only

---

**Last Updated:** February 2025
**Version:** 1.0.0
