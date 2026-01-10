/**
 * Migration 013: Update user_plans table schema
 * Adds missing Razorpay payment columns and fixes status field
 */

-- Add razorpay_order_id column
ALTER TABLE user_plans
ADD COLUMN razorpay_order_id VARCHAR(100) DEFAULT NULL
COMMENT 'Razorpay order ID';

-- Add razorpay_payment_id column
ALTER TABLE user_plans
ADD COLUMN razorpay_payment_id VARCHAR(100) DEFAULT NULL
COMMENT 'Razorpay payment ID';

-- Add razorpay_signature column
ALTER TABLE user_plans
ADD COLUMN razorpay_signature VARCHAR(500) DEFAULT NULL
COMMENT 'Razorpay payment signature';

-- Add amount column
ALTER TABLE user_plans
ADD COLUMN amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00
COMMENT 'Subscription amount paid';

-- Add status column (will replace payment_status)
ALTER TABLE user_plans
ADD COLUMN status ENUM('pending', 'active', 'expired', 'cancelled', 'failed') DEFAULT 'pending'
COMMENT 'Subscription status';

-- Migrate data from payment_status to status
UPDATE user_plans
SET status = CASE
    WHEN payment_status = 'completed' THEN 'active'
    WHEN payment_status = 'failed' THEN 'failed'
    WHEN payment_status = 'cancelled' THEN 'cancelled'
    ELSE 'pending'
END;

-- Drop old payment_status column
ALTER TABLE user_plans
DROP COLUMN payment_status;

-- Drop old is_active column (status field replaces this)
ALTER TABLE user_plans
DROP COLUMN is_active;
