# Nginx Configuration Deployment Instructions

## Problem
Naukri verification API 504 Gateway Timeout देतोय कारण nginx चा timeout 60 seconds आहे पण verification ला 40-50 seconds लागतात.

## Solution
Nginx timeout 120 seconds वर वाढवायचा आहे specially `/api/auth/verify-naukri-credentials` endpoint साठी.

---

## Option 1: Automatic Deployment (Recommended)

### Step 1: Upload Script to Server
```bash
# Your local machine वरून
scp deploy-nginx-config.sh user@your-server-ip:/home/user/
```

### Step 2: Run Script on Server
```bash
# SSH into your server
ssh user@your-server-ip

# Make script executable
chmod +x deploy-nginx-config.sh

# Run script with sudo
sudo bash deploy-nginx-config.sh
```

Script automatically करेल:
- ✅ Existing config backup
- ✅ New config create
- ✅ Test configuration
- ✅ Reload nginx
- ✅ If error, restore backup

---

## Option 2: Manual Deployment

### Step 1: SSH into Server
```bash
ssh user@your-server-ip
```

### Step 2: Backup Existing Config
```bash
sudo mkdir -p /etc/nginx/backups
sudo cp /etc/nginx/sites-available/autojobzy /etc/nginx/backups/autojobzy_backup_$(date +%Y%m%d).conf
```

### Step 3: Edit Config File
```bash
sudo nano /etc/nginx/sites-available/autojobzy
```

### Step 4: Add/Update Verification Endpoint Config

Find या line पूर्वी (before other location blocks):

```nginx
location /api/auth/verify-naukri-credentials {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;

    # Headers
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # CRITICAL: Extended timeouts for Puppeteer (120 seconds)
    proxy_connect_timeout 120s;
    proxy_send_timeout 120s;
    proxy_read_timeout 120s;

    # Disable buffering
    proxy_buffering off;
}
```

### Step 5: Test Configuration
```bash
sudo nginx -t
```

### Step 6: Reload Nginx
```bash
sudo systemctl reload nginx
# OR
sudo service nginx reload
```

---

## Verification

### Test 1: Check Nginx Status
```bash
sudo systemctl status nginx
```

### Test 2: Test API Endpoint
```bash
curl -X POST https://api.autojobzy.com/api/auth/verify-naukri-credentials \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"naukriUsername":"test@example.com","naukriPassword":"testpass"}' \
  --max-time 130
```

**Expected:** No 504 timeout, should complete in 40-60 seconds

---

## Troubleshooting

### Issue: Config test fails
```bash
# Check syntax errors
sudo nginx -t

# Restore backup
sudo cp /etc/nginx/backups/autojobzy_backup_*.conf /etc/nginx/sites-available/autojobzy
sudo nginx -t
sudo systemctl reload nginx
```

### Issue: Still getting 504
```bash
# Check if config is actually loaded
sudo nginx -T | grep -A 20 "verify-naukri-credentials"

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check if timeout is set
sudo nginx -T | grep timeout
```

### Issue: Nginx won't reload
```bash
# Check error logs
sudo journalctl -u nginx -n 50

# Force restart (use carefully)
sudo systemctl restart nginx
```

---

## Files Created

1. **nginx-config-autojobzy.conf** - Complete nginx config reference
2. **deploy-nginx-config.sh** - Automatic deployment script
3. **NGINX-DEPLOYMENT-INSTRUCTIONS.md** - या instructions

---

## Summary of Changes

| Setting | Before | After |
|---------|--------|-------|
| `/api/auth/verify-naukri-credentials` timeout | 60s | 120s ✅ |
| Other `/api/*` timeouts | 60s | 60s (unchanged) |
| Max upload size | Default (1MB) | 10MB ✅ |
| Buffering for verification | On | Off ✅ |

---

## After Deployment

1. ✅ Nginx timeout increased to 120s
2. ✅ Verification endpoint properly configured
3. ✅ Resume uploads support up to 10MB
4. ✅ Test the endpoint from your app

**Now verification should work without 504 errors!** 🎉
