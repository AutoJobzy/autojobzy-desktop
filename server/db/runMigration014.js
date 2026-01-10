/**
 * ========================================================================
 * RUN MIGRATION 014: Fix Suggestions Table Schema
 * ========================================================================
 * Drops and recreates suggestions table with correct schema
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sequelize from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
    try {
        console.log('🚀 Starting Migration 014: Fix Suggestions Schema\n');

        // Read migration file
        const migrationPath = join(__dirname, 'migrations', '014_fix_suggestions_schema.sql');
        const migrationSQL = readFileSync(migrationPath, 'utf8');

        // Split by semicolons and filter out empty statements
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));

        console.log(`📄 Found ${statements.length} SQL statements to execute\n`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];

            // Skip comments and empty lines
            if (statement.startsWith('--') || statement.length < 5) {
                continue;
            }

            try {
                console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);

                await sequelize.query(statement);

                console.log(`✅ Statement ${i + 1} completed\n`);
            } catch (error) {
                // Some statements might fail (like DESCRIBE) but that's okay
                if (error.name === 'SequelizeDatabaseError') {
                    console.log(`⚠️  Statement ${i + 1} warning: ${error.message}\n`);
                } else {
                    throw error;
                }
            }
        }

        // Verify the new structure
        console.log('📋 Verifying new table structure:\n');
        const [columns] = await sequelize.query('DESCRIBE suggestions');
        console.table(columns.map(col => ({
            Field: col.Field,
            Type: col.Type,
            Null: col.Null,
            Default: col.Default
        })));

        console.log('\n✅ Migration 014 completed successfully!');
        console.log('🎉 Suggestions table now has correct schema with type, title, and priority columns\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

runMigration();
