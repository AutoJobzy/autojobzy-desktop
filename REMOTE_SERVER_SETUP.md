# Remote Server Setup for Desktop App

## Overview

The Electron desktop app runs **locally** on Windows machines. To enable data syncing and admin panel access, you need a **remote server** that:

1. Receives data from desktop apps via API
2. Stores data in a database
3. Exposes data to a web-based admin panel

---

## Architecture

```
┌──────────────────────┐
│  Desktop App (EXE)   │
│  ┌────────────────┐  │
│  │ Electron       │  │
│  │ + Node.js      │  │
│  │ + Puppeteer    │  │
│  │ + React UI     │  │
│  └────────┬───────┘  │
│           │          │
└───────────┼──────────┘
            │
            │ HTTP/HTTPS
            │ POST/GET Requests
            │
            ▼
┌──────────────────────┐
│  Remote Server       │
│  ┌────────────────┐  │
│  │ Express API    │  │
│  │ MySQL/Postgres │  │
│  │ Admin Panel    │  │
│  └────────────────┘  │
└──────────────────────┘
```

---

## Option 1: Dual-Mode (Recommended)

The desktop app can work in **two modes**:

### Mode A: Standalone (No Server)
- All data stored locally (MySQL on user's machine)
- No internet required
- No admin panel access
- Good for: Individual users, offline scenarios

### Mode B: Connected (With Server)
- Desktop app sends data to remote server
- Admin panel available via web
- Centralized data management
- Good for: Institutes, organizations, multi-user scenarios

---

## Server Setup

### Step 1: Deploy Existing Backend

Your existing `server/` code can be deployed as-is to any hosting platform:

**Options:**
- AWS EC2
- DigitalOcean
- Heroku
- Render
- Railway
- Your own VPS

**Example: Deploy to AWS EC2**

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Clone/upload your project
git clone your-repo-url
cd your-project

# Install dependencies
npm install

# Set up environment variables
nano .env

# Add:
DB_HOST=your-rds-endpoint
DB_USER=admin
DB_PASSWORD=yourpassword
DB_NAME=jobautomate
PORT=5000
JWT_SECRET=your_secret

# Start server
npm run server

# Or use PM2 for production
npm install -g pm2
pm2 start server/index.js --name "autojobzy-server"
pm2 startup
pm2 save
```

---

### Step 2: Configure Desktop App to Use Remote Server

Update desktop app's `.env` before building:

```env
# For desktop app that syncs to remote server
VITE_API_BASE_URL=https://your-server.com
```

The desktop app will:
1. Still run local server for Puppeteer/automation
2. Send results to remote server via API
3. Sync user data to remote database

---

### Step 3: API Endpoints for Data Sync

Your existing API endpoints can be used as-is. Examples:

**Desktop App → Remote Server:**

```javascript
// Save job application results
POST https://your-server.com/api/job-results/bulk
Body: {
  userId: "user-id",
  results: [
    { jobTitle: "...", company: "...", status: "applied" }
  ]
}

// Sync user profile
PUT https://your-server.com/api/auth/profile
Body: {
  userId: "user-id",
  profile: { ... }
}

// Get subscription status
GET https://your-server.com/api/subscription/status?userId=user-id

// Save automation logs
POST https://your-server.com/api/automation/logs
Body: {
  userId: "user-id",
  logs: [...]
}
```

**Admin Panel ← Remote Server:**

```javascript
// Get all users
GET https://your-server.com/api/admin/users

// Get user statistics
GET https://your-server.com/api/admin/stats

// Get job results for all users
GET https://your-server.com/api/admin/job-results
```

---

## Implementation: Sync Logic

### Option A: Real-time Sync

Desktop app sends data immediately after each action:

```javascript
// In your existing automation code
async function saveJobResult(result) {
  // Save locally (existing code - UNCHANGED)
  await saveToLocalDB(result);

  // Also sync to remote server (NEW)
  if (isConnectedMode()) {
    try {
      await fetch(`${REMOTE_API_URL}/api/job-results/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          userId: currentUserId,
          results: [result]
        })
      });
    } catch (error) {
      console.error('Failed to sync to remote:', error);
      // App continues working locally
    }
  }
}
```

### Option B: Batch Sync

Desktop app syncs data periodically (e.g., every hour):

```javascript
// Run this periodically
async function syncToRemoteServer() {
  if (!isConnectedMode()) return;

  // Get local data that hasn't been synced
  const unsyncedResults = await getUnsyncedResults();

  if (unsyncedResults.length === 0) return;

  try {
    await fetch(`${REMOTE_API_URL}/api/job-results/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        userId: currentUserId,
        results: unsyncedResults
      })
    });

    // Mark as synced
    await markAsSynced(unsyncedResults.map(r => r.id));
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Schedule sync every hour
setInterval(syncToRemoteServer, 60 * 60 * 1000);
```

---

## Database Configuration

### Local Database (Desktop App)
- MySQL installed on user's Windows machine
- Used for local storage and offline mode
- Optional: Can be SQLite for simpler setup

### Remote Database (Server)
- MySQL/PostgreSQL on cloud (AWS RDS, DigitalOcean, etc.)
- Stores data from all desktop app users
- Powers admin panel

**Same Schema:** Use identical database schema for both local and remote.

---

## Security Considerations

### 1. Authentication
Desktop app authenticates with remote server using JWT:

```javascript
// Login flow (existing code - UNCHANGED)
const { token, user } = await login(email, password);

// Store token in desktop app
localStorage.setItem('authToken', token);

// Use token for all API requests
fetch(API_URL, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 2. API Rate Limiting
Implement rate limiting on server to prevent abuse:

```javascript
// On server (existing middleware can be reused)
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. HTTPS
Always use HTTPS for production:
```
https://your-server.com (✓)
http://your-server.com (✗)
```

---

## Environment Variables

### Desktop App (.env)

```env
# Mode: standalone or connected
APP_MODE=connected

# Remote server URL (only if APP_MODE=connected)
VITE_API_BASE_URL=https://your-production-server.com

# Local server port
PORT=5000

# Local database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=localpassword
DB_NAME=jobautomate_local
```

### Remote Server (.env)

```env
# Database (Cloud RDS/managed database)
DB_HOST=your-rds-endpoint.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=securepassword
DB_NAME=jobautomate_production
DB_PORT=3306

# Server configuration
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=your-production-secret

# API Keys
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
```

---

## Admin Panel Access

Admin panel is served from the remote server:

```
Desktop App (EXE) → https://your-server.com/api/*
Admin Panel (Web) → https://your-server.com/admin

OR

Admin Panel (Web) → https://admin.your-domain.com
```

Admin panel shows:
- All registered users
- Job application statistics
- Usage metrics
- Subscription status
- System logs

---

## Testing

### Test Local Mode
```bash
# Set APP_MODE=standalone in .env
npm run electron:dev

# Verify:
# - App works without internet
# - Data saved to local MySQL
# - All features functional
```

### Test Connected Mode
```bash
# Set APP_MODE=connected in .env
# Set VITE_API_BASE_URL=http://localhost:5000 (for testing)
npm run electron:dev

# Start remote server separately
npm run server

# Verify:
# - App connects to remote server
# - Data syncs to remote database
# - Admin panel shows data
```

---

## Deployment Checklist

### Desktop App
- [ ] Set `VITE_API_BASE_URL` to production server
- [ ] Build EXE: `npm run electron:build:win`
- [ ] Test on clean Windows machine
- [ ] Verify server connection
- [ ] Verify data sync
- [ ] Distribute to users

### Remote Server
- [ ] Deploy backend to cloud
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring
- [ ] Deploy admin panel

---

## Cost Considerations

### Standalone Mode (No Server)
- **Cost:** $0 (no server needed)
- **Limitations:** No admin panel, no centralized data

### Connected Mode (With Server)
- **Basic:** $5-10/month (DigitalOcean, Railway)
- **Production:** $20-50/month (AWS EC2 + RDS)
- **Enterprise:** $100+/month (Auto-scaling, high availability)

---

## Summary

1. **Desktop app works standalone** (no changes needed)
2. **Optional remote server** for data sync and admin panel
3. **Existing backend code reused as-is** on server
4. **Minimal changes** to add sync functionality
5. **Flexible deployment** - users choose standalone or connected mode

Your existing application architecture already supports this perfectly!
