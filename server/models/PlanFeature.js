/**
 * ======================== PLAN FEATURE MODEL ========================
 * Features associated with each subscription plan
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';
import Plan from './Plan.js';

const PlanFeature = sequelize.define('PlanFeature', {
    id: {
        type: DataTypes.STRING(36),
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Plan,
            key: 'id',
        },
    },
    featureKey: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    featureValue: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    featureLabel: {
        type: DataTypes.STRING(200),
        allowNull: true,
    },
}, {
    tableName: 'plan_features',
    timestamps: true,
    underscored: true,
});

// Associations
Plan.hasMany(PlanFeature, { foreignKey: 'planId', as: 'features', onDelete: 'CASCADE' });
PlanFeature.belongsTo(Plan, { foreignKey: 'planId' });

export default PlanFeature;
