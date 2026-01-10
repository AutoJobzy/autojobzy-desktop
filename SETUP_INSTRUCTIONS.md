# 🤖 Job Automation Bot - Quick Start Guide

## What Was Created

I've completely refactored and production-ified your Node.js automation scripts. Here's what you now have:

### ✨ Key Improvements

1. **Modular Architecture** - Clean separation of concerns
2. **Secure Credentials** - System keychain support + fallback to .env
3. **Express Backend** - Full REST API for React integration
4. **AI Integration** - OpenAI for intelligent interview answers
5. **Resume Support** - Upload & auto-extract text (PDF, TXT)
6. **Real-time Logging** - Timestamped, categorized logs
7. **Error Handling** - Comprehensive try-catch and recovery
8. **Production Ready** - Comments, documentation, best practices

---

## Files Created/Modified

### Backend Files (NEW)

```
server/
├── index.js                    # Express server (main entry point)
├── aiAnswer.js                 # AI answer generation (refactored from aiAnswer.js)
├── autoApply.js                # Job automation (refactored from autoApply.js)
├── .env.template               # Environment variables template
├── utils/
│   └── credentialsManager.js   # System keychain integration
└── routes/
    ├── automation.js           # /api/automation/* endpoints
    └── credentials.js          # /api/credentials/* endpoints
```

### Configuration Files (NEW)

```
.env.template                   # Copy to .env and configure
INTEGRATION_GUIDE.md            # Detailed setup & architecture guide
SETUP_INSTRUCTIONS.md           # This file
```

### Modified Files

```
package.json                    # Added dependencies & scripts
```

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

```bash
# Copy template
cp server/.env.template .env

# Edit .env and add:
# 1. OPENAI_API_KEY - Get from https://platform.openai.com/api-keys
# 2. Optional: NAUKRI_EMAIL & NAUKRI_PASSWORD (or use system keychain)
```

### Step 3: Update Resume

Edit `server/aiAnswer.js` and replace the default resume in `initializeResume()` function with your actual resume.

### Step 4: Run Both Servers

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Step 5: Test It

1. Open `http://localhost:5173`
2. Go to Dashboard
3. Upload resume (optional)
4. Save Naukri credentials
5. Click "Start Bot" button

---

## 📋 How It Works

### Architecture Overview

```
React Dashboard
       ↓
   [Start Bot]
       ↓
   Express API
   (https://api.autojobzy.com)
       ↓
   Puppeteer Browser
       ↓
   Naukri.com
   - Auto Login
   - Job Search
   - Apply
   - Answer Chatbot
   - Use AI for answers
```

### What Happens When You Click "Start Bot"

1. **React** sends request to backend with job URL & resume text
2. **Backend** fetches Naukri credentials from system keychain
3. **Puppeteer** launches visible browser (you see what bot does)
4. **Bot** logs in automatically
5. **Bot** searches for jobs and applies
6. **For each application**:
   - Checks match score
   - Clicks apply button
   - Detects chatbot questions
   - Gets AI answers from OpenAI
   - Auto-fills form
7. **Logs** streamed to React dashboard in real-time
8. **Results** shown after completion

---

## 🔐 Credential Management

### Option 1: System Keychain (Recommended) ✅

First time:
```bash
# Save credentials once (uses system keychain)
curl -X POST https://api.autojobzy.com/api/credentials/set \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"your-password"}'
```

After that:
- Credentials auto-fetched from system keychain
- No need to enter again
- Secure & encrypted

### Option 2: Environment Variables

If keychain fails, add to `.env`:
```env
NAUKRI_EMAIL=your@email.com
NAUKRI_PASSWORD=your-password
```

---

## 📊 API Endpoints

### Automation Control

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/automation/start` | POST | Start job applying |
| `/api/automation/stop` | POST | Stop automation |
| `/api/automation/logs` | GET | Get live logs |
| `/api/automation/status` | GET | Check if running |

### Credentials

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/credentials/set` | POST | Save credentials |
| `/api/credentials/check` | GET | Check if saved |
| `/api/credentials/clear` | DELETE | Clear credentials |

### Resume

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/resume/upload` | POST | Upload resume file |
| `/api/resume/text` | GET | Get resume text |

---

## 🎯 Key Features Explained

### 1. Secure Credentials 🔒

Your Naukri email/password is:
- Stored in **system keychain** (macOS Keychain, Windows Credential Manager, Linux Secret Service)
- Never exposed to frontend
- Never logged
- Never sent to OpenAI

```javascript
// How it works:
import { getCredentials } from './utils/credentialsManager.js';
const { email, password } = await getCredentials();
// Returns credentials from keychain or .env
```

### 2. Resume Integration 📄

Upload your actual resume:
- **PDF** - Automatically extracts text
- **TXT** - Plain text
- **DOC/DOCX** - Convert to PDF first

AI then uses your resume for intelligent answers:
```javascript
// Common questions answered instantly from resume:
- "What is your experience?" → "3 years" (from resume)
- "What is your location?" → "Pune" (from resume)
- "What is your current salary?" → "6 LPA" (from resume)

