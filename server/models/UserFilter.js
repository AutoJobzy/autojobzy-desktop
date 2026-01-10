/**
 * ======================== USER FILTER MODEL ========================
 * Store user's selected job search filters
 * Links to job_settings or users table
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';
import User from './User.js';

const UserFilter = sequelize.define('UserFilter', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'id',
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: 'user_id',
        references: {
            model: User,
            key: 'id',
        },
    },
    // Filter selections stored as comma-separated values for multiselect
    freshness: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'freshness',
    },
    salaryRange: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'salary_range',
    },
    wfhType: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'wfh_type',
    },
    citiesGid: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'cities_gid',
    },
    functionalAreaGid: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'functional_area_gid',
    },
    industryTypeGid: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'industry_type_gid',
    },
    ugCourseGid: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'ug_course_gid',
    },
    pgCourseGid: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'pg_course_gid',
    },
    business_size: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'business_size',
    },
    employement: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'employement',
    },
    glbl_RoleCat: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'glbl__role_cat',
    },
    topGroupId: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'top_group_id',
    },
    featuredCompanies: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'featured_companies',
    },
    // Final URL after filters applied on Naukri
    finalUrl: {
        type: DataTypes.STRING(2000),
        allowNull: true,
        field: 'final_url',
    },
    // Selected filters stored as JSON
    selectedFilters: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'selected_filters',
    },
}, {
    tableName: 'user_filters',
    underscored: true,  // Maps createdAt → created_at, updatedAt → updated_at
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id'],
        },
    ],
});

// Association
User.hasOne(UserFilter, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserFilter.belongsTo(User, { foreignKey: 'userId' });

export default UserFilter;
