/**
 * ======================== ADMIN ROUTES ========================
 * Admin-only endpoints for platform management
 * Requires authentication + admin role
 */

import express from 'express';
import { Op } from 'sequelize';
import { authenticateToken, authenticateAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import PlanFeature from '../models/PlanFeature.js';
import JobApplicationResult from '../models/JobApplicationResult.js';
import UserSubscription from '../models/UserSubscription.js';
import Expense from '../models/Expense.js';
import Suggestion from '../models/Suggestion.js';
import DiscountCoupon from '../models/DiscountCoupon.js';
import sequelize from '../db/config.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticateToken);
router.use(authenticateAdmin);

// ========================================================================
// ANALYTICS & STATISTICS
// ========================================================================

/**
 * GET /api/admin/analytics/overview
 * Get high-level system overview and key metrics
 */
router.get('/analytics/overview', async (req, res) => {
    try {
        // Total users
        const totalUsers = await User.count();

        // Active vs inactive users
        const activeUsers = await User.count({ where: { isActive: true, role: 'user' } });
        const inactiveUsers = await User.count({ where: { isActive: false, role: 'user' } });

        // Plan-wise user distribution
        const [planDistribution] = await sequelize.query(`
            SELECT
                p.name as plan_name,
                p.price,
                COUNT(us.id) as user_count
            FROM plans p
            LEFT JOIN user_plans us ON p.id = us.plan_id AND us.status = 'active'
            GROUP BY p.id
            ORDER BY user_count DESC
        `);

        // Total job applications
        const totalApplications = await JobApplicationResult.count();

        // Applications by status
        const applicationsByStatus = await JobApplicationResult.count({
            attributes: ['matchStatus'],
            group: ['matchStatus']
        });

        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentApplications = await JobApplicationResult.count({
            where: {
                createdAt: {
                    [Op.gte]: sevenDaysAgo
                }
            }
        });

        // New users (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newUsers = await User.count({
            where: {
                createdAt: {
                    [Op.gte]: thirtyDaysAgo
                }
            }
        });

        // Daily application stats (last 7 days)
        const [dailyStats] = await sequelize.query(`
            SELECT
                DATE(datetime) as date,
                COUNT(*) as applications,
                COUNT(DISTINCT user_id) as active_users
            FROM job_application_results
            WHERE datetime >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(datetime)
            ORDER BY date DESC
        `);

        res.json({
            summary: {
                totalUsers,
                activeUsers,
                inactiveUsers,
                totalApplications,
                newUsersThisMonth: newUsers,
                applicationsThisWeek: recentApplications
            },
            planDistribution,
            applicationsByStatus,
            dailyStats
        });
    } catch (error) {
        console.error('Analytics overview error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

/**
 * GET /api/admin/analytics/users
 * Get detailed user analytics
 */
router.get('/analytics/users', async (req, res) => {
    try {
        // User growth over time (monthly)
        const [userGrowth] = await sequelize.query(`
            SELECT
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as new_users,
                SUM(COUNT(*)) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m')) as cumulative_users
            FROM users
            WHERE role = 'user'
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
            LIMIT 12
        `);

        // User activity levels
        const [activityLevels] = await sequelize.query(`
            SELECT
                u.id,
                u.email,
                u.first_name,
                u.last_name,
                COUNT(jar.id) as total_applications,
                MAX(jar.datetime) as last_application
            FROM users u
            LEFT JOIN job_application_results jar ON u.id = jar.user_id
            WHERE u.role = 'user'
            GROUP BY u.id
            ORDER BY total_applications DESC
            LIMIT 50
        `);

        res.json({
            userGrowth,
            topActiveUsers: activityLevels
        });
    } catch (error) {
        console.error('User analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch user analytics' });
    }
});

// ========================================================================
// USER MANAGEMENT
// ========================================================================

/**
 * POST /api/admin/users
 * Create new user (admin only)
 */
router.post('/users', async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone } = req.body;

        // Validation
        if (!email || !password) {
            console.log('[ADMIN CREATE USER] Missing email or password');
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (password.length < 6) {
            console.log('[ADMIN CREATE USER] Password too short');
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log('[ADMIN CREATE USER] User already exists:', email);
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        console.log('[ADMIN CREATE USER] Creating user:', {
            email,
            passwordLength: password.length,
            firstName,
            lastName
        });

        // Create user (password will be auto-hashed by beforeCreate hook)
        const user = await User.create({
            email,
            password,
            firstName: firstName || email.split('@')[0],
            lastName: lastName || '',
            phone: phone || null,
            role: 'user',
            isActive: true
        });

        console.log('[ADMIN CREATE USER] User created successfully:', {
            userId: user.id,
            email: user.email,
            passwordHashLength: user.password?.length
        });

        // Create default job settings
        await sequelize.query(`
            INSERT INTO job_settings (user_id, created_at, updated_at)
            VALUES (?, NOW(), NOW())
        `, { replacements: [user.id] });

        console.log('[ADMIN CREATE USER] JobSettings created for user:', user.id);

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                isActive: user.isActive,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('[ADMIN CREATE USER] Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

/**
 * GET /api/admin/users
 * Get all users with pagination and filters
 */
router.get('/users', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = '',
            status = 'all',
            role = 'user'
        } = req.query;

        const offset = (page - 1) * limit;

        const where = { role };

        if (search) {
            where[Op.or] = [
                { email: { [Op.like]: `%${search}%` } },
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } }
            ];
        }

        if (status !== 'all') {
            where.isActive = status === 'active';
        }

        const { count, rows: users } = await User.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['password'] }
        });

        // Get subscription info for each user
        const usersWithSubscriptions = await Promise.all(
            users.map(async (user) => {
                const [subscriptions] = await sequelize.query(`
                    SELECT
                        us.status,
                        us.start_date,
                        us.end_date,
                        p.name as plan_name,
                        p.price
                    FROM user_plans us
                    JOIN plans p ON us.plan_id = p.id
                    WHERE us.user_id = ?
                    ORDER BY us.created_at DESC
                    LIMIT 1
                `, {
                    replacements: [user.id]
                });

                const [applicationCount] = await sequelize.query(`
                    SELECT COUNT(*) as count
                    FROM job_application_results
                    WHERE user_id = ?
                `, {
                    replacements: [user.id]
                });

                return {
                    ...user.toJSON(),
                    subscription: subscriptions[0] || null,
                    totalApplications: applicationCount[0].count
                };
            })
        );

        res.json({
            users: usersWithSubscriptions,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * GET /api/admin/users/:id
 * Get detailed user information
 */
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get subscriptions
        const [subscriptions] = await sequelize.query(`
            SELECT
                us.*,
                p.name as plan_name,
                p.price as plan_price
            FROM user_plans us
            JOIN plans p ON us.plan_id = p.id
            WHERE us.user_id = ?
            ORDER BY us.created_at DESC
        `, {
            replacements: [user.id]
        });

        // Get job settings
        const [jobSettings] = await sequelize.query(`
            SELECT *
            FROM job_settings
            WHERE user_id = ?
        `, {
            replacements: [user.id]
        });

        // Get application stats
        const [appStats] = await sequelize.query(`
            SELECT
                COUNT(*) as total_applications,
                SUM(CASE WHEN match_status = 'Good Match' THEN 1 ELSE 0 END) as good_matches,
                SUM(CASE WHEN apply_type = 'Direct Apply' THEN 1 ELSE 0 END) as direct_applies,
                MAX(datetime) as last_application
            FROM job_application_results
            WHERE user_id = ?
        `, {
            replacements: [user.id]
        });

        res.json({
            user: user.toJSON(),
            subscriptions,
            jobSettings: jobSettings[0] || null,
            applicationStats: appStats[0]
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
});

/**
 * PUT /api/admin/users/:id
 * Update user details (email, name, phone, etc.)
 */
router.put('/users/:id', async (req, res) => {
    try {
        const { email, firstName, lastName, phone, isActive } = req.body;

        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ error: 'Cannot modify admin accounts' });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        // Update user fields
        const updateData = {};
        if (email !== undefined) updateData.email = email;
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (phone !== undefined) updateData.phone = phone;
        if (isActive !== undefined) updateData.isActive = isActive;

        await user.update(updateData);

        res.json({
            message: 'User updated successfully',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

/**
 * PUT /api/admin/users/:id/password
 * Reset user password
 */
router.put('/users/:id/password', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ error: 'Cannot modify admin accounts' });
        }

        // Update password (will be hashed by beforeUpdate hook in User model)
        await user.update({ password });

        res.json({
            message: 'Password reset successfully',
            user: { id: user.id, email: user.email }
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

/**
 * PUT /api/admin/users/:id/status
 * Activate or deactivate user account
 */
router.put('/users/:id/status', async (req, res) => {
    try {
        const { isActive } = req.body;

        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ error: 'Cannot modify admin accounts' });
        }

        await user.update({ isActive });

        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user: { id: user.id, email: user.email, isActive }
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
});

/**
 * POST /api/admin/users/:id/change-plan
 * Change user's subscription plan
 */
router.post('/users/:id/change-plan', async (req, res) => {
    try {
        const { planId, startDate, endDate } = req.body;

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const plan = await Plan.findByPk(planId);
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        // Create new subscription
        const [subscription] = await sequelize.query(`
            INSERT INTO user_plans
            (id, user_id, plan_id, amount, status, start_date, end_date, created_at, updated_at)
            VALUES (UUID(), ?, ?, ?, 'active', ?, ?, NOW(), NOW())
        `, {
            replacements: [user.id, planId, plan.price, startDate, endDate]
        });

        res.json({
            message: 'Plan changed successfully',
            subscription: {
                userId: user.id,
                planId,
                planName: plan.name,
                startDate,
                endDate
            }
        });
    } catch (error) {
        console.error('Change plan error:', error);
        res.status(500).json({ error: 'Failed to change plan' });
    }
});

/**
 * DELETE /api/admin/users/:id
 * Delete user account (soft delete by deactivating)
 */
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ error: 'Cannot delete admin accounts' });
        }

        // Soft delete by deactivating
        await user.update({ isActive: false });

        res.json({ message: 'User deactivated successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ========================================================================
// PLAN MANAGEMENT
// ========================================================================

/**
 * GET /api/admin/plans
 * Get all plans including inactive ones
 */
router.get('/plans', async (req, res) => {
    try {
        const plans = await Plan.findAll({
            include: [{ model: PlanFeature, as: 'features' }],
            order: [['sortOrder', 'ASC']]
        });

        res.json(plans);
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});

/**
 * POST /api/admin/plans
 * Create new pricing plan
 */
router.post('/plans', async (req, res) => {
    try {
        const {
            name,
            description,
            subtitle,
            price,
            durationDays,
            isPopular,
            comingSoon,
            isActive,
            sortOrder,
            features
        } = req.body;

        const plan = await Plan.create({
            name,
            description,
            subtitle,
            price,
            durationDays,
            isPopular: isPopular || false,
            comingSoon: comingSoon || false,
            isActive: isActive !== undefined ? isActive : true,
            sortOrder: sortOrder || 0
        });

        // Create features
        if (features && features.length > 0) {
            for (let i = 0; i < features.length; i++) {
                await PlanFeature.create({
                    planId: plan.id,
                    featureKey: `feature_${i + 1}`,
                    featureValue: features[i],
                    featureLabel: features[i]
                });
            }
        }

        const planWithFeatures = await Plan.findByPk(plan.id, {
            include: [{ model: PlanFeature, as: 'features' }]
        });

        res.status(201).json({
            message: 'Plan created successfully',
            plan: planWithFeatures
        });
    } catch (error) {
        console.error('Create plan error:', error);
        res.status(500).json({ error: 'Failed to create plan' });
    }
});

/**
 * PUT /api/admin/plans/:id
 * Update existing plan
 */
router.put('/plans/:id', async (req, res) => {
    try {
        const plan = await Plan.findByPk(req.params.id);

        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        const {
            name,
            description,
            subtitle,
            price,
            durationDays,
            isPopular,
            comingSoon,
            isActive,
            sortOrder,
            features
        } = req.body;

        // Validation
        if (name !== undefined && !name.trim()) {
            return res.status(400).json({ error: 'Plan name cannot be empty' });
        }

        if (description !== undefined && !description.trim()) {
            return res.status(400).json({ error: 'Description cannot be empty' });
        }

        if (price !== undefined && (price < 0 || isNaN(price))) {
            return res.status(400).json({ error: 'Price must be a non-negative number' });
        }

        if (durationDays !== undefined && (durationDays <= 0 || !Number.isInteger(durationDays))) {
            return res.status(400).json({ error: 'Duration must be a positive integer (days)' });
        }

        if (features !== undefined && !Array.isArray(features)) {
            return res.status(400).json({ error: 'Features must be an array' });
        }

        if (features !== undefined && features.some(f => !f || !f.trim())) {
            return res.status(400).json({ error: 'Features cannot contain empty values' });
        }

        // Update plan with proper NULL handling
        await plan.update({
            name: name !== undefined ? name : plan.name,
            description: description !== undefined ? description : plan.description,
            subtitle: subtitle !== undefined ? subtitle : plan.subtitle,
            price: price !== undefined ? price : plan.price,
            durationDays: durationDays !== undefined ? durationDays : plan.durationDays,
            isPopular: isPopular !== undefined ? isPopular : plan.isPopular,
            comingSoon: comingSoon !== undefined ? comingSoon : plan.comingSoon,
            isActive: isActive !== undefined ? isActive : plan.isActive,
            sortOrder: sortOrder !== undefined ? sortOrder : plan.sortOrder
        });

        // Update features if provided
        if (features) {
            // Delete existing features
            await PlanFeature.destroy({ where: { planId: plan.id } });

            // Create new features
            for (let i = 0; i < features.length; i++) {
                await PlanFeature.create({
                    planId: plan.id,
                    featureKey: `feature_${i + 1}`,
                    featureValue: features[i],
                    featureLabel: features[i]
                });
            }
        }

        const updatedPlan = await Plan.findByPk(plan.id, {
            include: [{ model: PlanFeature, as: 'features' }]
        });

        res.json({
            message: 'Plan updated successfully',
            plan: updatedPlan
        });
    } catch (error) {
        console.error('Update plan error:', error);
        res.status(500).json({ error: 'Failed to update plan' });
    }
});

/**
 * DELETE /api/admin/plans/:id
 * Delete plan (soft delete by deactivating)
 * Admin has unrestricted access - no validation for active subscriptions
 */
router.delete('/plans/:id', async (req, res) => {
    try {
        const plan = await Plan.findByPk(req.params.id);

        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        // Admin has full control - soft delete by deactivating without restrictions
        await plan.update({ isActive: false });

        res.json({ message: 'Plan deactivated successfully' });
    } catch (error) {
        console.error('Delete plan error:', error);
        res.status(500).json({ error: 'Failed to delete plan' });
    }
});

// ========================================================================
// MONEY MANAGEMENT
// ========================================================================

/**
 * GET /api/admin/money/overview
 * Get comprehensive financial overview
 */
router.get('/money/overview', async (req, res) => {
    try {
        // Revenue calculations
        const [revenueStats] = await sequelize.query(`
            SELECT
                SUM(CASE WHEN status = 'active' THEN amount ELSE 0 END) as total_revenue,
                SUM(CASE WHEN status = 'active' AND DATE(start_date) = CURDATE() THEN amount ELSE 0 END) as daily_revenue,
                SUM(CASE WHEN status = 'active' AND MONTH(start_date) = MONTH(CURDATE()) AND YEAR(start_date) = YEAR(CURDATE()) THEN amount ELSE 0 END) as monthly_revenue,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
                COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_subscriptions,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_subscriptions
            FROM user_plans
        `);

        // Plan-wise revenue
        const [planRevenue] = await sequelize.query(`
            SELECT
                p.name as plan_name,
                p.price,
                COUNT(us.id) as subscription_count,
                SUM(us.amount) as total_revenue
            FROM plans p
            LEFT JOIN user_plans us ON p.id = us.plan_id AND us.status = 'active'
            GROUP BY p.id
            ORDER BY total_revenue DESC
        `);

        // Expense calculations
        const [expenseStats] = await sequelize.query(`
            SELECT
                SUM(amount) as total_expenses,
                SUM(CASE WHEN DATE(date) = CURDATE() THEN amount ELSE 0 END) as daily_expenses,
                SUM(CASE WHEN MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE()) THEN amount ELSE 0 END) as monthly_expenses
            FROM expenses
        `);

        const stats = revenueStats[0] || {};
        const expenses = expenseStats[0] || {};

        // Calculate profit/loss
        const totalRevenue = parseFloat(stats.total_revenue || 0);
        const totalExpenses = parseFloat(expenses.total_expenses || 0);
        const monthlyRevenue = parseFloat(stats.monthly_revenue || 0);
        const monthlyExpenses = parseFloat(expenses.monthly_expenses || 0);

        res.json({
            revenue: {
                total: totalRevenue,
                daily: parseFloat(stats.daily_revenue || 0),
                monthly: monthlyRevenue,
            },
            expenses: {
                total: totalExpenses,
                daily: parseFloat(expenses.daily_expenses || 0),
                monthly: monthlyExpenses,
            },
            profit: {
                total: totalRevenue - totalExpenses,
                monthly: monthlyRevenue - monthlyExpenses,
            },
            subscriptions: {
                active: stats.active_subscriptions || 0,
                expired: stats.expired_subscriptions || 0,
                cancelled: stats.cancelled_subscriptions || 0,
            },
            planRevenue: planRevenue || [],
        });
    } catch (error) {
        console.error('Money overview error:', error);
        res.status(500).json({ error: 'Failed to fetch financial overview' });
    }
});

/**
 * GET /api/admin/money/revenue-trends
 * Get month-wise revenue trends for charts
 */
router.get('/money/revenue-trends', async (req, res) => {
    try {
        const [trends] = await sequelize.query(`
            SELECT
                DATE_FORMAT(start_date, '%Y-%m') as month,
                SUM(amount) as revenue,
                COUNT(*) as subscription_count
            FROM user_plans
            WHERE status IN ('active', 'expired')
            AND start_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(start_date, '%Y-%m')
            ORDER BY month ASC
        `);

        res.json({ trends: trends || [] });
    } catch (error) {
        console.error('Revenue trends error:', error);
        res.status(500).json({ error: 'Failed to fetch revenue trends' });
    }
});

/**
 * GET /api/admin/money/subscription-analytics
 * Get detailed subscription analytics
 */
router.get('/money/subscription-analytics', async (req, res) => {
    try {
        const { startDate, endDate, planId } = req.query;

        let whereClause = '';
        const params = [];

        if (startDate && endDate) {
            whereClause += ' AND us.start_date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        if (planId) {
            whereClause += ' AND us.plan_id = ?';
            params.push(planId);
        }

        const [subscriptions] = await sequelize.query(`
            SELECT
                us.id,
                us.amount,
                us.status,
                us.start_date,
                us.end_date,
                us.created_at,
                u.email as user_email,
                u.first_name,
                u.last_name,
                p.name as plan_name,
                p.price as plan_price
            FROM user_plans us
            JOIN users u ON us.user_id = u.id
            JOIN plans p ON us.plan_id = p.id
            WHERE 1=1 ${whereClause}
            ORDER BY us.created_at DESC
        `, { replacements: params });

        // New subscriptions per day/week/month
        const [newSubscriptions] = await sequelize.query(`
            SELECT
                DATE(start_date) as date,
                COUNT(*) as count
            FROM user_plans
            WHERE start_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(start_date)
            ORDER BY date DESC
        `);

        // Upcoming renewals (next 30 days)
        const [upcomingRenewals] = await sequelize.query(`
            SELECT
                us.id,
                us.end_date,
                u.email,
                p.name as plan_name,
                p.price
            FROM user_plans us
            JOIN users u ON us.user_id = u.id
            JOIN plans p ON us.plan_id = p.id
            WHERE us.status = 'active'
            AND us.end_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
            ORDER BY us.end_date ASC
        `);

        res.json({
            subscriptions: subscriptions || [],
            newSubscriptions: newSubscriptions || [],
            upcomingRenewals: upcomingRenewals || [],
        });
    } catch (error) {
        console.error('Subscription analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch subscription analytics' });
    }
});

/**
 * GET /api/admin/money/transactions
 * Get payment transaction history
 */
router.get('/money/transactions', async (req, res) => {
    try {
        const { page = 1, limit = 50, status } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {};
        if (status) {
            whereClause.status = status;
        }

        const { count, rows: transactions } = await UserSubscription.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    attributes: ['email', 'firstName', 'lastName'],
                },
                {
                    model: Plan,
                    as: 'plan',
                    attributes: ['name', 'price'],
                },
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            transactions,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error('Transaction history error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

/**
 * POST /api/admin/money/transactions/:id/refund
 * Mark a transaction as refunded
 */
router.post('/money/transactions/:id/refund', async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const subscription = await UserSubscription.findByPk(id);

        if (!subscription) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        await subscription.update({
            status: 'cancelled',
            // You might want to add a refund_notes field to the model
        });

        res.json({ message: 'Transaction marked as refunded', subscription });
    } catch (error) {
        console.error('Refund transaction error:', error);
        res.status(500).json({ error: 'Failed to process refund' });
    }
});

/**
 * GET /api/admin/money/expenses
 * Get all expenses
 */
router.get('/money/expenses', async (req, res) => {
    try {
        const { category, startDate, endDate } = req.query;

        let whereClause = {};

        if (category) {
            whereClause.category = category;
        }

        if (startDate && endDate) {
            whereClause.date = {
                [Op.between]: [startDate, endDate],
            };
        }

        const expenses = await Expense.findAll({
            where: whereClause,
            order: [['date', 'DESC']],
        });

        // Category-wise breakdown
        const [categoryBreakdown] = await sequelize.query(`
            SELECT
                category,
                SUM(amount) as total,
                COUNT(*) as count
            FROM expenses
            GROUP BY category
            ORDER BY total DESC
        `);

        res.json({
            expenses,
            categoryBreakdown: categoryBreakdown || [],
        });
    } catch (error) {
        console.error('Fetch expenses error:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

/**
 * POST /api/admin/money/expenses
 * Create a new expense
 */
router.post('/money/expenses', async (req, res) => {
    try {
        const { category, amount, date, notes } = req.body;

        if (!category || !amount) {
            return res.status(400).json({ error: 'Category and amount are required' });
        }

        const adminEmail = req.user?.email || 'admin';

        const expense = await Expense.create({
            category,
            amount,
            date: date || new Date(),
            notes,
            createdBy: adminEmail,
        });

        res.status(201).json({ message: 'Expense created successfully', expense });
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

/**
 * PUT /api/admin/money/expenses/:id
 * Update an expense
 */
router.put('/money/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { category, amount, date, notes } = req.body;

        const expense = await Expense.findByPk(id);

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        await expense.update({
            category,
            amount,
            date,
            notes,
        });

        res.json({ message: 'Expense updated successfully', expense });
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ error: 'Failed to update expense' });
    }
});

/**
 * DELETE /api/admin/money/expenses/:id
 * Delete an expense
 */
router.delete('/money/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await Expense.findByPk(id);

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        await expense.destroy();

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

/**
 * GET /api/admin/money/profit-loss
 * Get monthly profit/loss report
 */
router.get('/money/profit-loss', async (req, res) => {
    try {
        // Monthly revenue and expenses for the last 12 months
        const [monthlyData] = await sequelize.query(`
            SELECT
                months.month,
                COALESCE(r.revenue, 0) as revenue,
                COALESCE(e.expenses, 0) as expenses,
                COALESCE(r.revenue, 0) - COALESCE(e.expenses, 0) as profit
            FROM (
                SELECT DATE_FORMAT(DATE_SUB(NOW(), INTERVAL n MONTH), '%Y-%m') as month
                FROM (SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
                      UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11) numbers
            ) months
            LEFT JOIN (
                SELECT
                    DATE_FORMAT(start_date, '%Y-%m') as month,
                    SUM(amount) as revenue
                FROM user_plans
                WHERE status IN ('active', 'expired')
                GROUP BY DATE_FORMAT(start_date, '%Y-%m')
            ) r ON months.month = r.month
            LEFT JOIN (
                SELECT
                    DATE_FORMAT(date, '%Y-%m') as month,
                    SUM(amount) as expenses
                FROM expenses
                GROUP BY DATE_FORMAT(date, '%Y-%m')
            ) e ON months.month = e.month
            ORDER BY months.month DESC
        `);

        res.json({ monthlyData: monthlyData || [] });
    } catch (error) {
        console.error('Profit/loss report error:', error);
        res.status(500).json({ error: 'Failed to generate profit/loss report' });
    }
});

// ========================================================================
// SUGGESTIONS MANAGEMENT
// ========================================================================

/**
 * GET /api/admin/suggestions
 * Get all suggestions with filters
 */
router.get('/suggestions', async (req, res) => {
    try {
        const {
            status,
            type,
            priority,
            page = 1,
            limit = 20,
            search = ''
        } = req.query;

        const where = {};

        if (status) where.status = status;
        if (type) where.type = type;
        if (priority) where.priority = priority;

        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        const offset = (page - 1) * limit;

        const { count, rows: suggestions } = await Suggestion.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'firstName', 'lastName']
                }
            ],
            order: [
                ['priority', 'DESC'],
                ['createdAt', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                suggestions,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get suggestions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch suggestions'
        });
    }
});

/**
 * GET /api/admin/suggestions/:id
 * Get detailed suggestion information
 */
router.get('/suggestions/:id', async (req, res) => {
    try {
        const suggestion = await Suggestion.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'firstName', 'lastName']
                }
            ]
        });

        if (!suggestion) {
            return res.status(404).json({
                success: false,
                error: 'Suggestion not found'
            });
        }

        // Get associated coupon if exists
        const coupon = await DiscountCoupon.findOne({
            where: { suggestionId: suggestion.id }
        });

        res.json({
            success: true,
            data: {
                suggestion,
                coupon
            }
        });
    } catch (error) {
        console.error('Get suggestion error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch suggestion'
        });
    }
});

