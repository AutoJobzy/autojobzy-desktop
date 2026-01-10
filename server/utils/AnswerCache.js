/**
 * ======================== ANSWER CACHE ========================
 * In-memory cache for storing answers within a session
 * Speeds up repeated questions (name, email, common questions)
 */

import crypto from 'crypto';

class AnswerCache {
    constructor() {
        // Map<questionHash, { answer, timestamp, confidence }>
        this.cache = new Map();
        this.defaultTTL = 300000; // 5 minutes in milliseconds
    }

    /**
     * Generate hash from question text
     * @param {string} question - Question text
     * @returns {string} Hash
     */
    _generateHash(question) {
        return crypto
            .createHash('md5')
            .update(question.toLowerCase().trim())
            .digest('hex');
    }

    /**
     * Get cached answer if exists and not expired
     * @param {string} question - Question text
     * @returns {object|null} Cached result or null
     */
    get(question) {
        const hash = this._generateHash(question);
        const cached = this.cache.get(hash);

        if (!cached) {
            return null;
        }

        // Check if expired
        const now = Date.now();
        if (now - cached.timestamp > this.defaultTTL) {
            this.cache.delete(hash);
            return null;
        }

        return {
            answer: cached.answer,
            confidence: cached.confidence,
            fromCache: true
        };
    }

    /**
     * Cache answer with optional TTL
     * @param {string} question - Question text
     * @param {string} answer - Answer to cache
     * @param {number} confidence - Confidence score (0-100)
     * @param {number} ttl - Time to live in milliseconds (optional)
     */
    set(question, answer, confidence = 100, ttl = null) {
        const hash = this._generateHash(question);
        this.cache.set(hash, {
            answer,
            confidence,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL
        });
    }

    /**
     * Clear all cached answers
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     * @returns {object} Stats
     */
    getStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.values()).map(entry => ({
                answer: entry.answer.substring(0, 50) + '...',
                age: Date.now() - entry.timestamp,
                confidence: entry.confidence
            }))
        };
    }

    /**
     * Clean expired entries
     */
    cleanExpired() {
        const now = Date.now();
        for (const [hash, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(hash);
            }
        }
    }
}

export default AnswerCache;
