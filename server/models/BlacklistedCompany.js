/**
 * ======================== BLACKLISTED COMPANY MODEL ========================
 * Store companies that the user wants to skip during job automation
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';
import User from './User.js';

const BlacklistedCompany = sequelize.define('BlacklistedCompany', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
            model: User,
            key: 'id',
        },
    },
    companyName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'company_name',
        comment: 'Raw company name as entered by user',
    },
    normalizedName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'normalized_name',
        comment: 'Lowercase + suffix-stripped name for fast matching',
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
}, {
    tableName: 'blacklisted_companies',
    indexes: [
        {
            fields: ['user_id'],
            name: 'idx_blacklist_user',
        },
        {
            unique: true,
            fields: ['user_id', 'normalized_name'],
            name: 'unique_user_company',
        },
    ],
});

// Association
User.hasMany(BlacklistedCompany, { foreignKey: 'userId', onDelete: 'CASCADE' });
BlacklistedCompany.belongsTo(User, { foreignKey: 'userId' });

export default BlacklistedCompany;
