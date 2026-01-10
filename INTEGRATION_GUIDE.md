# Job Automation Bot - Integration Guide

## Overview

This guide explains how the Node.js automation scripts are integrated into your React application. The system consists of:

1. **Express Backend Server** - Runs Puppeteer automation
2. **React Frontend** - UI for starting/stopping bot and monitoring logs
3. **Secure Credential Management** - System keychain support
4. **AI-Powered Resume Integration** - OpenAI integration for interview answers

---

## Project Structure

```
jobautomate/
├── server/                      # Backend automation
│   ├── index.js                # Express server (main entry point)
│   ├── aiAnswer.js             # AI answer generation module
│   ├── autoApply.js            # Job automation logic
│   ├── .env.template           # Environment variables template
│   ├── utils/
│   │   └── credentialsManager.js  # Secure credential handling
│   └── routes/
│       ├── automation.js       # Automation API routes
│       └── credentials.js      # Credentials management routes
│
├── App.tsx                     # React main app
├── pages/
│   ├── Dashboard.tsx           # Main automation dashboard
│   ├── Auth.tsx               # Authentication
│   └── ...
├── context/
│   └── AppContext.tsx         # Global state management
│
└── package.json               # Dependencies
```

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

The new dependencies added:
- `puppeteer` - Browser automation
- `openai` - AI-powered answers
- `express` - Backend server
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `multer` - File upload handling
- `pdfparse` - PDF text extraction
- `node-keytar` - System keychain (optional)

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
cp server/.env.template .env
```

Configure the file:

```env
# Required: OpenAI API Key
OPENAI_API_KEY=sk-proj-xxx...

# Server Configuration
PORT=5000
NODE_ENV=development

# Optional: Naukri Credentials (if not using system keychain)
# NAUKRI_EMAIL=your-email@example.com
# NAUKRI_PASSWORD=your-password

# Resume Storage
RESUME_UPLOAD_PATH=./uploads/resumes
MAX_PAGES_TO_PROCESS=10
```

### 3. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env` file

---

## How It Works

### Architecture Flow

```
React UI (Start Bot Button)
    ↓
    └─→ API Request to /api/automation/start
        ↓
        └─→ Express Server
            ↓
            ├─→ Fetch credentials (system keychain or .env)
            ├─→ Launch Puppeteer browser
            ├─→ Login to Naukri
            ├─→ Extract job listings
            ├─→ For each job:
            │   ├─→ Check match score
            │   ├─→ Click apply button
            │   ├─→ Detect chatbot
            │   ├─→ Get AI answers via OpenAI
            │   └─→ Fill form automatically
            └─→ Return logs to React UI
```

### Core Components

#### 1. **Credential Management** (`credentialsManager.js`)
- Stores Naukri email/password securely
- Uses system keychain (most secure)
- Falls back to environment variables
- Never exposes credentials in frontend

```javascript
// Usage in backend
import { getCredentials } from './utils/credentialsManager.js';
const { email, password } = await getCredentials();
```

#### 2. **Resume Integration** (`aiAnswer.js`)
- Initializes resume from uploaded file or defaults
- Answers common questions instantly (name, experience, location, salary)
- Uses OpenAI for complex/scenario-based questions
- Maintains context from resume throughout session

```javascript
// Initialize with uploaded resume
initializeResume(resumeText);

// Get answer to any question
const answer = await getAnswer("What is your experience?");
```

#### 3. **Auto Apply** (`autoApply.js`)
- Main automation logic
- Handles Naukri login
- Extracts and applies for jobs
- Auto-answers interview chatbots
- Generates detailed logs
- Supports stop/pause functionality

```javascript
// Start automation
const result = await startAutomation({
  jobUrl: "https://...",
  maxPages: 10,
  resumeText: uploadedResumeText
});

// Result: { success, jobsApplied, logs }
```

#### 4. **Express Server** (`index.js`)
- REST API for frontend communication
- File upload handling
- Resume parsing (PDF, TXT)
- Credentials management endpoints
- Real-time logging

---

## API Endpoints

### Automation Control

```bash
# Start automation
POST /api/automation/start
Body: {
  "jobUrl": "https://naukri.com/...",
  "maxPages": 10,
  "resumeText": "PDF text content..."
}
Response: { success, jobsApplied, logs }

# Stop automation
POST /api/automation/stop
Response: { success, logs }

# Get logs
GET /api/automation/logs
Response: { logs, isRunning, logCount }

# Clear logs
POST /api/automation/clear-logs
Response: { success }

# Get status
GET /api/automation/status
Response: { isRunning, logCount, lastLog }
```

### Credentials Management

```bash
# Save credentials
POST /api/credentials/set
Body: {
  "email": "your-email@naukri.com",
  "password": "your-password"
}
Response: { success, message }

# Check if credentials exist
GET /api/credentials/check
Response: { hasCredentials, message }

# Clear credentials
DELETE /api/credentials/clear
Response: { success }
```

### Resume Management

```bash
# Upload resume
POST /api/resume/upload
Body: FormData with 'resume' file (PDF/TXT/DOC)
Response: { success, fileName, message }

# Get resume text
GET /api/resume/text
Response: { resumeText }
```

---

## Frontend Integration (React)

### Update Dashboard.tsx

The Dashboard component needs to be updated to call the backend API:

```typescript
// Add this function in Dashboard.tsx
const handleStartBot = async () => {
  try {
    setIsRunning(true);
    
    const response = await fetch('https://api.autojobzy.com/api/automation/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobUrl: configForm.jobSearchUrl,
        maxPages: 10,
        resumeText: resumeText // from uploaded file
      })
    });

    const result = await response.json();
    if (result.success) {
      alert(`Applied to ${result.jobsApplied} jobs!`);
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error('Error starting bot:', error);
  } finally {
    setIsRunning(false);
  }
};
```

