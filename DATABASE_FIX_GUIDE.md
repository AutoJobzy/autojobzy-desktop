# 🗄️ Database Connection Fix Guide

## Problem Found

Backend server can't connect to AWS RDS:
```
Access denied for user 'admin'@'122.167.118.160' (using password: YES)
```

**Reason:** AWS RDS Security Group is blocking your IP address.

---

## Solution 1: Allow Your IP in AWS RDS (For Desktop App Testing)

### Step 1: Login to AWS Console

1. Go to https://console.aws.amazon.com/
2. Login with your credentials
3. Go to **RDS** service

### Step 2: Find Your Database

1. Click **Databases** in left menu
2. Find: `database-1`
3. Click on it

### Step 3: Update Security Group

1. Scroll to **Connectivity & security**
2. Click on the **VPC security groups** link
3. Click **Inbound rules** tab
4. Click **Edit inbound rules**

### Step 4: Add Your IP

1. Click **Add rule**
2. **Type:** MySQL/Aurora (port 3306)
3. **Source:** My IP (automatically adds your current IP)
4. **Description:** Desktop app access
5. Click **Save rules**

### Step 5: Test Connection

```bash
# Test if database is now accessible
npm run server

# Should show:
# ✅ MySQL Connection established successfully
# 🚀 Server running on http://localhost:5000
```

---

## Solution 2: Allow All IPs (For Desktop App Distribution)

**⚠️ WARNING: Less secure - only for development/testing**

If you want the desktop app to work on any user's machine:

### Update Security Group:

1. Type: MySQL/Aurora
2. Source: `0.0.0.0/0` (Anywhere IPv4)
3. Description: Allow desktop app connections

**Better approach:** Use SSL/TLS and restrict by other means.

---

## Solution 3: Use Local MySQL Database (Best for Desktop App)

### Install MySQL Locally

**On macOS:**
```bash
brew install mysql
brew services start mysql

# Create database
mysql -u root -e "CREATE DATABASE jobautomate;"
```

**On Windows:**
1. Download MySQL: https://dev.mysql.com/downloads/installer/
2. Install and start MySQL service
3. Create database using MySQL Workbench

### Update .env for Local Database

```env
# Local MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=jobautomate
DB_PORT=3306
```

### Test Local Connection

```bash
npm run server

# Should work immediately!
```

---

## Solution 4: Hybrid Approach (Recommended for Production)

**For Desktop App:**
- Use **local database** (each user has their own data)
- Optionally sync to remote server via API

**Architecture:**
```
Desktop App → Local MySQL → (Optional) Sync to Remote Server
```

**Benefits:**
- Works offline
- No AWS RDS security issues
- Better performance
- User data privacy

---

## Quick Fix for Testing Now

### Option A: Fix AWS RDS (5 minutes)

1. Open AWS Console
2. RDS → database-1 → Security Group
3. Add inbound rule: MySQL/Aurora, Source: My IP
4. Save
5. Run: `npm run server`

### Option B: Use Local MySQL (10 minutes)

```bash
# Install MySQL
brew install mysql
brew services start mysql

# Update .env
cat > .env << 'EOF'
VITE_API_BASE_URL=http://localhost:5000/api
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=jobautomate
DB_PORT=3306
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here_change_in_production
EOF

# Create database
mysql -u root -e "CREATE DATABASE jobautomate;"

# Start server
npm run server
```

---

## Verification

After fixing database connection:

```bash
# Test server
npm run server

# Should see:
✅ Model associations defined
✅ Using existing database 'jobautomate' on localhost
✅ MySQL Connection established successfully
✅ Database connection verified
🚀 Server running on http://localhost:5000

# Test login API
curl http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vishwa@gmail.com","password":"123456"}'

# Should return:
{"token":"...","user":{...}}
```

---

## For Desktop App Distribution

**Recommended approach:**

1. **Bundle local MySQL** with desktop app
   - Or use SQLite (lighter weight)
   - No external database needed

2. **Or connect to remote API**
   - Desktop app → Your backend API → AWS RDS
   - No direct RDS access from desktop

3. **Or hybrid**
   - Local DB for user data
   - Sync to cloud when online

---

## Current Error Details

```
Error: Access denied for user 'admin'@'122.167.118.160'
```

**What this means:**
- Database server is reachable
- Password is correct
- But your IP `122.167.118.160` is blocked
- AWS RDS Security Group needs update

**Quick check:**
```bash
# Try to connect directly
mysql -h database-1.c72i2s6muax7.ap-south-1.rds.amazonaws.com \
      -u admin \
      -p'Ronit@123' \
      -P 3306

# If this fails with same error → Security Group issue
# If this works → Problem is in Node.js config
```

---

## Next Steps

1. **Choose a solution** (I recommend Option A for now)
2. **Fix database access**
3. **Test server:** `npm run server`
4. **Test API:** Use curl command above
5. **Rebuild Electron app** once server works
6. **Test desktop app**

---

**Which solution tumhala best वाटतो? मी तुम्हाला मदत करतो setup करायला!** 🚀
