# Database Migrations

यो folder मध्ये सगळे database schema changes ठेवलेले आहेत.

## Available Migrations

### 1. `add_onboarding_completed.js`
**Purpose**: Adds `onboarding_completed` column to `users` table

**Usage**:
```bash
node server/migrations/add_onboarding_completed.js
```

**What it does**:
- Adds TINYINT(1) column `onboarding_completed` (default: 0)
- Tracks whether user has completed initial onboarding

---

### 2. `add_resume_s3_fields.js`
**Purpose**: Adds S3 resume storage columns to `job_settings` table

**Usage**:
```bash
node server/migrations/add_resume_s3_fields.js
```

**What it does**:
- Adds `resume_s3_url` VARCHAR(500) - Full S3 URL of uploaded resume
- Adds `resume_s3_key` VARCHAR(500) - S3 object key for file operations
- Checks if columns exist before adding (idempotent)

---

### 3. `complete_resume_s3_setup.sql`
**Purpose**: Complete SQL script for resume S3 setup (manual fallback)

**Usage**:
```bash
mysql -u admin -p jobautomate < server/migrations/complete_resume_s3_setup.sql
```

**What it does**:
- Adds all resume-related columns (`resume_file_name`, `resume_s3_url`, `resume_s3_key`)
- Shows verification queries
- Displays existing resume data
- Idempotent (can run multiple times safely)

---

## How to Run Migrations

### Automatic (Recommended)
```bash
# Run specific migration
node server/migrations/add_resume_s3_fields.js

# Or run from any directory
cd /path/to/project
node server/migrations/add_onboarding_completed.js
```

### Manual (SQL)
```bash
# Login to MySQL
mysql -u admin -p

# Use database
USE jobautomate;

# Copy-paste SQL from .sql files
# Or run entire file:
source server/migrations/complete_resume_s3_setup.sql;
```

---

## Creating New Migrations

जेव्हा database schema change करायचं असेल:

### 1. JavaScript Migration (Preferred)
```javascript
/**
 * ======================== MIGRATION: Your Migration Name ========================
 * Description of what this migration does
 *
 * Usage: node server/migrations/your_migration_name.js
 */

import sequelize from '../db/config.js';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
    try {
        console.log('🔄 Starting migration: Your migration name...');

        await sequelize.authenticate();
        console.log('✅ Database connection established');

        // Check if column/table exists
        const [results] = await sequelize.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'your_table'
            AND COLUMN_NAME = 'your_column'
        `);

        if (results.length === 0) {
            // Make changes
            await sequelize.query(`
                ALTER TABLE your_table
                ADD COLUMN your_column VARCHAR(255) NULL
            `);
            console.log('✅ Successfully added column');
        } else {
            console.log('ℹ️  Column already exists. Skipping.');
        }

        console.log('✅ Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
```

### 2. SQL Migration (Backup)
```sql
-- Check if exists
SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'your_table' AND COLUMN_NAME = 'your_column';

-- Make changes
ALTER TABLE your_table ADD COLUMN your_column VARCHAR(255) NULL;

-- Verify
SELECT * FROM your_table LIMIT 1;
```

---

## Migration Best Practices

### ✅ DO:
- Always check if column/table exists before creating
- Add comments explaining what migration does
- Make migrations idempotent (can run multiple times safely)
- Test on development database first
- Add verification queries at the end
- Document in this README

### ❌ DON'T:
- Drop columns without backup
- Run migrations directly on production without testing
- Forget to handle existing data
- Skip verification steps

---

## Current Database Schema

### Resume Storage Fields (job_settings table)
```sql
resume_file_name    VARCHAR(255)  - Original filename
resume_s3_url       VARCHAR(500)  - Full S3 URL (https://bucket.s3.region.amazonaws.com/key)
resume_s3_key       VARCHAR(500)  - S3 object key (autojobzy-resumes/userId/timestamp_filename)
```

### S3 Configuration
```
Bucket: autojobzy-desktop-downloads
Region: eu-north-1 (Stockholm)
Folder Structure: autojobzy-resumes/{userId}/{timestamp}_{filename}
```

---

## Troubleshooting

### Error: "Cannot find module"
```bash
# Make sure you're in project root
cd /path/to/Job_automate-main

# Install dependencies
npm install

# Run migration
node server/migrations/add_resume_s3_fields.js
```

### Error: "Access denied for user"
```bash
# Check .env file has correct credentials
cat .env | grep DB_

# Test connection
mysql -h database-1.c72i2s6muax7.ap-south-1.rds.amazonaws.com -u admin -p jobautomate
```

### Error: "Column already exists"
✅ This is OK! Migration is idempotent. It will skip existing columns.

---

## Migration History

| Date | Migration | Description |
|------|-----------|-------------|
| 2024-01 | add_onboarding_completed.js | Added onboarding tracking |
| 2024-01 | add_resume_s3_fields.js | Added S3 resume upload support |
| 2024-01 | complete_resume_s3_setup.sql | Complete SQL script for resume S3 |

---

## Need Help?

1. Check server logs: `tail -f server/logs/server.log`
2. Verify database connection: `node -e "import('./server/db/config.js').then(db => db.default.authenticate())"`
3. Check existing schema: Run verification queries in `.sql` files

---

**सगळे migrations tested आणि production-ready आहेत! 🚀**
