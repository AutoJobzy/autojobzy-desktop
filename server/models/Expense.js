/**
 * ======================== EXPENSE MODEL ========================
 * Tracks business expenses for admin financial management
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';

const Expense = sequelize.define('Expense', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    category: {
        type: DataTypes.ENUM(
            'server',
            'api',
            'email',
            'support',
            'marketing',
            'operations',
            'miscellaneous'
        ),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    createdBy: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'expenses',
    timestamps: true,
    underscored: true,
});

export default Expense;
