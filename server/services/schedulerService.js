
import schedule from 'node-schedule';
import JobSettings from '../models/JobSettings.js';
import { startAutomation } from '../autoApply.js';
import User from '../models/User.js';
import { setUserData, initializeSkillsFromDB } from '../aiAnswer.js';
import { queueSafeUpdateResume } from './naukriProfileUpdate.js';
import { Op } from 'sequelize';

// Track active jobs to avoiding duplicates
const activeJobs = new Map();

/**
 * Run the automation task for a user
 * @param {string} userId
 */
async function runScheduledTask(userId) {
    console.log(`⏰ Executing scheduled task for user ${userId}`);

    try {
        const jobSettings = await JobSettings.findOne({ where: { userId } });
        if (!jobSettings) {
            console.error(`❌ Job settings not found for user ${userId}`);
            return;
        }

        // Update status to processing (optional, or just keep pending until done)

        // Load data needed for automation
        const user = await User.findByPk(userId);

        setUserData({
            name: user?.firstName || 'User',
            currentCTC: jobSettings.currentCTC,
            expectedCTC: jobSettings.expectedCTC,
            noticePeriod: jobSettings.noticePeriod,
            location: jobSettings.location,
            yearsOfExperience: jobSettings.yearsOfExperience,
            naukriEmail: jobSettings.naukriEmail,
        });

        // Load skills from database for intelligent answering
        await initializeSkillsFromDB(userId, {
            host: process.env.DB_HOST || 'database-1.c72i2s6muax7.ap-south-1.rds.amazonaws.com',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'admin',
            password: process.env.DB_PASSWORD || 'YsjlUaX5yFJGtZqjmrSj',
            database: process.env.DB_NAME || 'jobautomate',
        });

        // Run automation
        const result = await startAutomation({
            userId: userId,
            jobUrl: 'https://www.naukri.com/jobs-by-skill-software-engineer', // Default or fetch from settings if added
            maxPages: 5,
            resumeText: jobSettings.resumeText,
            naukriEmail: jobSettings.naukriEmail,
            naukriPassword: jobSettings.naukriPassword,
        });

        // Update status
        await jobSettings.update({
            scheduleStatus: result.success ? 'completed' : 'failed',
            // scheduledTime: null // Optional: clear schedule or keep history
        });

        console.log(`✅ Scheduled task completed for user ${userId}: ${result.success ? 'Success' : 'Failed'}`);

    } catch (error) {
        console.error(`❌ Error executing scheduled task for user ${userId}:`, error);
        // Update status to failed
        await JobSettings.update(
            { scheduleStatus: 'failed' },
            { where: { userId } }
        );
    } finally {
        activeJobs.delete(userId);
    }
}

/**
 * Schedule a job for a specific time
 * @param {string} userId
 * @param {Date} date
 */
export function scheduleJobForUser(userId, date) {
    // Cancel existing job if any
    if (activeJobs.has(userId)) {
        activeJobs.get(userId).cancel();
    }

    const job = schedule.scheduleJob(date, () => runScheduledTask(userId));
    activeJobs.set(userId, job);

    console.log(`📅 Job scheduled for user ${userId} at ${date.toLocaleString()}`);
}

/**
 * Cancel a scheduled job
 * @param {string} userId
 */
export function cancelScheduledJob(userId) {
    if (activeJobs.has(userId)) {
        activeJobs.get(userId).cancel();
        activeJobs.delete(userId);
        return true;
    }
    return false;
}

/**
 * Initialize scheduler: Load pending jobs from DB on startup
 */
export async function initScheduler() {
    console.log('🔄 Initializing scheduler...');
    try {
        // Load job automation scheduled tasks
        const pendingJobs = await JobSettings.findAll({
            where: {
                scheduleStatus: 'pending',
            }
        });

        let count = 0;
        const now = new Date();

        for (const job of pendingJobs) {
            if (job.scheduledTime) {
                const scheduleTime = new Date(job.scheduledTime);

                // If time is in the past, run immediately or mark failed?
                // Let's run immediately if it was missed recently (e.g. within last hour), else skip?
                // For simplicity, let's schedule it. If it's past, node-schedule might run it immediately or we handle it.

                if (scheduleTime < now) {
                    console.log(`⚠️ Missed schedule for user ${job.userId} at ${scheduleTime.toLocaleString()}. Running immediately.`);
                    runScheduledTask(job.userId);
                } else {
                    scheduleJobForUser(job.userId, scheduleTime);
                }
                count++;
            }
        }

        // Load profile update scheduled tasks
        const enabledProfileUpdates = await JobSettings.findAll({
            where: {
                profileUpdateEnabled: true,
                profileUpdateNextRun: { [Op.ne]: null }
            }
        });

        let profileUpdateCount = 0;
        for (const setting of enabledProfileUpdates) {
            const nextRun = new Date(setting.profileUpdateNextRun);
            scheduleProfileUpdateForUser(setting.userId, nextRun);
            profileUpdateCount++;
        }

        console.log(`✅ Scheduler initialized. Loaded ${count} pending jobs and ${profileUpdateCount} profile updates.`);
    } catch (error) {
        console.error('❌ Failed to initialize scheduler:', error);
    }
}

