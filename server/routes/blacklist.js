/**
 * ======================== BLACKLIST ROUTES ========================
 * Manage user's blacklisted companies
 */

import express from 'express';
import BlacklistedCompany from '../models/BlacklistedCompany.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Normalize company name for consistent matching
 * - Lowercase, trim spaces
 * - Remove common suffixes: Pvt Ltd, Ltd, Inc, LLC, LLP, Limited, Co.
 */
function normalizeCompanyName(name) {
    if (!name) return '';
    return name
        .toLowerCase()
        .trim()
        .replace(/\b(pvt\.?\s*ltd\.?|private\s+limited|ltd\.?|inc\.?|llp|llc|limited|co\.?)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * GET /api/blacklist
 * Get all blacklisted companies for the logged-in user
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const companies = await BlacklistedCompany.findAll({
            where: { userId: req.userId },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'companyName', 'createdAt'],
        });
        res.json({ companies });
    } catch (error) {
        console.error('Fetch blacklist error:', error);
        res.status(500).json({ error: 'Failed to fetch blacklist' });
    }
});

/**
 * POST /api/blacklist
 * Add a company to the blacklist
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { companyName } = req.body;

        if (!companyName || !companyName.trim()) {
            return res.status(400).json({ error: 'Company name is required' });
        }

        const normalized = normalizeCompanyName(companyName);

        if (!normalized) {
            return res.status(400).json({ error: 'Invalid company name' });
        }

        const [company, created] = await BlacklistedCompany.findOrCreate({
            where: {
                userId: req.userId,
                normalizedName: normalized,
            },
            defaults: {
                userId: req.userId,
                companyName: companyName.trim(),
                normalizedName: normalized,
            },
        });

        if (!created) {
            return res.status(409).json({ error: 'Company already in blacklist' });
        }

        res.status(201).json({
            message: 'Company added to blacklist',
            company: {
                id: company.id,
                companyName: company.companyName,
                createdAt: company.createdAt,
            },
        });
    } catch (error) {
        console.error('Add blacklist error:', error);
        res.status(500).json({ error: 'Failed to add company to blacklist' });
    }
});

/**
 * DELETE /api/blacklist/:id
 * Remove a company from the blacklist
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await BlacklistedCompany.destroy({
            where: {
                id,
                userId: req.userId, // ensure user can only delete their own entries
            },
        });

        if (!deleted) {
            return res.status(404).json({ error: 'Blacklist entry not found' });
        }

        res.json({ message: 'Company removed from blacklist' });
    } catch (error) {
        console.error('Delete blacklist error:', error);
        res.status(500).json({ error: 'Failed to remove company from blacklist' });
    }
});

export default router;
