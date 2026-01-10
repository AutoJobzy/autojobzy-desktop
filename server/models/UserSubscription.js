/**
 * ======================== USER SUBSCRIPTION MODEL ========================
 * Tracks user subscriptions to plans
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';
import User from './User.js';
import Plan from './Plan.js';

const UserSubscription = sequelize.define('UserSubscription', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Plan,
            key: 'id',
        },
    },
    razorpayOrderId: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    razorpayPaymentId: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    razorpaySignature: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'active', 'expired', 'cancelled', 'failed'),
        defaultValue: 'pending',
    },
}, {
    tableName: 'user_plans',
    timestamps: true,
    underscored: true,
});

// Associations
User.hasMany(UserSubscription, { foreignKey: 'userId', as: 'subscriptions', onDelete: 'CASCADE' });
UserSubscription.belongsTo(User, { foreignKey: 'userId' });

Plan.hasMany(UserSubscription, { foreignKey: 'planId', as: 'subscriptions' });
UserSubscription.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

export default UserSubscription;
