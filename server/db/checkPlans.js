import sequelize from './config.js';

async function checkPlans() {
    try {
        await sequelize.authenticate();
        const [plans] = await sequelize.query('SELECT * FROM plans');
        console.log(`\n📋 Plans in database: ${plans.length}`);
        if (plans.length === 0) {
            console.log('   ⚠️  No plans found - database needs seeding\n');
        } else {
            console.table(plans);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkPlans();
