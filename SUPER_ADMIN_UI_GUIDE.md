# Super Admin UI - Implementation Guide

## ✅ Created Pages

### 1. SuperAdminDashboard.tsx
**Location:** `/pages/SuperAdminDashboard.tsx`

**Features:**
- Dashboard with 8 stat cards (institutes, students, revenue, etc.)
- Quick action buttons
- System overview
- Fully integrated with `/api/superadmin/dashboard-stats`

**Route:** `/superadmin/dashboard`

---

### 2. SuperAdminInstitutes.tsx
**Location:** `/pages/SuperAdminInstitutes.tsx`

**Features:**
- Institute list with search
- Create institute modal with admin user creation
- Delete institute with confirmation
- View institute details
- Fully integrated with `/api/superadmin/institutes`

**Route:** `/superadmin/institutes`

---

## 📝 Remaining Pages to Create

### 3. SuperAdminPackages.tsx

Create similar to `SuperAdminInstitutes.tsx` with these features:

```typescript
// Key Features:
- List all packages
- Create new package with:
  - Name
  - Description
  - Student limit
  - Price per month
  - Features (JSON)
- Edit package
- Delete package (only if no active subscriptions)
- Toggle package active/inactive status

// API Endpoints:
GET    /api/superadmin/packages
POST   /api/superadmin/packages
PUT    /api/superadmin/packages/:id
DELETE /api/superadmin/packages/:id

// Form Fields:
- name: string
- description: textarea
- studentLimit: number
- pricePerMonth: number
- features: JSON object
  - job_automation: boolean
  - resume_builder: boolean
  - skill_tracking: boolean
  - analytics: boolean
  - support: string
```

**Sample Code Structure:**
```typescript
const [packages, setPackages] = useState<Package[]>([]);
const [showCreateModal, setShowCreateModal] = useState(false);
const [formData, setFormData] = useState({
  name: '',
  description: '',
  studentLimit: 500,
  pricePerMonth: 60000,
  features: {
    job_automation: true,
    resume_builder: true,
    skill_tracking: true,
    analytics: true,
    support: 'Email & Phone'
  }
});
```

---

### 4. InstituteAdminDashboard.tsx

**Features:**
- Show institute details
- Display current subscription with:
  - Package name
  - Student limit
  - Students added / limit
  - Remaining slots
  - Payment status
  - Expiry date
- Quick stats (students, staff)
- Quick actions (add student, add staff)

**API Endpoint:** `GET /api/institute-admin/dashboard`

**Sample Response:**
```json
{
  "institute": {
    "id": "uuid",
    "name": "ABC College",
    "email": "admin@abc.edu.in"
  },
  "subscription": {
    "package": {
      "name": "Basic Plan",
      "studentLimit": 500,
      "pricePerMonth": 60000
    },
    "status": "active",
    "paymentStatus": "paid",
    "startDate": "2026-01-01",
    "endDate": "2026-12-31"
  },
  "studentCount": 245,
  "staffCount": 12,
  "adminCount": 3,
  "canAddStudents": true,
  "remainingSlots": 255
}
```

**UI Elements:**
```typescript
// Subscription Card
<div className="bg-dark-800 border border-white/10 rounded-lg p-6">
  <h3>Current Subscription: {subscription.package.name}</h3>
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p>Students: {studentCount} / {studentLimit}</p>
      <ProgressBar percent={(studentCount / studentLimit) * 100} />
    </div>
    <div>
      <p>Remaining Slots: {remainingSlots}</p>
      <p>Valid Until: {endDate}</p>
    </div>
  </div>
</div>
```

---

### 5. InstituteStudents.tsx

**Features:**
- Student list with pagination
- Search by name/email
- Filter by status (active, inactive, graduated, suspended)
- Add student form with:
  - Name
  - Email
  - Password
  - Enrollment number
  - Batch
  - Course
- Edit student
- Remove student
- **Limit enforcement** - Cannot add if limit reached

**API Endpoints:**
```
GET    /api/institute-admin/students?page=1&limit=50&search=&status=
POST   /api/institute-admin/students
PUT    /api/institute-admin/students/:id
DELETE /api/institute-admin/students/:id
```

**Add Student Logic:**
```typescript
const handleAddStudent = async () => {
  // Check if can add students
  if (!canAddStudents) {
    alert(`Student limit reached (${studentLimit}). Please upgrade your package.`);
    return;
  }

  // Make API call
  const response = await fetch('/api/institute-admin/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error = await response.json();
    alert(error.error); // Will show limit error from backend
    return;
  }

  // Success
  alert('Student added successfully!');
  fetchStudents();
};
```

---

### 6. InstituteStaff.tsx

Similar to `InstituteStudents.tsx` but for staff members.

**Features:**
- Staff list
- Add staff with:
  - Name
  - Email
  - Password
  - Role/Designation
- Remove staff

**API Endpoints:**
```
GET    /api/institute-admin/staff
POST   /api/institute-admin/staff
DELETE /api/institute-admin/staff/:id
```

---

## 🛣️ Route Configuration

### Update App.tsx or Router Configuration

