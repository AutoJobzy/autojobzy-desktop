/**
 * Comprehensive Schema Fix
 * Ensures all columns exist in skills and user_filters tables
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
        console.log('=== Fixing Skills Table ===\n');

        await addColumnIfMissing('skills', 'display_name',
            "VARCHAR(255) NULL COMMENT 'Display name for UI'");

        console.log('\n=== Fixing User Filters Table ===\n');

        const userFilterColumns = [
            ['freshness', 'TEXT NULL'],
            ['salary_range', 'TEXT NULL'],
            ['wfh_type', 'TEXT NULL'],
            ['cities_gid', 'TEXT NULL'],
            ['functional_area_gid', 'TEXT NULL'],
            ['industry_type_gid', 'TEXT NULL'],
            ['ug_course_gid', 'TEXT NULL'],
            ['pg_course_gid', 'TEXT NULL'],
            ['business_size', 'TEXT NULL'],
            ['employement', 'TEXT NULL'],
            ['glbl__role_cat', 'TEXT NULL'],
            ['top_group_id', 'TEXT NULL'],
            ['featured_companies', 'TEXT NULL'],
            ['final_url', 'VARCHAR(2000) NULL'],
        ];

        for (const [columnName, columnDef] of userFilterColumns) {
            await addColumnIfMissing('user_filters', columnName, columnDef);
        }

        console.log('\n✅ All schema fixes completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error fixing schema:', error);
        process.exit(1);
    }
}

fixSchema();
