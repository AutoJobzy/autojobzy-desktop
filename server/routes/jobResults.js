/**
 * ======================== JOB RESULTS API ROUTES ========================
 * Endpoints for saving and retrieving job application results
 * Supports bulk insert for efficiency
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import JobApplicationResult from '../models/JobApplicationResult.js';
import { Op } from 'sequelize';

const router = express.Router();

/**
 * POST /api/job-results/bulk
 * Save multiple job results at once (bulk insert)
 * Body: { results: [...job result objects] }
 */
router.post('/bulk', authenticateToken, async (req, res) => {
    try {
        const { results } = req.body;

        if (!Array.isArray(results) || results.length === 0) {
            return res.status(400).json({ error: 'Results array is required and cannot be empty' });
        }

        // Transform data to match database schema
        const transformedResults = results.map(result => ({
            userId: req.userId,
            datetime: result.datetime ? result.datetime : new Date().toISOString(),
            pageNumber: result.pageNumber,
            jobNumber: result.jobNumber,
            companyUrl: result.companyUrl,
            earlyApplicant: result.EarlyApplicant === 'Yes' || result.earlyApplicant === true,
            keySkillsMatch: result.KeySkillsMatch === 'Yes' || result.keySkillsMatch === true,
            locationMatch: result.LocationMatch === 'Yes' || result.locationMatch === true,
            experienceMatch: result.ExperienceMatch === 'Yes' || result.experienceMatch === true,
            matchScore: parseInt(result.MatchScore?.split('/')[0] || result.matchScore || 0),
            matchScoreTotal: 5,
            matchStatus: result.matchStatus,
            applyType: result.applyType,
            applicationStatus: result.applicationStatus || null,
        }));

        // Bulk insert into database
        const savedResults = await JobApplicationResult.bulkCreate(transformedResults, {
            validate: true,
            returning: true,
        });

        res.status(201).json({
            message: `Successfully saved ${savedResults.length} job results`,
            count: savedResults.length,
            results: savedResults,
        });
    } catch (error) {
        console.error('Error saving job results:', error);
        res.status(500).json({ error: 'Failed to save job results', details: error.message });
    }
});

/**
 * GET /api/job-results
 * Get all job results for authenticated user
 * Query params: page, limit, matchStatus, startDate, endDate
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            matchStatus,
            applyType,
            applicationStatus,
            pageNumber,
            earlyApplicant,
            keySkillsMatch,
            locationMatch,
            experienceMatch,
            minScore,
            maxScore,
            startDate,
            endDate,
        } = req.query;

        const where = { userId: req.userId };

        // Filter by match status
        if (matchStatus) {
            where.matchStatus = matchStatus;
        }

        // Filter by apply type
        if (applyType) {
            where.applyType = applyType;
        }

        // Filter by application status
        if (applicationStatus) {
            where.applicationStatus = applicationStatus;
        }

        // Filter by page number
        if (pageNumber) {
            where.pageNumber = parseInt(pageNumber);
        }

        // Filter by boolean fields
        if (earlyApplicant !== undefined) {
            where.earlyApplicant = earlyApplicant === 'true';
        }
        if (keySkillsMatch !== undefined) {
            where.keySkillsMatch = keySkillsMatch === 'true';
        }
        if (locationMatch !== undefined) {
            where.locationMatch = locationMatch === 'true';
        }
        if (experienceMatch !== undefined) {
            where.experienceMatch = experienceMatch === 'true';
        }

        // Filter by match score range
        if (minScore !== undefined || maxScore !== undefined) {
            where.matchScore = {};
            if (minScore !== undefined) where.matchScore[Op.gte] = parseInt(minScore);
            if (maxScore !== undefined) where.matchScore[Op.lte] = parseInt(maxScore);
        }

        // Filter by date range
        if (startDate || endDate) {
            where.datetime = {};
            if (startDate) where.datetime[Op.gte] = new Date(startDate);
            if (endDate) where.datetime[Op.lte] = new Date(endDate);
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await JobApplicationResult.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['datetime', 'DESC']],
        });

        res.json({
            totalRecords: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            records: rows,
        });
    } catch (error) {
        console.error('Error fetching job results:', error);
        res.status(500).json({ error: 'Failed to fetch job results' });
    }
});

/**
 * GET /api/job-results/stats
 * Get statistics for user's job applications
 */
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const where = { userId: req.userId };

        if (startDate || endDate) {
            where.datetime = {};
            if (startDate) where.datetime[Op.gte] = new Date(startDate);
            if (endDate) where.datetime[Op.lte] = new Date(endDate);
        }

        // Get all results for the user
        const results = await JobApplicationResult.findAll({ where });

        // Calculate today's applications (using UTC to avoid timezone issues)
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayResults = results.filter(r => {
            const appDate = new Date(r.datetime);
            return appDate >= today && appDate < tomorrow;
        });

        // Calculate statistics
        const goodMatches = results.filter(r => r.matchStatus === 'Good Match').length;
        const successRate = results.length > 0
            ? Math.round((goodMatches / results.length) * 100)
            : 0;

        // Application status breakdown
        const applied = results.filter(r => r.applicationStatus === 'Applied').length;
        const skipped = results.filter(r => r.applicationStatus === 'Skipped').length;

        // Apply type breakdown (for applied only)
        const appliedResults = results.filter(r => r.applicationStatus === 'Applied');
        const directApplyCount = appliedResults.filter(r => r.applyType === 'Direct Apply').length;
        const externalApplyCount = appliedResults.filter(r => r.applyType === 'External Apply').length;

        // Calculate daily application trend (last 7 days)
        const dailyTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const dayResults = results.filter(r => {
                const rDate = new Date(r.datetime);
                return rDate >= date && rDate < nextDate;
            });

            dailyTrend.push({
                date: date.toISOString().split('T')[0],
                total: dayResults.length,
                applied: dayResults.filter(r => r.applicationStatus === 'Applied').length,
                skipped: dayResults.filter(r => r.applicationStatus === 'Skipped').length,
            });
        }

        const stats = {
            // Overall stats
            totalApplications: results.length,
            todayApplications: todayResults.length,

            // Application status breakdown
            applied: applied,
            skipped: skipped,

            // Apply type breakdown (for applied applications)
            directApply: directApplyCount,
            externalApply: externalApplyCount,
            noApplyButton: results.filter(r => r.applyType === 'No Apply Button').length,

            // Match quality
            successRate: successRate,
            goodMatches: goodMatches,
            poorMatches: results.filter(r => r.matchStatus === 'Poor Match').length,
            avgMatchScore:
                results.length > 0
                    ? (results.reduce((sum, r) => sum + r.matchScore, 0) / results.length).toFixed(2)
                    : 0,

            // Match criteria counts
            earlyApplicantCount: results.filter(r => r.earlyApplicant).length,
            keySkillsMatchCount: results.filter(r => r.keySkillsMatch).length,
            locationMatchCount: results.filter(r => r.locationMatch).length,
            experienceMatchCount: results.filter(r => r.experienceMatch).length,

            // Trend data
            dailyTrend: dailyTrend,
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching job stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

/**
 * DELETE /api/job-results
 * Delete all job results for authenticated user (for testing/cleanup)
 */
router.delete('/', authenticateToken, async (req, res) => {
    try {
        const count = await JobApplicationResult.destroy({
            where: { userId: req.userId },
        });

        res.json({
            message: `Deleted ${count} job results`,
            count,
        });
    } catch (error) {
        console.error('Error deleting job results:', error);
        res.status(500).json({ error: 'Failed to delete job results' });
    }
});

export default router;
