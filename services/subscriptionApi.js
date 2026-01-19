/**
 * ======================== SUBSCRIPTION API ========================
 * Frontend API functions for subscription management
 */

import { fetchWithTimeout, safeJsonParse } from '../utils/fetchWithTimeout.js';
import { getTimeoutForPlatform, debugLog, isWindows } from '../utils/platformDetection.js';

// Remote backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
const API_BASE = `${API_BASE_URL}/subscription`;

/**
 * Get auth headers
 */
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
}

/**
 * Get all available plans
 */
export async function getPlans() {
    try {
        const response = await fetchWithTimeout(`${API_BASE}/plans`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }, getTimeoutForPlatform(30000));
        return await safeJsonParse(response);
    } catch (error) {
        console.error('Get plans error:', error);
        debugLog('Get plans error', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get single plan by ID
 */
export async function getPlanById(planId) {
    try {
        const response = await fetchWithTimeout(`${API_BASE}/plan/${planId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }, getTimeoutForPlatform(30000));
        return await safeJsonParse(response);
    } catch (error) {
        console.error('Get plan error:', error);
        debugLog('Get plan error', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create Razorpay order
 */
export async function createOrder(planId) {
    try {
        const response = await fetchWithTimeout(`${API_BASE}/create-order`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ planId }),
        }, getTimeoutForPlatform(30000));
        return await safeJsonParse(response);
    } catch (error) {
        console.error('Create order error:', error);
        debugLog('Create order error', error);
        return { success: false, error: error.message };
    }
}

/**
 * Verify payment
 */
export async function verifyPayment(paymentData) {
    try {
        const response = await fetchWithTimeout(`${API_BASE}/verify-payment`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(paymentData),
        }, getTimeoutForPlatform(30000));
        return await safeJsonParse(response);
    } catch (error) {
        console.error('Verify payment error:', error);
        debugLog('Verify payment error', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get current subscription status
 */
export async function getSubscriptionStatus() {
    try {
        const response = await fetchWithTimeout(`${API_BASE}/status`, {
            method: 'GET',
            headers: getAuthHeaders(),
        }, getTimeoutForPlatform(30000));
        return await safeJsonParse(response);
    } catch (error) {
        console.error('Get subscription status error:', error);
        debugLog('Get subscription status error', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get subscription history
 */
export async function getSubscriptionHistory() {
    try {
        const response = await fetchWithTimeout(`${API_BASE}/history`, {
            method: 'GET',
            headers: getAuthHeaders(),
        }, getTimeoutForPlatform(30000));
        return await safeJsonParse(response);
    } catch (error) {
        console.error('Get subscription history error:', error);
        debugLog('Get subscription history error', error);
        return { success: false, error: error.message };
    }
}

/**
 * Load Razorpay script dynamically with timeout
 */
export function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            console.log('[Razorpay] SDK already loaded');
            resolve(true);
            return;
        }

        debugLog('[Razorpay] Loading SDK from CDN...');
        console.log('[Razorpay] Loading SDK from CDN...');

        // Timeout for script loading (10s on Windows, 5s on Mac)
        const timeout = isWindows() ? 10000 : 5000;
        let timedOut = false;

        const timeoutId = setTimeout(() => {
            timedOut = true;
            console.error(`[Razorpay] Failed to load SDK (timeout after ${timeout}ms)`);
            debugLog(`Razorpay SDK load timeout (Windows firewall issue?)`);
            resolve(false);
        }, timeout);

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
            if (!timedOut) {
                clearTimeout(timeoutId);
                console.log('[Razorpay] SDK loaded successfully');
                debugLog('[Razorpay] SDK loaded successfully');
                resolve(true);
            }
        };
        script.onerror = () => {
            if (!timedOut) {
                clearTimeout(timeoutId);
                console.error('[Razorpay] Failed to load SDK from CDN');
                debugLog('[Razorpay] Failed to load SDK (network error or CDN blocked)');
                resolve(false);
            }
        };
        document.body.appendChild(script);
    });
}

/**
 * Initialize Razorpay payment
 */
export async function initiatePayment(orderData, userInfo, onSuccess, onFailure) {
    console.log('[Razorpay] Initiating payment with order data:', {
        orderId: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        planName: orderData.planName
    });

    // Validate required data
    if (!orderData || !orderData.orderId || !orderData.keyId) {
        const error = 'Invalid order data - missing orderId or keyId';
        console.error('[Razorpay]', error);
        onFailure({ error });
        return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
        const error = 'Failed to load Razorpay SDK. Please check your internet connection.';
        console.error('[Razorpay]', error);
        onFailure({ error });
        return;
    }

    const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AutoJobzy',
        description: orderData.planName || 'Subscription Plan',
        order_id: orderData.orderId,
        handler: async function (response) {
            console.log('[Razorpay] Payment completed, verifying signature...');
            // Payment successful - verify on backend
            const verifyResult = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
            });

            console.log('[Razorpay] Verification result:', verifyResult);

            if (verifyResult.success) {
                onSuccess(verifyResult);
            } else {
                onFailure(verifyResult);
            }
        },
        prefill: {
            name: userInfo?.name || userInfo?.firstName || '',
            email: userInfo?.email || '',
            contact: userInfo?.phone || '',
        },
        notes: {
            planName: orderData.planName,
        },
        theme: {
            color: '#6366f1',
        },
        modal: {
            ondismiss: function () {
                console.log('[Razorpay] Payment modal dismissed by user');
                onFailure({ error: 'Payment cancelled by user' });
            },
        },
    };

    console.log('[Razorpay] Opening payment modal with key:', orderData.keyId);

    try {
        // Windows: verify Razorpay is available before creating instance
        if (!window.Razorpay) {
            const error = 'Razorpay SDK not loaded. Please refresh and try again.';
            console.error('[Razorpay]', error);
            debugLog('[Razorpay] SDK not available (Windows CDN block?)');
            onFailure({ error });
            return;
        }

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', function (response) {
            console.error('[Razorpay] Payment failed:', response.error);
            debugLog('[Razorpay] Payment failed', response.error);
            onFailure({
                error: response.error.description || 'Payment failed',
                code: response.error.code,
            });
        });
        razorpay.open();
        debugLog('[Razorpay] Payment modal opened');
    } catch (err) {
        console.error('[Razorpay] Error creating Razorpay instance:', err);
        debugLog('[Razorpay] Error creating instance', err);
        onFailure({ error: 'Failed to initialize payment. Please try again.' });
    }
}

export default {
    getPlans,
    getPlanById,
    createOrder,
    verifyPayment,
    getSubscriptionStatus,
    getSubscriptionHistory,
    loadRazorpayScript,
    initiatePayment,
};
