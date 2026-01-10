/**
 * Verify User Signup and Subscription
 * Check if the user from the signup flow exists and has proper subscription
 */

import sequelize from './config.js';

async function verifyUser() {
    try {
        const email = 'rohanravikadam@gmail.com';

        console.log(`\n=== Verifying User: ${email} ===\n`);

        // Check if user exists
        const [users] = await sequelize.query(`
            SELECT id, email, first_name, last_name, created_at
            FROM users
            WHERE email = ?
        `, {
            replacements: [email]
        });

        if (users.length === 0) {
            console.log('❌ User not found!');
            process.exit(1);
        }

        const user = users[0];
        console.log('✓ User found:');
        console.log('  ID:', user.id);
        console.log('  Email:', user.email);
        console.log('  Name:', user.first_name, user.last_name);
        console.log('  Created:', user.created_at);

        // Check subscription
        const [subscriptions] = await sequelize.query(`
            SELECT us.*, p.name as plan_name, p.price
            FROM user_plans us
            JOIN plans p ON us.plan_id = p.id
            WHERE us.user_id = ?
            ORDER BY us.created_at DESC
            LIMIT 1
        `, {
            replacements: [user.id]
        });

        if (subscriptions.length === 0) {
            console.log('\n❌ No subscription found for this user!');
        } else {
            const sub = subscriptions[0];
            console.log('\n✓ Subscription found:');
            console.log('  Plan:', sub.plan_name);
            console.log('  Price:', sub.price);
            console.log('  Status:', sub.status);
            console.log('  Start Date:', sub.start_date);
            console.log('  End Date:', sub.end_date);
            console.log('  Order ID:', sub.order_id);
            console.log('  Payment ID:', sub.payment_id);
        }

        console.log('\n✅ Verification complete!\n');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

verifyUser();
