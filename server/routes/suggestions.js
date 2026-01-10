/**
 * ======================== SUGGESTIONS ROUTES ========================
 * User-facing endpoints for submitting and viewing suggestions
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Suggestion from '../models/Suggestion.js';
import DiscountCoupon from '../models/DiscountCoupon.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/suggestions
 * Submit a new suggestion
 */
router.post('/', async (req, res) => {
  try {
    const { type, title, description } = req.body;
    const userId = req.userId;

    // Validation
    if (!type || !title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Type, title, and description are required'
      });
    }

    const validTypes = ['feature_request', 'bug_report', 'ux_improvement', 'general_feedback'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid suggestion type'
      });
    }

    if (title.length < 5 || title.length > 255) {
      return res.status(400).json({
        success: false,
        error: 'Title must be between 5 and 255 characters'
      });
    }

    if (description.length < 20) {
      return res.status(400).json({
        success: false,
        error: 'Description must be at least 20 characters'
      });
    }

    // Create suggestion
    const suggestion = await Suggestion.create({
      userId,
      type,
      title,
      description,
      status: 'pending',
      priority: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Suggestion submitted successfully! We will review it soon.',
      data: {
        id: suggestion.id,
        type: suggestion.type,
        title: suggestion.title,
        status: suggestion.status,
        createdAt: suggestion.createdAt
      }
    });
  } catch (error) {
    console.error('Submit suggestion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit suggestion'
    });
  }
});

/**
 * GET /api/suggestions
 * Get user's own suggestions
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { status, type, page = 1, limit = 10 } = req.query;

    const where = { userId };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const offset = (page - 1) * limit;

    const { count, rows: suggestions } = await Suggestion.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['adminNotes', 'reviewedBy'] } // Hide admin-only fields
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
 * GET /api/suggestions/stats/summary
 * Get user's suggestion statistics
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const userId = req.userId;

    const totalSuggestions = await Suggestion.count({ where: { userId } });
    const pending = await Suggestion.count({ where: { userId, status: 'pending' } });
    const underReview = await Suggestion.count({ where: { userId, status: 'under_review' } });
    const approved = await Suggestion.count({ where: { userId, status: 'approved' } });
    const implemented = await Suggestion.count({ where: { userId, status: 'implemented' } });
    const rewarded = await Suggestion.count({ where: { userId, status: 'rewarded' } });
    const rejected = await Suggestion.count({ where: { userId, status: 'rejected' } });

    // Get available coupons
    const coupons = await DiscountCoupon.findAll({
      where: {
        userId,
        isUsed: false,
        isActive: true,
        expiryDate: { [Op.gt]: new Date() }
      },
      attributes: ['id', 'code', 'discountType', 'discountValue', 'expiryDate', 'minPurchaseAmount', 'maxDiscountAmount']
    });

    res.json({
      success: true,
      data: {
        total: totalSuggestions,
        statusBreakdown: {
          pending,
          underReview,
          approved,
          implemented,
          rewarded,
          rejected
        },
        coupons: {
          available: coupons.length,
          list: coupons
        }
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

/**
 * GET /api/suggestions/:id
 * Get a specific suggestion (only user's own)
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const suggestion = await Suggestion.findOne({
      where: { id, userId },
      attributes: { exclude: ['adminNotes', 'reviewedBy'] }
    });

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        error: 'Suggestion not found'
      });
    }

    // Also fetch associated coupon if rewarded
    let coupon = null;
    if (suggestion.status === 'rewarded') {
      coupon = await DiscountCoupon.findOne({
        where: { suggestionId: id, userId },
        attributes: ['id', 'code', 'discountType', 'discountValue',
          'minPurchaseAmount', 'maxDiscountAmount', 'expiryDate',
          'isUsed', 'usedAt', 'isActive']
      });
    }

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

export default router;
