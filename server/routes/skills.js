/**
 * ======================== SKILLS ROUTES ========================
 * Manage user skills with ratings and experience
 */

import express from 'express';
import Skill from '../models/Skill.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/skills
 * Get all skills for the logged-in user
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const skills = await Skill.findAll({
            where: { userId: req.userId },
            order: [['createdAt', 'ASC']],
        });

        res.json({ skills });
    } catch (error) {
        console.error('Fetch skills error:', error);
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
});

/**
 * POST /api/skills
 * Create or update a skill for the logged-in user
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { skillName, displayName, rating, outOf, experience } = req.body;

        if (!skillName) {
            return res.status(400).json({ error: 'Skill name is required' });
        }

        // Find or create skill
        const [skill, created] = await Skill.findOrCreate({
            where: {
                userId: req.userId,
                skillName: skillName.toLowerCase(),
            },
            defaults: {
                userId: req.userId,
                skillName: skillName.toLowerCase(),
                displayName: displayName || skillName,
                rating: rating || 0,
                outOf: outOf || 5,
                experience: experience || '0 years',
            },
        });

        // If not created, update existing
        if (!created) {
            await skill.update({
                displayName: displayName || skill.displayName,
                rating: rating !== undefined ? rating : skill.rating,
                outOf: outOf !== undefined ? outOf : skill.outOf,
                experience: experience || skill.experience,
            });
        }

        res.json({
            message: created ? 'Skill created successfully' : 'Skill updated successfully',
            skill,
        });
    } catch (error) {
        console.error('Create/Update skill error:', error);
        res.status(500).json({ error: 'Failed to save skill' });
    }
});

/**
 * POST /api/skills/bulk
 * Create or update multiple skills at once
 */
router.post('/bulk', authenticateToken, async (req, res) => {
    try {
        const { skills } = req.body;

        if (!Array.isArray(skills)) {
            return res.status(400).json({ error: 'Skills must be an array' });
        }

        const savedSkills = [];

        for (const skillData of skills) {
            const { skillName, displayName, rating, outOf, experience } = skillData;

            if (!skillName) continue;

            const [skill, created] = await Skill.findOrCreate({
                where: {
                    userId: req.userId,
                    skillName: skillName.toLowerCase(),
                },
                defaults: {
                    userId: req.userId,
                    skillName: skillName.toLowerCase(),
                    displayName: displayName || skillName,
                    rating: rating || 0,
                    outOf: outOf || 5,
                    experience: experience || '0 years',
                },
            });

            if (!created) {
                await skill.update({
                    displayName: displayName || skill.displayName,
                    rating: rating !== undefined ? rating : skill.rating,
                    outOf: outOf !== undefined ? outOf : skill.outOf,
                    experience: experience || skill.experience,
                });
            }

            savedSkills.push(skill);
        }

        res.json({
            message: `${savedSkills.length} skills saved successfully`,
            skills: savedSkills,
        });
    } catch (error) {
        console.error('Bulk save skills error:', error);
        res.status(500).json({ error: 'Failed to save skills' });
    }
});

/**
 * PUT /api/skills/:skillId
 * Update an existing skill
 */
router.put('/:skillId', authenticateToken, async (req, res) => {
    try {
        const { skillId } = req.params;
        const { skillName, displayName, rating, outOf, experience } = req.body;

        // Find skill and verify ownership
        const skill = await Skill.findOne({
            where: {
                id: skillId,
                userId: req.userId,
            },
        });

        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        // Update skill
        await skill.update({
            skillName: skillName ? skillName.toLowerCase() : skill.skillName,
            displayName: displayName || skill.displayName,
            rating: rating !== undefined ? parseFloat(rating) : skill.rating,
            outOf: outOf !== undefined ? parseInt(outOf) : skill.outOf,
            experience: experience !== undefined ? experience : skill.experience,
        });

        res.json({
            message: 'Skill updated successfully',
            skill,
        });
    } catch (error) {
        console.error('Update skill error:', error);
        res.status(500).json({ error: 'Failed to update skill' });
    }
});

/**
 * DELETE /api/skills/:skillId
 * Delete a specific skill
 */
router.delete('/:skillId', authenticateToken, async (req, res) => {
    try {
        const { skillId } = req.params;

        const skill = await Skill.findOne({
            where: {
                id: skillId,
                userId: req.userId,
            },
        });

        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        await skill.destroy();

        res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
        console.error('Delete skill error:', error);
        res.status(500).json({ error: 'Failed to delete skill' });
    }
});

/**
 * DELETE /api/skills
 * Delete all skills for the user
 */
router.delete('/', authenticateToken, async (req, res) => {
    try {
        await Skill.destroy({
            where: { userId: req.userId },
        });

        res.json({ message: 'All skills deleted successfully' });
    } catch (error) {
        console.error('Delete all skills error:', error);
        res.status(500).json({ error: 'Failed to delete skills' });
    }
});

export default router;
