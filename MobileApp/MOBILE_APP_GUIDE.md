# 📱 AutoJobzy Mobile App - Complete Usage Guide

## ✅ Setup Complete!

तुमची mobile app **पूर्णपणे तयार** आहे आणि backend server शी connected आहे!

---

## 🚀 How to Use

### Step 1: Login करा

1. App उघडा
2. Email आणि Password टाका (तुमचा AutoJobzy account)
3. Login वर click करा

### Step 2: Job Profile Setup करा

1. **Dashboard** उघडल्यावर **हॅम्बर्गर menu** (≡) वर tap करा
2. **"Job Profile"** select करा
3. तुमची माहिती भरा:
   - Personal Information (Name, Phone, Location, etc.)
   - Years of Experience
   - Current & Expected Salary
   - Notice Period
   - Skills (Add, Rate, Experience)
   - Resume Upload
   - **Naukri Credentials** (Email & Password) ⚠️ **महत्वाचे!**

4. **Save** करा

### Step 3: Job Automation Start करा

1. Dashboard वर **menu** (≡) उघडा
2. **"Job Engine"** select करा
3. तुम्हाला दिसेल:
   - ▶️ **Start Automation** button (हिरवं)
   - 📊 Status indicator
   - 📋 Real-time logs

4. **Start Automation** वर tap करा
5. Backend server तुमच्यासाठी automation सुरू करेल!

### Step 4: Real-time Logs पहा

Automation चालू असताना तुम्हाला दिसेल:
```
✅ Launching browser...
✅ Using Naukri account: your-email
✅ Opening Naukri login page...
✅ Login successful!
✅ Found 20 jobs on page 1
✅ Opening job 1/20...
✅ Job: Software Developer at TCS
✅ Application submitted successfully
...
```

### Step 5: Results पहा

1. Menu → **"Application History"**
2. तुम्हाला सर्व applied jobs दिसतील:
   - Company name & logo
   - Job title
   - Match score (color-coded)
   - Status (Applied/Skipped/Failed)
   - Location, Salary, Experience
   - Posted date & Applicants

3. Filters वापरा:
   - Status: All / Applied / Skipped / Failed
   - Date range
   - Match score
   - Location

4. Export करा:
   - CSV format
   - PDF format
   - Email share

### Step 6: Analytics पहा

1. Menu → **"My Activity"**
2. तुम्हाला statistics दिसतील:
   - Total Applications
   - Success Rate
   - Daily Application Chart (Line Chart)
   - Success/Failure Pie Chart
   - Date range filters

---

## 📋 All Menu Options

### 🎯 Job Engine (Overview)
- Start/Stop automation
- Real-time logs
- Automation status
- Schedule automation (coming soon)

### 👤 Job Profile (Config)
- Personal information
- Skills management
- Resume upload
- Naukri credentials

### 📊 Application History
- All job applications
- Filters & search
- Export to CSV/PDF
- Pagination (20 per page)

### 📈 My Activity (Analytics)
- Statistics dashboard
- Charts & graphs
- Success rate
- Date range filters

### 💳 My Plan
- Current subscription
- Available plans
- Razorpay payment
- Coupon codes
- Upgrade/downgrade

### 🔄 Auto Profile Update
- Manual profile update
- Scheduled updates
- Update history
- Naukri profile sync

### 💡 Suggest & Earn
- Submit suggestions
- Feature requests
- Bug reports
- Reward points
- My suggestions status

### ⚙️ App Settings
- Theme (Light/Dark/System)
- Notifications
- Cache management
- Account settings
- Privacy policy
- About app
- Logout

---

## ⚙️ Backend Server Integration

तुमची mobile app **`https://api.autojobzy.com`** या server शी connected आहे.

### API Endpoints वापरलेले:

```
POST /api/auth/login              - Login
POST /api/auth/signup             - Signup
GET  /api/job-settings            - Get profile
POST /api/job-settings            - Update profile
POST /api/automation/run-bot      - Start automation
POST /api/automation/stop         - Stop automation
GET  /api/automation/status       - Get status
GET  /api/automation/logs         - Get logs
GET  /api/job-results             - Get applications
GET  /api/job-results/stats       - Get statistics
GET  /api/subscription/plans      - Get plans
POST /api/subscription/create-order - Create payment
```

### Backend काम कसं करतं:

1. **तुम्ही Start Automation click करता**
   - Mobile app POST request पाठवतं `/automation/run-bot` ला
   - Backend server Puppeteer browser launch करतो (headless mode)
   - Server Naukri वर login करतो तुमच्या credentials ने
   - Jobs शोधतो आणि apply करतो
   - Real-time logs database मध्ये save करतो

