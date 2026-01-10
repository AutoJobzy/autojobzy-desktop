# 🔧 API "Failed to Load" Fix Guide

## Problem
Login API shows "failed to load" error because backend server isn't starting properly in the Electron app.

## What Was Fixed

### 1. Working Directory Issue ✅
- Backend server needs correct working directory to find `.env` file
- Added `cwd` parameter to spawn process

### 2. Environment Variables ✅
- `.env` file now included in build
- Database credentials configured
- API base URL set correctly

### 3. Server Path ✅
- Server files unpacked from ASAR
- Correct path resolution for production

## Files Updated

✅ `electron/server.js` - Fixed working directory
✅ `electron-builder.yml` - Include .env in build
✅ `.env` - Updated with correct database password
✅ `.env.production` - Production template created

## 🚀 Rebuild & Test

### Step 1: Clean Build

```bash
rm -rf dist-electron dist node_modules/.cache
```

### Step 2: Rebuild for Mac

```bash
npm run electron:build:mac
```

### Step 3: Test the App

```bash
# Open the DMG
open dist-electron/AutoJobzy-1.0.0-arm64.dmg

# Drag to Applications and open
# Right-click → Open (first time only)
```

### Step 4: Check DevTools

When app opens:

1. **Check console logs:**
   ```
   Starting backend server from: ...
   Working directory: ...
   Using Node.js from: ...
   ✅ Backend server started on http://localhost:5000
   ```

2. **Try login**
3. **Check Network tab** - API calls should succeed

## 🐛 Debugging

### If Backend Doesn't Start

**Check log file:**
```bash
# macOS
open ~/Library/Application\ Support/autojobzy/logs/

# Look for latest .log file
cat ~/Library/Application\ Support/autojobzy/logs/autojobzy-*.log
```

**Common issues:**

1. **"Cannot find module 'dotenv'"**
   - node_modules not unpacked correctly
   - Rebuild with clean cache

2. **"Database connection failed"**
   - Check `.env` has correct DB_PASSWORD
   - Verify database is accessible

3. **"Port 5000 already in use"**
   - Kill any running servers
   - Try app again

### If API Still Fails

**Test backend separately:**

```bash
# Run server directly
npm run server

# In another terminal, test API
curl http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vishwa@gmail.com","password":"123456"}'
```

If this works, backend is fine - issue is with Electron integration.

## ✅ Success Checklist

When everything works:

- [ ] App opens without errors
- [ ] DevTools shows "Backend server started"
- [ ] Login page loads
- [ ] Can enter email/password
- [ ] Login button clickable
- [ ] Network tab shows API call to http://localhost:5000/api/auth/login
- [ ] API returns response (token + user data)
- [ ] Redirects to dashboard after login

## 📝 Environment Variables Reference

Your `.env` file should have:

```env
# Frontend
VITE_API_BASE_URL=http://localhost:5000/api

# Database (AWS RDS)
DB_HOST=database-1.c72i2s6muax7.ap-south-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=Ronit@123
DB_NAME=jobautomate
DB_PORT=3306

# Server
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=your_jwt_secret_here_change_in_production
```

## 🔐 Security Note

**Before distributing to users:**

1. Change `JWT_SECRET` to a strong random value
2. Consider encrypting database credentials
3. Use environment-specific .env files

## 🎯 Quick Test Commands

```bash
# Test login API
curl http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vishwa@gmail.com","password":"123456"}'

# Should return:
# {"token":"...","user":{...}}

# Test if server is running
curl http://localhost:5000/api/plans
# Should return list of plans
```

## 📊 Expected Behavior

### Successful Startup Sequence:

1. ✅ Electron app launches
2. ✅ DevTools opens (debug mode)
3. ✅ "Starting backend server..." message
4. ✅ "Backend server started on http://localhost:5000"
5. ✅ "Loading index.html from: ..."
6. ✅ React UI loads
7. ✅ Login page appears
8. ✅ Can interact with form

### Successful Login Flow:

1. ✅ Enter email: vishwa@gmail.com
2. ✅ Enter password: 123456
3. ✅ Click "Login"
4. ✅ Network request to /api/auth/login
5. ✅ Response with token
6. ✅ Token saved to localStorage
7. ✅ Redirect to /dashboard

## 🚀 Next Steps

After successful build and test:

1. **Remove DevTools** from production
   - Edit `electron/main.js`
   - Comment out: `// mainWindow.webContents.openDevTools();`
   - Rebuild

2. **Create distribution package**
   - Test installer
   - Create user documentation
   - Prepare for distribution

3. **Test on different machines**
   - Fresh install
   - Different macOS versions
   - Verify all features work

---

**Rebuild now and test! Backend server will work properly.** 🎉