// Complex questions go to OpenAI:
- "Tell me about your recent project" → Uses OpenAI with resume context
```

### 3. Smart Question Answering 🤖

Three-tier approach:
1. **Hardcoded answers** - Common questions (instant, no API cost)
2. **Resume extraction** - Auto answers from your actual resume
3. **OpenAI fallback** - Complex questions using your resume as context

### 4. Real-Time Logging 📝

Every action logged with timestamp and type:
```javascript
addLog('🌐 Opening Naukri login...', 'info');
addLog('✅ Login successful!', 'success');
addLog('❌ Job skipped - poor match', 'warning');
addLog('💥 Error: Connection timeout', 'error');
```

Logs streamed to frontend in real-time.

### 5. Job Filtering 🔍

Bot automatically:
- Checks **match score** (skips if below threshold)
- Skips **external application** links
- Verifies **apply button** exists
- Handles **chatbot interactions**

---

## 📱 Frontend Integration

### Update Dashboard.tsx

Replace your existing "Start Bot" handler with:

```typescript
const handleStartBot = async () => {
  try {
    const response = await fetch('https://api.autojobzy.com/api/automation/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobUrl: configForm.jobSearchUrl || 'https://www.naukri.com/dot-net-developer-jobs',
        maxPages: configForm.maxPages || 10,
        resumeText: uploadedResumeText // if you uploaded
      })
    });

    const result = await response.json();
    
    if (result.success) {
      alert(`Success! Applied to ${result.jobsApplied} jobs`);
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    alert(`Connection error: ${error.message}`);
  }
};
```

### Update Resume Upload Handler

```typescript
const handleResumeUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('resume', file);

  try {
    const response = await fetch('https://api.autojobzy.com/api/resume/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      setResumeUploaded(true);
      alert(`Resume uploaded: ${data.fileName}`);
    }
  } catch (error) {
    alert(`Upload error: ${error.message}`);
  }
};
```

### Poll Logs in Real-Time

```typescript
useEffect(() => {
  if (isRunning) {
    const interval = setInterval(async () => {
      const response = await fetch('https://api.autojobzy.com/api/automation/logs');
      const data = await response.json();
      setLogs(data.logs);
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }
}, [isRunning]);
```

---

## 🧪 Testing Manually

### Test Backend Health
```bash
curl https://api.autojobzy.com/api/health
```

### Test Credential Save
```bash
curl -X POST https://api.autojobzy.com/api/credentials/set \
  -H "Content-Type: application/json" \
  -d '{"email":"test@naukri.com","password":"test123"}'
```

### Test Credential Check
```bash
curl https://api.autojobzy.com/api/credentials/check
```

### Start Automation
```bash
curl -X POST https://api.autojobzy.com/api/automation/start \
  -H "Content-Type: application/json" \
  -d '{"maxPages":2}'
```

### Get Logs
```bash
curl https://api.autojobzy.com/api/automation/logs
```

---

## ⚡ Performance Tips

1. **Limit pages** - Start with `maxPages: 2` for testing, increase for production
2. **Match score** - Higher threshold (6+) = fewer poor applications
3. **Delays** - Already optimized but can be adjusted in `autoApply.js`
4. **Memory** - Puppeteer uses ~200MB per job page, allocate accordingly

---

## 🐛 Troubleshooting

### Bot Won't Connect

```bash
# Check backend is running
curl https://api.autojobzy.com/api/health

# Check logs
npm run server  # Look for errors
```

### Login Fails

1. Verify credentials at naukri.com manually
2. Save new credentials:
   ```bash
   curl -X POST https://api.autojobzy.com/api/credentials/set \
     -H "Content-Type: application/json" \
     -d '{"email":"your@email.com","password":"your-password"}'
   ```

### OpenAI API Errors

1. Check API key in `.env`
2. Verify key has credits: https://platform.openai.com/account/billing/overview
3. Check rate limits: https://platform.openai.com/account/rate-limits

### Resume Text Not Extracted

- PDF may be image-based (scanned)
- Try TXT format instead
- Or manually paste resume text

---

## 📚 File Documentation

### `server/index.js`
- Express server setup
- CORS configuration
- File upload handling
- Resume text extraction
- Route registration

### `server/aiAnswer.js`
- Resume storage management
- Common answer patterns
- OpenAI integration
- Question answering logic

### `server/autoApply.js`
- Puppeteer automation logic
- Naukri login
- Job filtering
- Chatbot interaction
- Logging system

### `server/utils/credentialsManager.js`
- System keychain interface
- Secure credential storage
- Fallback to environment variables

### `server/routes/automation.js`
- `/api/automation/*` endpoints
- Start/stop automation
- Log retrieval
- Status checking

### `server/routes/credentials.js`
- `/api/credentials/*` endpoints
- Credential save/check/clear
- Input validation

---

## 🚀 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Create `.env` file with OpenAI key
3. ✅ Run backend: `npm run server`
4. ✅ Run frontend: `npm run dev`
5. ✅ Test at http://localhost:5173
6. ✅ Save Naukri credentials via UI or API
7. ✅ Click "Start Bot" and watch the magic! ✨

---

## 📝 Notes

- **DO NOT commit `.env` file** (add to `.gitignore`)
- Change default resume in `aiAnswer.js`
- Update selectors if Naukri UI changes
- Use carefully - respect job board terms of service
- Monitor logs for any issues

---

## 🆘 Need Help?

1. Check `INTEGRATION_GUIDE.md` for detailed documentation
2. Review code comments in each file
3. Check browser console for frontend errors
4. Check terminal output for backend errors
5. Verify all dependencies installed: `npm list`

---

**You're all set! Happy automating! 🎉**
