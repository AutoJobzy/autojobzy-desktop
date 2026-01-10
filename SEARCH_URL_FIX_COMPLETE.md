# Search URL Save Fix - COMPLETE ✅

## Problem Summary

The Search URL field in Job Profile → Job Search Filters was not being saved to the database because the Sequelize model field names (camelCase) didn't match the actual database column names (snake_case).

## Root Cause

The database uses **snake_case** column names:
- `user_id`
- `final_url`
- `selected_filters`
- `created_at`
- `updated_at`

But the Sequelize model was using **camelCase** field names without proper mapping:
- `userId` → needed mapping to `user_id`
- `finalUrl` → needed mapping to `final_url`
- `selectedFilters` → needed mapping to `selected_filters`

## Solution Implemented

### 1. Updated UserFilter Model ([server/models/UserFilter.js](server/models/UserFilter.js))

Added explicit field mappings for all columns:

```javascript
const UserFilter = sequelize.define('UserFilter', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'id',
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: 'user_id',  // ← Maps to database column
        references: {
            model: User,
            key: 'id',
        },
    },
    freshness: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'freshness',
    },
    salaryRange: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'salary_range',  // ← Maps to database column
    },
    wfhType: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'wfh_type',  // ← Maps to database column
    },
    citiesGid: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'cities_gid',  // ← Maps to database column
    },
    functionalAreaGid: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'functional_area_gid',  // ← Maps to database column
    },
    industryTypeGid: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'industry_type_gid',  // ← Maps to database column
    },
    ugCourseGid: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'ug_course_gid',  // ← Maps to database column
    },
    pgCourseGid: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'pg_course_gid',  // ← Maps to database column
    },
    business_size: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'business_size',
    },
    employement: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'employement',
    },
    glbl_RoleCat: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'glbl__role_cat',  // ← Maps to database column
    },
    topGroupId: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'top_group_id',  // ← Maps to database column
    },
    featuredCompanies: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'featured_companies',  // ← Maps to database column
    },
    finalUrl: {
        type: DataTypes.STRING(2000),
        allowNull: true,
        field: 'final_url',  // ← Maps to database column (CRITICAL FIX)
    },
    selectedFilters: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'selected_filters',  // ← Maps to database column (NEW)
    },
}, {
    tableName: 'user_filters',
    underscored: true,  // ← Automatically maps createdAt → created_at, updatedAt → updated_at
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id'],
        },
    ],
});
```

### 2. Updated Filters Route ([server/routes/filters.js](server/routes/filters.js))

Added support for `selectedFilters` field in both GET and POST endpoints:

**GET /api/filters/user** - Added to response:
```javascript
res.json({
    success: true,
    data: {
        // ... other fields
        finalUrl: userFilters.finalUrl || '',
        selectedFilters: userFilters.selectedFilters || null,  // ← NEW
    },
});
```

**POST /api/filters/user** - Added to save logic:
```javascript
const {
    // ... other fields
    finalUrl,
    selectedFilters,  // ← NEW
} = req.body;

console.log('[Save Filters] finalUrl:', finalUrl ? finalUrl.substring(0, 100) + '...' : 'NOT PROVIDED');
console.log('[Save Filters] selectedFilters:', selectedFilters ? JSON.stringify(selectedFilters).substring(0, 100) + '...' : 'NOT PROVIDED');

const [userFilter, created] = await UserFilter.upsert({
    userId: req.userId,
    // ... other fields
    finalUrl: finalUrl || null,
    selectedFilters: selectedFilters || null,  // ← NEW
});
```

### 3. Created Database Verification Script

Created [server/db/verifyAndFixUserFilters.js](server/db/verifyAndFixUserFilters.js) to:
- Check if `user_filters` table exists
- Verify all required columns exist
- Auto-add missing columns if needed
- Provide detailed column listing

Run with:
```bash
node server/db/verifyAndFixUserFilters.js
```

## Database Schema

The `user_filters` table now has the following structure:

| Column Name           | Data Type      | Nullable | Description                           |
|-----------------------|----------------|----------|---------------------------------------|
| id                    | CHAR(36)       | NOT NULL | Primary key (UUID)                    |
| user_id               | CHAR(36)       | NOT NULL | Foreign key to users table (UNIQUE)   |
| final_url             | VARCHAR(2000)  | NULL     | **Search URL entered by user**        |
| selected_filters      | JSON           | NULL     | **Selected filter values as JSON**    |
| created_at            | DATETIME       | NULL     | Record creation timestamp             |
| updated_at            | DATETIME       | NULL     | Record update timestamp               |
| freshness             | TEXT           | NULL     | Job freshness filter                  |
| salary_range          | TEXT           | NULL     | Salary range filter                   |
| wfh_type              | TEXT           | NULL     | Work from home type filter            |
| cities_gid            | TEXT           | NULL     | Cities filter                         |
| functional_area_gid   | TEXT           | NULL     | Functional area filter                |
| industry_type_gid     | TEXT           | NULL     | Industry type filter                  |
| ug_course_gid         | TEXT           | NULL     | UG course filter                      |
| pg_course_gid         | TEXT           | NULL     | PG course filter                      |
| business_size         | TEXT           | NULL     | Business size filter                  |
| employement           | TEXT           | NULL     | Employment type filter                |
| glbl__role_cat        | TEXT           | NULL     | Role category filter                  |
| top_group_id          | TEXT           | NULL     | Top group filter                      |
| featured_companies    | TEXT           | NULL     | Featured companies filter             |

