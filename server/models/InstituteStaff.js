/**
 * ======================== INSTITUTE STAFF MODEL ========================
 * Manages staff members for each institute
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';
import Institute from './Institute.js';
import User from './User.js';

const InstituteStaff = sequelize.define('InstituteStaff', {
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
    addedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'added_by',
        references: {
            model: User,
            key: 'id',
        },
    },
    role: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
}, {
    tableName: 'institute_staff',
    timestamps: true,
    underscored: true,
});

// Note: Associations are defined in models/associations.js

export default InstituteStaff;
