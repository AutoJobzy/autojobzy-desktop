/**
 * ======================== INSTITUTE MODEL ========================
 * Represents educational institutes managed by super admin
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';

const Institute = sequelize.define('Institute', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    logo: {
        type: DataTypes.STRING(512),
        allowNull: true,
    },
    website: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active',
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'created_by',
    },
}, {
    tableName: 'institutes',
    timestamps: true,
    underscored: true,
});

// Note: Associations will be defined after all models are loaded
// to avoid circular dependency issues

export default Institute;
