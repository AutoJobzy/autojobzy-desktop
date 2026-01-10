/**
 * ======================== INSTITUTE SUBSCRIPTION MODEL ========================
 * Manages institute subscriptions to packages
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';
import Institute from './Institute.js';
import Package from './Package.js';

const InstituteSubscription = sequelize.define('InstituteSubscription', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    instituteId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'institute_id',
        references: {
            model: Institute,
            key: 'id',
        },
    },
    packageId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'package_id',
        references: {
            model: Package,
            key: 'id',
        },
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'start_date',
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'end_date',
    },
    status: {
        type: DataTypes.ENUM('active', 'expired', 'cancelled', 'pending'),
        defaultValue: 'pending',
    },
    paymentStatus: {
        type: DataTypes.ENUM('paid', 'pending', 'failed'),
        defaultValue: 'pending',
        field: 'payment_status',
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'payment_date',
    },
    paymentAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'payment_amount',
    },
    paymentReference: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'payment_reference',
    },
}, {
    tableName: 'institute_subscriptions',
    timestamps: true,
    underscored: true,
});

// Note: Associations are defined in models/associations.js

export default InstituteSubscription;
