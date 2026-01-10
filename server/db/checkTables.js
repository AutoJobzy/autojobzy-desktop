/**
 * Check what tables exist in the database
 */

import sequelize from './config.js';

async function checkTables() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database\n');

        // Show all tables
        const [tables] = await sequelize.query('SHOW TABLES');
        console.log('📋 Tables in database:');
        if (tables.length === 0) {
            console.log('   (none - database is empty)\n');
        } else {
            tables.forEach(table => {
                console.log(`   - ${Object.values(table)[0]}`);
            });
            console.log('');
        }

        // Check database name
        const [dbInfo] = await sequelize.query('SELECT DATABASE() as db');
        console.log('📊 Current database:', dbInfo[0].db);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkTables();
