# Razorpay Integration Fix - Testing Guide

## Overview
Fixed Razorpay payment integration issues during the signup flow with comprehensive logging and error handling throughout the entire payment lifecycle.

---

## Changes Made

### 1. Frontend Fixes

#### **Auth.tsx** (Signup Flow)
**Lines 65-67**: Fixed navigation timing
```typescript
setTimeout(() => {
  setLoading(false);
  navigate('/pricing', { replace: true, state: { fromSignup: true } });
}, 2000);
```
**What changed:**
- Moved `setLoading(false)` inside setTimeout to prevent race condition
- Added `replace: true` to prevent back button issues
- Added `state: { fromSignup: true }` for routing context

---

#### **Pricing.tsx** (Payment Flow)
**Lines 78-130**: Added comprehensive logging and validation
```typescript
console.log('[Pricing] Starting payment flow for plan:', plan.name);
console.log('[Pricing] Creating order for plan ID:', plan.id);
console.log('[Pricing] Order creation result:', orderResult);
console.log('[Pricing] Order created successfully:', orderResult.data.orderId);
console.log('[Pricing] Initiating Razorpay payment...');
console.log('[Pricing] Payment successful:', successResult);
console.error('[Pricing] Payment failed:', failureResult);
```
**What changed:**
- Added logging at each step of payment flow
- Added validation: `if (!orderResult.data || !orderResult.data.orderId)`
- Enhanced error messages with specific context
- Improved user feedback messages

---

#### **subscriptionApi.js** (Razorpay SDK Integration)
**Lines 118-230**: Enhanced SDK loading and payment initiation
```javascript
console.log('[Razorpay] SDK already loaded');
console.log('[Razorpay] Loading SDK from CDN...');
console.log('[Razorpay] SDK loaded successfully');
console.log('[Razorpay] Initiating payment with order data:', {...});
console.log('[Razorpay] Opening payment modal with key:', orderData.keyId);
console.log('[Razorpay] Payment completed, verifying signature...');
console.log('[Razorpay] Verification result:', verifyResult);
```
**What changed:**
- Added validation for `orderData.orderId` and `orderData.keyId`
- Enhanced SDK loading error handling
- Fixed user prefill to use `firstName` as fallback
- Added try-catch around Razorpay instance creation
- Improved all error messages

---

### 2. Backend Fixes

#### **subscription.js** (API Routes)
**Lines 64-150**: Added comprehensive backend logging
```javascript
console.log('[Create Order] Request received:', { userId, planId });
console.log('[Create Order] Fetching plan details for planId:', planId);
console.log('[Create Order] Plan retrieved:', { name, price, isActive });
console.log('[Create Order] Creating Razorpay order:', { amount, currency, receipt });
console.log('[Create Order] Razorpay order created:', { orderId, amount });
console.log('[Create Order] Creating pending subscription record');
console.log('[Create Order] Subscription record created successfully');
console.log('[Create Order] Sending success response:', { orderId, keyId });
```

**Lines 157-231**: Added payment verification logging
```javascript
console.log('[Verify Payment] Request received:', { orderId, paymentId, userId });
console.log('[Verify Payment] Verifying payment signature');
console.log('[Verify Payment] Signature verified successfully');
console.log('[Verify Payment] Activating subscription for order:', orderId);
console.log('[Verify Payment] Subscription activated:', { subscriptionId, status, endDate });
```

**What changed:**
- Added detailed logging at each step of order creation
- Added logging for payment verification process
- Enhanced error logging with stack traces
- Better error response messages

---

## Testing Instructions

### Step 1: Start the Server
```bash
# Terminal 1 - Start backend
cd /Users/rohan/Documents/old/job_automate
npm run server
```

### Step 2: Start the Frontend
```bash
# Terminal 2 - Start frontend
cd /Users/rohan/Documents/old/job_automate
npm run dev
```

### Step 3: Open Browser DevTools
1. Open your browser (Chrome/Firefox)
2. Press `F12` or right-click → Inspect
3. Go to **Console** tab
4. Keep it open during the entire test

### Step 4: Test Signup → Payment Flow

**4.1. Sign Up**
1. Navigate to signup page
2. Fill in the form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: Test123!@#
3. Click **Sign Up**
4. **Watch Console**: Should see welcome message

**Expected Console Logs:**
```
✓ User signed up successfully
✓ Token saved to localStorage
✓ Redirecting to pricing page in 2 seconds...
```

**4.2. Pricing Page Loads**
After 2 seconds, you should be redirected to `/pricing`

