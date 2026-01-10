/**
 * ======================== PLANS ROUTES ========================
 * API endpoints for fetching subscription plans (public)
 */

import express from 'express';
import * as plansService from '../services/plansService.js';

const router = express.Router();

/**
 * GET /api/plans
 * Get all active plans with features
 * Public endpoint - no authentication required
 */
router.get('/', async (req, res) => {
    try {
        const plans = await plansService.getActivePlans();

        // Transform data for frontend consumption
        const formattedPlans = plans.map((plan, index) => ({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price: parseFloat(plan.price),
            priceFormatted: `₹${parseFloat(plan.price).toLocaleString('en-IN')}`,
            durationDays: plan.durationDays,
            duration: formatDuration(plan.durationDays),
            isPopular: index === 1, // Mark second plan as popular
            features: plan.features.map(f => ({
                id: f.id,
                key: f.featureKey,
                value: f.featureValue,
                label: f.featureLabel || f.featureValue,
            })),
            sortOrder: plan.sortOrder,
        }));

        res.json({
            success: true,
            data: formattedPlans,
        });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch plans',
        });
    }
});

/**
 * GET /api/plans/:planId
 * Get single plan by ID
 * Public endpoint - no authentication required
 */
router.get('/:planId', async (req, res) => {
    try {
        const plan = await plansService.getPlanById(req.params.planId);

        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Plan not found',
            });
        }

        res.json({
            success: true,
            data: {
                id: plan.id,
                name: plan.name,
                description: plan.description,
                price: parseFloat(plan.price),
                priceFormatted: `₹${parseFloat(plan.price).toLocaleString('en-IN')}`,
                durationDays: plan.durationDays,
                duration: formatDuration(plan.durationDays),
                features: plan.features.map(f => ({
                    id: f.id,
                    key: f.featureKey,
                    value: f.featureValue,
                    label: f.featureLabel || f.featureValue,
                })),
            },
        });
    } catch (error) {
        console.error('Get plan error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch plan',
        });
    }
});

/**
 * Format duration days into readable string
 * @param {number} days - Duration in days
 * @returns {string} Formatted duration
 */
function formatDuration(days) {
    if (days === 1) return '1 Day';
    if (days === 7) return '1 Week';
    if (days === 14) return '2 Weeks';
    if (days === 30 || days === 31) return '1 Month';
    if (days === 60 || days === 61 || days === 62) return '2 Months';
    if (days === 90 || days === 91 || days === 92) return '3 Months';
    if (days === 180) return '6 Months';
    if (days === 365 || days === 366) return '1 Year';
    return `${days} Days`;
}

export default router;
