# Puppeteer on Linux EC2 - Complete Production Guide

## 📋 Table of Contents
1. [Why Puppeteer Fails on EC2](#why-puppeteer-fails-on-ec2)
2. [Puppeteer vs Puppeteer-Core](#puppeteer-vs-puppeteer-core)
3. [Setup Instructions](#setup-instructions)
4. [Configuration Explained](#configuration-explained)
5. [Troubleshooting](#troubleshooting)
6. [Best Practices](#best-practices)

---

## 🔴 Why Puppeteer Fails on EC2

### The Problem

Your code works on Windows/Mac but fails on Linux EC2 because:

| Issue | Local (Windows/Mac) | EC2 Linux |
|-------|---------------------|-----------|
| **GUI Libraries** | Pre-installed (for display) | ❌ Missing (headless server) |
| **Chrome Sandbox** | Works out of box | ❌ Requires special permissions |
| **Shared Libraries** | Available by default | ❌ Must install manually |
| **Display Server** | X11/Quartz available | ❌ No display (headless) |

### Why Headless Mode Still Needs GUI Libraries

Even in `headless: true` mode, Chromium needs:
- **Font rendering libraries** (libfontconfig, pango)
- **Graphics libraries** (cairo, GTK)
- **X11 libraries** (for window management APIs)
- **Audio libraries** (ALSA)

These are required because Chromium's rendering engine is built on these dependencies, regardless of whether it displays to screen.

---

## 🔄 Puppeteer vs Puppeteer-Core

### Comparison Table

| Feature | `puppeteer` | `puppeteer-core` |
|---------|-------------|------------------|
| **Chromium Download** | ✅ Auto-downloads | ❌ No download |
| **Package Size** | ~300MB | ~2MB |
| **Setup Complexity** | Easy (works out of box) | Manual (specify Chrome path) |
| **System Chrome** | Optional | Required |
| **Updates** | Bundled version | Use system version |
| **Best For** | Development, consistency | Production, Docker |

### Current Setup (Recommended)

```json
"dependencies": {
  "puppeteer": "^24.32.1"  // ✅ You're using this (GOOD)
}
```

**Why `puppeteer` is better for you:**
- Bundles known-working Chromium version
- No need to manage Chrome updates
- Consistent across environments
- Just needs system dependencies installed

### When to Use Puppeteer-Core

Only switch to `puppeteer-core` if:
1. You're in a Docker container (to reduce image size)
2. You want to use system-installed Chrome
3. You need a specific Chrome version

**If switching to puppeteer-core:**
```bash
npm uninstall puppeteer
npm install puppeteer-core

# Install Chrome manually
# Ubuntu:
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install ./google-chrome-stable_current_amd64.deb

# Then specify in code:
executablePath: '/usr/bin/google-chrome-stable'
```

---

## ⚙️ Setup Instructions

### Step 1: Run Setup Script

```bash
# Make script executable
chmod +x setup-ec2-puppeteer.sh

# Run it
./setup-ec2-puppeteer.sh
```

**Or install manually:**

#### Ubuntu/Debian EC2:
```bash
sudo apt-get update
sudo apt-get install -y \
  ca-certificates fonts-liberation libappindicator3-1 libasound2 \
  libatk-bridge2.0-0 libatk1.0-0 libcairo2 libcups2 libdbus-1-3 \
  libexpat1 libfontconfig1 libgbm1 libglib2.0-0 libgtk-3-0 \
  libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
  libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
  libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
  libxss1 libxtst6 lsb-release wget xdg-utils
```

#### Amazon Linux 2:
```bash
sudo yum install -y \
  alsa-lib atk cups-libs gtk3 ipa-gothic-fonts libXcomposite \
  libXcursor libXdamage libXext libXi libXrandr libXScrnSaver \
  libXtst pango xorg-x11-fonts-100dpi xorg-x11-fonts-75dpi \
  xorg-x11-fonts-cyrillic xorg-x11-fonts-misc xorg-x11-fonts-Type1
```

### Step 2: Verify Installation

```bash
# Check if Chrome is installed (optional but recommended)
google-chrome --version

# Check Puppeteer's bundled Chromium
node -e "console.log(require('puppeteer').executablePath())"

# Test Puppeteer
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  console.log('✅ Puppeteer working!');
  await browser.close();
})();
"
```

### Step 3: Update Code (Already Done)

Your `autoApply.js` has been updated with production-ready configuration.

---

## 🛠️ Configuration Explained

### Critical Arguments for EC2

```javascript
args: [
  '--no-sandbox',                    // ⚠️ CRITICAL
  '--disable-setuid-sandbox',        // ⚠️ CRITICAL
  '--disable-dev-shm-usage',         // 🔧 Important
  '--disable-gpu',                   // 🔧 Important
  // ... more args
]
```

#### Why Each Arg is Needed:

| Argument | Why Required | Impact if Missing |
|----------|-------------|-------------------|
| `--no-sandbox` | Chrome sandbox needs kernel permissions not available in EC2/Docker | Browser won't launch |
| `--disable-setuid-sandbox` | Alternative sandbox mechanism also blocked | Browser won't launch |
| `--disable-dev-shm-usage` | Docker/EC2 have limited `/dev/shm` (64MB default) | Out of memory crashes |
| `--disable-gpu` | No GPU on headless servers | Rendering errors |
| `--disable-accelerated-2d-canvas` | Prevents GPU-dependent canvas issues | Canvas errors |
| `--no-zygote` | Process forking issues on some Linux setups | Startup failures |

#### Security Note

**Is `--no-sandbox` safe?**

⚠️ **Trade-off:**
- Chrome sandbox protects against malicious websites exploiting browser vulnerabilities
- For **trusted automation** (like your job application bot), it's acceptable
- You're visiting known websites (Naukri.com), not arbitrary user-provided URLs

**Best practice:**
```javascript
// Only disable sandbox on Linux, keep it on for local dev
args: [
  ...(process.platform === 'linux' ? ['--no-sandbox', '--disable-setuid-sandbox'] : []),
  // ... other args
]
```

### Advanced Configuration

```javascript
// Optional: Use system Chrome for better stability
executablePath: process.platform === 'linux'
  ? '/usr/bin/google-chrome-stable'  // System Chrome
  : undefined,                        // Bundled Chromium on local

// Optional: Environment variable override
executablePath: process.env.CHROME_PATH || undefined,
```

---

## 🐛 Troubleshooting

### Error: "Failed to launch the browser process"

**Symptom:**
```
Error: Failed to launch the browser process!
/path/to/chrome: error while loading shared libraries: libX11.so.6
```

**Solution:**
```bash
# Find missing library
ldd /path/to/chrome | grep "not found"

# Install missing dependencies (run setup script again)
./setup-ec2-puppeteer.sh
```

### Error: "Navigation timeout exceeded"

**Symptom:**
```
TimeoutError: Navigation timeout of 30000 ms exceeded
```

**Solutions:**
```javascript
// Increase timeout
await page.goto(url, {
  waitUntil: 'networkidle2',
  timeout: 60000  // 60 seconds
});

// Or use domcontentloaded for faster loading
await page.goto(url, {
  waitUntil: 'domcontentloaded',
  timeout: 30000
});
```

### Error: "Protocol error (Target.createTarget)"

**Symptom:**
```
Error: Protocol error (Target.createTarget): Target closed
```

**Solution:**
```javascript
// Add these args
args: [
  '--disable-dev-shm-usage',  // Important!
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
]
```

### Memory Issues

**Symptom:**
- Browser crashes randomly
- "Out of memory" errors

**Solutions:**
```bash
# Check available memory
free -h

# Increase EC2 instance memory (t2.medium or higher recommended)

# Add swap space temporarily
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

**In code:**
```javascript
// Close pages after use
await jobPage.close();

// Limit concurrent pages
const maxConcurrentPages = 3;

// Restart browser periodically
if (jobsProcessed % 50 === 0) {
  await browser.close();
  browser = await puppeteer.launch({...});
}
```

### Zombie Chrome Processes

**Symptom:**
```bash
ps aux | grep chrome
# Shows many chrome processes still running
```

**Solution:**
```bash
# Kill all Chrome processes
pkill -f chrome

# Or more aggressively
killall -9 chrome
```

**In code (already implemented):**
```javascript
// Your stopAutomation() function handles this correctly
process.on('SIGINT', async () => {
  if (browser) await browser.close();
  process.exit();
});
```

---

## ✅ Best Practices

### 1. Resource Management

```javascript
// ✅ GOOD: Close pages immediately
for (const link of jobLinks) {
  const jobPage = await browser.newPage();
  // ... do work
  await jobPage.close();  // ✅ Close immediately
}

// ❌ BAD: Keep all pages open
const pages = await Promise.all(
  jobLinks.map(link => browser.newPage())
);
// Memory leak!
```

### 2. Error Handling

```javascript
// ✅ GOOD: Graceful degradation
try {
  await page.goto(url, { timeout: 30000 });
} catch (error) {
  if (error.name === 'TimeoutError') {
    // Retry or skip
  } else {
    // Log and continue
  }
}
```

### 3. Browser Lifecycle

```javascript
// ✅ GOOD: One browser instance for entire session
const browser = await puppeteer.launch({...});
try {
  // Process all jobs
} finally {
  await browser.close();  // Always close
}

// ❌ BAD: Launch browser for each job
for (const job of jobs) {
  const browser = await puppeteer.launch({...});  // ❌ Wasteful
  // ...
  await browser.close();
}
```

### 4. Monitoring

```javascript
// Add health checks
setInterval(async () => {
  if (browser) {
    const pages = await browser.pages();
    console.log(`Active pages: ${pages.length}`);

    // Cleanup if too many pages
    if (pages.length > 10) {
      for (const page of pages.slice(3)) {
        await page.close();
      }
    }
  }
}, 60000);  // Every minute
```

### 5. Environment-Specific Config

```javascript
// ✅ GOOD: Different configs for dev/prod
const isDev = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const browser = await puppeteer.launch({
  headless: isProduction,  // Show browser in dev
  devtools: isDev,         // Open DevTools in dev
  slowMo: isDev ? 100 : 0, // Slow down in dev
  args: [
    ...(process.platform === 'linux' ? [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ] : []),
    // ... common args
  ]
});
```

### 6. EC2 Instance Recommendations

| Instance Type | vCPUs | Memory | Concurrent Jobs | Cost/Hour* |
|---------------|-------|--------|-----------------|------------|
| t2.micro      | 1     | 1 GB   | 1-2 (tight)     | $0.0116    |
| t2.small      | 1     | 2 GB   | 2-3             | $0.023     |
| **t2.medium** ✅ | **2** | **4 GB** | **5-10** | **$0.0464** |
| t2.large      | 2     | 8 GB   | 10-20           | $0.0928    |

*US East pricing as of 2024

**Recommended:** `t2.medium` for production automation

### 7. Logging

```javascript
// Your addLog() function is good! Also add:
const fs = require('fs');

function addLog(message, type) {
  // ... existing code

  // Write to file for debugging
  fs.appendFileSync('/var/log/autojobzy.log',
    `${new Date().toISOString()} [${type}] ${message}\n`
  );
}
```

### 8. Process Management with PM2

```bash
# Install PM2
npm install -g pm2

# Start your server
pm2 start server/index.js --name autojobzy

# Auto-restart on crashes
pm2 startup
pm2 save

# Monitor
pm2 monit

# View logs
pm2 logs autojobzy
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'autojobzy',
    script: './server/index.js',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

---

## 🎯 Quick Deployment Checklist

- [ ] Run `setup-ec2-puppeteer.sh` on EC2
- [ ] Verify dependencies: `ldd $(node -e "console.log(require('puppeteer').executablePath())")`
- [ ] Test browser launch: `node -e "require('puppeteer').launch()..."`
- [ ] Set `NODE_ENV=production`
- [ ] Configure security groups (port 3000 if needed)
- [ ] Set up PM2 for process management
- [ ] Configure logging
- [ ] Set up monitoring (CloudWatch)
- [ ] Test with 1-2 jobs first
- [ ] Scale up gradually

---

## 📚 Additional Resources

- [Puppeteer Troubleshooting](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md)
- [Chrome Headless on Docker](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-in-docker)
- [Chrome Command Line Switches](https://peter.sh/experiments/chromium-command-line-switches/)

---

## 🆘 Still Having Issues?

1. **Check logs:** `tail -f /var/log/autojobzy.log`
2. **Verify Chrome:** `google-chrome --version`
3. **Test minimal launch:**
   ```bash
   node -e "
   const puppeteer = require('puppeteer');
   (async () => {
     try {
       const browser = await puppeteer.launch({
         headless: true,
         args: ['--no-sandbox', '--disable-setuid-sandbox']
       });
       console.log('✅ Success!');
       await browser.close();
     } catch (e) {
       console.error('❌ Error:', e.message);
     }
   })();
   "
   ```
4. **Check missing libraries:**
   ```bash
   ldd $(node -e "console.log(require('puppeteer').executablePath())") | grep "not found"
   ```

---

**Your setup is now production-ready! 🚀**
