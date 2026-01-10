/**
 * ======================== DATABASE CONFIG ========================
 * MySQL Connection using Sequelize ORM
 * Connects to central AWS RDS MySQL database for all platforms
 */

import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'jobautomate';
const DB_USER = process.env.DB_USER || 'admin';
const DB_PASSWORD = process.env.DB_PASSWORD || 'YsjlUaX5yFJGtZqjmrSj';
const DB_HOST = process.env.DB_HOST || 'database-1.c72i2s6muax7.ap-south-1.rds.amazonaws.com';
const DB_PORT = process.env.DB_PORT || 3306;

const sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    {
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            connectTimeout: 60000, // 60 seconds
            ssl: {
                rejectUnauthorized: false // Required for Railway/production databases
            }
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 60000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
        },
    }
);

/**
 * Create database if it doesn't exist
 * Skip for production/Railway as database already exists
 */
async function createDatabaseIfNotExists() {
    // Skip database creation for Railway/production databases
    if (DB_HOST !== 'localhost' && DB_HOST !== '127.0.0.1') {
        console.log(`✅ Using existing database '${DB_NAME}' on ${DB_HOST}`);
        return;
    }

    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        console.log(`✅ Database '${DB_NAME}' ready`);
        await connection.end();
    } catch (error) {
        console.error('❌ Failed to create database:', error.message);
        throw error;
    }
}

/**
 * Test and sync database
 */
export const initDatabase = async () => {
    try {
        // First, create the database if it doesn't exist
        await createDatabaseIfNotExists();

        // Then connect with Sequelize
        await sequelize.authenticate();
        console.log('✅ MySQL Connection established successfully');

        // Note: Using migrations instead of auto-sync for production safety
        // Skip sync since we manage schema through migrations
        // await sequelize.sync({ alter: false });
        console.log('✅ Database connection verified (using migrations for schema management)');

        return sequelize;
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
};

export default sequelize;
