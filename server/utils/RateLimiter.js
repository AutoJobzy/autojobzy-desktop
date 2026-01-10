/**
 * ======================== RATE LIMITER ========================
 * Prevents hitting Claude API rate limits
 * Max 40 requests per 60 seconds to stay safely under limits
 */

class RateLimiter {
    constructor(maxRequests = 40, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = []; // Array of timestamps
    }

    /**
     * Acquire permission to make an API call
     * Blocks if rate limit would be exceeded
     * @returns {Promise<void>}
     */
    async acquire() {
        const now = Date.now();

        // Remove old requests outside the time window
        this.requests = this.requests.filter(
            timestamp => now - timestamp < this.windowMs
        );

        // Check if we've hit the limit
        if (this.requests.length >= this.maxRequests) {
            // Calculate wait time until oldest request expires
            const oldest = this.requests[0];
            const waitTime = this.windowMs - (now - oldest);

            console.log(
                `[RateLimiter] Rate limit reached. Waiting ${waitTime}ms...`
            );

            // Wait for the required time
            await new Promise(resolve => setTimeout(resolve, waitTime));

            // Try again after waiting
            return this.acquire();
        }

        // Record this request
        this.requests.push(now);
    }

    /**
     * Check if we can make a request without blocking
     * @returns {boolean}
     */
    canAcquire() {
        const now = Date.now();
        this.requests = this.requests.filter(
            timestamp => now - timestamp < this.windowMs
        );
        return this.requests.length < this.maxRequests;
    }

    /**
     * Get current usage statistics
     * @returns {object}
     */
    getStats() {
        const now = Date.now();
        this.requests = this.requests.filter(
            timestamp => now - timestamp < this.windowMs
        );

        return {
            requestsInWindow: this.requests.length,
            maxRequests: this.maxRequests,
            availableRequests: this.maxRequests - this.requests.length,
            windowMs: this.windowMs,
            utilizationPercent: (this.requests.length / this.maxRequests) * 100
        };
    }

    /**
     * Reset the rate limiter
     */
    reset() {
        this.requests = [];
    }
}

export default RateLimiter;
