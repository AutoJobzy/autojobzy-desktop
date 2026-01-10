/**
 * ======================== SUBSCRIPTION SERVICE ========================
 * Business logic for subscription management
 */

import { Op } from 'sequelize';
import Plan from '../models/Plan.js';
import PlanFeature from '../models/PlanFeature.js';
import UserSubscription from '../models/UserSubscription.js';
import User from '../models/User.js';

/**
 * Get all active plans with features
 * @returns {Promise<Array>} List of plans with features
 */
export async function getAllPlans() {
    try {
        const plans = await Plan.findAll({
            where: { isActive: true },
            include: [{
                model: PlanFeature,
                as: 'features',
            }],
            order: [['sortOrder', 'ASC'], ['price', 'ASC']],
        });
        return plans;
    } catch (error) {
        console.error('Get all plans error:', error);
        throw error;
    }
}

/**
 * Get plan by ID
 * @param {string} planId - Plan ID
 * @returns {Promise<object>} Plan with features
 */
export async function getPlanById(planId) {
    try {
        const plan = await Plan.findByPk(planId, {
            include: [{
                model: PlanFeature,
                as: 'features',
            }],
        });
        return plan;
    } catch (error) {
        console.error('Get plan by ID error:', error);
        throw error;
    }
}

/**
 * Create a new subscription record (pending status)
 * @param {string} userId - User ID
 * @param {string} planId - Plan ID
 * @param {string} razorpayOrderId - Razorpay order ID
 * @param {number} amount - Amount paid
 * @returns {Promise<object>} Created subscription
 */
export async function createSubscription(userId, planId, razorpayOrderId, amount) {
    try {
        const subscription = await UserSubscription.create({
            userId,
            planId,
            razorpayOrderId,
            amount,
            status: 'pending',
        });
        return subscription;
    } catch (error) {
        console.error('Create subscription error:', error);
        throw error;
    }
}

/**
 * Activate subscription after successful payment
 * @param {string} razorpayOrderId - Razorpay order ID
 * @param {string} razorpayPaymentId - Razorpay payment ID
 * @param {string} razorpaySignature - Razorpay signature
 * @returns {Promise<object>} Updated subscription
 */
export async function activateSubscription(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    try {
        // Find the pending subscription
        const subscription = await UserSubscription.findOne({
            where: { razorpayOrderId, status: 'pending' },
            include: [{ model: Plan, as: 'plan' }],
        });

        if (!subscription) {
            throw new Error('Subscription not found');
        }

        // Calculate dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + subscription.plan.durationDays);

        // Update subscription
        await subscription.update({
            razorpayPaymentId,
            razorpaySignature,
            startDate,
            endDate,
            status: 'active',
        });

        return subscription;
    } catch (error) {
        console.error('Activate subscription error:', error);
        throw error;
    }
}

/**
 * Mark subscription as failed
 * @param {string} razorpayOrderId - Razorpay order ID
 * @returns {Promise<object>} Updated subscription
 */
export async function failSubscription(razorpayOrderId) {
    try {
        const subscription = await UserSubscription.findOne({
            where: { razorpayOrderId },
        });

        if (subscription) {
            await subscription.update({ status: 'failed' });
        }

        return subscription;
    } catch (error) {
        console.error('Fail subscription error:', error);
        throw error;
    }
}

/**
 * Get user's active subscription
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} Active subscription or null
 */
export async function getActiveSubscription(userId) {
    try {
        const subscription = await UserSubscription.findOne({
            where: {
                userId,
                status: 'active',
                endDate: { [Op.gt]: new Date() },
            },
            include: [{
                model: Plan,
                as: 'plan',
                include: [{
                    model: PlanFeature,
                    as: 'features',
                }],
            }],
            order: [['endDate', 'DESC']],
        });
        return subscription;
    } catch (error) {
        console.error('Get active subscription error:', error);
        throw error;
    }
}

/**
 * Get user's subscription history
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of subscriptions
 */
export async function getSubscriptionHistory(userId) {
    try {
        const subscriptions = await UserSubscription.findAll({
            where: { userId },
            include: [{
                model: Plan,
                as: 'plan',
            }],
            order: [['createdAt', 'DESC']],
        });
        return subscriptions;
    } catch (error) {
        console.error('Get subscription history error:', error);
        throw error;
    }
}

/**
 * Check if user has active subscription
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Whether user has active subscription
 */
export async function hasActiveSubscription(userId) {
    const subscription = await getActiveSubscription(userId);
    return subscription !== null;
}

/**
 * Get subscription feature value
 * @param {string} userId - User ID
 * @param {string} featureKey - Feature key to check
 * @returns {Promise<string|null>} Feature value or null
 */
export async function getFeatureValue(userId, featureKey) {
    try {
        const subscription = await getActiveSubscription(userId);
        if (!subscription || !subscription.plan || !subscription.plan.features) {
            return null;
        }

        const feature = subscription.plan.features.find(f => f.featureKey === featureKey);
        return feature ? feature.featureValue : null;
    } catch (error) {
        console.error('Get feature value error:', error);
        return null;
    }
}

/**
 * Expire old subscriptions (cron job)
 * @returns {Promise<number>} Number of expired subscriptions
 */
export async function expireOldSubscriptions() {
    try {
        const [count] = await UserSubscription.update(
            { status: 'expired' },
            {
                where: {
                    status: 'active',
                    endDate: { [Op.lt]: new Date() },
                },
            }
        );
        return count;
    } catch (error) {
        console.error('Expire subscriptions error:', error);
        throw error;
    }
}

export default {
    getAllPlans,
    getPlanById,
    createSubscription,
    activateSubscription,
    failSubscription,
    getActiveSubscription,
    getSubscriptionHistory,
    hasActiveSubscription,
    getFeatureValue,
    expireOldSubscriptions,
};
