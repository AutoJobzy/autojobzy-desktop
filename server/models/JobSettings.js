/**
 * ======================== JOB SETTINGS MODEL ========================
 * Store all user job profile settings and resume data
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';
import User from './User.js';

const JobSettings = sequelize.define('JobSettings', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    // Naukri Credentials
    naukriEmail: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    naukriPassword: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    credentialsVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'credentials_verified',
        comment: 'Whether Naukri credentials have been verified',
    },
    lastVerified: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_verified',
        comment: 'Timestamp of last successful verification',
    },
    // Job Profile Settings
    targetRole: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Software Engineer',
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Bangalore',
    },
    currentCTC: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    expectedCTC: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    noticePeriod: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Immediate',
    },
    searchKeywords: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // Automation Settings
    maxPages: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 5,
        field: 'max_pages',
        comment: 'Maximum pages to process during automation',
    },
    // Face-to-Face Availability
    availability: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Flexible',
        comment: 'Face-to-face meeting availability',
    },
    // Resume Data
    resumeFileName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resumeS3Url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'S3 URL of uploaded resume',
    },
    resumeS3Key: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'S3 object key for resume file',
    },
    resumeText: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        comment: 'Extracted resume text for AI processing',
    },
    resumeScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    // Years of experience for job search filtering (numeric value)
    yearsOfExperience: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: 'years_of_experience',
        comment: 'Years of experience for job search filtering',
    },
    // Date of Birth
    dob: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Date of Birth in YYYY-MM-DD format',
    },
    // Scheduling
    scheduledTime: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    scheduleStatus: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: true,
    },
    // Profile Update Scheduler
    profileUpdateEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
        field: 'profile_update_enabled',
        comment: 'Is auto profile update enabled',
    },
    profileUpdateFrequency: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: true,
        field: 'profile_update_frequency',
        comment: 'Update frequency in days',
    },
    profileUpdateScheduleTime: {
        type: DataTypes.TIME,
        defaultValue: '09:00:00',
        allowNull: true,
        field: 'profile_update_schedule_time',
        comment: 'Time of day to run the update (HH:MM:SS)',
    },
    profileUpdateNextRun: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'profile_update_next_run',
        comment: 'Next scheduled profile update time',
    },
    profileUpdateLastStatus: {
        type: DataTypes.STRING(50),
        defaultValue: 'idle',
        allowNull: true,
        field: 'profile_update_last_status',
        comment: 'Last update status: idle, success, failed, scheduled',
    },
    lastProfileUpdate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_profile_update',
        comment: 'Timestamp of last Naukri profile update',
    },
    // Timestamps
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'job_settings',
});

// Association
User.hasOne(JobSettings, { foreignKey: 'userId', onDelete: 'CASCADE' });
JobSettings.belongsTo(User, { foreignKey: 'userId' });

export default JobSettings;
