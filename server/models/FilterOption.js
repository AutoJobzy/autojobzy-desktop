/**
 * ======================== FILTER OPTION MODEL ========================
 * Store all Naukri filter options (salary, location, industry, etc.)
 * Used for populating filter dropdowns in the frontend
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';

const FilterOption = sequelize.define('FilterOption', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // Filter category (e.g., 'salaryRange', 'wfhType', 'citiesGid', etc.)
    filterType: {
        type: DataTypes.ENUM(
            'salaryRange',
            'wfhType',
            'topGroupId',
            'stipend',
            'employement',
            'featuredCompanies',
            'business_size',
            'citiesGid',
            'functionalAreaGid',
            'internshipDuration',
            'ugCourseGid',
            'glbl_RoleCat',
            'pgCourseGid',
            'industryTypeGid'
        ),
        allowNull: false,
    },
    // The ID used by Naukri API
    optionId: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    // Display label
    label: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    // Count of jobs (optional, can be updated periodically)
    count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    // Optional URL for featured companies
    url: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    // For ordering
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    // Is this option active/visible
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'filter_options',
    indexes: [
        {
            fields: ['filter_type'],
        },
        {
            unique: true,
            fields: ['filter_type', 'option_id'],
        },
    ],
});

export default FilterOption;
