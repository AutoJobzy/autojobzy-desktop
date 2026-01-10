# Project Structure Overview

```
jobautomate/
│
├── 📄 README_NEW.md                    ⭐ START HERE - Main overview
├── 📄 SETUP_INSTRUCTIONS.md             ⭐ Quick 5-min setup guide
├── 📄 INTEGRATION_GUIDE.md              ⭐ Detailed docs & API reference
├── 📄 COMPLETION_SUMMARY.md             📊 What was delivered
├── 📄 EXAMPLE_USAGE.jsx                 💻 React integration examples
├── 📄 STRUCTURE.md                      📋 This file
│
├── 📁 server/                           🖥️  BACKEND (NEW)
│   ├── index.js                         🟢 Express server (main)
│   ├── aiAnswer.js                      🤖 AI answer generation
│   ├── autoApply.js                     🤳 Puppeteer automation
│   ├── .env.template                    ⚙️  Configuration template
│   │
│   ├── 📁 utils/                        🔧 Utilities
│   │   └── credentialsManager.js        🔐 Secure credential storage
│   │
│   └── 📁 routes/                       🛣️  API Routes
│       ├── automation.js                ✅ Automation endpoints
│       └── credentials.js               🔑 Credential endpoints
│
├── 📁 services/                         📡 FRONTEND UTILITIES (NEW)
│   └── automationApi.js                 🔌 React API client
│
├── 📁 components/                       🎨 REACT COMPONENTS (Existing)
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── DashboardLayout.tsx
│   ├── DashboardSidebar.tsx
│   ├── Features.tsx
│   ├── Hero.tsx
│   ├── HowItWorks.tsx
│   ├── Pricing.tsx
│   ├── Stats.tsx
│   ├── StudentSection.tsx
│   └── TerminalDemo.tsx
│
├── 📁 pages/                            📖 PAGE COMPONENTS (Existing)
│   ├── Landing.tsx
│   ├── Auth.tsx
│   ├── Plans.tsx
│   ├── Dashboard.tsx                    ⚡ UPDATE THIS with example code
│   └── ProfileSetup.tsx
│
├── 📁 context/                          🌍 GLOBAL STATE
│   └── AppContext.tsx                   (Existing - no changes needed)
│
├── 📁 uploads/                          💾 USER UPLOADS (Auto-created)
│   └── resumes/                         📄 Resume files stored here
│
├── 📄 App.tsx                           (Existing)
├── 📄 index.tsx                         (Existing)
├── 📄 constants.ts                      (Existing)
├── 📄 types.ts                          (Existing)
├── 📄 metadata.json                     (Existing)
├── 📄 index.html                        (Existing)
├── 📄 tsconfig.json                     (Existing)
├── 📄 vite.config.ts                    (Existing)
│
├── 📄 package.json                      📦 MODIFIED - Added dependencies
├── 📄 .env                              ⚙️  NEW - Create from .env.template
│                                         (DO NOT COMMIT!)
│
└── 📄 .gitignore                        (Add: .env, node_modules, uploads/)
```

---

## 📊 File Breakdown

### 🆕 NEW FILES CREATED

#### Backend Files
| File | Lines | Purpose |
|------|-------|---------|
| `server/index.js` | 312 | Express server, API setup |
| `server/aiAnswer.js` | 186 | AI-powered question answering |
| `server/autoApply.js` | 450+ | Puppeteer automation engine |
| `server/utils/credentialsManager.js` | 78 | Secure credential management |
| `server/routes/automation.js` | 125 | `/api/automation/*` routes |
| `server/routes/credentials.js` | 92 | `/api/credentials/*` routes |

#### Configuration & Documentation
| File | Purpose |
|------|---------|
| `server/.env.template` | Environment variables template |
| `README_NEW.md` | Project overview (START HERE) |
| `SETUP_INSTRUCTIONS.md` | Quick 5-minute setup |
| `INTEGRATION_GUIDE.md` | Detailed docs & architecture |
| `COMPLETION_SUMMARY.md` | Deliverables summary |
| `STRUCTURE.md` | This file |
| `EXAMPLE_USAGE.jsx` | React integration code |

#### Frontend Utilities
| File | Purpose |
|------|---------|
| `services/automationApi.js` | React API client functions |

---

### 🔧 MODIFIED FILES

| File | Changes |
|------|---------|
| `package.json` | Added 10 dependencies + npm scripts |

---

### 📚 EXISTING FILES (No Changes)

```
App.tsx                    # React app root
index.tsx                  # Entry point
components/               # React components (no changes)
pages/                    # React pages (no changes needed yet)
context/                  # Global state (no changes)
```

---

## 🚀 Execution Flow

### On Frontend
```
User Action (Click "Start Bot")
    ↓
Dashboard.tsx
    ↓
Call automationApi.js → startAutomation()
    ↓
HTTP POST to https://api.autojobzy.com/api/automation/start
```

### On Backend
```
Express Server (index.js)
    ↓
Routes Handler (routes/automation.js)
    ↓
Puppeteer Browser Launch (autoApply.js)
    ↓
Login with credentials (credentialsManager.js)
    ↓
Apply for jobs (autoApply.js)
    ↓
Get AI answers (aiAnswer.js) → OpenAI API
    ↓
Return logs to frontend
```

---

## 📦 Dependencies Added

