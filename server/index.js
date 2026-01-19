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
import http from 'http';

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

// Configure dotenv with explicit path resolution
// In production (Electron), .env is in resources/ directory
// In development, .env is in project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try multiple .env locations for Electron compatibility
const envLocations = [
    path.resolve(process.cwd(), '.env.production'),  // Current working directory (Electron sets this)
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../.env.production'),   // Parent directory from server/
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '.env.production'),      // Same directory as server/
    path.resolve(__dirname, '.env'),
    // Additional Windows-specific paths
    process.env.PORTABLE_EXECUTABLE_DIR ? path.resolve(process.env.PORTABLE_EXECUTABLE_DIR, '.env.production') : null,
    process.env.PORTABLE_EXECUTABLE_DIR ? path.resolve(process.env.PORTABLE_EXECUTABLE_DIR, '.env') : null,
].filter(Boolean); // Remove null entries

console.log('[ENV] ==================== ENVIRONMENT LOADING ====================');
console.log('[ENV] Current working directory:', process.cwd());
console.log('[ENV] __dirname:', __dirname);
console.log('[ENV] NODE_ENV:', process.env.NODE_ENV);
console.log('[ENV] Platform:', process.platform);
console.log('[ENV] Process title:', process.title);
console.log('[ENV] Checking', envLocations.length, 'possible .env locations...');
console.log('[ENV] ===========================================================');

let envLoaded = false;
for (let i = 0; i < envLocations.length; i++) {
    const envPath = envLocations[i];
    const exists = fs.existsSync(envPath);
    console.log(`[ENV] [${i + 1}/${envLocations.length}] ${exists ? '✓ FOUND' : '✗ NOT FOUND'}:`, envPath);

    if (exists) {
        try {
            dotenv.config({ path: envPath });
            envLoaded = true;
            console.log('[ENV] ✅ Successfully loaded environment from:', envPath);

            // Verify critical env vars are loaded
            const criticalVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
            const missing = criticalVars.filter(v => !process.env[v]);
            if (missing.length > 0) {
                console.warn('[ENV] ⚠️  WARNING: Missing critical env vars:', missing.join(', '));
            } else {
                console.log('[ENV] ✓ All critical environment variables loaded');
            }
            break;
        } catch (error) {
            console.error('[ENV] ✗ Failed to load .env from:', envPath, error.message);
        }
    }
}

if (!envLoaded) {
    console.warn('[ENV] ⚠️  No .env file found in any location.');
    console.warn('[ENV] ⚠️  Will use environment variables if available.');
    console.warn('[ENV] ⚠️  If database connection fails, check .env.production file location.');
}
const app = express();
let PORT = parseInt(process.env.PORT || '5000', 10);

/**
 * Check if a port is available
 */
async function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = http.createServer();

        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(false);
            } else {
                resolve(false);
            }
        });

        server.once('listening', () => {
            server.close();
            resolve(true);
        });

        server.listen(port, '0.0.0.0');
    });
}

/**
 * Find an available port starting from the given port
 */
