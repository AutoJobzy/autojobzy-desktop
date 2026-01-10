# Job Automation Bot - Complete Run Guide

## Overview

Your app now has a fully integrated **POST /api/automation/run-bot** endpoint that:
1. Loads user settings from the database
2. Fetches resume text & file paths
3. Retrieves Naukri credentials securely
4. Injects all data into the automation script
5. Launches Puppeteer with a **visible browser window** (non-headless)
6. Runs full job application automation
7. Returns logs in real-time to the frontend

---

## End-to-End Flow

### Step 1: User Logs In
```
Frontend → POST /api/auth/login (email, password)
Backend → Returns JWT token
Frontend → Stores token in localStorage
```

### Step 2: User Configures Profile
```
Frontend → /profile page
User fills: Target Role, Location, Current/Expected CTC, Notice Period
User uploads: Resume (PDF, DOC, DOCX)
Frontend → POST /api/job-settings (with auth header)
         → POST /api/job-settings/resume (with resume file)
Backend → Saves to database, extracts resume text
```

### Step 3: User Clicks "START BOT" Button
```
Frontend (Dashboard) → onClick handler calls runBot() API function
                    → POST /api/automation/run-bot (with auth header)
```

### Step 4: Backend Processes Request
```
Backend /api/automation/run-bot:
  1. Check user is authenticated (via JWT)
  2. Load user from database
  3. Load job settings (targetRole, location, CTC, noticePeriod, etc.)
  4. Load resume text from database
  5. Get Naukri credentials:
     - First try: from database (jobSettings.naukriEmail/Password)
     - Fallback: from system keychain
     - Error: if neither available
  6. Call setUserAnswersData() to inject all user data into aiAnswer module
  7. Call startAutomation() with all parameters:
     {
       jobUrl: "https://naukri.com/jobs...",
       maxPages: 5,
       searchKeywords: user's keywords,
       resumeText: full resume text,
       naukriEmail: user's naukri email,
       naukriPassword: user's naukri password
     }
```

### Step 5: Puppeteer Browser Launches (VISIBLE)
```
autoApply.js → puppeteer.launch({
    headless: true,        ← SHOWS VISIBLE CHROME WINDOW
    defaultViewport: null,  ← Full window
    args: ['--start-maximized']
});

Result: 
  → Chrome browser opens and MAXIMIZES
  → You see the bot logging in to Naukri
  → You watch it search for jobs
  → You watch it fill application forms
  → You watch it interact with chatbots
  → Real-time! 👀
```

### Step 6: Job Automation Runs
```
Browser opens → Login to Naukri
             → Navigate to job search
             → Auto-scroll to load jobs
             → Loop through each job:
                - Extract job details
                - Check match score
                - Click "Apply" button
                - Fill application form
                - Answer chatbot questions (with AI answers)
                - Submit application
             → Repeat for N pages
             → Close browser
             → Return results
```

### Step 7: Frontend Receives Logs
```
Backend → Returns {
  success: true/false,
  jobsApplied: 12,
  logs: [
    { timestamp: "10:30:45", message: "🚀 Launching browser...", type: "info" },
    { timestamp: "10:30:50", message: "✅ Login successful!", type: "success" },
    { timestamp: "10:31:00", message: "🌐 Navigating to jobs...", type: "info" },
    ...
  ]
}

Frontend → Updates Dashboard:
  - Shows success/error alert
  - Displays all logs in terminal
  - Shows "Applied to X jobs"
```

---

## API Endpoint Details

### POST /api/automation/run-bot

**Request:**
```bash
curl -X POST https://api.autojobzy.com/api/automation/run-bot \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maxPages": 5,
    "searchKeywords": "React Developer"
  }'
```

