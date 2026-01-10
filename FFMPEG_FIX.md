# ffmpeg.dll Error Fix

## Problem
After installing AutoJobzy on Windows, you get: "ffmpeg.dll was not found"

## Root Cause
The NSIS installer isn't copying all Electron binaries to the installation folder.

## Solution

### Option 1: Manual Fix (Quick Test)

If you already installed the app on Windows:

1. Go to installation folder (usually `C:\Program Files\AutoJobzy\`)
2. Look for `ffmpeg.dll` - is it there?
3. If missing, copy from `node_modules/electron/dist/` on Mac:
   ```bash
   # On Mac, find the file
   find node_modules/electron/dist -name "ffmpeg.dll"

   # Copy to a USB/cloud
   cp node_modules/electron/dist/ffmpeg.dll ~/Desktop/
   ```
4. On Windows, copy `ffmpeg.dll` to `C:\Program Files\AutoJobzy\`
5. Try launching app again

### Option 2: Rebuild with Proper Configuration (Permanent Fix)

The electron-builder configuration needs to ensure all binaries are included.

**Already done:** I've updated `electron-builder.yml` with:
```yaml
asar: true
asarUnpack:
  - "**/*.node"
  - "**/node_modules/puppeteer/**/*"
```

But we need to verify Electron binaries are bundled.

## Verification Steps

After rebuild, before distributing:

1. Check `dist-electron/win-unpacked/` folder
2. Look for these files:
   - `ffmpeg.dll`
   - `libGLESv2.dll`
   - `libEGL.dll`
   - `AutoJobzy.exe`
3. All should be in the same folder

## If Files Are Missing

The issue is with how electron-builder packages Electron itself.

**Solution:** Ensure you're using the correct Electron version and electron-builder is finding the binaries.

Check:
```bash
# Verify Electron installation
ls -la node_modules/electron/dist/

# Should see many DLL files
```

## Alternative: Portable Build

Instead of NSIS installer, create a portable ZIP:

Update `electron-builder.yml`:
```yaml
win:
  target:
    - target: zip
      arch:
        - x64
    - target: nsis
      arch:
        - x64
```

This creates both:
- ZIP file (portable, no installation needed)
- NSIS installer

Users can use the ZIP version if installer has issues.