### Resume Upload Handler

```typescript
const handleResumeUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await fetch('https://api.autojobzy.com/api/resume/upload', {
    method: 'POST',
    body: formData
  });

  if (response.ok) {
    const data = await response.json();
    console.log('Resume uploaded:', data.fileName);
  }
};
```

---

## Step-by-Step Execution

### 1. **User Logs In**
   - React frontend authenticates user
   - User navigates to Dashboard

### 2. **User Uploads Resume** (Optional)
   - Click "Upload Resume" button
   - Select PDF/TXT/DOC file
   - File sent to `/api/resume/upload`
   - Backend extracts text and stores in memory
   - AI uses this text for answers

### 3. **User Saves Naukri Credentials** (First time only)
   - User enters Naukri email and password
   - POST to `/api/credentials/set`
   - Credentials saved to system keychain securely
   - Future runs auto-fetch from keychain

### 4. **User Clicks "Start Bot"**
   - React sends POST to `/api/automation/start`
   - Express server launches Puppeteer
   - Browser opens Naukri in visible window (not headless)
   - Auto-logs in with saved credentials
   - Automation begins...

### 5. **Real-Time Monitoring**
   - Frontend polls `/api/automation/logs` every 2 seconds
   - Displays live logs in UI
   - Shows current job, questions, answers

### 6. **Automation Completes**
   - Final stats sent to frontend
   - Total jobs applied displayed
   - Logs downloadable as JSON/CSV

---

## Security Considerations

### ✅ What's Secure

1. **Credentials Storage**
   - Uses system keychain (most secure)
   - Never stored in localStorage
   - Never sent to OpenAI or external services

2. **Environment Variables**
   - Sensitive keys in `.env` (not in code)
   - `.env` file gitignored
   - Never exposed to frontend

3. **API Communication**
   - Backend-to-OpenAI only
   - Frontend never calls OpenAI directly
   - CORS configured for localhost only

### ⚠️ Important Notes

1. **Do NOT commit `.env` file**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Change default resume** - Update the resume in `aiAnswer.js` with your actual resume

3. **API Key security** - Rotate OpenAI keys periodically

---

## Running the Application

### Terminal 1: Start Backend

```bash
# From project root
npm run server
# Or manually:
node server/index.js
```

Should show:
```
🚀 Server running on https://api.autojobzy.com
```

### Terminal 2: Start Frontend

```bash
# From project root (new terminal)
npm run dev
```

Should show:
```
  VITE  ready in 123 ms

  ➜  Local:   http://localhost:5173/
```

### 3. Open Browser

Visit `http://localhost:5173` → Go to Dashboard → Click "Start Bot"

---

## Troubleshooting

### Bot Won't Start

1. **Check backend is running**
   ```bash
   curl https://api.autojobzy.com/api/health
   ```

2. **Check credentials are saved**
   ```bash
   curl https://api.autojobzy.com/api/credentials/check
   ```

3. **Check OpenAI API key**
   - Verify key is in `.env`
   - Test with: `echo $OPENAI_API_KEY`

### Login Fails

1. **Naukri credentials incorrect**
   - Verify email/password manually at naukri.com
   - Update via `/api/credentials/set`

2. **Naukri UI changed**
   - Selectors may need updating in `autoApply.js`
   - Check browser console for errors

### No Logs Appearing

1. **Check API connection**
   ```bash
   curl https://api.autojobzy.com/api/automation/logs
   ```

2. **Check browser isn't blocked**
   - Allow popups for naukri.com
   - Check firewall settings

---

## Production Deployment

### For Deployment:

1. **Use environment manager** (not .env file)
   - AWS Secrets Manager
   - Azure Key Vault
   - Heroku Config Vars

2. **Update CORS settings**
   ```javascript
   // server/index.js
   app.use(cors({
     origin: 'https://yourdomain.com',
     credentials: true
   }));
   ```

3. **Use HTTPS only**
   - Certificates from Let's Encrypt
   - All API calls over HTTPS

4. **Run backend on separate server**
   - Puppeteer needs headless: true (no window)
   - More memory for browser instances

---

## Advanced Customization

### Add Custom Job Filters

Edit `autoApply.js` → `startAutomation()`:

```javascript
// Custom filter logic
const qualifiesForJob = await customJobFilter(jobPage);
if (!qualifiesForJob) continue;
```

### Add More Resume Data

Edit `aiAnswer.js` → `initializeResume()`:

```javascript
export function initializeResume(fileText) {
  if (fileText) {
    resumeText = fileText;
  } else {
    resumeText = `YOUR COMPLETE RESUME HERE`;
  }
}
```

### Add More Common Answers

Edit `aiAnswer.js` → `commonAnswers` object:

```javascript
const commonAnswers = {
  experience: () => '3 years',
  notice: () => '0 days',
  // Add more here
};
```

---

## Support & FAQ

**Q: Can I use this with other job sites?**
A: Yes, but selectors need to be updated for each site.

**Q: Will Naukri ban me?**
A: Unlikely if used responsibly. Space out applications and don't overload.

**Q: Can I customize the answers?**
A: Yes, edit `commonAnswers` in `aiAnswer.js` or provide custom resume.

**Q: Is my password safe?**
A: Yes, stored in system keychain, never exposed.

---

For questions or issues, check the code comments throughout the files for detailed explanations.

Happy automating! 🤖