## Testing Performed

### 1. Database Schema Verification
```bash
node server/db/verifyAndFixUserFilters.js
```
**Result**: ✅ All required columns exist

### 2. API Save Test
```bash
curl -X POST https://api.autojobzy.com/api/filters/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "finalUrl": "https://www.naukri.com/software-engineer-jobs-in-bangalore?test=search-url-save",
    "freshness": "1",
    "salaryRange": "5-10 Lakhs",
    "selectedFilters": {"experience": "3-5 years", "location": "Bangalore"}
  }'
```
**Result**: ✅ Success - Data saved with both finalUrl and selectedFilters

### 3. API Fetch Test
```bash
curl -X GET https://api.autojobzy.com/api/filters/user \
  -H "Authorization: Bearer <token>"
```
**Result**: ✅ Success - Data retrieved correctly:
```json
{
  "success": true,
  "data": {
    "salaryRange": "5-10 Lakhs",
    "freshness": "1",
    "finalUrl": "https://www.naukri.com/software-engineer-jobs-in-bangalore?test=search-url-save",
    "selectedFilters": {
      "location": "Bangalore",
      "experience": "3-5 years"
    }
  }
}
```

### 4. Server Logs Verification
Server console output confirmed successful save:
```
[Save Filters] Request received for userId: 9cf33870-cbce-4bf6-8873-c09c412e26b8
[Save Filters] finalUrl: https://www.naukri.com/software-engineer-jobs-in-bangalore?test=search-url-save...
[Save Filters] selectedFilters: {"experience":"3-5 years","location":"Bangalore"}...
[Save Filters] Created successfully
[Save Filters] Saved finalUrl: YES (https://www.naukri.com/software-engineer-jobs-in-b...)
```

## Files Modified

1. **[server/models/UserFilter.js](server/models/UserFilter.js)**
   - Added field mappings for all columns to match database snake_case names
   - Added `selectedFilters` field with JSON type
   - Added `underscored: true` for automatic timestamp mapping

2. **[server/routes/filters.js](server/routes/filters.js)**
   - Added `selectedFilters` to GET response
   - Added `selectedFilters` to POST request handling
   - Enhanced logging for both finalUrl and selectedFilters

3. **[server/db/verifyAndFixUserFilters.js](server/db/verifyAndFixUserFilters.js)** (NEW)
   - Comprehensive database schema verification script
   - Auto-creates missing columns if needed
   - Provides detailed schema reporting

## How to Use

### In the UI (Dashboard)

1. Navigate to **Dashboard → Job Profile → Job Search Filters**
2. Enter a search URL in the "Enter Your Search URL" field
   - Example: `https://www.naukri.com/software-engineer-jobs-in-bangalore`
3. Fill in all required Job Settings fields
4. Click **"Save Configuration"**
5. Verify success message: "✅ Configuration saved successfully!"
6. Refresh the page - the Search URL should persist

### Expected Behavior

**When saving:**
- Frontend logs: `[Save Config] Saving filters with finalUrl: https://...`
- Backend logs: `[Save Filters] Request received for userId: ...`
- Backend logs: `[Save Filters] finalUrl: https://...`
- Backend logs: `[Save Filters] selectedFilters: {...}`
- Backend logs: `[Save Filters] Created/Updated successfully`
- Backend logs: `[Save Filters] Saved finalUrl: YES (...)`
- Success toast/message appears

**When loading:**
- Search URL field is automatically populated with saved value
- Selected filters (if any) are loaded from database

## Key Improvements

✅ **Fixed column name mismatch** - Sequelize now correctly maps to snake_case database columns

✅ **Added selectedFilters support** - Can now store filter selections as JSON alongside the URL

✅ **Automatic timestamp handling** - `underscored: true` ensures createdAt/updatedAt map to created_at/updated_at

✅ **Comprehensive logging** - Easy to debug and verify saves at all layers

✅ **Database verification tooling** - Script to auto-detect and fix schema issues

✅ **No data migration needed** - Field mappings work with existing database structure

## Troubleshooting

### Issue: Search URL still not saving

**Check:**
1. Server logs for error messages
2. Browser console for frontend errors
3. Database schema with verification script
4. Authentication token is valid

**Debug:**
```bash
# 1. Verify database schema
node server/db/verifyAndFixUserFilters.js

# 2. Check server logs
# Look for lines starting with [Save Filters]

# 3. Test API directly
curl -X POST https://api.autojobzy.com/api/filters/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"finalUrl": "https://test.com"}'
```

### Issue: Data saves but doesn't reload

**Possible causes:**
- Different user account
- Token expired
- Frontend not reading the response correctly

**Debug:**
1. Check userId in server logs matches authenticated user
2. Check GET /api/filters/user returns correct data
3. Verify frontend is setting the input value from response

## Summary

The Search URL save functionality is now **fully working** with:
- ✅ Proper Sequelize model field mappings
- ✅ Support for both `final_url` and `selected_filters` columns
- ✅ Automatic timestamp handling
- ✅ Comprehensive logging
- ✅ Database verification tooling
- ✅ Tested and verified through API and server logs

The user can now enter a Naukri search URL in the Job Search Filters section, save it, and have it persist correctly in the database with proper timestamps and user association.
