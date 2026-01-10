/**
 * ======================== USER MODEL ========================
 * User authentication and profile storage
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    role: {
        type: DataTypes.ENUM('user', 'admin', 'superadmin', 'institute_admin', 'staff', 'student'),
        defaultValue: 'user',
        allowNull: false,
    },
    instituteId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'institutes',
            key: 'id',
        },
    },
    onboardingCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'users',
    underscored: true, // Map camelCase fields to snake_case columns
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                console.log('[USER MODEL] beforeCreate: Hashing password for:', user.email);
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
                console.log('[USER MODEL] beforeCreate: Password hashed. Hash length:', user.password.length);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                console.log('[USER MODEL] beforeUpdate: Hashing password for:', user.email);
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
                console.log('[USER MODEL] beforeUpdate: Password hashed. Hash length:', user.password.length);
            }
        },
    },
});

/**
 * Compare password with hashed password
 */
User.prototype.comparePassword = async function (plainPassword) {
    console.log('[USER MODEL] comparePassword: Comparing for user:', this.email);
    console.log('[USER MODEL] comparePassword: Plain password length:', plainPassword?.length);
    console.log('[USER MODEL] comparePassword: Stored hash length:', this.password?.length);

    const result = await bcrypt.compare(plainPassword, this.password);

    console.log('[USER MODEL] comparePassword: Result:', result);
    return result;
};

export default User;
