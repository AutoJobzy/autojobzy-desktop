import sequelize from './config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database\n');

        console.log('📄 Running migration 013: Update user_plans schema...\n');

        const migrationPath = path.join(__dirname, 'migrations', '013_update_user_plans_schema.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

        // Split by semicolons and execute each statement
        const statements = migrationSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s && !s.startsWith('/*') && !s.startsWith('--'));

        for (const statement of statements) {
            try {
                await sequelize.query(statement);
                console.log('✅ Executed:', statement.substring(0, 60) + '...');
            } catch (error) {
                if (error.message.includes('Duplicate column')) {
                    console.log('ℹ️  Column already exists, skipping...');
                } else if (error.message.includes("Can't DROP")) {
                    console.log('ℹ️  Column already dropped, skipping...');
                } else {
                    throw error;
                }
            }
        }

        console.log('\n✅ Migration 013 completed successfully!');
        console.log('\n📋 Verifying new structure...');

        const [columns] = await sequelize.query('DESCRIBE user_plans');
        console.table(columns.map(col => ({ Field: col.Field, Type: col.Type, Null: col.Null, Default: col.Default })));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

runMigration();
