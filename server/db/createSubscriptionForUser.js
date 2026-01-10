/**
 * Create Subscription for User
 * Manually create subscription for user who paid but didn't get subscription due to "user exists" error
 */

import sequelize from './config.js';

async function createSubscription() {
    try {
        const userId = 'da81d7b7-e5ce-4576-a328-364008e15ab0';
        const email = 'rohanravikadam@gmail.com';
        const planId = 1; // base plan
        const orderId = 'order_RyZNBJuMBZedr0';
        const paymentId = 'pay_RyZNSyyceLTgwK';
        const amount = 299.00;

        console.log(`\n=== Creating Subscription for ${email} ===\n`);

        // Get plan details
        const [plans] = await sequelize.query(`
            SELECT * FROM plans WHERE id = ?
        `, {
            replacements: [planId]
        });

        if (plans.length === 0) {
            console.log('❌ Plan not found!');
            process.exit(1);
        }

        const plan = plans[0];
        console.log('✓ Plan found:', plan.name, '-', plan.price);

        // Calculate dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration_days);

        console.log('  Start Date:', startDate.toISOString());
        console.log('  End Date:', endDate.toISOString());
        console.log('  Duration:', plan.duration_days, 'days');

        // Create subscription
        const [result] = await sequelize.query(`
            INSERT INTO user_plans
            (user_id, plan_id, razorpay_order_id, razorpay_payment_id, amount, start_date, end_date, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
        `, {
            replacements: [
                userId,
                planId,
                orderId,
                paymentId,
                amount,
                startDate,
                endDate
            ]
        });

        console.log('\n✓ Subscription created successfully!');
        console.log('  Subscription ID:', result);
        console.log('  Status: active');

        // Verify
        const [subscriptions] = await sequelize.query(`
            SELECT * FROM user_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
        `, {
            replacements: [userId]
        });

        if (subscriptions.length > 0) {
            const sub = subscriptions[0];
            console.log('\n✓ Verification:');
            console.log('  ID:', sub.id);
            console.log('  Plan ID:', sub.plan_id);
            console.log('  Status:', sub.status);
            console.log('  Start:', sub.start_date);
            console.log('  End:', sub.end_date);
        }

        console.log('\n✅ Subscription created successfully!\n');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createSubscription();
