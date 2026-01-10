# Database Migrations

## Overview

This directory contains all database schema migrations for the JobAutoApply application. All database changes MUST be managed through these versioned SQL files.

## Migration Files

| File | Purpose | Idempotent | Dependencies |
|------|---------|------------|--------------|
| `001_create_database.sql` | Create database | ✅ Yes | None |
| `002_create_tables.sql` | Create all tables with PRIMARY KEYS, FOREIGN KEYS, and indexes | ✅ Yes | 001 |
| `003_add_unique_constraints.sql` | Add UNIQUE constraint on company_url for deduplication | ✅ Yes | 002 |
| `004_add_filter_types.sql` | Add 'stipend' and 'internshipDuration' to filter_type ENUM | ✅ Yes | 002 |
| `005_update_years_of_experience.sql` | Convert years_of_experience from VARCHAR to TINYINT UNSIGNED | ✅ Yes | 002 |
| `006_update_plans_schema.sql` | Update plans table schema | ✅ Yes | 002 |
| `007_add_admin_role.sql` | Add admin role functionality | ✅ Yes | 002 |
| `008_create_suggestions_and_coupons.sql` | Create suggestions and coupons tables | ✅ Yes | 002 |
| `009_add_job_details_columns.sql` | Add job details columns | ✅ Yes | 002 |
| `010_add_credentials_verification_fields.sql` | Add credentials verification fields | ✅ Yes | 002 |
| `011_add_dob_to_job_settings.sql` | Add date of birth to job settings | ✅ Yes | 002 |
| `012_add_application_status.sql` | Add application status field | ✅ Yes | 002 |
| `013_update_user_plans_schema.sql` | Update user plans schema | ✅ Yes | 002 |
| `014_fix_suggestions_schema.sql` | Fix suggestions table schema | ✅ Yes | 008 |
| `015_add_unique_constraint_user_filters.sql` | **Add UNIQUE constraint on user_id in user_filters table** | ✅ Yes | 002 |
| `015_add_unique_constraint_user_filters.js` | JavaScript migration for unique constraint (auto-cleanup duplicates) | ✅ Yes | 002 |
| `016_add_last_profile_update.sql` | Add last_profile_update column to job_settings table | ✅ Yes | 002 |
| `016_add_last_profile_update.js` | JavaScript migration for last_profile_update column | ✅ Yes | 002 |
| `017_add_profile_update_scheduler.sql` | Add profile update scheduler columns (enabled, frequency, next_run, status) | ✅ Yes | 002 |
| `017_add_profile_update_scheduler.js` | JavaScript migration for profile update scheduler columns | ✅ Yes | 002 |

## Principles

### 1. Version Control
- All schema changes are versioned (001, 002, 003, etc.)
- Files are numbered sequentially
- Never edit past migrations after they've been run in production

### 2. Idempotency
- All migrations use `IF NOT EXISTS` or conditional checks
- Safe to run multiple times without errors
- Automatically skip if already applied

### 3. Single Source of Truth
- Database schema is fully defined in these SQL files
- No manual changes in database tools
- If database is dropped, running these files recreates exact schema

## Running Migrations

### First Time Setup (Fresh Database)

```bash
# Run all migrations in order
mysql -u root -p < server/db/migrations/001_create_database.sql
mysql -u root -p < server/db/migrations/002_create_tables.sql
mysql -u root -p < server/db/migrations/003_add_unique_constraints.sql
```

Or use the provided script:

```bash
cd server/db/migrations
./run_migrations.sh
```

### Single Migration

```bash
mysql -u root -p < server/db/migrations/003_add_unique_constraints.sql
```

### Production Deployment

```bash
# Run only new migrations (migrations are idempotent)
for file in server/db/migrations/*.sql; do
    echo "Running $file..."
    mysql -u root -p jobautomate < "$file"
done
```

## Creating New Migrations

### Naming Convention
```
<sequence>_<description>.sql
```

Example: `004_add_user_email_index.sql`

### Template

