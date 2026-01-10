# 🔍 Electron App Inspection Guide

## Quick Start

```bash
# Start app with DevTools
npm run electron:dev
```

**तुम्हाला हे दिसेल:**
- Left: Your app
- Right: DevTools (automatically opens)

---

## 🎛️ DevTools Tabs

### 1. Console Tab
**Use for:**
- See backend logs
- Check errors (red text)
- Run JavaScript commands

**Example:**
```javascript
// Check API URL
console.log(import.meta.env.VITE_API_BASE_URL)

// Test API call
fetch('http://localhost:5000/api/plans')
  .then(r => r.json())
  .then(d => console.log(d))
```

### 2. Network Tab
**Use for:**
- Inspect API calls
- Check status codes
- View request/response data

**Steps:**
1. Click "Network" tab
2. Filter by "Fetch/XHR"
3. Perform action (login, etc.)
4. Click request to see details

**What to check:**
```
Request URL: http://localhost:5000/api/auth/login
Method: POST
Status: 200 (success) या 500 (error)
Response: {token: "...", user: {...}}
```

### 3. Application Tab
**Use for:**
- Check localStorage
- See stored tokens
- View cookies

**Check token:**
```
Storage → Local Storage → Select URL
Look for: "token" key
```

### 4. Elements Tab
**Use for:**
- Inspect HTML
- Check CSS styles
- Debug UI issues

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch"
**Console shows:**
```
Failed to fetch
या
net::ERR_CONNECTION_REFUSED
```

**Solution:**
- Backend server not running
- Check terminal: "Backend server started" message?
- Restart: `npm run electron:dev`

### Issue 2: "404 Not Found"
**Network tab shows:**
```
Status: 404
URL: http://localhost:5000/auth/login (wrong!)
```

**Solution:**
- Missing `/api` in URL
- Check .env: `VITE_API_BASE_URL=http://localhost:5000/api`

### Issue 3: "401 Unauthorized"
**Network tab shows:**
```
Status: 401
Response: {"error": "Unauthorized"}
```

**Solution:**
- Token missing या invalid
- Check localStorage for "token"
- Login again

### Issue 4: Backend not starting
**Console shows:**
```
❌ Failed to start backend server
```

**Solution:**
- Check port 5000 is free: `lsof -i :5000`
- Kill process: `kill -9 [PID]`
- Check database connection

---

## 📝 Inspection Checklist

### When App Starts:
- [ ] Window opens
- [ ] DevTools visible on right
- [ ] Console shows: "Backend server started"
- [ ] No red errors

### When Login:
- [ ] Network tab open
- [ ] Filter: XHR
- [ ] POST to `/api/auth/login` visible
- [ ] Status: 200 OK
- [ ] Response has token
- [ ] Token saved to localStorage
- [ ] Redirects to dashboard

### If Error:
- [ ] Check Console for red text
- [ ] Check Network tab for failed requests
- [ ] Check status code (200, 404, 500, etc.)
- [ ] Check response message

---

## 🧪 Testing Commands

### In DevTools Console:

```javascript
// 1. Check API base URL
console.log(import.meta.env.VITE_API_BASE_URL)
// Should show: http://localhost:5000/api

// 2. Test backend reachable
fetch('http://localhost:5000/api/plans')
  .then(r => r.json())
  .then(d => console.log(d))
// Should return plans data

// 3. Check localStorage token
console.log(localStorage.getItem('token'))
// Should show JWT token या null

// 4. Test login API
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'vishwa@gmail.com',
    password: '123456'
  })
})
  .then(r => r.json())
  .then(d => console.log(d))
// Should return {token, user}
```

### In Terminal:

```bash
# 1. Check backend is running
curl http://localhost:5000/api/plans

# 2. Test login API
curl http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vishwa@gmail.com","password":"123456"}'

# 3. Check port 5000
lsof -i :5000

# 4. Check processes
ps aux | grep node
```

---

## 📊 Visual Guide

### DevTools Layout:
```
┌─────────────────────────────────────────┐
│ AutoJobzy App Window                     │
├──────────────────┬──────────────────────┤
│                  │  DevTools            │
│   Your App       │  ┌────────────────┐  │
│   (React UI)     │  │ Console        │  │
│                  │  │ Network        │  │
│   [Login Form]   │  │ Elements       │  │
│                  │  │ Application    │  │
│                  │  └────────────────┘  │
└──────────────────┴──────────────────────┘
```

### Network Tab View:
```
Name                Status  Type    Size
──────────────────────────────────────────
login               200     xhr     1.2 KB  ✓
plans               200     xhr     843 B   ✓
profile             401     xhr     23 B    ✗
```

### Console View:
```
✅ Backend server started on http://localhost:5000
⚡ React app loaded
🔄 Fetching user profile...
✅ Profile loaded
```

---

## 🎯 Quick Inspection Steps

1. **Start app:** `npm run electron:dev`
2. **Wait:** App + DevTools open
3. **Check Console:** "Backend server started" visible?
4. **Open Network tab:** Filter by XHR
5. **Try login:** Enter credentials, click Login
6. **Watch Network:** POST request appears?
7. **Check status:** 200 = success, 500 = error
8. **Check response:** Click request → Preview tab
9. **Check localStorage:** Application tab → Local Storage
10. **Check token:** Should be saved after login

---

## 🚀 Pro Tips

### Tip 1: Keep DevTools Open
- Always keep DevTools open during development
- Catch errors immediately

### Tip 2: Use Console Commands
- Test APIs without clicking UI
- Faster debugging

### Tip 3: Monitor Network
- Keep Network tab open
- See all API calls in real-time

### Tip 4: Check Logs
- Terminal logs = backend
- DevTools Console = frontend
- Both important!

### Tip 5: Reload App
- Cmd+R = Refresh
- Fixes many UI issues

---

## 📋 Success Indicators

**Everything working:**
```
✅ Console: "Backend server started"
✅ Console: No red errors
✅ Network: All requests show 200
✅ Login: Redirects to dashboard
✅ LocalStorage: Token saved
✅ API calls: Data loads correctly
```

**Something wrong:**
```
❌ Console: Red errors
❌ Network: Failed requests (red)
❌ Status: 404, 500, या connection refused
❌ Login: Error message shows
❌ LocalStorage: No token
```

---

**DevTools तुमचा best friend आहे debugging साठी! Keep it open always!** 🔍
