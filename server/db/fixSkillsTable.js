/**
 * Fix Skills Table Schema
 * Ensures all required columns exist in skills table
 */

import sequelize from './config.js';

async function getTableColumns(tableName) {
    const [columns] = await sequelize.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
        AND TABLE_NAME = '${tableName}'
    `);
    return columns.map(col => col.COLUMN_NAME);
}

async function addColumnIfMissing(tableName, columnName, columnDef) {
    const existingColumns = await getTableColumns(tableName);

    if (!existingColumns.includes(columnName)) {
        console.log(`Adding ${columnName} to ${tableName}...`);
        await sequelize.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
        console.log(`✓ Added ${columnName}`);
        return true;
    } else {
        console.log(`✓ ${tableName}.${columnName} already exists`);
        return false;
    }
}

async function fixSchema() {
    try {
        console.log('=== Fixing Skills Table Schema ===\n');

        const skillsColumns = [
            ['skill_name', "VARCHAR(255) NOT NULL COMMENT 'e.g., java, spring, angular'"],
            ['display_name', "VARCHAR(255) NULL COMMENT 'e.g., Java, Spring Boot, Angular'"],
            ['rating', "DECIMAL(2, 1) DEFAULT 0.0 COMMENT 'Skill rating out of 5'"],
            ['out_of', "INT DEFAULT 5 COMMENT 'Maximum rating (usually 5)'"],
            ['experience', "VARCHAR(255) NULL COMMENT 'e.g., 3 years, 6 months'"],
        ];

        for (const [columnName, columnDef] of skillsColumns) {
            await addColumnIfMissing('skills', columnName, columnDef);
        }

        console.log('\n✅ Skills table schema fixed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error fixing schema:', error);
        process.exit(1);
    }
}

fixSchema();
