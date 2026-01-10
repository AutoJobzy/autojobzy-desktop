/**
 * ======================== AGENTIC ANSWER SERVICE ========================
 * Main public API for the agentic AI system
 * Orchestrates all agents and provides unified interface
 */

import DataRetriever from '../agents/DataRetriever.js';
import AnswerValidator from '../agents/AnswerValidator.js';
import AnswerAgent from '../agents/AnswerAgent.js';
import CheckboxAnalyzer from '../agents/CheckboxAnalyzer.js';
import AnswerCache from '../utils/AnswerCache.js';
import RateLimiter from '../utils/RateLimiter.js';

class AgenticAnswerService {
    constructor(userId, dbConfig) {
        this.userId = userId;
        this.dbConfig = dbConfig;

        // Initialize components
        this.cache = new AnswerCache();
        this.rateLimiter = new RateLimiter(40, 60000); // 40 requests per minute
        this.dataRetriever = new DataRetriever(userId, dbConfig);
        this.validator = new AnswerValidator(this.rateLimiter);
        this.answerAgent = new AnswerAgent(this.dataRetriever, this.validator, this.rateLimiter);
        this.checkboxAnalyzer = new CheckboxAnalyzer(this.dataRetriever, this.rateLimiter);

        // Reasoning log for debugging
        this.reasoningLog = [];

        console.log(`[AgenticAnswerService] Initialized for user ${userId}`);
    }

    /**
     * Get answer for a question with agentic reasoning
     * @param {string} question - Question text
     * @param {string} questionType - Type of question ('text', 'checkbox', 'radio')
     * @returns {Promise<object>} { answer, confidence, reasoning, fromCache }
     */
    async getAnswer(question, questionType = 'text') {
        try {
            // Check cache first
            const cached = this.cache.get(question);
            if (cached) {
                console.log(`[AgenticAnswerService] Cache hit: "${question}"`);
                return cached;
            }

            // Use answer agent to process question
            const result = await this.answerAgent.processQuestion(question);

            // Log reasoning for debugging
            this.reasoningLog.push({
                question,
                timestamp: new Date().toISOString(),
                ...result
            });

            // Cache the answer
            this.cache.set(question, result.answer, result.confidence);

            console.log(`[AgenticAnswerService] Question: "${question}" → Answer: "${result.answer}" (Confidence: ${result.confidence}%, Latency: ${result.latency}ms)`);

            return {
                answer: result.answer,
                confidence: result.confidence,
                reasoning: result.reasoning,
                toolsUsed: result.toolsUsed,
                latency: result.latency,
                fromCache: false
            };
        } catch (error) {
            console.error('[AgenticAnswerService] Error in getAnswer:', error.message);

            // Return empty answer on error
            return {
                answer: '',
                confidence: 0,
                reasoning: ['Error occurred'],
                error: error.message,
                fromCache: false
            };
        }
    }

    /**
     * Analyze checkbox/radio options and select best match
     * @param {Array} options - Array of option objects with label
     * @param {string} question - Question text
     * @returns {Promise<object>} { selectedIndex, reasoning, confidence }
     */
    async analyzeCheckboxOptions(options, question) {
        try {
            console.log(`[AgenticAnswerService] Analyzing ${options.length} options for: "${question}"`);

            const result = await this.checkboxAnalyzer.selectBestOption(options, question);

            // Log for debugging
            this.reasoningLog.push({
                question,
                type: 'checkbox',
                timestamp: new Date().toISOString(),
                options: options.map(o => o.label),
                ...result
            });

            console.log(`[AgenticAnswerService] Selected option ${result.selectedIndex + 1}: "${options[result.selectedIndex].label}" (Confidence: ${result.confidence})`);

            return result;
        } catch (error) {
            console.error('[AgenticAnswerService] Error in analyzeCheckboxOptions:', error.message);

            // Fallback to first option on error
            return {
                selectedIndex: 0,
                reasoning: 'Error occurred, selected first option',
                confidence: 'LOW',
                error: error.message
            };
        }
    }

    /**
     * Get reasoning log for debugging
     * @returns {Array}
     */
    getReasoningLog() {
        return this.reasoningLog;
    }

    /**
     * Get latest reasoning entry
     * @returns {object|null}
     */
    getLatestReasoning() {
        return this.reasoningLog.length > 0
            ? this.reasoningLog[this.reasoningLog.length - 1]
            : null;
    }

    /**
     * Clear answer cache
     */
    clearCache() {
        this.cache.clear();
        console.log('[AgenticAnswerService] Cache cleared');
    }

    /**
     * Clear reasoning log
     */
    clearReasoningLog() {
        this.reasoningLog = [];
        console.log('[AgenticAnswerService] Reasoning log cleared');
    }

    /**
     * Get service statistics
     * @returns {object}
     */
    getStats() {
        return {
            userId: this.userId,
            cacheStats: this.cache.getStats(),
            rateLimiterStats: this.rateLimiter.getStats(),
            reasoningLogSize: this.reasoningLog.length,
            latestReasoning: this.getLatestReasoning()
        };
    }

    /**
     * Pre-load user data (optional, for faster first question)
     */
    async preloadData() {
        try {
            console.log('[AgenticAnswerService] Pre-loading user data...');
            await this.dataRetriever.getContext();
            console.log('[AgenticAnswerService] User data pre-loaded successfully');
        } catch (error) {
            console.error('[AgenticAnswerService] Error pre-loading data:', error.message);
        }
    }
}

export default AgenticAnswerService;
