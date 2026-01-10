import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';
import User from './User.js';

const Suggestion = sequelize.define('Suggestion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  type: {
    type: DataTypes.ENUM('feature_request', 'bug_report', 'ux_improvement', 'general_feedback'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'under_review', 'approved', 'implemented', 'rewarded', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  implementedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rewardedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
}, {
  tableName: 'suggestions',
  timestamps: true,
  underscored: true,
});

// Associations
User.hasMany(Suggestion, { foreignKey: 'userId', as: 'suggestions', onDelete: 'CASCADE' });
Suggestion.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Suggestion.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

export default Suggestion;
