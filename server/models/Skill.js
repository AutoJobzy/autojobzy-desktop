/**
 * ======================== SKILL MODEL ========================
 * Store user skills with ratings and experience
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';
import User from './User.js';

const Skill = sequelize.define('Skill', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    // Skill Name (lowercase, normalized)
    skillName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'e.g., java, spring, angular, etc.',
    },
    // Skill Display Name (for UI)
    displayName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'e.g., Java, Spring Boot, Angular',
    },
    // Rating
    rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
        defaultValue: 0.0,
        comment: 'Skill rating out of 5',
    },
    // Out of (max rating)
    outOf: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 5,
        comment: 'Maximum rating (usually 5)',
    },
    // Years of Experience
    experience: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'e.g., "3 years", "6 months"',
    },
    // Timestamps
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'skills',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'skill_name'],
            name: 'unique_user_skill'
        }
    ]
});

// Association
User.hasMany(Skill, { foreignKey: 'userId', onDelete: 'CASCADE' });
Skill.belongsTo(User, { foreignKey: 'userId' });

export default Skill;
