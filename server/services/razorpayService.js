/**
 * ======================== RAZORPAY SERVICE ========================
 * Handles all Razorpay payment operations
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Razorpay instance lazily
let razorpayInstance = null;

function getRazorpay() {
    if (!razorpayInstance) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file');
        }
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
}

/**
 * Create a new Razorpay order
 * @param {number} amount - Amount in rupees
 * @param {string} currency - Currency code (default: INR)
 * @param {string} receipt - Unique receipt ID
 * @param {object} notes - Additional notes
 * @returns {Promise<object>} Razorpay order object
 */
export async function createOrder(amount, currency = 'INR', receipt, notes = {}) {
    try {
        const razorpay = getRazorpay();
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt,
            notes,
        };

        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error('Razorpay create order error:', error);
        throw new Error(`Failed to create order: ${error.message}`);
    }
}

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} Whether signature is valid
 */
export function verifyPaymentSignature(orderId, paymentId, signature) {
    try {
        const body = orderId + '|' + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        return expectedSignature === signature;
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
}

/**
 * Fetch payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<object>} Payment details
 */
export async function fetchPayment(paymentId) {
    try {
        const razorpay = getRazorpay();
        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        console.error('Fetch payment error:', error);
        throw new Error(`Failed to fetch payment: ${error.message}`);
    }
}

/**
 * Fetch order details
 * @param {string} orderId - Razorpay order ID
 * @returns {Promise<object>} Order details
 */
export async function fetchOrder(orderId) {
    try {
        const razorpay = getRazorpay();
        const order = await razorpay.orders.fetch(orderId);
        return order;
    } catch (error) {
        console.error('Fetch order error:', error);
        throw new Error(`Failed to fetch order: ${error.message}`);
    }
}

/**
 * Get Razorpay key ID for frontend
 * @returns {string} Razorpay key ID
 */
export function getKeyId() {
    return process.env.RAZORPAY_KEY_ID;
}

export default {
    createOrder,
    verifyPaymentSignature,
    fetchPayment,
    fetchOrder,
    getKeyId,
};
