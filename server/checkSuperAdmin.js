import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const checkSuperAdmin = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'job_automation',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to database');

        const [users] = await connection.execute(
            'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE email = ?',
            ['admin@jobzy.com']
        );

        if (users.length > 0) {
            console.log('\n✅ Super Admin found:');
            console.table(users);
        } else {
            console.log('\n❌ Super Admin NOT found with email: admin@jobzy.com');
        }

        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

checkSuperAdmin();
