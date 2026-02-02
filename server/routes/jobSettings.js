/**
 * ======================== JOB SETTINGS ROUTES ========================
 * User profile settings, resume upload, and dynamic data management
 */

import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import JobSettings from '../models/JobSettings.js';
import Skill from '../models/Skill.js';
import UserFilter from '../models/UserFilter.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for resume uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './server/uploads/resumes';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.userId + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, TXT, DOC, DOCX allowed.'));
        }
    },
});

/**
 * Extract text from resume file
 */
const extractResumeText = async (filePath, mimeType) => {
    try {
        if (mimeType === 'application/pdf') {
            const fileBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(fileBuffer);
            return pdfData.text;
        } else if (mimeType === 'text/plain') {
            return fs.readFileSync(filePath, 'utf-8');
        } else {
            // For DOCX/DOC - return file path for frontend handling
            return `File uploaded: ${path.basename(filePath)}`;
        }
    } catch (error) {
        console.error('Error extracting resume text:', error);
        throw error;
    }
};

/**
 * Extract years of experience from resume text
 */
const extractExperience = (resumeText) => {
    const patterns = [
        /(\d+)\s*\+?\s*years?\s+of\s+experience/gi,
        /experience:\s*(\d+)\s*\+?\s*years?/gi,
        /(\d+)\s*\+?\s*years?\s+in/gi,
    ];

    for (const pattern of patterns) {
        const match = resumeText.match(pattern);
        if (match) {
            const numberMatch = match[0].match(/\d+/);
            if (numberMatch) {
                return numberMatch[0] + '+';
            }
        }
    }
    return 'Not specified';
};

/**
 * POST /api/job-settings/resume
 * Upload and process resume
 */
router.post('/resume', authenticateToken, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No resume file provided' });
        }

        const resumeText = await extractResumeText(req.file.path, req.file.mimetype);
        const yearsOfExperience = extractExperience(resumeText);

        // Update job settings with resume data
        const [jobSettings] = await JobSettings.findOrCreate({
            where: { userId: req.userId },
            defaults: { userId: req.userId },
        });

        await jobSettings.update({
            resumeFileName: req.file.originalname,
            resumeText,
            yearsOfExperience,
            resumeScore: 85, // Mock score
        });

        res.json({
            message: 'Resume uploaded successfully',
            resumeText,
            yearsOfExperience,
            fileName: req.file.originalname,
        });
    } catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({ error: error.message || 'Resume upload failed' });
    }
});

