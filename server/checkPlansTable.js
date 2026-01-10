/**
 * Check plans table structure and data
 */

import sequelize from './db/config.js';

const checkPlans = async () => {
    try {
        console.log('Plans table structure:');
        const [columns] = await sequelize.query('DESCRIBE plans');
        console.log(columns);

        console.log('\n\nPlans data:');
        const [plans] = await sequelize.query('SELECT * FROM plans');
        console.log(JSON.stringify(plans, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkPlans();