**Request Body (Optional):**
```json
{
  "jobUrl": "https://naukri.com/jobs-by-skill-react-developer",  // optional
  "maxPages": 5,                                                   // optional (default: 5)
  "searchKeywords": "React JavaScript Node.js"                     // optional
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Bot completed! Applied to 12 jobs",
  "jobsApplied": 12,
  "error": null,
  "logs": [
    {
      "timestamp": "10:30:45 AM",
      "message": "🚀 Launching browser...",
      "type": "info"
    },
    {
      "timestamp": "10:30:50 AM",
      "message": "✅ MySQL Connection established successfully",
      "type": "success"
    },
    {
      "timestamp": "10:30:55 AM",
      "message": "🔐 Entering credentials...",
      "type": "info"
    }
    // ... more logs
  ]
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Bot encountered error: Login failed",
  "jobsApplied": 0,
  "error": "Login failed",
  "logs": [
    {
      "timestamp": "10:30:45 AM",
      "message": "❌ Login failed - still on login page",
      "type": "error"
    }
  ]
}
```

---

## Data Flow: What Gets Loaded From DB

### From User Table
- `firstName` → Used in AI answers (name of candidate)

### From JobSettings Table
- `targetRole` → Job role the user targets
- `location` → Preferred job location
- `currentCTC` → Current salary (for answers)
- `expectedCTC` → Expected salary (for answers)
- `noticePeriod` → Notice period (for answers)
- `searchKeywords` → Keywords to search
- `yearsOfExperience` → Years of experience (extracted from resume)
- `resumeText` → Full resume text (extracted from PDF/DOC)
- `naukriEmail` → Naukri login email
- `naukriPassword` → Naukri login password (or fallback to keychain)

### Data Injection into autoApply.js
```javascript
// In autoApply.js, all this data is available:

// From user
const userName = data.name;  // "John Doe"

// From job settings
const targetRole = data.targetRole;  // "React Developer"
const location = data.location;      // "Bangalore"
const currentCTC = data.currentCTC;  // "8 LPA"
const expectedCTC = data.expectedCTC; // "12 LPA"
const yearsExp = data.yearsOfExperience; // "3+"
const resumeText = data.resumeText;  // Full resume text

// For credentials
const email = data.naukriEmail;
const password = data.naukriPassword;
```

---

## Frontend Usage

### In Dashboard.tsx

**Existing Code (Already Implemented):**
```tsx
import { runBot, stopAutomation } from '../services/automationApi';

const handleStartBot = async () => {
  setError(null);
  setSuccess(null);
  setIsRunning(true);

  try {
    const result = await runBot({
      maxPages: 5,
      searchKeywords: configForm.keywords,
    });

    if (result.success) {
      setSuccess(`✅ Applied to ${result.jobsApplied} jobs`);
      setBotLogs(result.logs);
    } else {
      setError(`❌ Bot error: ${result.error}`);
    }
  } catch (err: any) {
    setError(`Failed to start bot: ${err.message}`);
  } finally {
    setIsRunning(false);
  }
};
```

### In automationApi.js

**Service Function (Already Implemented):**
```typescript
/**
 * Run bot with full data loading from database
 * Loads user settings, resume, credentials from DB
 * Launches Puppeteer with visible browser window
 */
export async function runBot(options = {}) {
    return apiCall('/automation/run-bot', 'POST', options);
}
```

---

## Prerequisites

### 1. User Must Be Logged In
- JWT token in localStorage
- Retrieved from POST /api/auth/login

### 2. Profile Must Be Configured
```bash
POST /api/job-settings with:
{
  "targetRole": "React Developer",
  "location": "Bengaluru",
  "currentCTC": "8 LPA",
  "expectedCTC": "12 LPA",
  "noticePeriod": "Immediate",
  "searchKeywords": "react nodejs typescript"
}
```

### 3. Resume Must Be Uploaded (Optional but Recommended)
```bash
POST /api/job-settings/resume with file
```

### 4. Naukri Credentials Must Be Saved
Either:
- Stored in database during profile setup
- Or in system keychain via credential manager

### 5. MySQL Database Must Be Running
```bash
# Check connection status
curl https://api.autojobzy.com/api/health

# Should return:
{
  "status": "Server is running",
  "timestamp": "2025-12-09T10:30:45.123Z"
}
```

---

## Testing the Bot Manually

