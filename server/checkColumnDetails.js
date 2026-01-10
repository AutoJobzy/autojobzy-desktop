/**
 * Check detailed column information
 */

import sequelize from './db/config.js';

const checkDetails = async () => {
    try {
        console.log('Checking institutes.id column:');
        const [institutesId] = await sequelize.query(`
            SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, CHARACTER_SET_NAME, COLLATION_NAME
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'institutes'
            AND COLUMN_NAME = 'id'
        `);
        console.log(institutesId);

        console.log('\nChecking users.institute_id column:');
        const [usersInstituteId] = await sequelize.query(`
            SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, CHARACTER_SET_NAME, COLLATION_NAME
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'users'
            AND COLUMN_NAME = 'institute_id'
        `);
        console.log(usersInstituteId);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDetails();
