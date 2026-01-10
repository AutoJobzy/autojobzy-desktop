# AutoJobzy - Complete System Flow Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [User Types & Access Levels](#user-types--access-levels)
3. [Individual User Flow](#individual-user-flow)
4. [Institute Admin Flow](#institute-admin-flow)
5. [Super Admin Flow](#super-admin-flow)
6. [Technical Architecture](#technical-architecture)

---

## 🎯 System Overview

**AutoJobzy** is an AI-powered job application automation platform with three distinct user systems:

- **Individual Users** - Job seekers who use automation for personal job applications
- **Institute Admins** - Educational institutions managing student job placements
- **Super Admins** - Platform administrators managing the entire system

---

## 👥 User Types & Access Levels

### 1. Individual Users (Job Seekers)
- **Purpose**: Automate job applications on Naukri, LinkedIn
- **Access**: Personal dashboard, job automation tools
- **Login**: `/login` → Select "Individual"

### 2. Institute Admins
- **Purpose**: Manage students, staff, and institutional subscriptions
- **Access**: Institute dashboard, student management, staff management
- **Login**: `/login` → Select "Institute Admin" → Redirects to `/institute-admin/login`

### 3. Super Admins
- **Purpose**: Manage all users, institutes, packages, and system settings
- **Access**: Full system control, analytics, user management
- **Login**: `/superadmin/login`

---

## 🔵 Individual User Flow

### Step 1: Registration & Signup
```
User visits website
    ↓
Clicks "Sign Up" button
    ↓
Selects "Individual" user type
    ↓
Fills registration form:
    - First Name
    - Last Name
    - Email
    - Password
    - Accept Terms & Conditions
    ↓
Redirected to Pricing Page
    ↓
Selects subscription plan:
    - Free Plan (Trial)
    - Basic Plan (₹299/month)
    - Professional Plan (₹599/month)
    - Enterprise Plan (₹999/month)
    ↓
Payment via Razorpay
    ↓
Account created & redirected to Dashboard
```

### Step 2: Dashboard Features
**What Individual Users Can Do:**

1. **Job Automation**
   - Connect Naukri.com credentials
   - Connect LinkedIn credentials
   - Set job preferences (keywords, location, experience)
   - Enable auto-apply

2. **Profile Management**
   - Upload/update resume
   - Edit personal details
   - Update job preferences

3. **Application Tracking**
   - View all applied jobs
   - Track application status
   - See daily/weekly statistics

4. **Subscription Management**
   - View current plan
   - Upgrade/downgrade plan
   - View payment history

### Step 3: Job Application Process
```
User enables auto-apply
    ↓
System logs into Naukri/LinkedIn (using user credentials)
    ↓
Searches for jobs matching user preferences
    ↓
Automatically applies to matching jobs
    ↓
Logs application details
    ↓
Sends daily report to user
```

---

## 🟣 Institute Admin Flow

### Step 1: Institute Registration
```
User visits website
    ↓
Clicks "Sign Up" button
    ↓
Selects "Institute" user type
    ↓
Redirected to Institute Signup Page
    ↓
Fills institute details:
    - Institute Name
    - Registration Number
    - Address, City, State, PIN
    - Phone Number
    - Admin First Name, Last Name
    - Admin Email, Password
    ↓
Institute account created (pending subscription)
    ↓
Redirected to Institute Admin Dashboard
```

### Step 2: Institute Admin Login
```
Visit `/login`
    ↓
Select "Institute Admin" option
    ↓
Redirected to `/institute-admin/login`
    ↓
Enter credentials
    ↓
Redirected to Institute Dashboard
```

### Step 3: Institute Dashboard Overview

**Left Sidebar Navigation:**
- 📊 Overview (Dashboard home)
- 🎓 Students (Student management)
- 👥 Staff (Staff management)
- 💳 Subscription (Package & payments)
- ⚙️ Settings (Institute settings)

---

### 📊 Overview Tab
**Dashboard Statistics:**
- Total Students enrolled
- Student limit (based on package)
- Remaining slots
- Active students vs Inactive students
- Total staff members
- Subscription status
- Package details

**Visual Cards:**
```
┌─────────────────┬─────────────────┬─────────────────┐
│  Total Students │  Student Limit  │ Remaining Slots │
│       45        │       50        │        5        │
└─────────────────┴─────────────────┴─────────────────┘

┌─────────────────┬─────────────────┬─────────────────┐
│ Active Students │Inactive Students│   Total Staff   │
│       42        │        3        │        8        │
└─────────────────┴─────────────────┴─────────────────┘
```

---

### 🎓 Students Tab
**What Institute Admins Can Do:**

1. **View All Students**
   - See student list in table format
   - View enrollment number, batch, course
   - Check active/inactive status

2. **Add New Student**
   ```
   Click "Add Student" button
       ↓
   Fill form:
       - First Name, Last Name
       - Email, Password
       - Enrollment Number
       - Batch, Course
       ↓
   Student account created
   ```

3. **Student Management Actions**
   - ✏️ **Edit** - Update student details
   - 🔑 **Change Password** - Reset student password
   - ⚡ **Activate/Deactivate** - Toggle student account status
   - 🗑️ **Delete** - Remove student (soft delete)

4. **Search & Filter**
   - Search by name, email, enrollment number
   - Real-time search functionality

**Student Table View:**
```
┌──────────────┬──────────────────┬────────┬────────┬──────────┬─────────┐
│    Name      │      Email       │ Status │ Course │  Batch   │ Actions │
├──────────────┼──────────────────┼────────┼────────┼──────────┼─────────┤
│ John Doe     │ john@example.com │ Active │  CSE   │ 2024-A   │ ✏️🔑⚡🗑️ │
│ Jane Smith   │ jane@example.com │Inactive│  ECE   │ 2024-B   │ ✏️🔑⚡🗑️ │
└──────────────┴──────────────────┴────────┴────────┴──────────┴─────────┘
```

---

### 👥 Staff Tab
**What Institute Admins Can Do:**

1. **View All Staff**
   - See staff list with roles
   - View who added each staff member
   - Check join dates

2. **Add New Staff**
   ```
   Click "Add Staff" button
       ↓
   Fill form:
       - First Name, Last Name
       - Email, Password
       - Role (Teacher/Admin/Counselor/Coordinator/Support)
       ↓
   Staff account created
   ```

3. **Staff Roles Available:**
   - 👨‍🏫 Teacher
   - 👔 Admin
   - 🎯 Counselor
   - 📋 Coordinator
   - 🔧 Support Staff

4. **Staff Management Actions**
   - 🗑️ **Remove** - Remove staff member

**Staff Table View:**
```
┌──────────────┬──────────────────┬───────────┬────────────┬──────────┬─────────┐
│ Staff Member │      Email       │   Role    │  Added By  │  Joined  │ Actions │
├──────────────┼──────────────────┼───────────┼────────────┼──────────┼─────────┤
│ Prof. Kumar  │ kumar@inst.edu   │  Teacher  │ Admin Name │ 01/12/24 │   🗑️   │
│ Ms. Sharma   │ sharma@inst.edu  │ Counselor │ Admin Name │ 15/12/24 │   🗑️   │
└──────────────┴──────────────────┴───────────┴────────────┴──────────┴─────────┘
```

---

### 💳 Subscription Tab
**Package Selection & Payment:**

1. **View Current Subscription**
   - Package name
   - Student limit
   - Price per month
   - Start date & End date
   - Payment status
   - Subscription status (Active/Expired)

2. **Available Packages** (Example)
   ```
   ┌─────────────────────────────────────────┐
   │         Basic Package - ₹2,999/mo       │
   │  • 50 Students                          │
   │  • Basic Support                        │
   │  • Email Notifications                  │
   │            [Subscribe Now]              │
   └─────────────────────────────────────────┘

   ┌─────────────────────────────────────────┐
   │      Standard Package - ₹4,999/mo       │
   │  • 100 Students                         │
   │  • Priority Support                     │
   │  • SMS + Email Notifications            │
   │  • Analytics Dashboard                  │
   │            [Subscribe Now]              │
   └─────────────────────────────────────────┘

   ┌─────────────────────────────────────────┐
   │      Premium Package - ₹9,999/mo        │
   │  • 200 Students                         │
   │  • Dedicated Support                    │
   │  • Advanced Analytics                   │
   │  • Custom Reports                       │
   │  • API Access                           │
   │            [Subscribe Now]              │
   └─────────────────────────────────────────┘
   ```

3. **Payment Flow**
   ```
   Select package
       ↓
   Click "Subscribe Now"
       ↓
   Razorpay payment gateway opens
       ↓
   Enter payment details
       ↓
   Payment processed
       ↓
   Subscription activated
       ↓
   Dashboard updated with new limits
   ```

---

### ⚙️ Settings Tab
**Institute Configuration:**

1. **Institute Information**
   - View institute name
   - Contact email
   - Phone number
   - Address

2. **Admin Profile**
   - Update admin details
   - Change password
   - Email preferences

---

## 🔴 Super Admin Flow

### Step 1: Super Admin Login
```
Visit `/superadmin/login`
    ↓
Enter super admin credentials
    ↓
Redirected to Super Admin Dashboard
```

### Step 2: Super Admin Dashboard

**Left Sidebar Navigation:**
- 📊 Overview (System analytics)
- 👤 Individual Users (Manage job seekers)
- 🏢 Institutes (Manage institutions)
- 📦 Packages (Manage pricing plans)
- ⚙️ Settings (System settings)

---

### 📊 Overview Tab
**System-Wide Analytics:**

```
┌──────────────────┬──────────────────┬──────────────────┐
│  Total Users     │  Active Users    │  Total Institutes│
│      1,250       │      1,100       │       45         │
└──────────────────┴──────────────────┴──────────────────┘

┌──────────────────┬──────────────────┬──────────────────┐
│ Total Revenue    │  Active Plans    │ Total Students   │
│   ₹2,45,000      │      890         │      2,340       │
└──────────────────┴──────────────────┴──────────────────┘
```

**Recent Activity:**
- New user registrations
- New institute signups
- Payment transactions
- System errors/issues

---

### 👤 Individual Users Tab
**What Super Admins Can Do:**

1. **View All Individual Users**
   - Complete user list
   - Search by email/name
   - Filter by status (active/inactive)
   - Filter by plan (Free/Basic/Pro/Enterprise)

2. **User Management Actions**
   - ✅ **Activate** - Enable user account
   - ❌ **Deactivate** - Disable user account
   - 🗑️ **Delete** - Remove user permanently
   - 👁️ **View Details** - See full user profile

3. **User Statistics**
   - Total applications made
   - Current subscription plan
   - Account creation date
   - Last login date

---

### 🏢 Institutes Tab
**What Super Admins Can Do:**

1. **View All Institutes**
   - Complete institute list
   - See subscription status
   - View student count
   - Check package details

2. **Institute Management Actions**
   - ✅ **Approve** - Approve pending institutes
   - ❌ **Suspend** - Suspend institute access
   - 🗑️ **Delete** - Remove institute
   - 👁️ **View Details** - See full institute profile
   - 📊 **View Students** - See all students in institute

3. **Institute Details View**
   ```
   Institute: ABC Engineering College
   Registration: REG123456
   Address: 123 Main St, Mumbai, MH 400001
   Admin: Prof. Sharma (admin@abc.edu)
   Package: Standard (100 students)
   Status: Active
   Students Enrolled: 87/100
   Subscription Expires: 31/12/2025
   ```

---

### 📦 Packages Tab
**What Super Admins Can Do:**

1. **View All Packages**
   - Individual user plans
   - Institute packages
   - Package features
   - Pricing details

2. **Package Management Actions**
   - ➕ **Create** - Add new package
   - ✏️ **Edit** - Modify package details
   - ✅ **Enable** - Activate package
   - ❌ **Disable** - Deactivate package
   - 🗑️ **Delete** - Remove package (if no active users)

3. **Package Creation Form**
   ```
   Package Name: [Premium Plan]
   Type: [Individual / Institute]
   Price: [₹ 999]
   Duration: [30 days]
   Features:
       ☑ Feature 1
       ☑ Feature 2
       ☑ Feature 3
   Student Limit (Institute only): [200]
   Sort Order: [3]
   Status: [Active / Inactive]
   ```

---

## 🏗️ Technical Architecture

### Frontend (React + TypeScript)
```
src/
├── pages/
│   ├── Auth.tsx (Individual + Institute Admin login selector)
│   ├── InstituteAdminLogin.tsx (Dedicated institute login)
│   ├── InstituteAdminDashboard.tsx (Institute dashboard)
│   ├── SuperAdminLogin.tsx (Super admin login)
│   ├── SuperAdminDashboard.tsx (Super admin dashboard)
│   └── Dashboard.tsx (Individual user dashboard)
│
├── components/
│   ├── InstituteAdminSidebar.tsx (Institute navigation)
│   ├── SuperAdminSidebar.tsx (Super admin navigation)
│   └── DashboardSidebar.tsx (Individual user navigation)
│
└── context/
    └── AppContext.tsx (Global state management)
```

### Backend (Node.js + Express + MySQL)
```
server/
├── models/
│   ├── User.js (All users - individual, students, staff, admins)
│   ├── Institute.js (Institute details)
│   ├── Package.js (Pricing plans)
│   ├── InstituteSubscription.js (Institute subscriptions)
│   └── InstituteStudent.js (Student-Institute relationship)
│
├── routes/
│   ├── auth.js (Authentication for all user types)
│   ├── instituteAdmin.js (Institute admin APIs)
│   ├── superadmin.js (Super admin APIs)
│   └── user.js (Individual user APIs)
│
└── middleware/
    ├── authenticateToken.js (JWT verification)
    ├── isInstituteAdmin.js (Role check)
    └── isSuperAdmin.js (Role check)
```

### Database Schema
```
Users Table
├── id (UUID)
├── email
├── password (hashed)
├── firstName, lastName
├── role (individual | student | staff | institute_admin | superadmin)
├── instituteId (FK - for students/staff)
├── isActive (boolean)
└── timestamps

Institutes Table
├── id (UUID)
├── name
├── registrationNumber
├── address, city, state, pinCode
├── phone, email
├── status (pending | active | suspended)
└── timestamps

InstituteSubscriptions Table
├── id (UUID)
├── instituteId (FK)
├── packageId (FK)
├── startDate, endDate
├── status (active | expired)
├── paymentStatus (paid | pending)
├── paymentId, orderId (Razorpay)
└── timestamps

Packages Table
├── id (UUID)
├── name
├── type (individual | institute)
├── pricePerMonth
├── studentLimit (for institute packages)
├── features (JSON)
├── isActive (boolean)
└── timestamps
```

---

## 🔐 Security & Authentication

### Token Storage
- **Individual Users**: `localStorage.setItem('token', ...)`
- **Institute Admins**: `localStorage.setItem('instituteAdminToken', ...)`
- **Super Admins**: `localStorage.setItem('superadminToken', ...)`

### Protected Routes
```
Individual User Routes:
/dashboard → Check 'token' & role='individual'

Institute Admin Routes:
/institute-admin → Check 'instituteAdminToken' & role='institute_admin'

Super Admin Routes:
/superadmin → Check 'superadminToken' & role='superadmin'
```

### API Middleware
```javascript
// Example: Institute Admin API protection
router.get('/students',
    authenticateToken,      // Verify JWT token
    isInstituteAdmin,       // Check role
    async (req, res) => {
        // Return students for this institute only
    }
);
```

---

## 💳 Payment Integration

### Razorpay Flow
```
1. User selects package
    ↓
2. Frontend calls /create-subscription-order
    ↓
3. Backend creates Razorpay order
    ↓
4. Frontend receives orderId + razorpayKeyId
    ↓
5. Razorpay payment modal opens
    ↓
6. User completes payment
    ↓
7. Frontend receives payment_id, order_id, signature
    ↓
8. Frontend calls /verify-payment
    ↓
9. Backend verifies signature
    ↓
10. Subscription activated in database
    ↓
11. Dashboard updated with new limits
```

---

## 📱 User Journey Summary

### For Job Seekers (Individual Users)
```
Sign Up → Choose Plan → Pay → Connect Credentials → Enable Auto-Apply → Get Jobs
```

### For Educational Institutes
```
Register Institute → Login as Admin → Subscribe to Package → Add Students/Staff → Manage Placements
```

### For Platform Administrators
```
Super Admin Login → View Analytics → Manage Users/Institutes → Create Packages → Monitor System
```

---

## 🎨 Color Coding & Themes

- **Individual Users**: Blue theme (`#00f3ff` - neon-blue)
- **Institute Admins**: Purple theme (`#bc13fe` - neon-purple)
- **Super Admins**: Red/Orange theme (`from-red-500 to-orange-500`)

This visual differentiation helps users instantly recognize which system they're using.

---

## 📊 Key Metrics & KPIs

### For Clients
- Total job applications automated
- Success rate (interviews/applications)
- Time saved per user
- Cost per application

### For Institutes
- Students placed
- Active subscriptions
- Student engagement rate
- Package utilization

### For Business
- Total revenue
- Active users/institutes
- Churn rate
- Customer acquisition cost

---

## 🚀 Deployment & Access

- **Production URL**: `https://job-automate.onrender.com`
- **API Base URL**: `https://job-automate.onrender.com/api`
- **Development**: `http://localhost:3001` (Frontend) + `https://api.autojobzy.com` (Backend)

---

## 📞 Support & Contact

- **Technical Support**: support@autojobzy.com
- **Institute Queries**: institutes@autojobzy.com
- **Super Admin Access**: admin@autojobzy.com

---

**Document Version**: 1.0
**Last Updated**: January 5, 2026
**Prepared For**: Client Presentations & Employee Training