/**
 * PUT /api/admin/suggestions/:id/status
 * Update suggestion status
 */
router.put('/suggestions/:id/status', async (req, res) => {
    try {
        const { status, adminNotes, priority } = req.body;
        const adminId = req.userId;

        const suggestion = await Suggestion.findByPk(req.params.id);

        if (!suggestion) {
            return res.status(404).json({
                success: false,
                error: 'Suggestion not found'
            });
        }

        const validStatuses = ['pending', 'under_review', 'approved', 'implemented', 'rewarded', 'rejected'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
        if (priority) updateData.priority = priority;

        // Track reviewer
        if (status === 'under_review') {
            updateData.reviewedBy = adminId;
            updateData.reviewedAt = new Date();
        }

        if (status === 'implemented') {
            updateData.implementedAt = new Date();
        }

        await suggestion.update(updateData);

        res.json({
            success: true,
            message: 'Suggestion updated successfully',
            data: suggestion
        });
    } catch (error) {
        console.error('Update suggestion error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update suggestion'
        });
    }
});

/**
 * POST /api/admin/suggestions/:id/generate-coupon
 * Generate discount coupon for a suggestion
 */
router.post('/suggestions/:id/generate-coupon', async (req, res) => {
    try {
        const {
            discountType = 'percentage',
            discountValue,
            minPurchaseAmount = 0,
            maxDiscountAmount = null,
            expiryDays = 90
        } = req.body;

        const adminId = req.userId;
        const suggestionId = req.params.id;

        const suggestion = await Suggestion.findByPk(suggestionId);

        if (!suggestion) {
            return res.status(404).json({
                success: false,
                error: 'Suggestion not found'
            });
        }

        // Check if coupon already exists
        const existingCoupon = await DiscountCoupon.findOne({
            where: { suggestionId }
        });

        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                error: 'Coupon already exists for this suggestion'
            });
        }

        // Validation
        if (!discountValue || discountValue <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid discount value is required'
            });
        }

        if (discountType === 'percentage' && discountValue > 100) {
            return res.status(400).json({
                success: false,
                error: 'Percentage discount cannot exceed 100%'
            });
        }

        // Calculate expiry date
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryDays);

        // Create coupon
        const coupon = await DiscountCoupon.create({
            suggestionId,
            userId: suggestion.userId,
            discountType,
            discountValue,
            minPurchaseAmount,
            maxDiscountAmount,
            expiryDate,
            generatedBy: adminId,
            isActive: true,
            isUsed: false
        });

        // Update suggestion status to rewarded
        await suggestion.update({
            status: 'rewarded',
            rewardedAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Coupon generated successfully',
            data: {
                coupon,
                suggestion
            }
        });
    } catch (error) {
        console.error('Generate coupon error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate coupon'
        });
    }
});

