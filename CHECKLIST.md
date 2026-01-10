# ✅ Complete Setup & Deployment Checklist

## 📋 Pre-Setup Checklist

- [ ] Node.js 14+ installed (`node --version`)
- [ ] npm 6+ installed (`npm --version`)
- [ ] OpenAI account created (https://openai.com)
- [ ] OpenAI API key obtained (https://platform.openai.com/api-keys)
- [ ] Have Naukri credentials ready (email & password)
- [ ] Have resume file ready (PDF/TXT) - optional but recommended

---

## 🚀 Installation (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```
- [ ] No errors during installation
- [ ] `node_modules/` folder created
- [ ] Check: `npm list | head -20` shows packages

### Step 2: Create Environment File
```bash
cp server/.env.template .env
```
- [ ] `.env` file created in project root
- [ ] Not committed to git (already in .gitignore)

### Step 3: Configure OpenAI API Key
Edit `.env`:
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
```
- [ ] API key added to `.env`
- [ ] Format starts with `sk-proj-`
- [ ] Key has sufficient credits

### Step 4: Update Default Resume (Optional)
Edit `server/aiAnswer.js` line ~28:
- [ ] Replace with your actual resume text
- [ ] Or use default resume (provided)

---

## 🧪 Testing Phase (10 minutes)

### Test 1: Backend Starts
```bash
npm run server
```
- [ ] Server starts without errors
- [ ] Message shows: "🚀 Server running on https://api.autojobzy.com"
- [ ] No port conflicts

### Test 2: Health Check
```bash
curl https://api.autojobzy.com/api/health
```
- [ ] Returns: `{"status":"Server is running",...}`

### Test 3: Frontend Starts (New Terminal)
```bash
npm run dev
```
- [ ] Frontend compiles without errors
- [ ] Message shows: "Local: http://localhost:5173"
- [ ] No port conflicts

### Test 4: Browser Access
- [ ] Visit http://localhost:5173
- [ ] Page loads without errors
- [ ] Navigation works (Landing, Dashboard, etc)
- [ ] No console errors (F12)

### Test 5: API Connection
Go to Dashboard page:
- [ ] Page loads
- [ ] No connection errors in console
- [ ] Can see form fields

---

## 🔐 Credentials Setup (2 minutes)

### Option A: Save via API (Recommended)
```bash
curl -X POST https://api.autojobzy.com/api/credentials/set \
  -H "Content-Type: application/json" \
  -d '{"email":"your@naukri.com","password":"your-password"}'
```
- [ ] Response shows: `{"success":true}`
- [ ] Credentials saved to system keychain

### Option B: Add to .env File
Edit `.env`:
```env
NAUKRI_EMAIL=your@naukri.com
NAUKRI_PASSWORD=your-password
```
- [ ] Credentials added to `.env`
- [ ] `.env` is in `.gitignore` (not committed)

### Verify Credentials Saved
```bash
curl https://api.autojobzy.com/api/credentials/check
```
- [ ] Response shows: `{"hasCredentials":true}`

---

## 📄 Resume Upload (Optional)

Go to Dashboard in React:
- [ ] Click "Upload Resume" button
- [ ] Select PDF/TXT/DOC file
- [ ] See success message
- [ ] File listed in UI

OR upload via API:
```bash
curl -X POST https://api.autojobzy.com/api/resume/upload \
  -F "resume=@/path/to/resume.pdf"
```
- [ ] Response shows: `{"success":true,"fileName":"..."}`

---

## 🤖 Run Automation Test (2-3 minutes)

### Manual Test
1. Go to Dashboard
2. Click "Save Credentials" if not done
3. Click "Start Bot"
4. Watch logs appear in real-time
5. Bot should:
   - [ ] Open Naukri login page
   - [ ] Auto-login with credentials
   - [ ] Search for jobs
   - [ ] Start applying

### Check Logs
- [ ] Logs appear in dashboard
- [ ] Each action logged with timestamp
- [ ] No errors in backend terminal
- [ ] Browser console clean (no errors)

### Stop Bot
- [ ] Click "Stop Bot" button
- [ ] Automation stops gracefully
- [ ] Final stats shown

---

## 📊 Verification Tests

### Test API Endpoints

#### Get Logs
```bash
curl https://api.autojobzy.com/api/automation/logs
```
- [ ] Returns array of logs
- [ ] Timestamp format is correct

#### Check Status
```bash
curl https://api.autojobzy.com/api/automation/status
```
- [ ] Returns `isRunning` boolean
- [ ] Returns `logCount`

#### Clear Logs
```bash
curl -X POST https://api.autojobzy.com/api/automation/clear-logs
```
- [ ] Returns: `{"success":true}`

#### Check Resume Text
```bash
curl https://api.autojobzy.com/api/resume/text
```
- [ ] Returns resume content (if uploaded)

---

## 🐛 Troubleshooting Checklist

### If Backend Won't Start
- [ ] Check Node.js version: `node --version` (should be 14+)
- [ ] Check port 5000 is free: `lsof -i :5000`
- [ ] Check .env file exists
- [ ] Try fresh install:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### If Frontend Won't Load
- [ ] Check port 5173 is free: `lsof -i :5173`
- [ ] Check Vite server started correctly
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Check console for errors (F12)

### If Credentials Won't Save
- [ ] Check API endpoint is correct
- [ ] Check format: email and password required
- [ ] Try alternative: add to `.env` directly
- [ ] Check system keychain available (usually is)

### If OpenAI Errors
- [ ] Check API key in `.env` is correct
- [ ] Check API key format: `sk-proj-...`
- [ ] Check account has credits: https://platform.openai.com/account/billing/overview
- [ ] Test with curl:
  ```bash
  curl https://api.openai.com/v1/models \
    -H "Authorization: Bearer $OPENAI_API_KEY"
  ```

### If Bot Won't Login
- [ ] Verify credentials manually at naukri.com
- [ ] Check for 2FA enabled (may block automation)
- [ ] Try different credentials
- [ ] Check Naukri website hasn't changed UI

### If No Logs Appear
- [ ] Check bot is running: `curl https://api.autojobzy.com/api/automation/status`
- [ ] Check logs endpoint: `curl https://api.autojobzy.com/api/automation/logs`
- [ ] Check frontend polling interval (default 2 sec)
- [ ] Check browser console (F12) for errors

---

## 📋 Before Going to Production

- [ ] Update default resume in `server/aiAnswer.js`
- [ ] Customize job search URL
- [ ] Test with 1-2 pages first (don't max out)
- [ ] Verify all logs look correct
- [ ] Test job application actually goes through
- [ ] Change `PORT` if needed
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use stronger error handling
- [ ] Set up proper logging/monitoring
- [ ] Use HTTPS if deploying online

---

## 🌍 Production Deployment

### Prepare for Deployment
- [ ] Remove console.log statements (optional)
- [ ] Add production error handling
- [ ] Set up monitoring/alerting
- [ ] Use environment manager (not .env)
- [ ] Set `headless: true` in Puppeteer config
- [ ] Allocate more memory (Puppeteer intensive)

### Deploy Backend
```bash
# Option 1: Heroku
# Option 2: AWS Lambda
# Option 3: DigitalOcean
# Option 4: Self-hosted
```

### Deploy Frontend
```bash
# Build for production
npm run build

# Deploy dist/ folder to:
# - Vercel, Netlify, GitHub Pages, AWS S3, etc
```

### Configure CORS for Production
Edit `server/index.js`:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

---

## 📊 Final Checklist

### Code Quality
- [ ] No hardcoded credentials in code
- [ ] All functions documented
- [ ] Error handling in place
- [ ] Comments added
- [ ] Code formatted consistently
- [ ] No unused imports/variables

### Security
- [ ] Credentials in keychain/env, not code
- [ ] API keys protected
- [ ] CORS properly configured
- [ ] Input validation in place
- [ ] No sensitive data in logs

### Testing
- [ ] Backend tests pass
- [ ] Frontend loads
- [ ] API endpoints work
- [ ] Credentials save/load
- [ ] Resume upload works
- [ ] Automation runs
- [ ] Logs appear in real-time

### Documentation
- [ ] README_NEW.md complete
- [ ] SETUP_INSTRUCTIONS.md clear
- [ ] INTEGRATION_GUIDE.md detailed
- [ ] Code comments comprehensive
- [ ] EXAMPLE_USAGE.jsx provided
- [ ] STRUCTURE.md up-to-date

### Performance
- [ ] Backend starts in < 2 seconds
- [ ] Frontend loads in < 3 seconds
- [ ] API responds in < 1 second
- [ ] No memory leaks
- [ ] Browser smooth (no lag)

---

## ✅ Final Verification

Run this sequence to verify everything works:

```bash
# 1. Start backend
npm run server
# ✓ See: "🚀 Server running on https://api.autojobzy.com"

# 2. In new terminal, start frontend
npm run dev
# ✓ See: "Local: http://localhost:5173"

# 3. Test health
curl https://api.autojobzy.com/api/health
# ✓ Returns status: "Server is running"

# 4. Check credentials
curl https://api.autojobzy.com/api/credentials/check
# ✓ Returns: {"hasCredentials": true/false}

# 5. Open browser
# ✓ http://localhost:5173 loads
# ✓ Navigate to Dashboard
# ✓ No console errors (F12)

# 6. Save credentials (if not done)
# ✓ Click "Save Credentials" button
# ✓ Success message appears

# 7. Start bot
# ✓ Click "Start Bot"
# ✓ Logs appear in real-time
# ✓ Bot starts working

# 8. Monitor
# ✓ Watch logs for 30 seconds
# ✓ See job applications happening
# ✓ No errors in console

# 9. Stop
# ✓ Click "Stop Bot"
# ✓ Automation stops
# ✓ Final stats shown
```

---

## 🎉 You're Ready!

If all checkboxes are ✅, you have:

✅ Fully functional job automation bot
✅ Secure credential management
✅ Real-time monitoring
✅ AI-powered interview answers
✅ Production-ready code
✅ Complete documentation

**Start automating! 🚀**

---

## 📞 Quick Reference

| Issue | Command |
|-------|---------|
| Backend won't start | `npm run server` |
| Frontend won't load | `npm run dev` |
| Check API | `curl https://api.autojobzy.com/api/health` |
| Save credentials | `curl -X POST https://api.autojobzy.com/api/credentials/set -H "Content-Type: application/json" -d '{"email":"...","password":"..."}'` |
| View logs | `curl https://api.autojobzy.com/api/automation/logs` |
| Stop automation | `curl -X POST https://api.autojobzy.com/api/automation/stop` |
| Fresh install | `rm -rf node_modules package-lock.json && npm install` |

---

**Last updated: December 2024**
**Status: ✅ Complete and tested**
