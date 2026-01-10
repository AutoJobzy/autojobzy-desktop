/**
 * ======================== JOB APPLICATION RESULT MODEL ========================
 * Sequelize model for storing job application results
 * Tracks each job processed during automation for analytics and auditing
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';

const JobApplicationResult = sequelize.define(
    'JobApplicationResult',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.CHAR(36),
            allowNull: false,
            field: 'user_id',
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        datetime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        pageNumber: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: false,
            field: 'page_number',
        },
        jobNumber: {
            type: DataTypes.STRING(20),
            allowNull: false,
            field: 'job_number',
        },
        companyUrl: {
            type: DataTypes.STRING(512),
            allowNull: false,
            field: 'company_url',
        },
        earlyApplicant: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'early_applicant',
        },
        keySkillsMatch: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'key_skills_match',
        },
        locationMatch: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'location_match',
        },
        experienceMatch: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'experience_match',
        },
        matchScore: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: false,
            field: 'match_score',
            validate: {
                min: 0,
                max: 5,
            },
        },
        matchScoreTotal: {
            type: DataTypes.TINYINT.UNSIGNED,
            defaultValue: 5,
            field: 'match_score_total',
        },
        matchStatus: {
            type: DataTypes.ENUM('Good Match', 'Poor Match'),
            allowNull: false,
            field: 'match_status',
        },
        applyType: {
            type: DataTypes.ENUM('Direct Apply', 'External Apply', 'No Apply Button'),
            allowNull: false,
            field: 'apply_type',
        },
        applicationStatus: {
            type: DataTypes.ENUM('Applied', 'Skipped'),
            allowNull: true,
            field: 'application_status',
            comment: 'Whether job was Applied or Skipped during automation',
        },
        // Additional job details fields
        jobTitle: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'job_title',
            comment: 'Job title/position',
        },
        companyName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'company_name',
            comment: 'Company name',
        },
        experienceRequired: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'experience_required',
            comment: 'Experience requirement (e.g., "4-8 years")',
        },
        salary: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'salary',
            comment: 'Salary range or "Not Disclosed"',
        },
        location: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'location',
            comment: 'Job location (city)',
        },
        postedDate: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'posted_date',
            comment: 'When job was posted (e.g., "1 week ago")',
        },
        openings: {
            type: DataTypes.STRING(20),
            allowNull: true,
            field: 'openings',
            comment: 'Number of openings',
        },
        applicants: {
            type: DataTypes.STRING(20),
            allowNull: true,
            field: 'applicants',
            comment: 'Number of applicants',
        },
        keySkills: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'key_skills',
            comment: 'Comma-separated list of key skills',
        },
        role: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'role',
            comment: 'Job role category',
        },
        industryType: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'industry_type',
            comment: 'Industry type',
        },
        employmentType: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'employment_type',
            comment: 'Employment type (Full-time, Contract, etc.)',
        },
        roleCategory: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'role_category',
            comment: 'Role category',
        },
        companyRating: {
            type: DataTypes.STRING(10),
            allowNull: true,
            field: 'company_rating',
            comment: 'Company rating (e.g., "4.0")',
        },
        jobHighlights: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'job_highlights',
            comment: 'Job highlights (comma-separated)',
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'created_at',
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'updated_at',
        },
    },
    {
        tableName: 'job_application_results',
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ['user_id'] },
            { fields: ['datetime'] },
            { fields: ['user_id', 'datetime'] },
            { fields: ['match_score'] },
            { fields: ['match_status'] },
            { fields: ['apply_type'] },
            { fields: ['application_status'] },
            { fields: ['job_title'] },
            { fields: ['company_name'] },
            { fields: ['location'] },
            { fields: ['posted_date'] },
        ],
    }
);

export default JobApplicationResult;