/**
 * GET /api/admin/suggestions/stats/overview
 * Get overall suggestion statistics
 */
router.get('/suggestions/stats/overview', async (req, res) => {
    try {
        const total = await Suggestion.count();
        const pending = await Suggestion.count({ where: { status: 'pending' } });
        const underReview = await Suggestion.count({ where: { status: 'under_review' } });
        const approved = await Suggestion.count({ where: { status: 'approved' } });
        const implemented = await Suggestion.count({ where: { status: 'implemented' } });
        const rewarded = await Suggestion.count({ where: { status: 'rewarded' } });

        // Type breakdown
        const typeBreakdown = await sequelize.query(`
            SELECT type, COUNT(*) as count
            FROM suggestions
            GROUP BY type
        `, { type: sequelize.QueryTypes.SELECT });

        // Recent suggestions
        const recentSuggestions = await Suggestion.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['email', 'firstName', 'lastName']
            }],
            attributes: ['id', 'title', 'type', 'status', 'createdAt']
        });

        res.json({
            success: true,
            data: {
                total,
                statusBreakdown: {
                    pending,
                    underReview,
                    approved,
                    implemented,
                    rewarded
                },
                typeBreakdown,
                recentSuggestions
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

// ========================================================================
// DISCOUNT COUPONS MANAGEMENT
// ========================================================================

/**
 * GET /api/admin/coupons
 * Get all discount coupons with filters
 */
router.get('/coupons', async (req, res) => {
    try {
        const { isUsed, isActive, page = 1, limit = 20 } = req.query;

        const where = {};
        if (isUsed !== undefined) where.isUsed = isUsed === 'true';
        if (isActive !== undefined) where.isActive = isActive === 'true';

        const offset = (page - 1) * limit;

        const { count, rows: coupons } = await DiscountCoupon.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['email', 'firstName', 'lastName']
                },
                {
                    model: Suggestion,
                    attributes: ['id', 'title', 'type']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                coupons,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get coupons error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch coupons'
        });
    }
});

/**
 * PUT /api/admin/coupons/:id/deactivate
 * Deactivate a coupon
 */
router.put('/coupons/:id/deactivate', async (req, res) => {
    try {
        const coupon = await DiscountCoupon.findByPk(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                error: 'Coupon not found'
            });
        }

        await coupon.update({ isActive: false });

        res.json({
            success: true,
            message: 'Coupon deactivated successfully',
            data: coupon
        });
    } catch (error) {
        console.error('Deactivate coupon error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to deactivate coupon'
        });
    }
});

export default router;
