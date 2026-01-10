/**
 * ======================== PACKAGE MODEL ========================
 * Subscription packages for institutes
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';

const Package = sequelize.define('Package', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    studentLimit: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'student_limit',
    },
    pricePerMonth: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'price_per_month',
    },
    features: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    type: {
        type: DataTypes.ENUM('individual', 'institute'),
        allowNull: false,
        defaultValue: 'institute',
        comment: 'Package type: individual for personal users, institute for educational institutions',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active',
    },
}, {
    tableName: 'packages',
    timestamps: true,
    underscored: true,
});

export default Package;
