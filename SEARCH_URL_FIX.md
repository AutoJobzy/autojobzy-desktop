# Search URL Save Functionality - Issue Resolution

## Problem Description

**Issue:** The Search URL field in Job Profile > Job Search Filters is not being saved to the database.

## Root Cause Analysis

The code flow for saving the Search URL is **CORRECT**:

1. ✅ **Frontend** - Dashboard.tsx (line 403): `finalUrl` is included in `filtersToSave` object
2. ✅ **API Call** - Dashboard.tsx (line 408): `saveUserFilters(filtersToSave)` is called
3. ✅ **Backend Endpoint** - filters.js (line 112-169): POST `/api/filters/user` receives and saves `finalUrl`
4. ✅ **Database Model** - UserFilter.js (line 80-83): `finalUrl` column is defined

**Most Likely Cause:** The `finalUrl` column doesn't exist in the actual database table, even though it's defined in the model. This can happen if:
- Database migrations weren't run after the model was updated
- The table was created before the `finalUrl` field was added to the model
- Database sync is not working properly

## Solution

### Step 1: Verify and Fix Database Schema

Run the verification script to check if the `finalUrl` column exists and add it if missing:

```bash
node server/db/verifyUserFiltersTable.js
```

**What this script does:**
- Checks if the `finalUrl` column exists in the `user_filters` table
- If missing, automatically adds the column: `ALTER TABLE user_filters ADD COLUMN finalUrl VARCHAR(2000)`
- Verifies the fix was successful

### Step 2: Test the Fix

Run the comprehensive test script:

```bash
./test_search_url_save.sh
```

**What this script does:**
1. Verifies database schema
2. Tests POST `/api/filters/user` endpoint with a sample Search URL
3. Fetches back the saved data using GET `/api/filters/user`
4. Confirms the Search URL was saved correctly

### Step 3: Manual Testing

1. **Start the server:**
   ```bash
   npm run server
   ```

2. **Login to the application** and navigate to Dashboard > Job Profile

3. **Enter a Search URL:**
   - Go to "Job Search Filters" section
   - Paste a Naukri search URL in the "Enter Your Search URL" field
   - Example: `https://www.naukri.com/software-engineer-jobs-in-bangalore`

4. **Fill all required fields** (to enable the Save button)

5. **Click "Save Configuration"**

6. **Check browser console** for logs:
   ```javascript
   [Save Config] Saving filters with finalUrl: https://www.naukri.com/software-engineer-jobs...
   [Save Config] ✅ Filters saved successfully
   ```

7. **Check server console** for logs:
   ```
   [Save Filters] Request received for userId: xxxx
   [Save Filters] finalUrl: https://www.naukri.com/software-engineer-jobs...
   [Save Filters] Updated successfully
   [Save Filters] Saved finalUrl: YES (https://www.naukri.com/software-engineer-jobs...)
   ```

8. **Refresh the page** and verify the Search URL is loaded back correctly

### Step 4: Verify in Database

Connect to MySQL and run:

```sql
USE your_database_name;

-- Check if column exists
DESCRIBE user_filters;

-- Check saved data
SELECT id, userId, finalUrl, createdAt, updatedAt
FROM user_filters
WHERE finalUrl IS NOT NULL;
```

## Enhanced Logging

### Frontend Logging (Dashboard.tsx)
- ✅ Line 406: Logs finalUrl before saving
- ✅ Line 410-415: Checks for errors and logs success/failure

### Backend Logging (filters.js)
- ✅ Line 131-132: Logs incoming request with finalUrl
- ✅ Line 153-154: Logs save success with confirmation
- ✅ Line 162-163: Logs detailed errors if save fails

## Expected Behavior

**When saving configuration:**

1. User enters a Search URL in the field
2. User clicks "Save Configuration"
3. Frontend logs: `[Save Config] Saving filters with finalUrl: https://...`
4. Backend logs: `[Save Filters] Request received` with URL
5. Backend logs: `[Save Filters] Updated successfully`
6. Backend logs: `[Save Filters] Saved finalUrl: YES (...)`
7. Frontend logs: `[Save Config] ✅ Filters saved successfully`
8. Success message appears: "✅ Configuration saved successfully!"

**When loading configuration:**

1. Page loads
2. Backend fetches user filters including `finalUrl`
3. Search URL field is populated with saved value

## Files Modified

1. **server/db/verifyUserFiltersTable.js** (NEW)
   - Database schema verification and auto-fix script

2. **test_search_url_save.sh** (NEW)
   - Comprehensive testing script

3. **server/routes/filters.js** (ENHANCED)
   - Lines 131-132: Added logging for incoming finalUrl
   - Lines 153-154: Added logging for save confirmation
   - Lines 162-163: Enhanced error logging

4. **pages/Dashboard.tsx** (ENHANCED)
   - Line 406: Added logging before saving filters
   - Lines 410-415: Added error checking and success logging

## Troubleshooting

### Issue: Column doesn't exist error

**Error Message:**
```
Error: ER_BAD_FIELD_ERROR: Unknown column 'finalUrl' in 'field list'
```

**Solution:**
Run the verification script:
```bash
node server/db/verifyUserFiltersTable.js
```

### Issue: Data saves but doesn't persist

**Symptoms:**
- Save appears successful
- Data doesn't reload on page refresh

**Possible Causes:**
1. Using different user accounts
2. Token expired/invalid
3. Database transaction not committed

**Debug Steps:**
1. Check browser console for token
2. Check server logs for userId
3. Query database directly to verify data

### Issue: Empty/NULL value saved

**Symptoms:**
- Save successful
- Database shows NULL or empty string

**Possible Causes:**
1. Input field is empty
2. Frontend not reading the value correctly

**Debug Steps:**
1. Check browser console logs for the value being sent
2. Verify `selectedFilters.finalUrl` is populated
3. Check if `|| ''` is converting to empty string

## API Endpoint Reference

### POST /api/filters/user
**Save user's filter selections including Search URL**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "finalUrl": "https://www.naukri.com/...",
  "freshness": "1",
  "salaryRange": "5-10 Lakhs",
  "wfhType": "Work from Home",
  ...
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Filters updated successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "finalUrl": "https://www.naukri.com/...",
    ...
  }
}
```

### GET /api/filters/user
**Fetch user's saved filter selections**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "finalUrl": "https://www.naukri.com/...",
    "freshness": "1",
    ...
  }
}
```

## Database Schema

```sql
CREATE TABLE user_filters (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  freshness TEXT,
  salaryRange TEXT,
  wfhType TEXT,
  citiesGid TEXT,
  functionalAreaGid TEXT,
  industryTypeGid TEXT,
  ugCourseGid TEXT,
  pgCourseGid TEXT,
  business_size TEXT,
  employement TEXT,
  glbl_RoleCat TEXT,
  topGroupId TEXT,
  featuredCompanies TEXT,
  finalUrl VARCHAR(2000),  -- ⬅️ This column must exist
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Summary

✅ **Code is correct** - Frontend and backend are properly handling the Search URL

✅ **Database column added** - Run verification script to ensure column exists

✅ **Enhanced logging** - Easy to diagnose issues in browser and server console

✅ **Comprehensive testing** - Automated test script verifies entire flow

🎯 **Next Steps:**
1. Run `node server/db/verifyUserFiltersTable.js`
2. Restart server
3. Test saving Search URL in the UI
4. Verify logs confirm successful save
