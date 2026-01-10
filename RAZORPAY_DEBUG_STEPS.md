# 🔧 Razorpay Not Working - Debug Steps

## The Problem
When clicking "Get Started" on the Pricing page, Razorpay payment modal is not opening.

## ✅ Razorpay IS Already Implemented
The integration is complete with:
- Backend API endpoints for order creation and verification
- Frontend payment flow in Pricing.tsx
- Razorpay SDK integration in subscriptionApi.js

## 🔍 Possible Causes & Solutions

### Issue 1: User Not Logged In ❌

**Symptom:** Clicking "Get Started" redirects to login page

**Why:** The payment flow requires authentication. Line 79-82 in Pricing.tsx checks if user is logged in.

**Solution:**
1. **Sign up first** or **log in** before accessing the pricing page
2. After login, you should be redirected to pricing page automatically
3. Then click "Get Started" to trigger payment

**Test:**
```javascript
// Open browser console (F12) and run:
localStorage.getItem('token')

// If it returns null, you're not logged in
// If it returns a long string, you're logged in
```

---

### Issue 2: JavaScript Error Blocking Flow ❌

**Symptom:** Nothing happens when clicking "Get Started", no modal appears

**Solution:**
1. Open browser console (F12)
2. Go to **Console** tab
3. Click "Get Started"
4. Look for **red error messages**

**Common errors:**
- `Razorpay is not defined` → SDK not loaded
- `Cannot read property 'orderId' of undefined` → Backend API failed
- CORS errors → Backend not running or different port

---

### Issue 3: Backend Server Not Running ❌

**Symptom:** Click "Get Started" → Error appears saying "Failed to create order"

**Check:**
```bash
# In terminal, check if server is running
curl https://api.autojobzy.com/api/subscription/plans

# Should return JSON with plans
# If connection refused, start the server:
npm run server
```

**Solution:**
Ensure backend is running on port 5000:
```bash
cd /Users/rohan/Documents/old/job_automate
npm run server
```

---

### Issue 4: Plans Not Loading ❌

**Symptom:** Pricing page shows "No plans available"

**Solution:**
1. Verify database has plans:
```sql
SELECT * FROM plans WHERE isActive = 1;
```

2. If no plans, run seed script:
```bash
node server/db/seedPlans.js
```

---

### Issue 5: Token Expired ❌

**Symptom:** Error message "Unauthorized" or "Invalid token"

**Solution:**
1. Clear localStorage and login again:
```javascript
// In browser console
localStorage.clear()
```

2. Then log in again from /login page

---

## 🧪 Quick Test Using Test Page

I've created a test page that tests each step independently:

### Step 1: Open Test Page
```bash
# Option 1: Serve it with Python
cd /Users/rohan/Documents/old/job_automate
python3 -m http.server 8080

# Then open: http://localhost:8080/RAZORPAY_QUICK_TEST.html
```

### Step 2: Run Tests in Order
1. Click **"Test Backend API"** → Should show ✅ Backend is UP
2. Click **"Load Plans"** → Should show 3 plans
3. Enter email/password → Click **"Login"** → Should show ✅ Login successful
4. Click **"Test Token"** → Should show ✅ Token is valid
5. Click **"Create Order"** → Should show ✅ Order created
6. Click **"Open Razorpay Modal"** → **Razorpay modal should appear!**

### What to Look For:
- **If modal opens:** ✅ Integration works! Issue is in main app
- **If modal doesn't open:** ❌ Check console for errors

---

## 📊 Step-by-Step Manual Test on Real App

### Test 1: Verify You're Logged In
1. Open your app: `http://localhost:5173` (or your frontend URL)
2. Press `F12` to open DevTools → Go to **Console** tab
3. Run:
   ```javascript
   console.log('Token:', localStorage.getItem('token'));
   console.log('User:', localStorage.getItem('user'));
   ```
4. **If both show `null`:** You're NOT logged in → Go to Step 2
5. **If token exists:** You're logged in → Go to Step 3

### Test 2: Sign Up / Log In
1. Go to `/login` or `/signup`
2. **If signing up:**
   - Fill the form: First Name, Last Name, Email, Password
   - Click **Sign Up**
   - Wait for welcome message
   - You should be redirected to `/pricing` after 2 seconds

3. **If logging in:**
   - Enter email and password
   - Click **Log In**

4. Verify login:
   ```javascript
   // In console
   localStorage.getItem('token') // Should show a long string
   ```