2. **Mobile app logs fetch करतं**
   - हर 5 seconds ला GET `/automation/logs` call होतो
   - Real-time updates तुम्हाला दिसतात

3. **Results save होतात**
   - प्रत्येक application database मध्ये save होतो
   - Match score calculate होतो
   - Status track होतो (Applied/Skipped/Failed)

---

## 🔧 Troubleshooting

### Problem 1: "Missing X server" Error

**Solution:** Server वर headless mode fix झाला असावा. Check करा:

```bash
# SSH into server
ssh your-user@your-server-ip

# Check server logs
pm2 logs autojobzy-server --lines 50

# Look for this line:
# "Browser config: headless=new, platform=linux"
```

### Problem 2: "Login Failed"

**Solution:**
1. Job Profile मध्ये जाऊन Naukri credentials check करा
2. Correct email आणि password असल्याची खात्री करा
3. Naukri.com वर manually login होतं का ते test करा

### Problem 3: "No Jobs Found"

**Solution:**
1. Backend server वर job URL check करा
2. Database मध्ये `user_filters` table check करा
3. `final_url` column मध्ये valid Naukri job search URL असावा

### Problem 4: Logs दिसत नाहीत

**Solution:**
1. Internet connection check करा
2. Backend server running आहे का ते check करा:
   ```bash
   pm2 status
   ```
3. App मध्ये **Refresh** button tap करा

### Problem 5: App Crash होतोय

**Solution:**
1. App clear करा आणि restart करा
2. Cache clear करा: Settings → Cache Management
3. Latest version install करा

---

## 🎯 Best Practices

### 1. Naukri Credentials Secure ठेवा
- Never share your credentials
- Use strong passwords
- Enable 2FA on Naukri if possible

### 2. Regular Profile Updates
- Update skills every month
- Keep resume fresh
- Update experience regularly

### 3. Monitor Automation
- Check logs daily
- Review application history
- Adjust filters based on results

### 4. Subscription Management
- Track expiry dates
- Use coupon codes
- Upgrade when needed

---

## 📊 Features Summary

### ✅ Working Features

| Feature | Status | Details |
|---------|--------|---------|
| Login/Signup | ✅ | JWT authentication |
| Job Profile | ✅ | Full CRUD with skills & resume |
| Automation Control | ✅ | Start/Stop bot via backend |
| Real-time Logs | ✅ | Live streaming from server |
| Application History | ✅ | Pagination, filters, export |
| Analytics Dashboard | ✅ | Charts, stats, date filters |
| Subscription | ✅ | Razorpay payment integration |
| Auto Profile Update | ✅ | Scheduled updates |
| Suggest & Earn | ✅ | Feedback system |
| Settings | ✅ | Theme, notifications, cache |

### 🔄 Background Processing

Automation **server वर** चालतो, mobile वर नाही:
- ✅ Mobile battery save होते
- ✅ App बंद केलं तरी automation चालू राहतो
- ✅ Stable आणि reliable
- ✅ Multiple users साठी scale करतं

---

## 🎉 Success Indicators

तुमची app properly काम करतेय ते कसं ओळखाल:

✅ **Login Screen:**
- Email & password fields work
- Login button functional
- Navigation to dashboard after login

✅ **Dashboard:**
- Drawer menu opens
- All 8 menu items visible
- User profile shows in drawer header

✅ **Job Engine:**
- Start button works
- Logs appear in real-time
- Stop button stops automation
- Status indicator updates

✅ **Application History:**
- Jobs list loads
- Pagination works
- Filters apply correctly
- Export functions work

✅ **My Activity:**
- Charts render properly
- Statistics show accurate data
- Date filters work

---

## 🔐 Security

### Data Encryption
- ✅ All API calls use HTTPS
- ✅ JWT tokens encrypted
- ✅ Naukri credentials stored securely in backend
- ✅ Local storage encrypted

### Privacy
- ✅ No data sharing with third parties
- ✅ User data isolated per account
- ✅ Secure logout clears all local data

---

## 📞 Support

### Need Help?

1. **Check Logs:**
   - Job Engine → View logs
   - Backend server → `pm2 logs autojobzy-server`

2. **Check Server Status:**
   ```bash
   pm2 status
   curl https://api.autojobzy.com/api/health
   ```

3. **Contact:**
   - Settings → About → Contact Support
   - Email: support@autojobzy.com

---

## 🚀 Next Steps

1. ✅ Login करा
2. ✅ Job Profile setup करा
3. ✅ Naukri credentials add करा
4. ✅ Start Automation tap करा
5. ✅ Logs आणि results पहा!

---

**तुमची mobile app आता ready आहे! Start करा automation आणि automatic job applications मिळवा! 🎉**