/**
 * GET /api/job-settings
 * Get user job settings
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching job settings for userId:', req.userId);

        const jobSettings = await JobSettings.findOne({
            where: { userId: req.userId },
        });

        if (!jobSettings) {
            // Create default if not exists
            console.log('No job settings found, creating default for userId:', req.userId);
            try {
                const created = await JobSettings.create({ userId: req.userId });
                const response = created.toJSON();
                response.name = response.fullName || 'User';
                response.searchUrl = '';  // No search URL yet for new users
                return res.json(response);
            } catch (createError) {
                // If foreign key error, user doesn't exist - they need to re-login
                if (createError.name === 'SequelizeForeignKeyConstraintError') {
                    console.error('User not found in database - token may be stale');
                    return res.status(401).json({
                        error: 'User session invalid. Please log out and log in again.',
                        code: 'USER_NOT_FOUND'
                    });
                }
                throw createError;
            }
        }

        // Debug: Log Naukri credentials status
        console.log(`[GET] Naukri Email: ${jobSettings.naukriEmail || 'NULL'}, Has Password: ${!!jobSettings.naukriPassword}, Verified: ${jobSettings.credentialsVerified}`);

        // Fetch saved search URL from user_filters table
        const userFilters = await UserFilter.findOne({
            where: { userId: req.userId },
            attributes: ['finalUrl']
        });

        // Return settings with normalized field names for AI answers
        const response = jobSettings.toJSON();
        response.name = response.fullName || 'User';  // Add name field for AI
        response.searchUrl = userFilters?.finalUrl || '';  // Add saved search URL

        console.log(`[GET] Saved search URL: ${response.searchUrl ? response.searchUrl.substring(0, 80) + '...' : 'NOT SET'}`);

        res.json(response);
    } catch (error) {
        console.error('Fetch job settings error:', error.message);
        res.status(500).json({ error: 'Failed to fetch job settings', details: error.message });
    }
});

/**
 * POST /api/job-settings
 * Update user job settings with proper field validation
 * Fetches existing record by userId, updates only provided fields
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            naukriEmail,
            naukriPassword,
            targetRole,
            location,
            currentCTC,
            expectedCTC,
            noticePeriod,
            searchKeywords,
            availability,
            maxPages,
            yearsOfExperience,
            dob,
        } = req.body;

        // Validate that provided fields are non-empty
        const fieldLabels = {
            naukriEmail: 'Naukri Email',
            naukriPassword: 'Naukri Password',
            targetRole: 'Target Role',
            location: 'Preferred Location',
            currentCTC: 'Current Salary',
            expectedCTC: 'Expected Salary',
            noticePeriod: 'Notice Period',
            searchKeywords: 'Keywords',
            availability: 'Availability',
            dob: 'Date of Birth',
        };

        // Check each provided field for empty values
        for (const [field, label] of Object.entries(fieldLabels)) {
            const value = req.body[field];
            // Only validate if field is provided
            if (value !== undefined && value !== null) {
                if (typeof value === 'string' && value.trim() === '') {
                    return res.status(400).json({
                        error: `${label} cannot be empty`,
                        field: field,
                        message: 'Please provide a valid value'
                    });
                }
            }
        }

        // Validate yearsOfExperience if provided
        if (yearsOfExperience !== undefined && yearsOfExperience !== null) {
            const experience = parseInt(yearsOfExperience);
            if (isNaN(experience) || experience < 0 || experience > 50 || !Number.isInteger(parseFloat(yearsOfExperience))) {
                return res.status(400).json({
                    error: 'Invalid years of experience',
                    message: 'Years of experience must be a positive integer between 0 and 50',
                    field: 'yearsOfExperience'
                });
            }
        }

        // Find or create job settings for the logged-in user
        let jobSettings = await JobSettings.findOne({
            where: { userId: req.userId },
        });

        // If not found, create new record
        if (!jobSettings) {
            jobSettings = await JobSettings.create({
                userId: req.userId,
            });
        }

        // Build update object - only include fields that were provided
        const updateData = {};

        // Update field only if explicitly provided (not undefined)
        // This allows empty strings and 0 values to be saved
        if (naukriEmail !== undefined) updateData.naukriEmail = naukriEmail;
        if (naukriPassword !== undefined) updateData.naukriPassword = naukriPassword;
        if (targetRole !== undefined) updateData.targetRole = targetRole;
        if (location !== undefined) updateData.location = location;
        if (currentCTC !== undefined) updateData.currentCTC = currentCTC;
        if (expectedCTC !== undefined) updateData.expectedCTC = expectedCTC;
        if (noticePeriod !== undefined) updateData.noticePeriod = noticePeriod;
        if (searchKeywords !== undefined) updateData.searchKeywords = searchKeywords;
        if (availability !== undefined) updateData.availability = availability;
        if (maxPages !== undefined) updateData.maxPages = maxPages;
        if (yearsOfExperience !== undefined) updateData.yearsOfExperience = parseInt(yearsOfExperience);
        if (dob !== undefined) updateData.dob = dob || null;

        // Update only if there are fields to update
        if (Object.keys(updateData).length > 0) {
            await jobSettings.update(updateData);
        }

        // Return updated record
        const updatedJobSettings = await JobSettings.findOne({
            where: { userId: req.userId },
        });

        res.json({
            message: 'Job settings updated successfully',
            jobSettings: updatedJobSettings,
        });
    } catch (error) {
        console.error('Update job settings error:', error);
        res.status(500).json({ error: 'Failed to update job settings' });
    }
});

/**
 * GET /api/job-settings/resume-text
 * Get stored resume text (for aiAnswer.js)
 */
router.get('/resume-text', authenticateToken, async (req, res) => {
    try {
        const jobSettings = await JobSettings.findOne({
            where: { userId: req.userId },
        });

        if (!jobSettings || !jobSettings.resumeText) {
            return res.json({
                resumeText: 'No resume uploaded',
                yearsOfExperience: '0',
            });
        }

        res.json({
            resumeText: jobSettings.resumeText,
            yearsOfExperience: jobSettings.yearsOfExperience,
        });
    } catch (error) {
        console.error('Fetch resume text error:', error);
        res.status(500).json({ error: 'Failed to fetch resume text' });
    }
});

/**
 * GET /api/job-settings/answers-data
 * Get all data needed by aiAnswer.js for dynamic answers
 */
router.get('/answers-data', authenticateToken, async (req, res) => {
    try {
        const jobSettings = await JobSettings.findOne({
            where: { userId: req.userId },
        });

        if (!jobSettings) {
            return res.status(404).json({ error: 'Job settings not found' });
        }

        // Load user skills
        const skills = await Skill.findAll({
            where: { userId: req.userId },
        });

        const skillsData = skills.map(skill => ({
            name: skill.displayName || skill.skillName,
            rating: skill.rating,
            experience: skill.experience
        }));

        res.json({
            name: jobSettings.firstName || 'User',
            currentCTC: jobSettings.currentCTC || 'Not specified',
            expectedCTC: jobSettings.expectedCTC || 'Not specified',
            noticePeriod: jobSettings.noticePeriod || 'Immediate',
            location: jobSettings.location || 'Bangalore',
            targetRole: jobSettings.targetRole || 'Software Engineer',
            yearsOfExperience: jobSettings.yearsOfExperience || '0',
            naukriEmail: jobSettings.naukriEmail || 'Not set',
            naukriPassword: jobSettings.naukriPassword || 'Not set',
            resumeText: jobSettings.resumeText || 'No resume',
            availability: jobSettings.availability || 'Flexible',
            dob: jobSettings.dob || null,
            skills: skillsData,
        });
    } catch (error) {
        console.error('Fetch answers data error:', error);
        res.status(500).json({ error: 'Failed to fetch answers data' });
    }
});

export default router;