```typescript
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminInstitutes from './pages/SuperAdminInstitutes';
import SuperAdminPackages from './pages/SuperAdminPackages';
import InstituteAdminDashboard from './pages/InstituteAdminDashboard';
import InstituteStudents from './pages/InstituteStudents';
import InstituteStaff from './pages/InstituteStaff';

// Add these routes:
<Routes>
  {/* Super Admin Routes */}
  <Route path="/superadmin/dashboard" element={
    <ProtectedRoute role="superadmin">
      <SuperAdminDashboard />
    </ProtectedRoute>
  } />

  <Route path="/superadmin/institutes" element={
    <ProtectedRoute role="superadmin">
      <SuperAdminInstitutes />
    </ProtectedRoute>
  } />

  <Route path="/superadmin/packages" element={
    <ProtectedRoute role="superadmin">
      <SuperAdminPackages />
    </ProtectedRoute>
  } />

  {/* Institute Admin Routes */}
  <Route path="/institute/dashboard" element={
    <ProtectedRoute role="institute_admin">
      <InstituteAdminDashboard />
    </ProtectedRoute>
  } />

  <Route path="/institute/students" element={
    <ProtectedRoute role="institute_admin">
      <InstituteStudents />
    </ProtectedRoute>
  } />

  <Route path="/institute/staff" element={
    <ProtectedRoute role="institute_admin">
      <InstituteStaff />
    </ProtectedRoute>
  } />
</Routes>
```

---

## 🔐 Protected Route Component

Create or update `ProtectedRoute` component:

```typescript
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  try {
    const decoded: any = jwtDecode(token);

    // Check if user has the required role
    if (decoded.role !== role) {
      // Redirect based on actual role
      if (decoded.role === 'superadmin') {
        return <Navigate to="/superadmin/dashboard" replace />;
      } else if (decoded.role === 'institute_admin') {
        return <Navigate to="/institute/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }

    return <>{children}</>;
  } catch (error) {
    localStorage.removeItem('token');
    return <Navigate to="/auth" replace />;
  }
};

export default ProtectedRoute;
```

---

## 🔄 Login Redirect Logic

Update your auth logic to redirect based on user role:

```typescript
// After successful login:
const handleLoginSuccess = (token: string) => {
  localStorage.setItem('token', token);

  const decoded: any = jwtDecode(token);

  // Redirect based on role
  switch (decoded.role) {
    case 'superadmin':
      navigate('/superadmin/dashboard');
      break;
    case 'institute_admin':
      navigate('/institute/dashboard');
      break;
    case 'student':
    case 'staff':
    case 'user':
    default:
      navigate('/dashboard');
      break;
  }
};
```

---

## 🎨 Common UI Components

### Package Card Component

```typescript
const PackageCard: React.FC<{ package: Package; onSelect?: () => void }> = ({ package, onSelect }) => {
  return (
    <div className="bg-dark-800 border border-white/10 rounded-lg p-6 hover:border-neon-blue transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-xl">{package.name}</h3>
          <p className="text-gray-400 text-sm">{package.description}</p>
        </div>
        {package.isActive ? (
          <CheckCircle className="w-5 h-5 text-green-400" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400" />
        )}
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-neon-blue">
          ₹{package.pricePerMonth.toLocaleString('en-IN')}
          <span className="text-gray-400 text-sm font-normal">/month</span>
        </div>
        <p className="text-gray-400 text-sm mt-1">
          Up to {package.studentLimit} students
        </p>
      </div>

      {/* Features */}
      <div className="space-y-2 mb-4">
        {Object.entries(package.features || {}).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 text-sm text-gray-400">
            <CheckCircle className="w-4 h-4 text-green-400" />
            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            {typeof value === 'string' && `: ${value}`}
          </div>
        ))}
      </div>

      {onSelect && (
        <button
          onClick={onSelect}
          className="w-full px-4 py-2 bg-neon-blue hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          Select Plan
        </button>
      )}
    </div>
  );
};
```

---

## 🧪 Testing Checklist

### Super Admin Testing:
- [ ] Login as super admin
- [ ] View dashboard - all stats loading
- [ ] Create new institute
- [ ] View institute list
- [ ] Delete institute
- [ ] Create package
- [ ] Edit package
- [ ] Delete package (should fail if active subscriptions)
- [ ] Assign subscription to institute

### Institute Admin Testing:
- [ ] Login as institute admin
- [ ] View dashboard - subscription details showing
- [ ] Check student count vs limit
- [ ] Add student (should work if under limit)
- [ ] Try adding student when limit reached (should fail)
- [ ] Edit student
- [ ] Remove student
- [ ] Add staff
- [ ] Remove staff

### Student/User Testing:
- [ ] Login as individual user
- [ ] Existing flow works normally
- [ ] No access to institute features

---

## 📊 Sample Test Data

```sql
-- Login as Super Admin
Email: superadmin@jobautomation.com
Password: Admin@123

-- After creating institute, login as Institute Admin
Email: john@abc.edu.in (or whatever you set)
Password: (whatever you set during creation)

-- Student login (after being added by institute admin)
Email: student@example.com
Password: (set by institute admin)
```

---

## 🔧 Troubleshooting

### Issue: Super admin can't access dashboard
**Fix:** Check JWT token has `role: 'superadmin'`

### Issue: Institute admin sees "No active subscription"
**Fix:** Super admin needs to create subscription for the institute

### Issue: Can't add students
**Fix:**
1. Check institute has active subscription
2. Check payment_status is 'paid'
3. Check student count < studentLimit

### Issue: API returns 403 Forbidden
**Fix:** Check middleware `isSuperAdmin` or `isInstituteAdmin` is working

---

## 🎯 Next Steps

1. **Run SQL Migration**
   ```bash
   mysql -u root -p job_automation < server/migrations/add_super_admin_system.sql
   ```

2. **Create Remaining UI Pages**
   - SuperAdminPackages.tsx
   - InstituteAdminDashboard.tsx
   - InstituteStudents.tsx
   - InstituteStaff.tsx

3. **Add Routes** in App.tsx

4. **Update Navigation**
   - Add super admin menu items
   - Add institute admin menu items

5. **Test Complete Flow**
   - Super admin creates institute
   - Super admin assigns subscription
   - Institute admin logs in
   - Institute admin adds students
   - Test limit enforcement

---

**Last Updated:** 2026-01-04
**Version:** 1.0.0
