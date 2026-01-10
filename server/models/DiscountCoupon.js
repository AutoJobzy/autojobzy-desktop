import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';
import crypto from 'crypto';
import User from './User.js';
import Suggestion from './Suggestion.js';

const DiscountCoupon = sequelize.define('DiscountCoupon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  suggestionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'suggestions',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'flat_amount'),
    defaultValue: 'percentage',
    allowNull: false,
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  minPurchaseAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  maxDiscountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  subscriptionId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'user_subscriptions',
      key: 'id'
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  generatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
  },
}, {
  tableName: 'discount_coupons',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: (coupon) => {
      if (!coupon.code) {
        // Auto-generate unique coupon code: SUGGEST-XXXXXX
        coupon.code = `SUGGEST-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      }
    }
  }
});

// Instance method to check if coupon is valid
DiscountCoupon.prototype.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    !this.isUsed &&
    new Date(this.expiryDate) > now
  );
};

// Instance method to calculate discount for given amount
DiscountCoupon.prototype.calculateDiscount = function(amount) {
  if (!this.isValid()) return 0;
  if (amount < this.minPurchaseAmount) return 0;

  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (amount * this.discountValue) / 100;
    if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else {
    discount = this.discountValue;
  }

  return Math.min(discount, amount); // Discount can't exceed amount
};

// Associations
Suggestion.hasOne(DiscountCoupon, { foreignKey: 'suggestionId', onDelete: 'CASCADE' });
DiscountCoupon.belongsTo(Suggestion, { foreignKey: 'suggestionId' });

User.hasMany(DiscountCoupon, { foreignKey: 'userId', onDelete: 'CASCADE' });
DiscountCoupon.belongsTo(User, { foreignKey: 'userId', as: 'user' });
DiscountCoupon.belongsTo(User, { foreignKey: 'generatedBy', as: 'generator' });

export default DiscountCoupon;
