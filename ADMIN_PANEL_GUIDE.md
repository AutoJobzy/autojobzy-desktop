# Admin Panel - Complete Setup Guide

## Overview

The Admin Panel is a separate, secure area for platform administrators to manage users, pricing plans, and monitor system analytics. It features:

- **Separate Authentication** - Independent admin login system
- **Role-Based Access** - Only users with `admin` role can access
- **User Management** - View, activate/deactivate, change plans
- **Plan Management** - Create, edit, delete pricing plans
- **Analytics Dashboard** - Comprehensive system metrics
- **Enterprise-Grade UI** - Professional, clean interface

## Architecture

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Frontend (React + TypeScript)                  │
│  ├─ AdminLogin.tsx (Separate authentication)    │
│  ├─ AdminDashboard.tsx (Layout & navigation)    │
│  ├─ AdminOverview.tsx (Analytics)               │
│  ├─ AdminUsers.tsx (User management)            │
│  └─ AdminPlans.tsx (Plan management)            │
│                                                 │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│                                                 │
│  Backend API (Express.js)                       │
│  ├─ /api/admin/* (Admin routes)                 │
│  ├─ authenticateAdmin middleware                │
│  └─ Admin-only endpoints                        │
│                                                 │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│                                                 │
│  Database (MySQL)                               │
│  └─ users.role ENUM('user', 'admin')            │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Setup Instructions

### Step 1: Run Database Migration

Add admin role to users table:

```bash
mysql -u root -p < server/db/migrations/007_add_admin_role.sql
```

**What this does:**
- Adds `role` ENUM column to users table
- Creates default admin user
- Adds index for role queries

**Default Admin Credentials:**
```
Email: admin@jobautomate.com
Password: Admin@123
```

**⚠️ IMPORTANT:** Change the admin password immediately after first login!

### Step 2: Register Admin Routes

Add admin routes to your Express server. In `server/index.js` or `server/server.js`:

```javascript
import adminRoutes from './routes/admin.js';

// Admin routes (requires authentication + admin role)
app.use('/api/admin', adminRoutes);
```

### Step 3: Add Frontend Routes

Update `App.tsx` to include admin routes:

```typescript
import AdminLogin from './pages/AdminLogin';
// Additional admin components to be created

// In your routes
<Route path="/admin/login" element={<AdminLogin />} />
<Route path="/admin/*" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
```

### Step 4: Create Admin Protected Route

```typescript
// AdminProtectedRoute.tsx
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  if (!token || adminUser.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
```

## API Endpoints

### Authentication

**Login (Uses existing auth endpoint)**
```
POST /api/auth/login
Body: { email, password }
Response: { token, user: { role: 'admin', ... } }
```

### Analytics

**Get Overview**
```
GET /api/admin/analytics/overview
Headers: Authorization: Bearer {adminToken}
Response: {
  summary: {
    totalUsers,
    activeUsers,
    totalApplications,
    ...
  },
  planDistribution: [...],
  dailyStats: [...]
}
```

**Get User Analytics**
```
GET /api/admin/analytics/users
Headers: Authorization: Bearer {adminToken}
Response: {
  userGrowth: [...],
  topActiveUsers: [...]
}
```

### User Management

**Get All Users**
```
GET /api/admin/users?page=1&limit=20&search=&status=all&role=user
Headers: Authorization: Bearer {adminToken}
Response: {
  users: [...],
  pagination: { total, page, limit, pages }
}
```

**Get User Details**
```
GET /api/admin/users/:id
Headers: Authorization: Bearer {adminToken}
Response: {
  user: {...},
  subscriptions: [...],
  jobSettings: {...},
  applicationStats: {...}
}
```

**Update User Status**
```
PUT /api/admin/users/:id/status
Headers: Authorization: Bearer {adminToken}
Body: { isActive: true/false }
```

**Change User Plan**
```
POST /api/admin/users/:id/change-plan
Headers: Authorization: Bearer {adminToken}
Body: { planId, startDate, endDate }
```

**Delete User (Soft Delete)**
```
DELETE /api/admin/users/:id
Headers: Authorization: Bearer {adminToken}
```

### Plan Management

**Get All Plans**
```
GET /api/admin/plans
Headers: Authorization: Bearer {adminToken}
Response: [{ ...plan, features: [...] }]
```

**Create Plan**
```
POST /api/admin/plans
Headers: Authorization: Bearer {adminToken}
Body: {
  name,
  description,
  subtitle,
  price,
  durationDays,
  isPopular,
  comingSoon,
  features: [...]
}
```

**Update Plan**
```
PUT /api/admin/plans/:id
Headers: Authorization: Bearer {adminToken}
Body: { name, price, features, ... }
```

**Delete Plan (Soft Delete)**
```
DELETE /api/admin/plans/:id
Headers: Authorization: Bearer {adminToken}
```

## Frontend Components Structure

### 1. Admin Login Page ✅

**File:** `/pages/AdminLogin.tsx`

**Features:**
- Separate login form
- Admin-only validation
- Security warnings
- Error handling

**Already Created:** Yes

### 2. Admin Dashboard Layout (To Create)

**File:** `/pages/AdminDashboard.tsx`

**Structure:**
```typescript
import { Routes, Route } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminPlans from './AdminPlans';

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-dark-900">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/plans" element={<AdminPlans />} />
        </Routes>
      </main>
    </div>
  );
};
```

### 3. Admin Sidebar (To Create)

**File:** `/components/AdminSidebar.tsx`

**Menu Items:**
```typescript
const menuItems = [
  { id: 'overview', label: 'Dashboard', icon: BarChart, path: '/admin/dashboard' },
  { id: 'users', label: 'Users', icon: Users, path: '/admin/dashboard/users' },
  { id: 'plans', label: 'Plans', icon: CreditCard, path: '/admin/dashboard/plans' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/dashboard/settings' }
];
```

### 4. Admin Overview Page (To Create)

**File:** `/pages/AdminOverview.tsx`

**Displays:**
- Total users (active/inactive)
- Plan distribution pie chart
- Daily application stats (line chart)
- Recent activity feed
- Quick stats cards

**Key Metrics:**
```typescript
interface OverviewStats {
  totalUsers: number;
  activeUsers: number;
  totalApplications: number;
  newUsersThisMonth: number;
  applicationsThisWeek: number;
}
```

### 5. Admin Users Page (To Create)

**File:** `/pages/AdminUsers.tsx`

**Features:**
- Searchable user table
- Filter by status (active/inactive)
- Pagination
- User details modal
- Quick actions:
  - Activate/Deactivate
  - Change plan
  - View details
  - Delete (soft)

**Table Columns:**
```typescript
| Email | Name | Status | Plan | Applications | Created | Actions |
```

### 6. Admin Plans Page (To Create)

**File:** `/pages/AdminPlans.tsx`

**Features:**
- Plans list/grid view
- Create new plan modal
- Edit plan modal
- Delete plan (with confirmation)
- Plan preview
- Feature management

**Plan Card:**
```typescript
<PlanCard>
  <Name>Pro Automation</Name>
  <Price>₹499 / 60 days</Price>
  <Status>Active | Popular | Coming Soon</Status>
  <Subscribers>125 users</Subscribers>
  <Features>...</Features>
  <Actions>Edit | Delete | Toggle Status</Actions>
</PlanCard>
```

## Sample Component Templates

### Admin Stat Card Component

```typescript
// components/AdminStatCard.tsx
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

const AdminStatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp
}) => {
  return (
    <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <div className="p-2 bg-red-500/10 rounded-lg">
          <Icon className="w-5 h-5 text-red-500" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-white">{value}</div>
        {trend && (
          <div className={`text-sm font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>
    </div>
  );
};
```

### Usage Example

```typescript
<AdminStatCard
  title="Total Users"
  value="1,234"
  icon={Users}
  trend="12%"
  trendUp={true}
/>
```

## Security Features

### 1. Role-Based Access Control

```javascript
// Middleware chain
router.use(authenticateToken);  // Verify JWT
router.use(authenticateAdmin);  // Verify admin role
```

### 2. Token Verification

```javascript
// Frontend API calls
const fetchAdminData = async () => {
  const token = localStorage.getItem('adminToken');

  const response = await fetch('/api/admin/users', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status === 403) {
    // Not authorized - redirect to login
    navigate('/admin/login');
  }
};
```

### 3. Auto-Logout on Token Expiry

```typescript
// Add to admin layout
useEffect(() => {
  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  // Check every minute
  const interval = setInterval(checkAuth, 60000);
  return () => clearInterval(interval);
}, []);
```

## Styling Guidelines

### Color Scheme

- **Primary:** Red/Orange gradient (`from-red-500 to-orange-500`)
- **Background:** Dark theme (`bg-dark-900`, `bg-dark-800`)
- **Borders:** Subtle white (`border-white/10`)
- **Text:** White headings, gray-400 for secondary
- **Accents:** Red for admin, Blue for regular features

### Component Patterns

```typescript
// Card Container
className="bg-dark-800 border border-white/10 rounded-lg p-6"

// Button Primary
className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"

// Input Field
className="bg-dark-900 border border-white/10 rounded-lg text-white focus:border-red-500"

// Table Row
className="border-b border-white/10 hover:bg-white/5"
```

## Testing

### Test Admin Login

```bash
# 1. Login as admin
POST https://api.autojobzy.com/api/auth/login
{
  "email": "admin@jobautomate.com",
  "password": "Admin@123"
}

# 2. Copy token from response

# 3. Test admin endpoint
GET https://api.autojobzy.com/api/admin/analytics/overview
Authorization: Bearer YOUR_TOKEN_HERE
```

### Test User Management

```bash
# Get all users
GET https://api.autojobzy.com/api/admin/users?page=1&limit=10
Authorization: Bearer YOUR_TOKEN

# Update user status
PUT https://api.autojobzy.com/api/admin/users/USER_ID/status
Authorization: Bearer YOUR_TOKEN
{
  "isActive": false
}
```

## Deployment Checklist

- [ ] Run migration 007_add_admin_role.sql
- [ ] Change default admin password
- [ ] Add admin routes to server
- [ ] Add admin pages to frontend
- [ ] Test authentication flow
- [ ] Test all CRUD operations
- [ ] Verify role-based access
- [ ] Enable HTTPS in production
- [ ] Set strong JWT_SECRET in .env
- [ ] Configure rate limiting for admin endpoints
- [ ] Add logging for admin actions
- [ ] Set up monitoring/alerts

## Next Steps

1. **Complete Frontend Components:**
   - Create AdminDashboard.tsx
   - Create AdminSidebar.tsx
   - Create AdminOverview.tsx
   - Create AdminUsers.tsx
   - Create AdminPlans.tsx

2. **Add Charts/Visualizations:**
   - Install recharts: `npm install recharts`
   - Create analytics charts (line, pie, bar)

3. **Enhance Security:**
   - Add rate limiting
   - Add audit logs
   - Add 2FA for admin accounts

4. **Add More Features:**
   - System settings management
   - Email templates editor
   - Backup/restore functionality
   - Activity logs viewer

## Troubleshooting

### Issue: "Admin access required" error

**Solution:**
- Verify user has `role = 'admin'` in database
- Check JWT token includes role field
- Ensure middleware is in correct order

### Issue: Cannot access admin endpoints

**Solution:**
```sql
-- Check user role
SELECT id, email, role FROM users WHERE email = 'admin@jobautomate.com';

-- Update role if needed
UPDATE users SET role = 'admin' WHERE email = 'admin@jobautomate.com';
```

### Issue: Token expired

**Solution:**
- Login again to get new token
- Token expires in 30 days by default
- Check JWT_SECRET is consistent

## Resources

- **Files Created:**
  - `/server/db/migrations/007_add_admin_role.sql`
  - `/server/models/User.js` (updated)
  - `/server/middleware/auth.js` (updated)
  - `/server/routes/admin.js`
  - `/pages/AdminLogin.tsx`

- **Files to Create:**
  - `/pages/AdminDashboard.tsx`
  - `/pages/AdminOverview.tsx`
  - `/pages/AdminUsers.tsx`
  - `/pages/AdminPlans.tsx`
  - `/components/AdminSidebar.tsx`
  - `/components/AdminStatCard.tsx`

---

**Last Updated:** 2025-12-20
**Status:** ✅ Backend Complete | ⚠️ Frontend In Progress