**Expected Console Logs:**
```
✓ [Pricing] Loading plans...
✓ [Pricing] Plans loaded successfully
```

**4.3. Select a Plan**
1. Click **Get Started** on any plan
2. **Watch Browser Console** (frontend logs)
3. **Watch Terminal 1** (backend logs)

**Expected Frontend Console Logs:**
```javascript
[Pricing] Starting payment flow for plan: Basic Plan
[Pricing] Creating order for plan ID: abc-123-def
[Pricing] Order creation result: { success: true, data: {...} }
[Pricing] Order created successfully: order_xyz123abc
[Pricing] Initiating Razorpay payment...
[Razorpay] Initiating payment with order data: { orderId: 'order_xyz123abc', amount: 99900, ... }
[Razorpay] SDK already loaded (or Loading SDK from CDN...)
[Razorpay] Opening payment modal with key: rzp_test_Rq72xNPez55mbO
```

**Expected Backend Terminal Logs:**
```javascript
[Create Order] Request received: { userId: '...', planId: 'abc-123-def' }
[Create Order] Fetching plan details for planId: abc-123-def
[Create Order] Plan retrieved: { name: 'Basic Plan', price: 999, isActive: true }
[Create Order] Creating Razorpay order: { amount: 999, currency: 'INR', receipt: 'rcpt_...' }
[Create Order] Razorpay order created: { orderId: 'order_xyz123abc', amount: 99900 }
[Create Order] Creating pending subscription record
[Create Order] Subscription record created successfully
[Create Order] Sending success response: { orderId: 'order_xyz123abc', keyId: 'rzp_test_...' }
```

**4.4. Razorpay Payment Modal**
The Razorpay payment modal should now appear.

**If modal appears:** ✅ Integration is working!
**If modal doesn't appear:** ❌ Check console for errors

**4.5. Complete Test Payment (Test Mode)**
Razorpay provides test credentials for test mode:

**Test Card Details:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date (e.g., `12/25`)
- CVV: Any 3 digits (e.g., `123`)
- Name: Any name

**Or use UPI:**
- UPI ID: `success@razorpay`

**Expected Frontend Console Logs (After Payment):**
```javascript
[Razorpay] Payment completed, verifying signature...
[Razorpay] Verification result: { success: true, message: 'Payment verified successfully' }
[Pricing] Payment successful: { success: true, ... }
```

**Expected Backend Terminal Logs (After Payment):**
```javascript
[Verify Payment] Request received: { orderId: 'order_xyz123abc', paymentId: 'pay_123abc', userId: '...' }
[Verify Payment] Verifying payment signature
[Verify Payment] Signature verified successfully
[Verify Payment] Activating subscription for order: order_xyz123abc
[Verify Payment] Subscription activated: { subscriptionId: '...', status: 'active', endDate: '...' }
```

**4.6. Redirect to Dashboard**
After successful payment, you should be redirected to `/dashboard` after 2 seconds.

---

## Troubleshooting Guide

### Issue 1: No logs appearing in console
**Problem:** Console is empty, no `[Pricing]` or `[Razorpay]` logs

**Solutions:**
1. Verify browser console is open and set to "All levels" (not just Errors)
2. Clear browser cache and reload: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Check if console is filtered - remove any filters
4. Ensure you're on the correct browser tab

---

### Issue 2: "User not logged in, redirecting to login"
**Problem:** Immediately redirected to login after clicking Get Started

**Solutions:**
1. Check localStorage for token:
   ```javascript
   // In browser console
   localStorage.getItem('token')
   ```
2. If null, sign up again
3. If token exists but still redirecting, token might be invalid:
   ```javascript
   // Clear and sign up again
   localStorage.clear()
   ```

---

### Issue 3: "Failed to create order"
**Problem:** Order creation fails on backend

**Check Backend Terminal for:**
```javascript
[Create Order] Error occurred: Plan not found
[Create Order] Error occurred: This plan is no longer available
[Create Order] Error occurred: Failed to create order: ...
```

**Solutions:**
1. **Plan not found:**
   - Verify plans exist in database:
     ```bash
     mysql -u root -p
     USE jobautomate;
     SELECT id, name, isActive FROM plans;
     ```
   - Run seed script if no plans:
     ```bash
     node server/db/seedPlans.js
     ```

2. **Razorpay credentials error:**
   - Verify `.env` file has:
     ```
     RAZORPAY_KEY_ID=rzp_test_Rq72xNPez55mbO
     RAZORPAY_KEY_SECRET=m8xaorSpn4j3CG2IUb5165NU
     ```
   - Restart server after adding credentials