async function findAvailablePort(startPort, maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
        const port = startPort + i;
        const available = await isPortAvailable(port);
        if (available) {
            return port;
        }
        console.log(`[PORT] Port ${port} is already in use, trying ${port + 1}...`);
    }
    return null;
}

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
    res.json({
        status: 'ok',
        port: PORT,
        timestamp: new Date().toISOString(),
        message: 'Server is running'
    });
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
    console.log('\n='.repeat(50));
    console.log('🚀 Starting AutoJobzy Backend Server...');
    console.log('='.repeat(50));
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Platform:', process.platform);
    console.log('Working Directory:', process.cwd());
    console.log('Server Directory:', __dirname);
    console.log('PORT:', PORT);
    console.log('DB_HOST:', process.env.DB_HOST || 'not set');
    console.log('DB_NAME:', process.env.DB_NAME || 'not set');
    console.log('='.repeat(50));

    let dbConnected = false;
    let schedulerInitialized = false;

    // Try to initialize database (don't crash if it fails, with timeout)
    try {
        console.log('\n📊 Initializing database connection...');
        console.log('⏱️  Timeout: 10 seconds (will skip if database not reachable)');

        // Add timeout to prevent hanging on database connection
        const dbPromise = initDatabase();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Database initialization timeout after 10 seconds')), 10000)
        );

        await Promise.race([dbPromise, timeoutPromise]);
        console.log('✅ Database initialized successfully');
        dbConnected = true;
    } catch (error) {
        console.error('\n❌ Database initialization failed:');
        console.error('Error:', error.message);
        if (error.stack && !error.message.includes('timeout')) {
            console.error('Stack:', error.stack);
        }
        console.error('\n⚠️  Server will start WITHOUT database connection');
        console.error('⚠️  API calls requiring database will fail');
        console.error('⚠️  Please check:');
        console.error('   1. Database credentials in .env file');
        console.error('   2. Network connectivity to database');
        console.error('   3. Database server is running');
        console.error('   4. Windows Firewall not blocking port 3306\n');
    }

    // Try to initialize scheduler (don't crash if it fails, with timeout)
    try {
        console.log('\n⏰ Initializing scheduler...');
        console.log('⏱️  Timeout: 5 seconds');

        const schedulerPromise = initScheduler();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Scheduler initialization timeout after 5 seconds')), 5000)
        );

        await Promise.race([schedulerPromise, timeoutPromise]);
        console.log('✅ Scheduler initialized successfully');
        schedulerInitialized = true;
    } catch (error) {
        console.error('\n❌ Scheduler initialization failed:');
        console.error('Error:', error.message);
        console.error('\n⚠️  Scheduler NOT running - scheduled tasks will not work\n');
    }

    // Check if port is available, find alternative if needed
    console.log(`\n🔍 Checking if port ${PORT} is available...`);
    const portAvailable = await isPortAvailable(PORT);

    if (!portAvailable) {
        console.error(`\n❌ Port ${PORT} is already in use!`);
        console.error('⚠️  Another application is using this port.');
        console.error('\n🔍 Attempting to find an available port...');

        const availablePort = await findAvailablePort(PORT);
        if (availablePort) {
            PORT = availablePort;
            console.log(`✅ Found available port: ${PORT}`);
        } else {
            console.error('\n❌ CRITICAL: Could not find any available port!');
            console.error('❌ Tried ports 5000-5009, all are in use.');
            console.error('\n💡 Solutions:');
            console.error('   1. Close other AutoJobzy instances');
            console.error('   2. Kill process using port 5000:');
            console.error('      Windows: netstat -ano | findstr :5000');
            console.error('               taskkill /PID <PID> /F');
            console.error('   3. Restart your computer\n');
            process.exit(1);
        }
    } else {
        console.log(`✅ Port ${PORT} is available`);
    }

    // CRITICAL: Always start HTTP server regardless of DB/Scheduler status
    // This MUST succeed or the app won't work
    try {
        console.log(`\n🌐 Starting HTTP server on port ${PORT}...`);
        console.log('🔥 CRITICAL: HTTP server MUST start for app to work');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`🌐 Bound to: 0.0.0.0:${PORT} (all network interfaces)`);
            console.log(`\n📊 Status:`);
            console.log(`   Database: ${dbConnected ? '✅ Connected' : '❌ Not Connected'}`);
            console.log(`   Scheduler: ${schedulerInitialized ? '✅ Running' : '❌ Not Running'}`);
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

            if (!dbConnected) {
                console.error('\n⚠️  WARNING: Database not connected!');
                console.error('⚠️  Most API endpoints will not work until database is fixed.\n');
            }
        });
    } catch (error) {
        console.error('\n❌ CRITICAL: Failed to start HTTP server:');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        console.error('\n💀 Exiting because HTTP server could not start...\n');
        process.exit(1);
    }
};

// Start the server with top-level error handling
startServer().catch((error) => {
    console.error('\n💀 FATAL ERROR: Server startup failed completely!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('\n🆘 Please check:');
    console.error('   1. All dependencies are installed');
    console.error('   2. .env.production file exists and is valid');
    console.error('   3. Port 5000 is not in use');
    console.error('   4. No syntax errors in code\n');
    process.exit(1);
});
