import sequelize from './config.js';

async function checkUserTable() {
    try {
        await sequelize.authenticate();
        const [columns] = await sequelize.query('DESCRIBE users');
        console.log('Users table structure:');
        console.table(columns);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkUserTable();