```sql
-- ========================================================================
-- MIGRATION XXX: Brief Description
-- ========================================================================
-- Purpose: Detailed explanation
-- Idempotent: YES/NO
-- Dependencies: XXX_previous_migration.sql
-- ========================================================================

USE jobautomate;

-- Step 1: Check if change already exists
SET @check = (SELECT COUNT(*) FROM ... WHERE ...);

-- Step 2: Apply change conditionally
SET @sql = IF(@check = 0,
    'ALTER TABLE ... ADD ...',
    'SELECT "Already exists, skipping" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Verify change
SELECT * FROM information_schema.columns WHERE ...;

-- ========================================================================
-- END OF MIGRATION XXX
-- ========================================================================
```

## Best Practices

### DO ✅

1. **Always check before altering**
   ```sql
   CREATE TABLE IF NOT EXISTS users ...
   ```

2. **Use conditional execution**
   ```sql
   SET @exists = (SELECT COUNT(*) FROM information_schema.tables WHERE ...);
   SET @sql = IF(@exists = 0, 'CREATE TABLE...', 'SELECT "Exists"');
   ```

3. **Add comments explaining WHY**
   ```sql
   -- Purpose: Add index to improve query performance for user lookups
   ALTER TABLE users ADD INDEX idx_email (email);
   ```

4. **Verify after each change**
   ```sql
   SHOW INDEX FROM users WHERE Key_name = 'idx_email';
   ```

5. **Clean up before constraints**
   ```sql
   -- Remove duplicates before adding UNIQUE constraint
   DELETE t1 FROM table t1 INNER JOIN table t2 WHERE ...;
   ```

### DON'T ❌

1. **Don't apply schema changes manually in database tools**
2. **Don't modify migrations after they've run in production**
3. **Don't rely on application-level checks for data integrity**
4. **Don't use non-idempotent commands without checks**
5. **Don't forget to add FOREIGN KEY constraints**

## Deduplication Strategy

### Problem
Prevent duplicate job applications to the same company.

### Solution (Migration 003)

**Database Level:**
- UNIQUE constraint on `company_url`
- Automatically enforced by MySQL
- Race-condition safe

**Application Level:**
```javascript
// Sequelize: ignoreDuplicates option
await JobApplicationResult.bulkCreate(data, {
    ignoreDuplicates: true
});
```

**Benefits:**
- ✅ Retry-safe: Script can run multiple times
- ✅ Concurrent-safe: Multiple processes won't create duplicates
- ✅ Crash-safe: Database enforces integrity even if app crashes
- ✅ Performance: Index-based validation is fast

## Recovery Scenarios

### Scenario 1: Dropped Database
```bash
# Recreate entire database from scratch
./run_migrations.sh
```

### Scenario 2: Partial Migration
```bash
# Run only remaining migrations (idempotent)
mysql -u root -p < 003_add_unique_constraints.sql
```

### Scenario 3: Migration Failed Halfway
```bash
# Re-run the same migration (idempotent)
mysql -u root -p < 003_add_unique_constraints.sql
```

## Verification

### Check All Constraints
```sql
SELECT
    TABLE_NAME,
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM information_schema.table_constraints
WHERE table_schema = 'jobautomate'
ORDER BY TABLE_NAME;
```

### Check All Indexes
```sql
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM information_schema.statistics
WHERE table_schema = 'jobautomate'
ORDER BY TABLE_NAME, INDEX_NAME;
```

### Check All Foreign Keys
```sql
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.key_column_usage
WHERE table_schema = 'jobautomate'
AND referenced_table_name IS NOT NULL;
```

## Migration Checklist

Before creating a new migration:

- [ ] Migration number is sequential
- [ ] File name is descriptive
- [ ] Idempotent (can run multiple times)
- [ ] Has proper comments explaining WHY
- [ ] Includes verification queries
- [ ] Tested on fresh database
- [ ] Tested on existing database
- [ ] Dependencies documented
- [ ] Added to this README

## Support

For questions or issues with migrations:
1. Check migration logs
2. Verify current schema state
3. Run verification queries
4. Check idempotency of problematic migration