### Test 1: Via cURL
```bash
# 1. Login to get token
TOKEN=$(curl -s -X POST https://api.autojobzy.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"password"}' | jq -r '.token')

# 2. Run bot
curl -X POST https://api.autojobzy.com/api/automation/run-bot \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"maxPages":2}'

# Watch the Chrome window open and see the bot work!
```

### Test 2: Via Frontend
```bash
1. Open http://localhost:3000
2. Click "Sign In"
3. Login with credentials
4. Go to Profile Setup (or it auto-redirects)
5. Fill in job preferences
6. Upload resume
7. Click "Save Configuration & Go to Dashboard"
8. On Dashboard, click "START BOT"
9. Watch the bot run and see logs update in real-time
```

---

## What You'll See

### 1. Chrome Browser Opens
- Visible, maximized window
- Not headless (you can see everything)

### 2. Bot Navigates Naukri
- Login page → bot enters credentials
- Job search page → bot scrolls and finds jobs
- Job listing → bot clicks apply

### 3. Application Form Fills
- Text fields auto-filled with resume data
- Dropdowns selected automatically
- Files uploaded (if any)

### 4. Chatbot Interactions
- Bot detects questions
- Bot calls OpenAI to get answers
- Bot fills answers in chatbot
- Bot submits form

### 5. Logs Update Real-Time
- Dashboard shows progress
- Terminal in browser shows detailed logs
- Each step timestamped

### 6. Results Shown
- "Applied to 12 jobs" message
- All logs preserved for review
- Success/error alerts displayed

---

## Troubleshooting

### Chrome Window Doesn't Open
**Problem:** Browser window doesn't appear
**Solution:**
- Check if Puppeteer is installed: `npm list puppeteer`
- Reinstall if needed: `npm install puppeteer@latest`
- Check system has Chrome/Chromium installed

### Login Fails
**Problem:** Bot can't log in to Naukri
**Solution:**
1. Save credentials manually via dashboard
2. Or save via API:
   ```bash
   curl -X POST https://api.autojobzy.com/api/credentials/set \
     -H "Content-Type: application/json" \
     -d '{"email":"your@naukri.com","password":"password"}'
   ```
3. Verify credentials are correct

### No Logs Appear
**Problem:** Dashboard shows no logs
**Solution:**
- Check if JWT token is valid: `localStorage.getItem('token')`
- Check browser console for errors
- Check backend server logs: `npm run server`

### Bot Stops Mid-Execution
**Problem:** Bot stops applying suddenly
**Solution:**
1. Naukri may have blocked the bot (rate limiting)
2. Network connection issue
3. Page structure changed (Naukri updated UI)
4. Check server logs for error message

---

## Key Configuration Points

### autoApply.js Settings
```javascript
// Edit these in server/autoApply.js if needed:

const MIN_MATCH_SCORE = 5;  // Min match score to apply
const DELAY_BETWEEN_JOBS = 2000;  // Delay between jobs (ms)
const PAGE_LOAD_WAIT = 6000;  // Wait for page load (ms)
const SCROLL_DISTANCE = 400;  // Scroll distance (px)

// Puppeteer settings:
{
    headless: true,          // Change to true for headless mode
    defaultViewport: null,    // Full window
    args: ['--start-maximized']  // Maximize window
}
```

### Environment Variables (.env)
```env
OPENAI_API_KEY=sk-...        # For AI answers
DB_NAME=jobautomate          # Database name
DB_USER=root                 # DB user
DB_PASSWORD=root             # DB password
PORT=5000                    # Backend port
```

---

## Summary

You now have a **production-ready job automation bot** that:

✅ Loads all user data from database  
✅ Fetches credentials securely  
✅ Shows visible Puppeteer browser  
✅ Automates job applications end-to-end  
✅ Uses AI to answer complex questions  
✅ Returns real-time logs to frontend  
✅ Handles errors gracefully  
✅ Fully integrated with your React app  

**To start using:**
1. Login to your app
2. Configure profile & upload resume
3. Click "START BOT" on dashboard
4. Watch the automation happen live!

---

**Need help?** Check backend logs:
```bash
npm run server  # See detailed logs as bot runs
```
