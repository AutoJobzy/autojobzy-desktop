

/**
 * ======================== FILTERS ROUTES ========================
 * API endpoints for fetching all job filter options
 * and saving/loading user filter selections
 */

import express from 'express';
import FilterOption from '../models/FilterOption.js';
import UserFilter from '../models/UserFilter.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/filters/all
 * Get all filter options grouped by filter type
 * Returns: { salaryRange: [...], wfhType: [...], citiesGid: [...], ... }
 */
router.get('/all', async (req, res) => {
    try {
        const filters = await FilterOption.findAll({
            where: { isActive: true },
            order: [
                ['filterType', 'ASC'],
                ['sortOrder', 'ASC'],
                ['count', 'DESC'],
            ],
            attributes: ['filterType', 'optionId', 'label', 'count', 'url'],
        });

        // Group by filterType
        const grouped = {};
        filters.forEach(filter => {
            const type = filter.filterType;
            if (!grouped[type]) {
                grouped[type] = [];
            }
            grouped[type].push({
                id: filter.optionId,
                label: filter.label,
                count: filter.count,
                ...(filter.url && { url: filter.url }),
            });
        });

        res.json({
            success: true,
            data: grouped,
        });
    } catch (error) {
        console.error('Error fetching filters:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/filters/user
 * Get user's saved filter selections
 * NOTE: This route MUST be before /:filterType to avoid route conflicts
 */
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const userFilters = await UserFilter.findOne({
            where: { userId: req.userId },
        });

        if (!userFilters) {
            return res.json({
                success: true,
                data: null,
                message: 'No saved filters found',
            });
        }

        res.json({
            success: true,
            data: {
                salaryRange: userFilters.salaryRange || '',
                freshness: userFilters.freshness || '',
                wfhType: userFilters.wfhType || '',
                citiesGid: userFilters.citiesGid || '',
                functionalAreaGid: userFilters.functionalAreaGid || '',
                industryTypeGid: userFilters.industryTypeGid || '',
                ugCourseGid: userFilters.ugCourseGid || '',
                pgCourseGid: userFilters.pgCourseGid || '',
                business_size: userFilters.business_size || '',
                employement: userFilters.employement || '',
                glbl_RoleCat: userFilters.glbl_RoleCat || '',
                topGroupId: userFilters.topGroupId || '',
                featuredCompanies: userFilters.featuredCompanies || '',
                finalUrl: userFilters.finalUrl || '',
                selectedFilters: userFilters.selectedFilters || null,
            },
        });
    } catch (error) {
        console.error('Error fetching user filters:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/filters/user
 * Save user's filter selections
 */
router.post('/user', authenticateToken, async (req, res) => {
    try {
        const {
            salaryRange,
            freshness,
            wfhType,
            citiesGid,
            functionalAreaGid,
            industryTypeGid,
            ugCourseGid,
            pgCourseGid,
            business_size,
            employement,
            glbl_RoleCat,
            topGroupId,
            featuredCompanies,
            finalUrl,
            selectedFilters,
        } = req.body;

        console.log('[Save Filters] Request received for userId:', req.userId);
        console.log('[Save Filters] finalUrl:', finalUrl ? finalUrl.substring(0, 100) + '...' : 'NOT PROVIDED');
        console.log('[Save Filters] selectedFilters:', selectedFilters ? JSON.stringify(selectedFilters).substring(0, 100) + '...' : 'NOT PROVIDED');

        // Upsert - create or update
        const [userFilter, created] = await UserFilter.upsert({
            userId: req.userId,
            salaryRange: salaryRange || null,
            freshness: freshness || null,
            wfhType: wfhType || null,
            citiesGid: citiesGid || null,
            functionalAreaGid: functionalAreaGid || null,
            industryTypeGid: industryTypeGid || null,
            ugCourseGid: ugCourseGid || null,
            pgCourseGid: pgCourseGid || null,
            business_size: business_size || null,
            employement: employement || null,
            glbl_RoleCat: glbl_RoleCat || null,
            topGroupId: topGroupId || null,
            featuredCompanies: featuredCompanies || null,
            finalUrl: finalUrl || null,
            selectedFilters: selectedFilters || null,
        });

        console.log(`[Save Filters] ${created ? 'Created' : 'Updated'} successfully`);
        console.log('[Save Filters] Saved finalUrl:', userFilter.finalUrl ? 'YES (' + userFilter.finalUrl.substring(0, 50) + '...)' : 'NO');

        res.json({
            success: true,
            message: created ? 'Filters saved successfully' : 'Filters updated successfully',
            data: userFilter,
        });
    } catch (error) {
        console.error('[Save Filters] ❌ Error saving user filters:', error.message);
        console.error('[Save Filters] Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/filters/seed
 * Seed/update filter options from provided data
 * Body: { filterType: string, options: [{ id, label, count, url? }] }
 */
router.post('/seed', async (req, res) => {
    try {
        const { filterType, options } = req.body;

        if (!filterType || !options || !Array.isArray(options)) {
            return res.status(400).json({
                success: false,
                error: 'filterType and options array are required',
            });
        }

        const results = [];
        for (let i = 0; i < options.length; i++) {
            const opt = options[i];
            const [record, created] = await FilterOption.upsert({
                filterType,
                optionId: opt.id,
                label: opt.label,
                count: opt.count || 0,
                url: opt.url || null,
                sortOrder: i,
                isActive: true,
            });
            results.push({ optionId: opt.id, created });
        }

        res.json({
            success: true,
            message: `Seeded ${results.length} options for ${filterType}`,
            results,
        });
    } catch (error) {
        console.error('Error seeding filters:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/filters/seed-all
 * Seed all filter options at once
 * Body: { salaryRange: [...], wfhType: [...], ... }
 */
router.post('/seed-all', async (req, res) => {
    try {
        const filterData = req.body;
        const results = {};

        for (const [filterType, options] of Object.entries(filterData)) {
            if (!Array.isArray(options)) continue;

            results[filterType] = { count: 0, errors: [] };

            for (let i = 0; i < options.length; i++) {
                try {
                    const opt = options[i];
                    await FilterOption.upsert({
                        filterType,
                        optionId: opt.id,
                        label: opt.label,
                        count: opt.count || 0,
                        url: opt.url || null,
                        sortOrder: i,
                        isActive: true,
                    });
                    results[filterType].count++;
                } catch (err) {
                    results[filterType].errors.push(err.message);
                }
            }
        }

        res.json({
            success: true,
            message: 'Filters seeded successfully',
            results,
        });
    } catch (error) {
        console.error('Error seeding all filters:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/filters/:filterType
 * Get filter options for a specific type
 * Example: GET /api/filters/salaryRange
 * NOTE: This route MUST be after /user, /all, /seed, /seed-all to avoid conflicts
 */
router.get('/:filterType', async (req, res) => {
    try {
        const { filterType } = req.params;

        const validTypes = [
            'salaryRange', 'freshness', 'wfhType', 'topGroupId', 'employement',
            'featuredCompanies', 'business_size', 'citiesGid',
            'functionalAreaGid', 'ugCourseGid', 'glbl_RoleCat',
            'pgCourseGid', 'industryTypeGid'
        ];

        if (!validTypes.includes(filterType)) {
            return res.status(400).json({
                success: false,
                error: `Invalid filter type. Valid types: ${validTypes.join(', ')}`,
            });
        }

        const filters = await FilterOption.findAll({
            where: {
                filterType,
                isActive: true,
            },
            order: [
                ['sortOrder', 'ASC'],
                ['count', 'DESC'],
            ],
            attributes: ['optionId', 'label', 'count', 'url'],
        });

        res.json({
            success: true,
            filterType,
            data: filters.map(f => ({
                id: f.optionId,
                label: f.label,
                count: f.count,
                ...(f.url && { url: f.url }),
            })),
        });
    } catch (error) {
        console.error('Error fetching filter:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

export default router;