// ========================================================================
// PROFILE UPDATE SCHEDULER FUNCTIONS
// ========================================================================

/**
 * Execute profile update task for a user
 * @param {string} userId - User ID
 */
async function runProfileUpdateTask(userId) {
    console.log(`[Profile Update Scheduler] Running profile update for user: ${userId}`);

    try {
        // Fetch user's job settings
        const jobSettings = await JobSettings.findOne({ where: { userId } });

        if (!jobSettings || !jobSettings.naukriEmail || !jobSettings.naukriPassword) {
            console.error(`[Profile Update Scheduler] No credentials found for user: ${userId}`);
            if (jobSettings) {
                await jobSettings.update({ profileUpdateLastStatus: 'failed' });
            }
            return;
        }

        // Execute profile update
        const result = await queueSafeUpdateResume(
            jobSettings.naukriEmail,
            jobSettings.naukriPassword
        );

        // Calculate next run time using custom schedule time
        const frequency = jobSettings.profileUpdateFrequency || 1;
        const nextRun = new Date();

        // Set the time based on profileUpdateScheduleTime
        if (jobSettings.profileUpdateScheduleTime) {
            const timeStr = jobSettings.profileUpdateScheduleTime;
            const [hours, minutes] = timeStr.split(':').map(Number);
            nextRun.setHours(hours, minutes, 0, 0);
        } else {
            // Default to 9 AM if no custom time set
            nextRun.setHours(9, 0, 0, 0);
        }

        // Add frequency days for next occurrence
        nextRun.setDate(nextRun.getDate() + frequency);

        // Update database with result
        await jobSettings.update({
            lastProfileUpdate: result.status === 'success' ? new Date() : jobSettings.lastProfileUpdate,
            profileUpdateLastStatus: result.status,
            profileUpdateNextRun: jobSettings.profileUpdateEnabled ? nextRun : null
        });

        // If still enabled, schedule next run
        if (jobSettings.profileUpdateEnabled) {
            scheduleProfileUpdateForUser(userId, nextRun);
        }

        console.log(`[Profile Update Scheduler] Profile update ${result.status} for user: ${userId}. Next run: ${nextRun.toLocaleString()}`);

    } catch (error) {
        console.error(`[Profile Update Scheduler] Error updating profile for user ${userId}:`, error);

        // Update status to failed
        const jobSettings = await JobSettings.findOne({ where: { userId } });
        if (jobSettings) {
            await jobSettings.update({ profileUpdateLastStatus: 'failed' });
        }
    } finally {
        // Remove from active jobs
        activeJobs.delete(`profile_update_${userId}`);
    }
}

/**
 * Schedule profile update for a user at specific time
 * @param {string} userId - User ID
 * @param {Date} scheduledTime - When to run the update
 */
export function scheduleProfileUpdateForUser(userId, scheduledTime) {
    const jobKey = `profile_update_${userId}`;

    // Cancel existing scheduled job if any
    if (activeJobs.has(jobKey)) {
        activeJobs.get(jobKey).cancel();
        activeJobs.delete(jobKey);
    }

    // Don't schedule if time is in the past
    const now = new Date();
    if (scheduledTime < now) {
        console.log(`[Profile Update Scheduler] Scheduled time in past, running immediately for user: ${userId}`);
        runProfileUpdateTask(userId);
        return;
    }

    // Schedule the job
    const job = schedule.scheduleJob(scheduledTime, () => {
        runProfileUpdateTask(userId);
    });

    activeJobs.set(jobKey, job);

    // Calculate and log time until execution
    const diffMs = scheduledTime.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);

    console.log(`[Profile Update Scheduler] ✅ Profile update scheduled for user ${userId}`);
    console.log(`[Profile Update Scheduler] 📅 Scheduled time: ${scheduledTime.toLocaleString()}`);
    console.log(`[Profile Update Scheduler] ⏰ Will run in: ${diffHours > 24 ? Math.round(diffHours/24) + ' days' : diffHours > 1 ? diffHours + ' hours' : diffMins + ' minutes'}`);
}

/**
 * Cancel scheduled profile update for a user
 * @param {string} userId - User ID
 */
export function cancelProfileUpdateForUser(userId) {
    const jobKey = `profile_update_${userId}`;

    if (activeJobs.has(jobKey)) {
        activeJobs.get(jobKey).cancel();
        activeJobs.delete(jobKey);
        console.log(`[Profile Update Scheduler] Cancelled profile update for user: ${userId}`);
        return true;
    }

    return false;
}
