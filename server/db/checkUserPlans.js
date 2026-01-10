import sequelize from './config.js';

async function checkUserPlansTable() {
    try {
        await sequelize.authenticate();
        const [columns] = await sequelize.query('DESCRIBE user_plans');
        console.log('\n📋 user_plans table structure:\n');
        console.table(columns.map(col => ({
            Field: col.Field,
            Type: col.Type,
            Null: col.Null,
            Default: col.Default
        })));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkUserPlansTable();