3. **Database connection error:**
   - Verify MySQL is running:
     ```bash
     mysql -u root -p -e "SELECT 1;"
     ```
   - Check `server/db/config.js` credentials

---

### Issue 4: "Invalid order data - missing orderId or keyId"
**Problem:** Frontend validation fails before showing payment modal

**Check Frontend Console for:**
```javascript
[Pricing] Order creation result: { success: true, data: {...} }
```

**Solutions:**
1. If `data` is `undefined` or `null`:
   - Backend didn't return proper response
   - Check backend terminal for errors in `[Create Order]` logs

2. If `orderId` is missing from `data`:
   - Backend Razorpay order creation failed
   - Check `.env` for correct Razorpay credentials
   - Verify Razorpay account is in test mode

3. If `keyId` is missing:
   - `RAZORPAY_KEY_ID` not in `.env`
   - Add it and restart server

---

### Issue 5: "Failed to load Razorpay SDK"
**Problem:** Razorpay checkout.js script failed to load

**Solutions:**
1. Check internet connection
2. Check if Razorpay CDN is accessible:
   - Open: `https://checkout.razorpay.com/v1/checkout.js`
   - Should download a JavaScript file
3. Check browser console for CORS errors
4. Try disabling browser extensions (AdBlock, etc.)

---

### Issue 6: Payment modal opens but payment fails
**Problem:** Payment modal appears but payment doesn't complete

**Solutions:**
1. **In Test Mode:**
   - Use test credentials: Card `4111 1111 1111 1111` or UPI `success@razorpay`
   - Don't use real card details in test mode

2. **Check Backend Terminal for:**
   ```javascript
   [Verify Payment] Signature verification failed
   ```
   - Means Razorpay signature mismatch
   - Verify `RAZORPAY_KEY_SECRET` is correct in `.env`

3. **Check Frontend Console for:**
   ```javascript
   [Razorpay] Payment failed: { error: { code: '...', description: '...' } }
   ```
   - Note the error code and description
   - Common codes:
     - `BAD_REQUEST_ERROR`: Invalid test credentials
     - `GATEWAY_ERROR`: Payment gateway issue (try again)
     - `SERVER_ERROR`: Backend verification failed

---

### Issue 7: Payment succeeds but subscription not activated
**Problem:** Payment completes but user not redirected or subscription not shown

**Check Backend Terminal for:**
```javascript
[Verify Payment] Error occurred: ...
```

**Solutions:**
1. Verify database schema has `user_subscriptions` table
2. Check subscription was created:
   ```sql
   SELECT * FROM user_subscriptions ORDER BY createdAt DESC LIMIT 5;
   ```
3. If no record, check backend error logs for database connection issues

---

## Common Error Messages

### Frontend Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Failed to create order" | Backend API failed | Check backend terminal logs |
| "Invalid order data received from server" | Backend returned incomplete data | Verify backend is returning `orderId` and `keyId` |
| "Failed to load Razorpay SDK. Please check your internet connection." | CDN blocked or offline | Check internet, disable ad blockers |
| "Payment cancelled by user" | User closed payment modal | Normal behavior, can retry |
| "Payment failed. Please try again." | Payment processing failed | Check Razorpay test credentials |

### Backend Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Plan ID is required" | Missing planId in request | Frontend not sending planId correctly |
| "Plan not found" | Invalid plan ID | Run `node server/db/seedPlans.js` |
| "This plan is no longer available" | Plan is inactive | Update plan: `UPDATE plans SET isActive=1 WHERE id='...'` |
| "Razorpay credentials not configured" | Missing .env variables | Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET |
| "Missing payment details" | Incomplete verification request | Frontend not sending all required fields |
| "Payment verification failed" | Invalid signature | Wrong RAZORPAY_KEY_SECRET or tampered data |

---

## Success Indicators

### ✅ Everything Working Correctly

**Frontend Console:**
```javascript
[Pricing] Starting payment flow for plan: Basic Plan
[Pricing] Creating order for plan ID: abc-123
[Pricing] Order creation result: { success: true, data: {...} }
[Pricing] Order created successfully: order_xyz123
[Pricing] Initiating Razorpay payment...
[Razorpay] Initiating payment with order data: {...}
[Razorpay] SDK loaded successfully
[Razorpay] Opening payment modal with key: rzp_test_...
[Razorpay] Payment completed, verifying signature...
[Razorpay] Verification result: { success: true, ... }
[Pricing] Payment successful: { success: true, ... }
```

