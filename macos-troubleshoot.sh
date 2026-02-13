#!/bin/bash

# AutoJobzy macOS Troubleshooting Script
# This script checks for common issues and provides solutions

echo "============================================================"
echo "  AutoJobzy macOS Troubleshooting Tool"
echo "============================================================"
echo ""

# Check macOS version
echo "Checking macOS version..."
os_version=$(sw_vers -productVersion)
echo "[INFO] macOS version: $os_version"
if [[ "$os_version" > "10.12" ]]; then
    echo "[OK] macOS version is compatible"
else
    echo "[WARNING] macOS version may be too old"
    echo "          AutoJobzy requires macOS 10.13 or later"
fi
echo ""

# Check architecture
echo "Checking processor architecture..."
arch=$(uname -m)
if [[ "$arch" == "arm64" ]]; then
    echo "[OK] Apple Silicon (M1/M2/M3) detected"
    echo "      Use: AutoJobzy-1.0.0-arm64.dmg"
elif [[ "$arch" == "x86_64" ]]; then
    echo "[OK] Intel Mac detected"
    echo "      Use: AutoJobzy-1.0.0-x64.dmg"
else
    echo "[WARNING] Unknown architecture: $arch"
fi
echo ""

# Check if app is installed
echo "Checking AutoJobzy installation..."
if [ -d "/Applications/AutoJobzy.app" ]; then
    echo "[OK] AutoJobzy found at: /Applications/AutoJobzy.app"

    # Check quarantine attribute
    echo ""
    echo "Checking quarantine status..."
    xattr /Applications/AutoJobzy.app 2>/dev/null | grep -q "com.apple.quarantine"
    if [ $? -eq 0 ]; then
        echo "[WARNING] App is quarantined by macOS Gatekeeper"
        echo "          Run: xattr -cr /Applications/AutoJobzy.app"
        echo ""
        read -p "Remove quarantine now? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            xattr -cr /Applications/AutoJobzy.app
            echo "[OK] Quarantine removed!"
        fi
    else
        echo "[OK] App is not quarantined"
    fi

    # Check permissions
    echo ""
    echo "Checking app permissions..."
    if [ -x "/Applications/AutoJobzy.app/Contents/MacOS/AutoJobzy" ]; then
        echo "[OK] App has execute permissions"
    else
        echo "[WARNING] App missing execute permissions"
        echo "          Run: chmod +x /Applications/AutoJobzy.app/Contents/MacOS/AutoJobzy"
    fi
else
    echo "[WARNING] AutoJobzy not found in /Applications/"
    echo "          Please install the app first"
fi
echo ""

# Check bundled Chrome
echo "Checking bundled Chrome..."
if [ -d "/Applications/AutoJobzy.app/Contents/Resources/.chrome-build/chrome" ]; then
    echo "[OK] Bundled Chrome found"
    chrome_version=$(ls /Applications/AutoJobzy.app/Contents/Resources/.chrome-build/chrome/ 2>/dev/null | head -1)
    echo "      Version: $chrome_version"
else
    echo "[INFO] Bundled Chrome not found - will download on first run"
fi
echo ""

# Check disk space
echo "Checking disk space..."
free_space=$(df -h / | awk 'NR==2 {print $4}')
echo "[INFO] Free space on main drive: $free_space"
echo "       AutoJobzy requires at least 500 MB free space"
echo ""

# Check internet connection
echo "Checking internet connection..."
ping -c 1 google.com >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "[OK] Internet connection available"
else
    echo "[WARNING] No internet connection detected"
    echo "          Internet is required for job automation"
fi
echo ""

# Check System Integrity Protection (SIP)
echo "Checking System Integrity Protection..."
csrutil status | grep -q "disabled"
if [ $? -eq 0 ]; then
    echo "[INFO] SIP is disabled"
else
    echo "[OK] SIP is enabled (normal)"
fi
echo ""

# Check if running from DMG
echo "Checking if running from disk image..."
mount | grep -q "AutoJobzy"
if [ $? -eq 0 ]; then
    echo "[WARNING] AutoJobzy may be running from the DMG file"
    echo "          Please copy AutoJobzy to Applications folder first"
    echo "          Then eject the disk image"
fi
echo ""

echo "============================================================"
echo "  Troubleshooting Complete"
echo "============================================================"
echo ""
echo "Common Solutions:"
echo ""
echo "1. Remove quarantine: xattr -cr /Applications/AutoJobzy.app"
echo "2. Right-click app → Open (to bypass Gatekeeper)"
echo "3. System Preferences → Security & Privacy → Open Anyway"
echo "4. Fix permissions: chmod +x /Applications/AutoJobzy.app/Contents/MacOS/AutoJobzy"
echo "5. Make sure app is in /Applications (not running from DMG)"
echo ""
echo "If issues persist, check INSTALLATION_GUIDE.md"
echo ""

# Offer to fix common issues automatically
if [ -d "/Applications/AutoJobzy.app" ]; then
    echo ""
    read -p "Fix common issues automatically? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Fixing common issues..."

        # Remove quarantine
        xattr -cr /Applications/AutoJobzy.app 2>/dev/null
        echo "[OK] Quarantine removed"

        # Fix permissions
        chmod +x /Applications/AutoJobzy.app/Contents/MacOS/AutoJobzy 2>/dev/null
        echo "[OK] Execute permissions set"

        echo ""
        echo "[SUCCESS] Common issues fixed!"
        echo "          Try launching AutoJobzy now"
    fi
fi

echo ""
