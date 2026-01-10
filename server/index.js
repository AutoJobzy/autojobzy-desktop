/**
 * ======================== MAIN SERVER ========================
 * Express server for handling automation and API requests
 * Integrates Puppeteer automation with React frontend + MySQL database
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { initDatabase } from './db/config.js';
import automationRoutes from './routes/automation.js';
import credentialsRoutes from './routes/credentials.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import jobSettingsRoutes from './routes/jobSettings.js';
import skillsRoutes from './routes/skills.js';
import filtersRoutes from './routes/filters.js';
import subscriptionRoutes from './routes/subscription.js';
import plansRoutes from './routes/plans.js';
import jobResultsRoutes from './routes/jobResults.js';
import suggestionsRoutes from './routes/suggestions.js';
import profileUpdateRoutes from './routes/profileUpdate.js';
import superadminRoutes from './routes/superadmin.js';
import instituteAdminRoutes from './routes/instituteAdmin.js';
import resumeUploadRoutes from './routes/resumeUpload.js';
import { initScheduler } from './services/schedulerService.js';

// Import models to ensure they're loaded
import './models/User.js';
import './models/JobSettings.js';
import './models/Skill.js';
import './models/FilterOption.js';
import './models/UserFilter.js';
import './models/Plan.js';
import './models/PlanFeature.js';
import './models/UserSubscription.js';
import './models/JobApplicationResult.js';
import './models/Suggestion.js';
import './models/DiscountCoupon.js';
import './models/Institute.js';
import './models/Package.js';
import './models/InstituteSubscription.js';
import './models/InstituteAdmin.js';
import './models/InstituteStaff.js';
import './models/InstituteStudent.js';
import './models/associations.js'; // Define model associations

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// ============= MIDDLEWARE =============

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads/resumes');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}


// Configure multer for file uploads
import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        cb(null, `resume-${timestamp}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT allowed.'));
        }
    },
});

// ============= ROUTE HANDLERS =============

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/job-settings', jobSettingsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/credentials', credentialsRoutes);
app.use('/api/filters', filtersRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/job-results', jobResultsRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/profile-update', profileUpdateRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/institute-admin', instituteAdminRoutes);
app.use('/api/resume', resumeUploadRoutes);

// ============= ERROR HANDLING =============

app.use((err, req, res, next) => {
    console.error('Server error:', err);

    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `File upload error: ${err.message}` });
    }

    res.status(500).json({
        error: err.message || 'Internal server error',
    });
});

// ============= 404 HANDLER =============

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// ============= SERVER START =============

const startServer = async () => {
    try {
        // Initialize database
        await initDatabase();

        // Initialize Scheduler
        await initScheduler();

        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Database: MySQL @ localhost:3306/jobautomate`);
            console.log(`\n📝 API Documentation:`);
            console.log(`   POST   /api/auth/signup              - Create account`);
            console.log(`   POST   /api/auth/login               - Login`);
            console.log(`   GET    /api/auth/profile             - Get profile (auth required)`);
            console.log(`   GET    /api/job-settings             - Get job settings (auth required)`);
            console.log(`   POST   /api/job-settings             - Update job settings (auth required)`);
            console.log(`   POST   /api/job-settings/resume      - Upload resume (auth required)`);
            console.log(`   GET    /api/job-settings/answers-data - Get AI answers data (auth required)`);
            console.log(`   GET    /api/skills                   - Get user skills (auth required)`);
            console.log(`   POST   /api/skills                   - Create/update skill (auth required)`);
            console.log(`   POST   /api/skills/bulk              - Bulk save skills (auth required)`);
            console.log(`   DELETE /api/skills/:id               - Delete skill (auth required)`);
            console.log(`   POST   /api/automation/start         - Start automation`);
            console.log(`   POST   /api/automation/stop          - Stop automation`);
            console.log(`   GET    /api/automation/logs          - Get logs`);
            console.log(`   GET    /api/filters/all              - Get all filter options`);
            console.log(`   GET    /api/filters/:filterType      - Get specific filter options`);
            console.log(`   GET    /api/plans                    - Get all active plans (public)`);
            console.log(`   GET    /api/plans/:planId           - Get plan by ID (public)`);
            console.log(`   GET    /api/subscription/plans       - Get all plans`);
            console.log(`   POST   /api/subscription/create-order - Create Razorpay order (auth)`);
            console.log(`   POST   /api/subscription/verify-payment - Verify payment (auth)`);
            console.log(`   GET    /api/subscription/status      - Get subscription status (auth)`);
            console.log(`   POST   /api/job-results/bulk         - Bulk save job results (auth)`);
            console.log(`   GET    /api/job-results              - Get job results (auth)`);
            console.log(`   GET    /api/job-results/stats        - Get job statistics (auth)`);
            console.log(`   DELETE /api/job-results              - Delete all job results (auth)\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
