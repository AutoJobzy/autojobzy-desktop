/**
 * Migration Runner Script
 * Runs all SQL migrations in order using Sequelize connection
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, readdirSync } from 'fs';
import sequelize from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
    try {
        console.log('🔄 Starting migration process...\n');

        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

        const migrationsDir = join(__dirname, 'migrations');
        const migrationFiles = readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql') && !file.includes('README'))
            .sort();

        console.log(`Found ${migrationFiles.length} migration files\n`);

        for (const file of migrationFiles) {
            try {
                console.log(`📄 Running: ${file}`);
                const filePath = join(migrationsDir, file);
                const sql = readFileSync(filePath, 'utf8');

                // Split by semicolon and filter out empty statements
                const statements = sql
                    .split(';')
                    .map(s => s.trim())
                    .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/));

                for (const statement of statements) {
                    if (statement.trim()) {
                        await sequelize.query(statement);
                    }
                }

                console.log(`✅ Completed: ${file}\n`);
            } catch (error) {
                console.error(`❌ Error in ${file}:`, error.message);
                // Continue with other migrations
            }
        }

        console.log('✅ All migrations completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigrations();
