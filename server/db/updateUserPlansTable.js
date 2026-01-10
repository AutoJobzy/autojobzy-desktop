import sequelize from './config.js';

async function updateUserPlansTable() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database\n');

        console.log('📄 Updating user_plans table schema...\n');

        // Add razorpay_order_id column
        try {
            await sequelize.query(`
                ALTER TABLE user_plans
                ADD COLUMN razorpay_order_id VARCHAR(100) DEFAULT NULL
            `);
            console.log('✅ Added razorpay_order_id column');
        } catch (error) {
            if (error.message.includes('Duplicate column')) {
                console.log('ℹ️  razorpay_order_id column already exists');
            } else {
                throw error;
            }
        }

        // Add razorpay_payment_id column
        try {
            await sequelize.query(`
                ALTER TABLE user_plans
                ADD COLUMN razorpay_payment_id VARCHAR(100) DEFAULT NULL
            `);
            console.log('✅ Added razorpay_payment_id column');
        } catch (error) {
            if (error.message.includes('Duplicate column')) {
                console.log('ℹ️  razorpay_payment_id column already exists');
            } else {
                throw error;
            }
        }

        // Add razorpay_signature column
        try {
            await sequelize.query(`
                ALTER TABLE user_plans
                ADD COLUMN razorpay_signature VARCHAR(500) DEFAULT NULL
            `);
            console.log('✅ Added razorpay_signature column');
        } catch (error) {
            if (error.message.includes('Duplicate column')) {
                console.log('ℹ️  razorpay_signature column already exists');
            } else {
                throw error;
            }
        }

        // Add amount column
        try {
            await sequelize.query(`
                ALTER TABLE user_plans
                ADD COLUMN amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00
            `);
            console.log('✅ Added amount column');
        } catch (error) {
            if (error.message.includes('Duplicate column')) {
                console.log('ℹ️  amount column already exists');
            } else {
                throw error;
            }
        }

        // Add status column
        try {
            await sequelize.query(`
                ALTER TABLE user_plans
                ADD COLUMN status ENUM('pending', 'active', 'expired', 'cancelled', 'failed') DEFAULT 'pending'
            `);
            console.log('✅ Added status column');
        } catch (error) {
            if (error.message.includes('Duplicate column')) {
                console.log('ℹ️  status column already exists');

                // Migrate data if needed
                try {
                    await sequelize.query(`
                        UPDATE user_plans
                        SET status = CASE
                            WHEN payment_status = 'completed' THEN 'active'
                            WHEN payment_status = 'failed' THEN 'failed'
                            WHEN payment_status = 'cancelled' THEN 'cancelled'
                            ELSE 'pending'
                        END
                        WHERE status IS NULL OR status = 'pending'
                    `);
                } catch (e) {
                    // Ignore if already migrated
                }
            } else {
                throw error;
            }
        }

        // Migrate data from payment_status to status if not already done
        try {
            const [result] = await sequelize.query(`
                SELECT COUNT(*) as count FROM user_plans WHERE payment_status IS NOT NULL
            `);
            if (result[0].count > 0) {
                console.log('🔄 Migrating payment_status data to status...');
                await sequelize.query(`
                    UPDATE user_plans
                    SET status = CASE
                        WHEN payment_status = 'completed' THEN 'active'
                        WHEN payment_status = 'failed' THEN 'failed'
                        WHEN payment_status = 'cancelled' THEN 'cancelled'
                        ELSE 'pending'
                    END
                `);
                console.log('✅ Data migrated successfully');
            }
        } catch (error) {
            console.log('ℹ️  Data migration not needed or already done');
        }

        // Drop payment_status column
        try {
            await sequelize.query(`ALTER TABLE user_plans DROP COLUMN payment_status`);
            console.log('✅ Dropped payment_status column');
        } catch (error) {
            if (error.message.includes("Can't DROP")) {
                console.log('ℹ️  payment_status column already dropped');
            } else {
                throw error;
            }
        }

        // Drop is_active column
        try {
            await sequelize.query(`ALTER TABLE user_plans DROP COLUMN is_active`);
            console.log('✅ Dropped is_active column');
        } catch (error) {
            if (error.message.includes("Can't DROP")) {
                console.log('ℹ️  is_active column already dropped');
            } else {
                throw error;
            }
        }

        console.log('\n✅ user_plans table updated successfully!');
        console.log('\n📋 Verifying new structure...');

        const [columns] = await sequelize.query('DESCRIBE user_plans');
        console.table(columns.map(col => ({ Field: col.Field, Type: col.Type, Null: col.Null, Default: col.Default })));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

updateUserPlansTable();
