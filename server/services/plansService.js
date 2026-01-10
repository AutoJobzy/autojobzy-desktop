/**
 * ======================== PLANS SERVICE ========================
 * Business logic for fetching subscription plans
 */

import Plan from '../models/Plan.js';
import PlanFeature from '../models/PlanFeature.js';

/**
 * Get all active plans with features
 * @returns {Promise<Array>} List of active plans sorted by sortOrder
 */
export async function getActivePlans() {
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
        console.error('Get active plans error:', error);
        throw error;
    }
}

/**
 * Get plan by ID (only if active)
 * @param {string} planId - Plan ID
 * @returns {Promise<object|null>} Plan with features or null
 */
export async function getPlanById(planId) {
    try {
        const plan = await Plan.findOne({
            where: { id: planId, isActive: true },
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

export default {
    getActivePlans,
    getPlanById,
};
