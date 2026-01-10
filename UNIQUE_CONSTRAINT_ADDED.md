# UNIQUE Constraint on user_id - COMPLETE ✅

## Summary

Added a UNIQUE constraint on the `user_id` column in the `user_filters` table to ensure that each user can only have one set of filter preferences.

## Problem

Without a UNIQUE constraint on `user_id`, it was possible for a single user to have multiple rows in the `user_filters` table, which could lead to:
- Data inconsistency
- Unexpected behavior when fetching user filters
- Potential bugs when updating filters

## Solution

Added a UNIQUE constraint named `unique_user_id` on the `user_id` column.

## Migration Process

### What Was Done

1. **Checked for Existing Constraint**
   - Verified no UNIQUE constraint existed on `user_id`

2. **Identified Duplicates**
   - Found 1 duplicate user_id: `da81d7b7-e5ce-4576-a328-364008e15ab0` (2 records)

3. **Cleaned Up Duplicates**
   - Kept the most recent record (based on `updated_at`)
   - Deleted older duplicate records

4. **Added UNIQUE Constraint**
   ```sql
   ALTER TABLE user_filters
   ADD CONSTRAINT unique_user_id UNIQUE (user_id);
   ```

5. **Verified Success**
   - Confirmed constraint exists: ✅ `unique_user_id (UNIQUE)`

## Database Schema

The `user_filters` table now has the following constraints:

| Constraint Name    | Type    | Column    | Purpose                                    |
|--------------------|---------|-----------|-------------------------------------------|
| PRIMARY            | PRIMARY | id        | Primary key (UUID)                        |
| unique_user_id     | UNIQUE  | user_id   | **Ensures one filter set per user** ✅    |
| user_id (FK)       | FOREIGN | user_id   | References users(id) ON DELETE CASCADE    |

## Files Created/Modified

### Migration Files

1. **[server/db/migrations/015_add_unique_constraint_user_filters.js](server/db/migrations/015_add_unique_constraint_user_filters.js)** (NEW)
   - Migration #015 - JavaScript version
   - Auto-detects and cleans up duplicate records
   - Adds constraint safely
   - Idempotent: Safe to run multiple times

2. **[server/db/migrations/015_add_unique_constraint_user_filters.sql](server/db/migrations/015_add_unique_constraint_user_filters.sql)** (NEW)
   - Migration #015 - SQL version
   - Idempotent: Checks if constraint exists before adding
   - Contains step-by-step SQL commands
   - Includes verification queries
   - Documented in migrations README

### Verification Script

3. **[server/db/verifyAndFixUserFilters.js](server/db/verifyAndFixUserFilters.js)** (UPDATED)
   - Added UNIQUE constraint verification step
   - Shows warning if constraint is missing
   - Provides command to fix the issue

### Model

4. **[server/models/UserFilter.js](server/models/UserFilter.js)** (Already Correct)
   - Model already had `unique: true` on userId field
   - Model already had unique index definition
   - Now database matches the model definition ✅

## How to Run Migration

If you need to run this migration on another environment:

### Option 1: JavaScript Migration (Recommended)

```bash
# Check current state
node server/db/verifyAndFixUserFilters.js

# Run migration (auto-cleanup duplicates)
node server/db/migrations/015_add_unique_constraint_user_filters.js

# Verify success
node server/db/verifyAndFixUserFilters.js
```

### Option 2: SQL Migration

```bash
# Check current state first
mysql -u admin -p jobautomate -e "
    SELECT user_id, COUNT(*) as count
    FROM user_filters
    GROUP BY user_id
    HAVING COUNT(*) > 1;
"

# Clean up duplicates manually if any exist (see SQL file)
# Then run migration
mysql -u admin -p jobautomate < server/db/migrations/015_add_unique_constraint_user_filters.sql
```

### Option 3: Run All Migrations (Production Deployment)

```bash
# Runs all migrations in order (idempotent)
cd server/db/migrations
./run_migrations.sh
```

## SQL Commands (Manual Execution)

If you prefer to run SQL manually:

```sql
-- 1. Check for duplicates
SELECT user_id, COUNT(*) as count
FROM user_filters
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 2. Clean up duplicates (if any found)
-- Replace 'duplicate-user-id' with actual user_id from step 1
DELETE FROM user_filters
WHERE user_id = 'duplicate-user-id'
AND id NOT IN (
    SELECT id FROM (
        SELECT id
        FROM user_filters
        WHERE user_id = 'duplicate-user-id'
        ORDER BY updated_at DESC
        LIMIT 1
    ) as keeper
);

-- 3. Add UNIQUE constraint
ALTER TABLE user_filters
ADD CONSTRAINT unique_user_id UNIQUE (user_id);

-- 4. Verify constraint exists
SELECT INDEX_NAME, NON_UNIQUE, COLUMN_NAME
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'user_filters'
AND COLUMN_NAME = 'user_id';
-- Should show: unique_user_id with NON_UNIQUE = 0
```

## Testing

### Before Migration
```sql
-- This would succeed (WRONG!)
INSERT INTO user_filters (id, user_id, ...) VALUES ('id1', 'user-123', ...);
INSERT INTO user_filters (id, user_id, ...) VALUES ('id2', 'user-123', ...);
-- Same user_id twice!
```

### After Migration
```sql
-- This fails as expected (CORRECT!)
INSERT INTO user_filters (id, user_id, ...) VALUES ('id1', 'user-123', ...);
INSERT INTO user_filters (id, user_id, ...) VALUES ('id2', 'user-123', ...);
-- ERROR: Duplicate entry 'user-123' for key 'unique_user_id'
```

## Application Behavior

### Sequelize Model Behavior

The UserFilter model uses `upsert()` which handles UNIQUE constraints correctly:

```javascript
// This works perfectly with UNIQUE constraint
const [userFilter, created] = await UserFilter.upsert({
    userId: req.userId,  // If exists, UPDATE. If not, INSERT.
    finalUrl: finalUrl || null,
    selectedFilters: selectedFilters || null,
    // ... other fields
});
```

**Behavior:**
- First time: Creates new record (INSERT)
- Subsequent calls: Updates existing record (UPDATE)
- No duplicates ever created ✅

## Verification Results

### Current State ✅

```
========================================
UNIQUE CONSTRAINT VERIFICATION
========================================

✅ UNIQUE constraint exists on user_id column
   - idx_user_id (NON-UNIQUE)
   - unique_user_id (UNIQUE)
```

## Benefits

✅ **Data Integrity** - Prevents duplicate filter records per user

✅ **Consistent Behavior** - Upsert always works correctly

✅ **Performance** - UNIQUE index improves query performance for user lookups

✅ **Database Protection** - Constraint enforced at database level, not just application level

✅ **Automatic Cleanup** - Migration automatically removes any existing duplicates

## Notes

- The migration detected and cleaned up **1 duplicate record** during execution
- The most recent record (by `updated_at`) was kept for the duplicate user
- The constraint is named `unique_user_id` for clarity
- Existing non-unique index `idx_user_id` remains (doesn't interfere)

## Summary

The `user_filters` table now enforces a UNIQUE constraint on `user_id`, ensuring:
- ✅ Each user can have exactly one filter configuration
- ✅ No duplicate records possible
- ✅ Upsert operations work correctly
- ✅ Database integrity is maintained
- ✅ All existing duplicates were cleaned up

The database schema now matches the Sequelize model definition perfectly.