**Backend Terminal:**
```javascript
[Create Order] Request received: { userId: '...', planId: '...' }
[Create Order] Fetching plan details for planId: ...
[Create Order] Plan retrieved: { name: '...', price: ..., isActive: true }
[Create Order] Creating Razorpay order: {...}
[Create Order] Razorpay order created: { orderId: '...', amount: ... }
[Create Order] Creating pending subscription record
[Create Order] Subscription record created successfully
[Create Order] Sending success response: { orderId: '...', keyId: '...' }

[Verify Payment] Request received: { orderId: '...', paymentId: '...', userId: '...' }
[Verify Payment] Verifying payment signature
[Verify Payment] Signature verified successfully
[Verify Payment] Activating subscription for order: ...
[Verify Payment] Subscription activated: { subscriptionId: '...', status: 'active', ... }
```

**UI Behavior:**
1. ✅ Signup completes successfully
2. ✅ Welcome message appears
3. ✅ Redirected to pricing page after 2 seconds
4. ✅ Plans load and display
5. ✅ Click "Get Started" → Razorpay modal opens
6. ✅ Enter test payment details
7. ✅ Payment completes successfully
8. ✅ Success message appears
9. ✅ Redirected to dashboard after 2 seconds
10. ✅ Dashboard shows active subscription

---

## Environment Verification Checklist

Before testing, verify:

### Backend Environment
- [ ] `.env` file exists in project root
- [ ] `RAZORPAY_KEY_ID=rzp_test_Rq72xNPez55mbO` is set
- [ ] `RAZORPAY_KEY_SECRET=m8xaorSpn4j3CG2IUb5165NU` is set
- [ ] MySQL database is running
- [ ] Database `jobautomate` exists
- [ ] `plans` table has active plans
- [ ] `user_subscriptions` table exists
- [ ] Backend server is running on port 5000

### Frontend Environment
- [ ] Frontend is running (usually port 5173)
- [ ] Browser DevTools console is open
- [ ] No browser extensions blocking scripts
- [ ] Internet connection is active
- [ ] VITE_API_BASE_URL is set correctly (or defaults to localhost:5000)

### Razorpay Account
- [ ] Account is in **Test Mode** (not Live Mode)
- [ ] Test API keys are correct
- [ ] Webhooks are configured (optional for basic testing)

---

## Next Steps After Successful Test

Once payment flow works end-to-end:

1. **Production Deployment:**
   - Replace test keys with live keys in production `.env`
   - Set `RAZORPAY_KEY_ID=rzp_live_...`
   - Set `RAZORPAY_KEY_SECRET=...`
   - Never commit `.env` to git

2. **Remove Test Logs (Optional):**
   - Console logs are helpful for debugging
   - Consider keeping them in development
   - Remove or disable in production if needed

3. **Configure Webhooks:**
   - Set up Razorpay webhooks for payment.captured, payment.failed
   - Configure webhook URL: `https://yourdomain.com/api/subscription/webhook`
   - Add `RAZORPAY_WEBHOOK_SECRET` to `.env`

4. **Add Subscription Management:**
   - View active subscription in dashboard
   - Cancel/upgrade options
   - Subscription expiry notifications

---

## Files Modified

✅ **Frontend:**
- `/pages/Auth.tsx` - Fixed signup navigation timing
- `/pages/Pricing.tsx` - Added logging and validation
- `/services/subscriptionApi.js` - Enhanced SDK handling and logging

✅ **Backend:**
- `/server/routes/subscription.js` - Added comprehensive logging to create-order and verify-payment endpoints

---

## Support

If you encounter issues not covered in this guide:

1. **Collect Diagnostic Info:**
   - Full frontend console logs
   - Full backend terminal logs
   - Error messages and stack traces
   - Steps to reproduce

2. **Check Razorpay Dashboard:**
   - Login to Razorpay dashboard
   - Go to Payments → Check if test payment appears
   - Go to Orders → Check if order was created
   - Look for error messages or failed payments

3. **Database Check:**
   ```sql
   -- Check if subscription was created
   SELECT * FROM user_subscriptions WHERE userId = 'your-user-id';

   -- Check if payment was recorded
   SELECT * FROM user_subscriptions WHERE razorpayOrderId = 'order_xyz123';
   ```

---

**Last Updated:** December 27, 2024
**Status:** ✅ Ready for Testing
**Version:** 1.0.0