```json
{
  "dependencies": {
    "express": "^4.18.2",           // Backend server
    "cors": "^2.8.5",               // Cross-origin requests
    "dotenv": "^16.3.1",            // Environment variables
    "puppeteer": "^21.6.0",         // Browser automation
    "openai": "^4.24.0",            // AI integration
    "multer": "^1.4.5-lts.1",       // File uploads
    "pdfparse": "^1.1.1",           // PDF text extraction
    "node-keytar": "^7.9.0"         // System keychain
  }
}
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│                  (Dashboard.tsx)                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • Resume Upload Button                              │   │
│  │  • Credentials Form                                  │   │
│  │  • Start/Stop Bot Buttons                           │   │
│  │  • Live Logs Display                                │   │
│  └──────────────────┬──────────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────────┘
                      │ HTTP/JSON
                      │ (automationApi.js)
                      ↓
┌─────────────────────────────────────────────────────────────┐
│            Express Backend Server                            │
│            (server/index.js :5000)                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Routes:                                         │   │
│  │  ├─ POST /api/automation/start                      │   │
│  │  ├─ POST /api/automation/stop                       │   │
│  │  ├─ GET /api/automation/logs                        │   │
│  │  ├─ POST /api/credentials/set                       │   │
│  │  └─ POST /api/resume/upload                         │   │
│  └──────────────────┬──────────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬──────────────┐
        │             │             │              │
        ↓             ↓             ↓              ↓
   autoApply.js  aiAnswer.js   credentials     File Storage
   (Puppeteer)   (OpenAI)     Manager
        │             │         (Keychain)
        ↓             ↓             │
    Naukri       OpenAI API    System Keychain
                                  │
                                  ↓
                              macOS/Windows/Linux
                              Credential Manager
```

---

## 📁 Directory Tree (Full)

```
jobautomate (4)/
├── README_NEW.md
├── SETUP_INSTRUCTIONS.md
├── INTEGRATION_GUIDE.md
├── COMPLETION_SUMMARY.md
├── EXAMPLE_USAGE.jsx
├── STRUCTURE.md
├── App.tsx
├── index.tsx
├── index.html
├── tsconfig.json
├── vite.config.ts
├── constants.ts
├── types.ts
├── metadata.json
├── package.json (MODIFIED)
├── .env (CREATE THIS)
├── .env.template (NEW)
│
├── server/
│   ├── index.js (NEW)
│   ├── aiAnswer.js (NEW)
│   ├── autoApply.js (NEW)
│   ├── .env.template (NEW)
│   ├── utils/
│   │   └── credentialsManager.js (NEW)
│   └── routes/
│       ├── automation.js (NEW)
│       └── credentials.js (NEW)
│
├── services/
│   └── automationApi.js (NEW)
│
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── DashboardLayout.tsx
│   ├── DashboardSidebar.tsx
│   ├── Features.tsx
│   ├── Hero.tsx
│   ├── HowItWorks.tsx
│   ├── Pricing.tsx
│   ├── Stats.tsx
│   ├── StudentSection.tsx
│   └── TerminalDemo.tsx
│
├── pages/
│   ├── Landing.tsx
│   ├── Auth.tsx
│   ├── Plans.tsx
│   ├── Dashboard.tsx
│   └── ProfileSetup.tsx
│
├── context/
│   └── AppContext.tsx
│
├── uploads/
│   └── resumes/
│
└── node_modules/
    ├── express/
    ├── puppeteer/
    ├── openai/
    ├── ... (other packages)
```

---

## ⚡ Quick Reference

### To Start Development
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend  
npm run dev
```

### To Build for Production
```bash
npm run build
```

### To Access the App
- Frontend: http://localhost:5173
- Backend: https://api.autojobzy.com
- API Docs: See INTEGRATION_GUIDE.md

### Important Files to Customize
- `server/aiAnswer.js` - Update default resume (line ~28)
- `server/aiAnswer.js` - Add custom Q&A (line ~89)
- `.env` - Add OpenAI API key
- `EXAMPLE_USAGE.jsx` - Copy React code into Dashboard.tsx

---

## 📖 Documentation Map

| Question | Document |
|----------|----------|
| How do I set this up? | SETUP_INSTRUCTIONS.md |
| How does it work? | INTEGRATION_GUIDE.md |
| What was created? | COMPLETION_SUMMARY.md |
| Show me React code | EXAMPLE_USAGE.jsx |
| Project structure | This file (STRUCTURE.md) |
| API reference | INTEGRATION_GUIDE.md |

---

## ✅ Checklist to Get Started

- [ ] Read README_NEW.md (2 min)
- [ ] Read SETUP_INSTRUCTIONS.md (5 min)
- [ ] Run `npm install`
- [ ] Copy `.env.template` → `.env`
- [ ] Add OPENAI_API_KEY to `.env`
- [ ] Run `npm run server` (Terminal 1)
- [ ] Run `npm run dev` (Terminal 2)
- [ ] Open http://localhost:5173
- [ ] Test at Dashboard page
- [ ] Update resume in aiAnswer.js
- [ ] Start automating!

---

## 🎯 What's Next?

1. **Setup** (5 min) → SETUP_INSTRUCTIONS.md
2. **Understand** (10 min) → INTEGRATION_GUIDE.md
3. **Integrate** (15 min) → EXAMPLE_USAGE.jsx
4. **Customize** (varies) → Update aiAnswer.js
5. **Deploy** → See "Production Deployment" in INTEGRATION_GUIDE.md

---

**Happy automating! 🚀**
