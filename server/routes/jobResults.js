/**
 * ======================== JOB RESULTS API ROUTES ========================
 * Endpoints for saving and retrieving job application results
 * Supports bulk insert for efficiency
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import JobApplicationResult from '../models/JobApplicationResult.js';
import sequelize from '../db/config.js';
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
            datetime: result.datetime ? new Date(result.datetime) : new Date(),
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

        // ── Query 1: all aggregate counts in one DB call ──────────────────────
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd   = new Date(todayStart.getTime() + 86400000); // +1 day

        const [agg] = await JobApplicationResult.findAll({
            where,
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')),                                                                    'total'],
                [sequelize.fn('SUM', sequelize.literal(`datetime >= '${todayStart.toISOString()}' AND datetime < '${todayEnd.toISOString()}'`)),  'today'],
                [sequelize.fn('SUM', sequelize.literal(`application_status = 'Applied'`)),                                      'applied'],
                [sequelize.fn('SUM', sequelize.literal(`application_status = 'Skipped'`)),                                      'skipped'],
                [sequelize.fn('SUM', sequelize.literal(`match_status = 'Good Match'`)),                                         'goodMatches'],
                [sequelize.fn('SUM', sequelize.literal(`match_status = 'Poor Match'`)),                                         'poorMatches'],
                [sequelize.fn('SUM', sequelize.literal(`apply_type = 'Direct Apply' AND application_status = 'Applied'`)),      'directApply'],
                [sequelize.fn('SUM', sequelize.literal(`apply_type = 'External Apply' AND application_status = 'Applied'`)),    'externalApply'],
                [sequelize.fn('SUM', sequelize.literal(`apply_type = 'No Apply Button'`)),                                      'noApplyButton'],
                [sequelize.fn('AVG',  sequelize.col('match_score')),                                                            'avgMatchScore'],
                [sequelize.fn('SUM', sequelize.literal(`early_applicant = 1`)),                                                 'earlyApplicantCount'],
                [sequelize.fn('SUM', sequelize.literal(`key_skills_match = 1`)),                                                'keySkillsMatchCount'],
                [sequelize.fn('SUM', sequelize.literal(`location_match = 1`)),                                                  'locationMatchCount'],
                [sequelize.fn('SUM', sequelize.literal(`experience_match = 1`)),                                                'experienceMatchCount'],
            ],
            raw: true,
        });

        const total      = parseInt(agg.total)      || 0;
        const goodMatches = parseInt(agg.goodMatches) || 0;

        // ── Query 2: daily trend — last 7 days grouped by date ───────────────
        const sevenDaysAgo = new Date(todayStart.getTime() - 6 * 86400000);

        const trendRows = await JobApplicationResult.findAll({
            where: {
                ...where,
                datetime: { [Op.gte]: sevenDaysAgo },
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('datetime')),                                                'day'],
                [sequelize.fn('COUNT', sequelize.col('id')),                                                     'total'],
                [sequelize.fn('SUM', sequelize.literal(`application_status = 'Applied'`)),                       'applied'],
                [sequelize.fn('SUM', sequelize.literal(`application_status = 'Skipped'`)),                       'skipped'],
            ],
            group: [sequelize.fn('DATE', sequelize.col('datetime'))],
            order: [[sequelize.fn('DATE', sequelize.col('datetime')), 'ASC']],
            raw: true,
        });

        // Fill in missing days with 0s
        const trendMap = Object.fromEntries(trendRows.map(r => [r.day, r]));
        const dailyTrend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(todayStart.getTime() - i * 86400000);
            const key = d.toISOString().split('T')[0];
            const row = trendMap[key] || {};
            dailyTrend.push({
                date:    key,
                total:   parseInt(row.total)   || 0,
                applied: parseInt(row.applied) || 0,
                skipped: parseInt(row.skipped) || 0,
            });
        }

        const stats = {
            totalApplications:  total,
            todayApplications:  parseInt(agg.today)          || 0,
            applied:            parseInt(agg.applied)         || 0,
            skipped:            parseInt(agg.skipped)         || 0,
            directApply:        parseInt(agg.directApply)     || 0,
            externalApply:      parseInt(agg.externalApply)   || 0,
            noApplyButton:      parseInt(agg.noApplyButton)   || 0,
            successRate:        total > 0 ? Math.round((goodMatches / total) * 100) : 0,
            goodMatches,
            poorMatches:        parseInt(agg.poorMatches)         || 0,
            avgMatchScore:      agg.avgMatchScore ? parseFloat(agg.avgMatchScore).toFixed(2) : 0,
            earlyApplicantCount: parseInt(agg.earlyApplicantCount) || 0,
            keySkillsMatchCount: parseInt(agg.keySkillsMatchCount) || 0,
            locationMatchCount:  parseInt(agg.locationMatchCount)  || 0,
            experienceMatchCount:parseInt(agg.experienceMatchCount)|| 0,
            dailyTrend,
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
