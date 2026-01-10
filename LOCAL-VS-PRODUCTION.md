# Local vs Production Setup - मराठी मार्गदर्शन

## 🔄 तुम्ही काय बदललं?

### आधी (Before):
```
Browser → https://api.autojobzy.com (Production)
                ↓
         जुना code चालतोय
                ↓
         Login selectors चुकीचे
                ↓
         ❌ Error: Could not find username field
```

### आता (After - Local Testing):
```
Browser → https://api.autojobzy.com (Local)
                ↓
         नवीन updated code चालतोय
                ↓
         Adaptive selectors (10+ strategies)
                ↓
         ✅ Login successful!
```

---

## 📂 Files बदलल्या:

### 1. `.env` - API URL Configuration
```bash
# Local testing
VITE_API_BASE_URL=https://api.autojobzy.com/api

# Production (काम पूर्ण झाल्यावर uncomment करा)
# VITE_API_BASE_URL=https://api.autojobzy.com/api
```

### 2. `server/autoApply.js` - Login Function
- ❌ Old: फक्त `#usernameField` वापरत होता
- ✅ New: 10+ selectors try करतो automatically

---

## 🧪 Local Testing - Step by Step

### 1. Services Check करा:
```bash
./test-local-setup.sh
```

तुम्हाला दिसावं:
```
✅ .env file exists
✅ API URL set to local (localhost:5000)
✅ Backend running on port 5000
✅ Frontend running on port 3000
✅ Backend API responding
```

### 2. Browser मध्ये test करा:
1. Open: http://localhost:3000
2. Login करा
3. Automation trigger करा
4. Logs बघा

### 3. Success ची खूण:
```
✅ Found email field: #usernameField
✅ Found password field: #passwordField
Entering credentials...
✅ Clicked submit button: button[type='submit'].blue-btn
Waiting for login response...
Login successful!
```

---

## 🚀 Production वर Deploy करायचं तर:

### Option 1: Manual Deploy (EC2)

1. **Code push करा:**
```bash
git add .
git commit -m "Fix: Updated login selectors with adaptive detection"
git push
```

2. **EC2 वर SSH करा:**
```bash
ssh ec2-user@your-ec2-ip
cd Job_automate
git pull
```

3. **Dependencies install करा (if needed):**
```bash
npm install
```

4. **Server restart करा:**
```bash
pm2 restart autojobzy
# किंवा
npm run server
```

5. **Verify:**
```bash
pm2 logs autojobzy
curl https://api.autojobzy.com/api/health
```

### Option 2: Quick Production Update Script

```bash
#!/bin/bash
# deploy-to-production.sh

echo "Deploying to production..."

# 1. Commit changes
git add .
git commit -m "Fix: Updated Naukri login selectors"
git push

# 2. SSH and update
ssh ec2-user@your-ec2-ip << 'EOF'
cd Job_automate
git pull
npm install
pm2 restart autojobzy
pm2 logs autojobzy --lines 20
EOF

echo "✅ Deployment complete!"
```

---

## 🔀 Local ↔️ Production Switch करायचं कसं?

### Local Testing साठी:
```bash
# .env file मध्ये
VITE_API_BASE_URL=https://api.autojobzy.com/api

# Frontend restart करा
npm run dev
```

### Production Use साठी:
```bash
# .env file मध्ये
VITE_API_BASE_URL=https://api.autojobzy.com/api

# Frontend restart करा
npm run dev
```

---

## 🐛 Troubleshooting

### Frontend production API वापरतोय (wrong!)
**Problem:**
```bash
curl request shows: https://api.autojobzy.com
```

**Solution:**
```bash
# Check .env
cat .env

# Update .env
echo "VITE_API_BASE_URL=https://api.autojobzy.com/api" > .env

# Restart frontend
npm run dev
```

### Backend चालत नाही
```bash
# Check backend
lsof -ti:5000

# Start backend
npm run server

# Or use PM2
pm2 start server/index.js --name autojobzy
```

### Frontend चालत नाही
```bash
# Check frontend
lsof -ti:3000

# Start frontend
npm run dev
```

---

## 📊 Current Setup Verification

Run this anytime:
```bash
./test-local-setup.sh
```

Expected output:
```
✅ All systems ready for testing!
```

---

## ✅ Checklist

### Local Testing (आत्ताच करायचं):
- [x] `.env` file created
- [x] API URL set to `https://api.autojobzy.com/api`
- [x] Backend running on 5000
- [x] Frontend running on 3000
- [ ] **Test automation from browser** ← हे करा आता!
- [ ] Verify login works
- [ ] Check logs show new messages

### Production Deploy (local test success झाल्यावर):
- [ ] Commit changes to git
- [ ] Push to repository
- [ ] SSH to EC2
- [ ] Pull latest code
- [ ] Restart server
- [ ] Test on production URL
- [ ] Update `.env` to production URL (if needed)

---

## 🎯 Summary

| Item | Local (Testing) | Production (Live) |
|------|-----------------|-------------------|
| Frontend URL | http://localhost:3000 | https://autojobzy.com |
| Backend URL | https://api.autojobzy.com | https://api.autojobzy.com |
| Code Version | **Latest (updated selectors)** | Old (needs update) |
| `.env` Setting | `localhost:5000/api` | `api.autojobzy.com/api` |
| Login Status | ✅ **Should work now** | ❌ Will work after deploy |

---

**Next Step:** Browser मध्ये http://localhost:3000 वर जा आणि automation test करा! 🚀