### Test 3: Go to Pricing Page
1. Navigate to `/pricing` (or you're already there after signup)
2. You should see 3 plans: Starter, Professional, Enterprise
3. Each plan should have a **"Get Started"** button

### Test 4: Click Get Started
1. Keep **Console tab open** (F12)
2. Click **"Get Started"** on any plan
3. **Watch the console logs** - you should see:
   ```javascript
   [Pricing] Starting payment flow for plan: Starter
   [Pricing] Creating order for plan ID: abc-123-def
   [Pricing] Order creation result: { success: true, ... }
   [Pricing] Order created successfully: order_xyz123
   [Pricing] Initiating Razorpay payment...
   [Razorpay] Initiating payment with order data: {...}
   [Razorpay] SDK loaded successfully (or Loading SDK from CDN...)
   [Razorpay] Opening payment modal with key: rzp_test_...
   ```

4. **Razorpay modal should appear** with payment form

### Test 5: Complete Test Payment
Use Razorpay test credentials:
- **Card Number:** `4111 1111 1111 1111`
- **Expiry:** Any future date (e.g., `12/25`)
- **CVV:** Any 3 digits (e.g., `123`)
- **Name:** Any name

OR use test UPI:
- **UPI ID:** `success@razorpay`

---

## 🚨 Common Issues and Exact Fixes

### Error: "User not logged in, redirecting to login"
**Console shows:**
```javascript
[Pricing] User not logged in, redirecting to login
```

**Fix:**
1. You're not logged in
2. Log in first, then try again
3. Make sure localStorage has token after login

---

### Error: "Failed to create order"
**Console shows:**
```javascript
[Pricing] Order creation result: { success: false, error: "..." }
```

**Possible causes:**
1. **Backend not running:**
   ```bash
   npm run server
   ```

2. **Invalid plan ID:**
   - Backend logs will show: `[Create Order] Plan not found`
   - Run: `node server/db/seedPlans.js`

3. **Razorpay keys missing:**
   - Backend logs: `Razorpay credentials not configured`
   - Check `.env` has:
     ```
     RAZORPAY_KEY_ID=rzp_test_Rq72xNPez55mbO
     RAZORPAY_KEY_SECRET=m8xaorSpn4j3CG2IUb5165NU
     ```

---

### Error: "Invalid order data - missing orderId or keyId"
**Console shows:**
```javascript
[Razorpay] Invalid order data - missing orderId or keyId
```

**Fix:**
1. Backend didn't return proper data
2. Check **backend terminal** for errors
3. Restart backend server

---

### Error: "Failed to load Razorpay SDK"
**Console shows:**
```javascript
[Razorpay] Failed to load SDK from CDN
```

**Fix:**
1. Check internet connection
2. Check if this URL works: https://checkout.razorpay.com/v1/checkout.js
3. Disable ad blockers or browser extensions
4. Try different browser

---

### Nothing happens, no logs at all
**Symptom:** Click "Get Started" → nothing happens, no console logs

**Fix:**
1. **Verify console is open** (F12)
2. **Check console filter** - set to "All levels" not just "Errors"
3. **Check if button is actually clickable:**
   - If button says "Current Plan" → You already have this plan
   - If button is grayed out → Processing or disabled
4. **Hard refresh page:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

### Modal opens but payment fails
**Symptom:** Razorpay modal appears but payment doesn't complete

**Fix:**
1. **Use test credentials** (not real card in test mode):
   - Card: `4111 1111 1111 1111`
   - Or UPI: `success@razorpay`

2. **Check backend logs** for verification errors:
   ```javascript
   [Verify Payment] Signature verification failed
   ```
   - Means `RAZORPAY_KEY_SECRET` is wrong

---

## 📋 Quick Checklist

Before asking for help, verify:

- [ ] Backend server is running (`npm run server`)
- [ ] Frontend is running (`npm run dev`)
- [ ] User is logged in (check localStorage token)
- [ ] Browser console is open (F12)
- [ ] No JavaScript errors in console
- [ ] Plans are loading on pricing page
- [ ] `.env` has Razorpay keys
- [ ] Database has active plans

---

## 🎯 Expected Working Flow

**Perfect scenario:**
1. User signs up → Welcome message → Redirected to pricing (2 sec delay)
2. Pricing page loads → Shows 3 plans
3. Click "Get Started" → Console shows logs
4. Razorpay modal appears → Enter test card `4111 1111 1111 1111`
5. Payment completes → Success message → Redirected to dashboard (2 sec delay)
6. Dashboard shows active subscription

---

## 💡 Still Not Working?

If you've tried everything above and it's still not working:

### Collect Debug Info:
1. **Full browser console logs** (copy everything)
2. **Backend terminal logs** (copy everything)
3. **Screenshot of the error**
4. **What you clicked and what happened**

### Share with me:
```
1. Did you sign up or log in? (which one?)
2. Are you on the pricing page? (yes/no)
3. What happens when you click "Get Started"? (redirect/nothing/error)
4. Any red errors in console? (copy them here)
5. Is backend running? (yes/no)
6. What does this return in console:
   localStorage.getItem('token')
```

---

## 🔧 Alternative: Use Test Page

If the main app still doesn't work, use the standalone test page:

1. Open: `/Users/rohan/Documents/old/job_automate/RAZORPAY_QUICK_TEST.html` in browser
2. Make sure backend is running: `npm run server`
3. Follow the on-screen steps
4. This will test Razorpay independently

If test page works but main app doesn't, the issue is in the React app routing or state management.

---

**Last Updated:** December 27, 2024
