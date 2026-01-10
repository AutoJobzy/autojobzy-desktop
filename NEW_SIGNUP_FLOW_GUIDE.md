# 🎯 New Signup Flow with Payment Integration

## Overview

The signup flow has been completely redesigned to follow this sequence:

1. **Signup Form** → User enters basic details
2. **Plan Selection** → User chooses a subscription plan
3. **Payment** → Razorpay payment integration
4. **Account Creation** → Account created after successful payment
5. **Auto-Login** → User automatically logged in
6. **Dashboard** → Redirected to dashboard with active subscription

---

## 🔄 Complete Flow Diagram

```
┌─────────────────┐
│  Signup Page    │
│  /signup        │
│                 │
│ • First Name    │
│ • Last Name     │
│ • Email         │
│ • Password      │
│ • Terms Accept  │
└────────┬────────┘
         │
         │ Click "Next"
         │ (No account created yet)
         ▼
┌─────────────────┐
│  Pricing Page   │
│  /pricing       │
│                 │
│ Special Banner: │
│ "Creating       │
│  account for    │
│  John Doe"      │
│                 │
│ Show all plans  │
└────────┬────────┘
         │
         │ Click "Get Started" on a plan
         │
         ▼
┌─────────────────┐
│  Razorpay Modal │
│                 │
│ Payment Form    │
│ Test Card:      │
│ 4111 1111       │
│ 1111 1111       │
└────────┬────────┘
         │
         │ Complete payment
         │
         ▼
┌─────────────────┐
│  Backend:       │
│  Verify Payment │
│  Create Account │
│  Activate Plan  │
│  Return Token   │
└────────┬────────┘
         │
         │ Auto-login
         │
         ▼
┌─────────────────┐
│  Dashboard      │
│  /dashboard     │
│                 │
│ Subscription:   │
│ ✅ Active       │
└─────────────────┘
```

---

## 📝 Implementation Details

### Frontend Changes

#### 1. **Auth.tsx** - Modified Signup Handler

**What Changed:**
- Signup form NO LONGER creates account immediately
- Instead, validates data and navigates to pricing page
- Passes signup data via router state

**Key Code:**
```typescript
// Lines 34-72
if (type === 'signup') {
  // Validate all fields
  if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
    throw new Error('Please fill in all fields');
  }

  if (!acceptedTerms) {
    throw new Error('Please accept the Terms & Conditions');
  }

  // Navigate to pricing with signup data (NO account created)
  navigate('/pricing', {
    replace: true,
    state: {
      fromSignup: true,
      signupData: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      }
    }
  });
}
```

---

#### 2. **Pricing.tsx** - Dual-Mode Payment Handler

**What Changed:**
- Detects if user is coming from signup flow
- Shows special banner for signup users
- Handles two payment flows:
  - **Signup Flow**: Guest order → Payment → Create account → Auto-login
  - **Normal Flow**: Regular authenticated order → Payment

**Key Code:**
```typescript
// Lines 50-57: Detect signup flow
const locationState = location.state as { fromSignup?: boolean; signupData?: SignupData } | null;
const isSignupFlow = locationState?.fromSignup && locationState?.signupData;
const signupData = locationState?.signupData;

// Lines 93-185: Handle signup flow
if (isSignupFlow && signupData) {
  // Create guest order (no auth required)
  const response = await fetch(`${API_BASE_URL}/subscription/create-guest-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId: plan.id }),
  });

  // After payment success:
  const signupResponse = await fetch(`${API_BASE_URL}/auth/signup-with-payment`, {
    method: 'POST',
    body: JSON.stringify({
      ...signupData,
      planId: plan.id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }),
  });

  // Auto-login with returned token
  localStorage.setItem('token', signupDataResponse.token);
  localStorage.setItem('user', JSON.stringify(signupDataResponse.user));
  login(...);
}
```

**UI Changes:**
```typescript
// Lines 275-284: Dynamic header
<h1>
  {isSignupFlow ? 'Complete Your Signup' : 'Choose Your Plan'}
</h1>

