/**
 * ======================== INSTITUTE ADMIN MODEL ========================
 * Manages admins for each institute
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';
import Institute from './Institute.js';
import User from './User.js';

const InstituteAdmin = sequelize.define('InstituteAdmin', {
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
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
            model: User,
            key: 'id',
        },
    },
    permissions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            canAddStudents: true,
            canAddStaff: true,
            canViewAnalytics: true,
            canManageSettings: false,
        },
    },
}, {
    tableName: 'institute_admins',
    timestamps: true,
    underscored: true,
});

// Note: Associations are defined in models/associations.js

export default InstituteAdmin;
