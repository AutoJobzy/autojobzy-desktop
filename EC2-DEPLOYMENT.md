# 🚀 Quick EC2 Deployment Guide

## Step-by-Step Deployment

### 1️⃣ Transfer Code to EC2

```bash
# From your local machine
rsync -avz --exclude 'node_modules' \
  ./ ec2-user@your-ec2-ip:/home/ec2-user/Job_automate/

# Or use git
ssh ec2-user@your-ec2-ip
git clone https://github.com/yourusername/Job_automate.git
cd Job_automate
```

### 2️⃣ Install Dependencies on EC2

```bash
# SSH into your EC2 instance
ssh ec2-user@your-ec2-ip

cd Job_automate

# Run the setup script
./setup-ec2-puppeteer.sh

# Install Node.js (if not installed)
# For Amazon Linux 2:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# For Ubuntu:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install npm packages
npm install
```

### 3️⃣ Test Puppeteer

```bash
# Run test script
node test-puppeteer.js

# If all tests pass, you're good to go!
```

### 4️⃣ Configure Environment

```bash
# Create .env file
nano .env

# Add your environment variables:
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=jobautomate
```

### 5️⃣ Start Server

```bash
# Option 1: Direct (for testing)
npm run server

# Option 2: With PM2 (recommended for production)
npm install -g pm2
pm2 start server/index.js --name autojobzy
pm2 save
pm2 startup  # Follow the instructions
```

### 6️⃣ Configure Security Group

In AWS Console:
1. Go to EC2 → Security Groups
2. Select your instance's security group
3. Add inbound rule:
   - Type: Custom TCP
   - Port: 3000
   - Source: Your IP (or 0.0.0.0/0 for public access)

### 7️⃣ Test from Browser

```bash
# Get your EC2 public IP
curl http://checkip.amazonaws.com

# Then visit in browser:
http://YOUR_EC2_IP:3000
```

---

## 🔧 Common Commands

### Managing the Server

```bash
# Start
pm2 start autojobzy

# Stop
pm2 stop autojobzy

# Restart
pm2 restart autojobzy

# View logs
pm2 logs autojobzy

# Monitor
pm2 monit

# List all processes
pm2 list
```

### Debugging

```bash
# Check if Chrome is working
google-chrome --version

# Check Puppeteer executable
node -e "console.log(require('puppeteer').executablePath())"

# Test browser launch
node test-puppeteer.js

# Check running Chrome processes
ps aux | grep chrome

# Kill zombie Chrome processes
pkill -f chrome

# Check disk space
df -h

# Check memory usage
free -h

# Monitor real-time resource usage
htop
```

### Viewing Logs

```bash
# Server logs (if using PM2)
pm2 logs autojobzy --lines 100

# System logs
tail -f /var/log/syslog  # Ubuntu
tail -f /var/log/messages  # Amazon Linux

# Chrome crash logs
ls -la ~/.config/google-chrome/Crash\ Reports/
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Browser won't launch | Run `./setup-ec2-puppeteer.sh` again |
| Missing libraries | Check: `ldd $(node -e "console.log(require('puppeteer').executablePath())") \| grep "not found"` |
| Out of memory | Increase EC2 instance size or add swap |
| Port already in use | Change PORT in .env or kill process: `lsof -ti:3000 \| xargs kill -9` |
| Can't connect from browser | Check security group rules |
| Chrome zombies | `pkill -f chrome` |

---

## 📊 Recommended EC2 Setup

### Instance Type
- **Development:** t2.small (2GB RAM)
- **Production:** t2.medium (4GB RAM) ✅ Recommended
- **High Volume:** t2.large (8GB RAM)

### Storage
- Minimum: 20GB
- Recommended: 30GB (for logs and screenshots)

### AMI
- Ubuntu Server 22.04 LTS (recommended)
- Amazon Linux 2023
- Amazon Linux 2

---

## 🔒 Security Checklist

- [ ] Don't commit .env file to git
- [ ] Use environment variables for sensitive data
- [ ] Restrict security group to specific IPs (not 0.0.0.0/0)
- [ ] Set up SSL/HTTPS for production
- [ ] Regularly update packages: `npm audit fix`
- [ ] Monitor logs for suspicious activity
- [ ] Set up CloudWatch alarms for CPU/memory

---

## 🎯 Performance Tips

1. **Restart browser periodically:**
   ```javascript
   if (jobsProcessed % 50 === 0) {
     await browser.close();
     browser = await puppeteer.launch({...});
   }
   ```

2. **Close pages immediately:**
   ```javascript
   await jobPage.close();  // After each job
   ```

3. **Limit concurrent operations:**
   ```javascript
   const maxConcurrent = 3;
   ```

4. **Use efficient selectors:**
   ```javascript
   // ✅ Good
   await page.$('#apply-button');

   // ❌ Slow
   await page.$$eval('*', elements => elements.find(...));
   ```

5. **Monitor memory:**
   ```bash
   pm2 start server/index.js --max-memory-restart 500M
   ```

---

## 📞 Support

If you encounter issues:

1. Check [PUPPETEER-EC2-GUIDE.md](PUPPETEER-EC2-GUIDE.md) for detailed troubleshooting
2. Run diagnostic test: `node test-puppeteer.js`
3. Check logs: `pm2 logs autojobzy`
4. Verify Chrome: `google-chrome --version`

---

## ✅ Pre-Launch Checklist

- [ ] Setup script completed: `./setup-ec2-puppeteer.sh`
- [ ] Test passed: `node test-puppeteer.js`
- [ ] Environment configured: `.env` file created
- [ ] Database accessible from EC2
- [ ] Security group configured (port 3000)
- [ ] PM2 installed and configured
- [ ] Server starts successfully
- [ ] Can access from browser
- [ ] Test with 1-2 jobs manually
- [ ] Monitor logs during test run
- [ ] Memory usage acceptable (<80%)

**You're ready to deploy! 🎉**