// Lines 287-304: Signup banner
{isSignupFlow && signupData && (
  <div className="bg-gradient-to-r from-green-500/20 ...">
    <UserPlus className="w-6 h-6 text-green-400" />
    <p>Creating account for {signupData.firstName} {signupData.lastName}</p>
    <p>Select a plan below and complete payment to activate your account</p>
  </div>
)}
```

---

### Backend Changes

#### 3. **Subscription Routes** - Guest Order Endpoint

**New Endpoint:** `POST /api/subscription/create-guest-order`

**Purpose:** Create Razorpay order WITHOUT authentication (for signup flow)

**Key Code:**
```javascript
// Lines 64-133 in server/routes/subscription.js
router.post('/create-guest-order', async (req, res) => {
  const { planId } = req.body;

  // Get plan details
  const plan = await subscriptionService.getPlanById(planId);

  // Create Razorpay order (no userId needed)
  const receipt = `rcpt_guest_${Date.now()}`;
  const order = await razorpayService.createOrder(
    parseFloat(plan.price),
    'INR',
    receipt,
    {
      planId,
      planName: plan.name,
      guestOrder: true,
    }
  );

  // Return order details for Razorpay modal
  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayService.getKeyId(),
      planName: plan.name,
    },
  });
});
```

---

#### 4. **Auth Routes** - Signup with Payment

**New Endpoint:** `POST /api/auth/signup-with-payment`

**Purpose:** Create user account AFTER successful payment

**Key Code:**
```javascript
// Lines 72-202 in server/routes/auth.js
router.post('/signup-with-payment', async (req, res) => {
  const {
    email, password, firstName, lastName,
    planId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  // 1. Verify payment signature
  const isValid = razorpayService.verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: 'Payment verification failed',
    });
  }

  // 2. Create user account
  const user = await User.create({
    email, password, firstName, lastName,
  });

  // 3. Create job settings
  await JobSettings.create({ userId: user.id });

  // 4. Activate subscription
  const subscription = await subscriptionService.activateSubscription(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    user.id
  );

  // 5. Generate auth token
  const token = generateToken(user.id, user.role);

  // 6. Return user data and token
  res.status(201).json({
    success: true,
    token,
    user: { id, email, firstName, lastName, role, onboardingCompleted },
    subscription: { id, planId, status, startDate, endDate },
  });
});
```

---

## 🧪 Testing the New Flow

### Prerequisites

1. **Backend running:**
   ```bash
   npm run server
   ```

2. **Frontend running:**
   ```bash
   npm run dev
   ```

3. **Database ready:**
   - MySQL running
   - Plans seeded: `node server/db/seedPlans.js`

---

### Test Steps

#### Step 1: Open Signup Page
```
Navigate to: http://localhost:5173/signup
```

#### Step 2: Fill Signup Form
- **First Name:** Test
- **Last Name:** User
- **Email:** test123@example.com
- **Password:** Test123!@#
- ☑️ Check "I accept the Terms & Conditions"

#### Step 3: Click "Next" Button
**Expected Result:**
- ✅ Form validates
- ✅ Redirected to `/pricing` page
- ✅ URL shows `/pricing`
- ✅ Green banner appears: "Creating account for Test User"
- ✅ Header says "Complete Your Signup"

**Console Logs:**
```javascript
[Signup] Form validated, proceeding to plan selection
```

#### Step 4: Select a Plan
Click **"Get Started"** on any plan (e.g., Starter plan)

**Expected Console Logs:**
```javascript
[Pricing] Signup flow detected - creating order for new user
[Pricing] Creating guest order for plan: <plan-id>
[Pricing] Guest order result: { success: true, ... }
[Pricing] Guest order created: order_xyz123
[Pricing] Initiating payment for signup...
[Razorpay] Initiating payment with order data: {...}
[Razorpay] Opening payment modal with key: rzp_test_...
```

**Expected Backend Logs:**
```javascript
[Create Guest Order] Request received for plan: <plan-id>
[Create Guest Order] Fetching plan details
[Create Guest Order] Plan retrieved: { name: 'Starter', price: '299.00' }
[Create Guest Order] Razorpay order created: { orderId: 'order_xyz', amount: 29900 }
```

**Expected Result:**
- ✅ Razorpay payment modal opens
- ✅ Shows plan name and amount

#### Step 5: Complete Test Payment

**Use Razorpay Test Credentials:**
- **Card Number:** `4111 1111 1111 1111`
- **Expiry:** `12/25`
- **CVV:** `123`
- **Name:** Any name

OR

- **UPI ID:** `success@razorpay`

**Click "Pay" button**

#### Step 6: Observe Account Creation

**Expected Console Logs:**
```javascript
[Razorpay] Payment completed, verifying signature...
[Pricing] Payment successful, creating account...
[Pricing] Account created successfully!
```

**Expected Backend Logs:**
```javascript
[Signup with Payment] Request received: { email: 'test123@example.com', ... }
[Signup with Payment] Verifying payment signature
[Signup with Payment] Payment verified successfully
[Signup with Payment] Creating user account
[Signup with Payment] User created: <user-id>
[Signup with Payment] Activating subscription
[Signup with Payment] Subscription activated: { subscriptionId: '...', status: 'active' }
[Signup with Payment] Account created and activated successfully
```

#### Step 7: Verify Auto-Login

**Expected Result:**
- ✅ Success message appears: "Welcome Test! Your account is ready."
- ✅ After 2 seconds, redirected to `/dashboard`
- ✅ Dashboard shows active subscription

**Verify in Browser Console:**
```javascript
localStorage.getItem('token') // Should return JWT token
localStorage.getItem('user')  // Should return user object
```

#### Step 8: Verify in Database

```sql
-- Check user was created
SELECT * FROM users WHERE email = 'test123@example.com';

