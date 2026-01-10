# Super Admin System - Setup Guide

## 📋 Overview

Complete multi-level institute management system with:
- **Super Admin** - Manages all institutes, packages, subscriptions
- **Institutes** - Educational organizations
- **Institute Admins** - Manage students and staff within institute
- **Staff** - Institute staff members
- **Students** - Students enrolled in institutes

## 🗄️ Database Migration

### Step 1: Run SQL Migration

```bash
# Connect to MySQL
mysql -u root -p

# Select your database
USE job_automation;

# Run migration
source /Users/rohan/Documents/old/job_automate/server/migrations/add_super_admin_system.sql
```

### Step 2: Create Super Admin User

The migration creates a default super admin, but you need to update the password:

```sql
-- Generate hashed password using bcrypt (run in Node.js)
-- bcrypt.hashSync('your_password', 10)

-- Update super admin password
UPDATE users
SET password = '$2b$10$YourActualHashedPasswordHere'
WHERE email = 'superadmin@jobautomation.com';
```

**OR** Create super admin using Node.js:

```javascript
// createSuperAdmin.js
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';

const createSuperAdmin = async () => {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'job_automation'
    });

    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const [result] = await connection.execute(
        `UPDATE users SET password = ? WHERE email = 'superadmin@jobautomation.com'`,
        [hashedPassword]
    );

    console.log('Super admin password updated!');
    await connection.end();
};

createSuperAdmin();
```

## 🚀 System Architecture

### Database Tables Created:
1. **institutes** - Institute details
2. **packages** - Subscription packages
3. **institute_subscriptions** - Institute package subscriptions
4. **institute_admins** - Admins for each institute
5. **institute_staff** - Staff members
6. **institute_students** - Students enrolled

### Modified Tables:
- **users** - Added `institute_id` and new roles

### Initial Packages:
1. **Basic Plan** - 500 students, ₹60,000/month
2. **Standard Plan** - 1000 students, ₹1,00,000/month
3. **Premium Plan** - 2500 students, ₹2,00,000/month

## 📡 API Endpoints

### Super Admin Routes (`/api/superadmin/`)

#### Package Management
- `GET /packages` - Get all packages
- `POST /packages` - Create new package
- `PUT /packages/:id` - Update package
- `DELETE /packages/:id` - Delete package

#### Institute Management
- `GET /institutes` - Get all institutes with stats
- `POST /institutes` - Create institute with admin
- `PUT /institutes/:id` - Update institute
- `DELETE /institutes/:id` - Delete institute

#### Subscription Management
- `POST /subscriptions` - Create subscription for institute
- `PUT /subscriptions/:id/payment` - Update payment status

#### Dashboard
- `GET /dashboard-stats` - Get overall statistics

### Institute Admin Routes (`/api/institute-admin/`)

#### Dashboard
- `GET /dashboard` - Get institute dashboard with subscription info

#### Student Management
- `GET /students` - Get all students
- `POST /students` - Add new student (checks limit)
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Remove student

#### Staff Management
- `GET /staff` - Get all staff
- `POST /staff` - Add new staff
- `DELETE /staff/:id` - Remove staff

## 🔐 Authentication & Authorization

### Roles:
1. **superadmin** - Full system access
2. **institute_admin** - Institute management
3. **staff** - Institute staff
4. **student** - Student (under institute)
5. **user** - Individual user (existing flow)
6. **admin** - Platform admin (existing)

### Access Control:
- Super admin: All `/api/superadmin/*` routes
- Institute admin: All `/api/institute-admin/*` routes for their institute
- Individual users: Existing flow unchanged

## 📝 Usage Flow

### 1. Super Admin Creates Institute

```bash
POST /api/superadmin/institutes
Authorization: Bearer <superadmin_token>

{
  "name": "ABC Engineering College",
  "email": "admin@abc.edu.in",
  "phone": "+91 9876543210",
  "address": "123 Main St, Mumbai",
  "website": "https://abc.edu.in",
  "adminName": "Dr. John Doe",
  "adminEmail": "john@abc.edu.in",
  "adminPassword": "Admin@123"
}
```

### 2. Super Admin Creates Subscription

```bash
POST /api/superadmin/subscriptions

{
  "instituteId": "uuid-of-institute",
  "packageId": 1,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "paymentStatus": "paid"
}
```

### 3. Institute Admin Logs In

```bash
POST /api/auth/login

{
  "email": "john@abc.edu.in",
  "password": "Admin@123"
}
```

### 4. Institute Admin Adds Students

```bash
POST /api/institute-admin/students
Authorization: Bearer <institute_admin_token>

{
  "name": "Jane Smith",
  "email": "jane@student.com",
  "password": "Student@123",
  "enrollmentNumber": "21CS001",
  "batch": "2021",
  "course": "Computer Science"
}
```

**Note:** Cannot add students beyond package limit!

## 🎨 UI Components (To Be Created)

### Super Admin Panel
- Dashboard with statistics
- Institute list with search/filter
- Institute creation form
- Package management
- Subscription management
- Payment tracking

### Institute Admin Panel
- Dashboard showing:
  - Current package
  - Student count / limit
  - Remaining slots
  - Payment status
- Student management (add/edit/remove)
- Staff management
- Analytics

## ✅ Testing Checklist

### Database Setup
- [ ] Run migration successfully
- [ ] Verify all tables created
- [ ] Check super admin user exists
- [ ] Verify initial packages created

### Super Admin Functions
- [ ] Login as super admin
- [ ] Create new institute
- [ ] Create package
- [ ] Assign subscription to institute
- [ ] View dashboard stats

### Institute Admin Functions
- [ ] Login as institute admin
- [ ] View dashboard with package info
- [ ] Add student (should work)
- [ ] Try adding student beyond limit (should fail)
- [ ] Add staff member
- [ ] View student list

### Student Functions
- [ ] Login as student
- [ ] Existing features work normally

## 🔧 Troubleshooting

### Issue: Migration fails
**Solution**: Check if tables already exist, run rollback script first

### Issue: Super admin can't login
**Solution**: Check password hash is correct, re-run password update

### Issue: Can't add students
**Solution**: Check institute has active, paid subscription

### Issue: Student limit not enforced
**Solution**: Verify subscription package_id is correct

## 📊 Sample Data for Testing

```sql
-- Check super admin
SELECT * FROM users WHERE role = 'superadmin';

-- Check packages
SELECT * FROM packages;

-- Check institutes
SELECT * FROM institutes;

-- Check subscriptions
SELECT
    i.name,
    p.name as package,
    s.status,
    s.payment_status,
    s.start_date,
    s.end_date
FROM institute_subscriptions s
JOIN institutes i ON i.id = s.institute_id
JOIN packages p ON p.id = s.package_id;

-- Check student count per institute
SELECT
    i.name,
    COUNT(s.id) as student_count
FROM institutes i
LEFT JOIN institute_students s ON s.institute_id = i.id
GROUP BY i.id;
```

## 🔒 Important Notes

1. **Individual User Flow**: Existing individual users can still register and login - this system doesn't affect them
2. **Student Limits**: Strictly enforced based on package subscription
3. **Payment Required**: Institute must have paid subscription to add students
4. **Cascading Deletes**: Deleting institute deletes all its admins, staff, and students
5. **Security**: Always use HTTPS in production

## 📞 Support

For issues or questions, contact: rohan@example.com

---

**Last Updated**: 2026-01-04
**Version**: 1.0.0
