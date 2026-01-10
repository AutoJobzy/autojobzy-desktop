/**
 * Drop and recreate skills table
 * Run this if you encounter index errors with the skills table
 */

import sequelize from './server/db/config.js';

async function resetSkillsTable() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Connected');

        console.log('Dropping skills table if exists...');
        await sequelize.query('DROP TABLE IF EXISTS skills');
        console.log('✅ Skills table dropped');

        console.log('Synchronizing database...');
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized');

        console.log('\n✅ Skills table reset successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

resetSkillsTable();
