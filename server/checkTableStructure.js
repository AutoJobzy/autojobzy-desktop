/**
 * Check table structures
 */

import sequelize from './db/config.js';

const checkStructure = async () => {
    try {
        console.log('Checking institutes table structure:');
        const [institutesColumns] = await sequelize.query('DESCRIBE institutes');
        console.log(institutesColumns);

        console.log('\nChecking users table structure:');
        const [usersColumns] = await sequelize.query('DESCRIBE users');
        console.log(usersColumns);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkStructure();