-- Check subscription was activated
SELECT * FROM user_subscriptions WHERE userId = '<user-id>' AND status = 'active';

-- Check job settings were created
SELECT * FROM job_settings WHERE userId = '<user-id>';
```

---

## 🎯 Success Indicators

### ✅ Signup Flow Works When:

1. **Form Validation:**
   - All fields required
   - Email format validated
   - Password minimum length enforced
   - Terms must be accepted

2. **Navigation:**
   - Signup → Pricing (with state)
   - Special banner shows user name
   - Plans display correctly

3. **Guest Order Creation:**
   - Order created without authentication
   - Razorpay modal opens
   - Correct plan details shown

4. **Payment Processing:**
   - Test payment accepted
   - Payment signature verified
   - No errors in console

5. **Account Creation:**
   - User record created in database
   - Job settings created
   - Subscription activated
   - Token generated

6. **Auto-Login:**
   - Token stored in localStorage
   - User object stored
   - Context updated
   - Redirected to dashboard

7. **Dashboard:**
   - Shows user name
   - Shows active subscription
   - Subscription details correct

---

## 🚨 Common Issues

### Issue 1: "User already exists"
**Symptom:** Error after payment: "User already exists with this email"

**Cause:** Email already in database from previous test

**Solution:**
```sql
DELETE FROM users WHERE email = 'test123@example.com';
```

---

### Issue 2: Payment succeeds but account not created
**Symptom:** Payment completes but error appears

**Check Backend Logs For:**
```javascript
[Signup with Payment] Error occurred: ...
```

**Common Causes:**
1. Database connection failed
2. Invalid payment signature
3. Subscription activation failed

**Solution:**
- Check database is running
- Verify Razorpay keys in `.env`
- Check subscription table exists

---

### Issue 3: Redirected to login instead of pricing
**Symptom:** After clicking "Next", redirected to login page

**Cause:** Form validation failed

**Solution:**
- Ensure all fields are filled
- Check "Terms & Conditions" checkbox
- Password must be 6+ characters
- Email must be valid format

---

### Issue 4: No signup banner on pricing page
**Symptom:** Pricing page looks normal, no green banner

**Cause:** State not passed from signup

**Check in Browser Console:**
```javascript
// Inspect location state
console.log(window.history.state)
```

**Solution:**
- Hard refresh page: `Ctrl+Shift+R`
- Clear browser cache
- Start flow from beginning

---

## 📊 API Endpoints Reference

### 1. GET /api/subscription/plans
**Purpose:** Get all available plans
**Auth:** None required
**Returns:** Array of plans with features

### 2. POST /api/subscription/create-guest-order
**Purpose:** Create Razorpay order for signup
**Auth:** None required
**Body:**
```json
{
  "planId": "abc-123-def"
}
```
**Returns:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_xyz123",
    "amount": 29900,
    "currency": "INR",
    "keyId": "rzp_test_...",
    "planName": "Starter",
    "planDescription": "..."
  }
}
```

### 3. POST /api/auth/signup-with-payment
**Purpose:** Create account after payment
**Auth:** None required (verifies payment instead)
**Body:**
```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "Test123!@#",
  "planId": "abc-123-def",
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc123",
  "razorpay_signature": "..."
}
```
**Returns:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "user",
    "onboardingCompleted": false
  },
  "subscription": {
    "id": "...",
    "planId": "abc-123-def",
    "status": "active",
    "startDate": "2024-12-27",
    "endDate": "2025-01-03"
  }
}
```

---

## 🔒 Security Considerations

### 1. Payment Verification
- ✅ Payment signature verified before account creation
- ✅ Razorpay signature cannot be forged
- ✅ No account created if payment fails

### 2. Email Uniqueness
- ✅ Checks if email exists before creating account
- ✅ Returns 409 Conflict if email already registered

### 3. Password Security
- ✅ Passwords hashed before storage (bcrypt in User model)
- ✅ Never logged or exposed in responses

### 4. Guest Order Protection
- ✅ Guest orders don't create database records until payment
- ✅ No orphan records if user abandons signup

---

## 📈 Future Enhancements

- [ ] Add email verification step before payment
- [ ] Support free trial plans (no payment required)
- [ ] Add "Back" button on pricing page to edit signup details
- [ ] Store incomplete signups for follow-up emails
- [ ] Add payment method selection (card vs UPI vs wallet)
- [ ] Support multiple payment gateways

---

## 🎬 Demo Video Script

1. Open `/signup` → Show signup form
2. Fill in details → Click "Next"
3. Show pricing page with signup banner
4. Select plan → Razorpay modal opens
5. Enter test card → Payment completes
6. Show success message → Auto-redirect to dashboard
7. Dashboard shows active subscription ✅

---

**Status:** ✅ Implementation Complete
**Last Updated:** December 27, 2024
**Version:** 2.0.0 (New Signup Flow)
