/**
 * ======================== INSTITUTE STUDENT MODEL ========================
 * Manages students for each institute
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';
import Institute from './Institute.js';
import User from './User.js';

const InstituteStudent = sequelize.define('InstituteStudent', {
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
    enrollmentNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'enrollment_number',
    },
    batch: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    course: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'graduated', 'suspended'),
        defaultValue: 'active',
    },
}, {
    tableName: 'institute_students',
    timestamps: true,
    underscored: true,
});

// Note: Associations are defined in models/associations.js

export default InstituteStudent;
