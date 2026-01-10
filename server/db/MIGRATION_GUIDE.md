# Database Migration Guide

## Overview
This document explains how to create, run, and manage database migrations for the Job Automate platform.

## Important Rules

### 1. **NEVER use `CREATE TABLE IF NOT EXISTS` on existing tables**
   - Problem: If table exists with wrong schema, it won't be updated
   - Solution: Use `ALTER TABLE` for schema changes, or `DROP + CREATE` for complete rewrites

### 2. **Always create migration scripts**
   - All schema changes MUST have a corresponding `.sql` file in `migrations/`
   - Number migrations sequentially: `001_`, `002_`, `003_`, etc.
   - Never skip numbers

### 3. **Test migrations before deploying**
   - Run migration on local database first
   - Verify with `DESCRIBE table_name`
   - Test API endpoints that use the table

## Migration History

### Migration 014 - Fix Suggestions Schema (2026-01-01)
**Problem:**
- Error: `Unknown column 'type' in 'field list'`
- Suggestions table had wrong structure:
  - Missing: `type`, `title`, `priority`, `admin_notes`, `reviewed_by`, etc.
  - Had: `id`, `user_id`, `suggestion_text`, `status` (old schema)

**Root Cause:**
- Original migration 008 used `CREATE TABLE IF NOT EXISTS`
- Table existed with old schema before migration 008 was created
- Migration skipped table creation, leaving old structure in place

**Solution:**
- Migration 014: DROP existing table + CREATE with correct schema
- Also recreated `discount_coupons` table to match foreign keys

**Files:**
- Migration: `migrations/014_fix_suggestions_schema.sql`
- Runner: `runMigration014.js`

**To run:**
```bash
node server/db/runMigration014.js
```

**Verify:**
```sql
DESCRIBE suggestions;
DESCRIBE discount_coupons;
```

## How to Create a New Migration

### Step 1: Create SQL file
```bash
touch server/db/migrations/015_your_migration_name.sql
```

### Step 2: Write migration SQL
```sql
-- ========================================================================
-- MIGRATION 015: Your Migration Title
-- ========================================================================
-- Purpose: What this migration does
-- Idempotent: YES/NO
-- Data Loss: YES/NO - Explain
-- ========================================================================

USE jobautomate;

-- Your SQL statements here
ALTER TABLE your_table ADD COLUMN new_column VARCHAR(255);

-- ========================================================================
-- END OF MIGRATION 015
-- ========================================================================
```

### Step 3: Create runner script
```bash
touch server/db/runMigration015.js
```

```javascript
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sequelize from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
    try {
        console.log('🚀 Starting Migration 015\n');

        const migrationPath = join(__dirname, 'migrations', '015_your_migration.sql');
        const migrationSQL = readFileSync(migrationPath, 'utf8');

        await sequelize.query(migrationSQL);

        console.log('✅ Migration 015 completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
```

### Step 4: Test migration
```bash
# Backup database first!
node server/db/runMigration015.js

# Verify changes
node -e "
import sequelize from './server/db/config.js';
const [columns] = await sequelize.query('DESCRIBE your_table');
console.table(columns);
process.exit(0);
"
```

## Common Issues

### Issue: "Table doesn't exist" error
**Cause:** Table was dropped but not recreated
**Fix:** Check migration SQL for syntax errors in CREATE TABLE statement

### Issue: "Foreign key constraint fails"
**Cause:** Referenced table doesn't exist or column mismatch
**Fix:** Ensure referenced tables exist first, or use `SET FOREIGN_KEY_CHECKS = 0`

### Issue: "Duplicate column name"
**Cause:** Column already exists
**Fix:** Use `ALTER TABLE ADD COLUMN IF NOT EXISTS` or check first:
```sql
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'your_table' AND COLUMN_NAME = 'your_column';
```

## Deployment Checklist

- [ ] Migration SQL file created in `migrations/`
- [ ] Runner script created (`runMigrationXXX.js`)
- [ ] Tested on local database
- [ ] API endpoints tested with new schema
- [ ] Migration documented in this file
- [ ] Backup created before running on production
- [ ] Migration script added to deployment pipeline

## Emergency Rollback

If migration fails in production:

1. **Restore from backup**
   ```bash
   mysql -u admin -p jobautomate < backup_before_migration.sql
   ```

2. **Identify failed migration**
   ```bash
   # Check which migration failed
   tail -100 migration_log.txt
   ```

3. **Fix and re-run**
   ```bash
   # Fix the SQL file
   node server/db/runMigrationXXX.js
   ```

## Best Practices

1. **Always backup before migrations**
   ```bash
   mysqldump -u admin -p jobautomate > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Make migrations idempotent**
   - Use `IF EXISTS` for DROP
   - Use `IF NOT EXISTS` for CREATE (only on new tables)
   - Check before ALTER

3. **Test data migration separately**
   - Don't mix schema and data changes
   - Use separate migrations for large data updates

4. **Document breaking changes**
   - Note in migration file if API changes needed
   - Update model files to match new schema

## Contact

For migration issues, contact the backend team or check:
- Migration files: `server/db/migrations/`
- Model files: `server/models/`
- This guide: `server/db/MIGRATION_GUIDE.md`
