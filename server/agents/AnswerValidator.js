/**
 * ======================== ANSWER VALIDATOR ========================
 * Multi-stage validation with self-correction
 * Ensures answers are properly formatted and relevant
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class AnswerValidator {
    constructor(rateLimiter) {
        this.rateLimiter = rateLimiter;
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    /**
     * Validate answer with multi-stage checks
     * @param {string} answer - Answer to validate
     * @param {string} question - Original question
     * @param {object} context - User context
     * @param {number} iteration - Current iteration (for recursion limit)
     * @returns {Promise<object>} { valid, answer, confidence, issues }
     */
    async validate(answer, question, context, iteration = 0) {
        const issues = [];

        // Stage 1: Format validation
        const formatCheck = this.validateFormat(answer, question);
        if (!formatCheck.valid) {
            issues.push(formatCheck.issue);
        }

        // Stage 2: Length validation
        const lengthCheck = this.validateLength(answer);
        if (!lengthCheck.valid) {
            issues.push(lengthCheck.issue);
        }

        // Stage 3: Completeness validation
        const completenessCheck = this.validateCompleteness(answer);
        if (!completenessCheck.valid) {
            issues.push(completenessCheck.issue);
        }

        // Stage 4: Relevance validation (uses AI, skip if no API key)
        if (process.env.OPENAI_API_KEY && issues.length === 0) {
            const relevanceCheck = await this.validateRelevance(answer, question);
            if (!relevanceCheck.valid) {
                issues.push(relevanceCheck.issue);
            }
        }

        // If all checks pass
        if (issues.length === 0) {
            return {
                valid: true,
                answer,
                confidence: 95,
                issues: []
            };
        }

        // Self-correction (max 2 iterations)
        if (iteration < 2) {
            console.log(`[Validator] Issues found (iteration ${iteration + 1}):`, issues);
            const correctedAnswer = await this.selfCorrect(answer, question, issues, context);

            if (correctedAnswer && correctedAnswer !== answer) {
                console.log(`[Validator] Self-corrected: "${answer}" → "${correctedAnswer}"`);
                return await this.validate(correctedAnswer, question, context, iteration + 1);
            }
        }

        // Return with issues if self-correction failed
        return {
            valid: false,
            answer,
            confidence: 50,
            issues
        };
    }

    /**
     * Validate answer format based on question type
     * @param {string} answer - Answer
     * @param {string} question - Question
     * @returns {object}
     */
    validateFormat(answer, question) {
        const lowerQ = question.toLowerCase();

        // Check for CTC/salary questions
        if (lowerQ.includes('ctc') || lowerQ.includes('salary') || lowerQ.includes('package')) {
            if (!/\d+/.test(answer)) {
                return { valid: false, issue: 'CTC/salary answer must contain a number' };
            }
        }

        // Check for date questions
        if (lowerQ.includes('date of birth') || lowerQ.includes('dob') || lowerQ.includes('birthday')) {
            if (!/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(answer)) {
                return { valid: false, issue: 'Date answer should be in DD/MM/YYYY format' };
            }
        }

        // Check for yes/no questions
        if (lowerQ.includes('are you') || lowerQ.includes('do you') || lowerQ.includes('willing')) {
            const normalizedAnswer = answer.toLowerCase().trim();
            if (!['yes', 'no', 'maybe'].includes(normalizedAnswer)) {
                return { valid: false, issue: 'Yes/No question should have yes, no, or maybe answer' };
            }
        }

        return { valid: true };
    }

    /**
     * Validate answer length (Naukri expects short answers)
     * @param {string} answer - Answer
     * @returns {object}
     */
    validateLength(answer) {
        const words = answer.trim().split(/\s+/);
        const chars = answer.length;

        if (words.length > 15) {
            return { valid: false, issue: `Answer is too long (${words.length} words, should be < 15)` };
        }

        if (chars > 150) {
            return { valid: false, issue: `Answer is too long (${chars} characters, should be < 150)` };
        }

        return { valid: true };
    }

    /**
     * Validate answer completeness (not empty or vague)
     * @param {string} answer - Answer
     * @returns {object}
     */
    validateCompleteness(answer) {
        if (!answer || answer.trim() === '') {
            return { valid: false, issue: 'Answer is empty' };
        }

        const vagueAnswers = [
            'not sure',
            'maybe',
            "i don't know",
            'unclear',
            'not specified',
            'to be confirmed',
            'tbd'
        ];

        const lowerAnswer = answer.toLowerCase().trim();
        if (vagueAnswers.some(vague => lowerAnswer === vague)) {
            return { valid: false, issue: 'Answer is too vague' };
        }

        return { valid: true };
    }

    /**
     * Validate answer relevance using AI
     * @param {string} answer - Answer
     * @param {string} question - Question
     * @returns {Promise<object>}
     */
    async validateRelevance(answer, question) {
        try {
            await this.rateLimiter.acquire();

            const prompt = `Does the answer "${answer}" properly address the question "${question}"?

Answer with just YES or NO.`;

            const response = await this.client.chat.completions.create({
                model: 'gpt-4',
                max_tokens: 10,
                temperature: 0,
                messages: [{ role: 'user', content: prompt }]
            });

            const result = response.choices[0]?.message?.content?.trim().toUpperCase();

            if (result === 'NO') {
                return { valid: false, issue: 'Answer does not address the question' };
            }

            return { valid: true };
        } catch (error) {
            console.error('[Validator] Relevance check error:', error.message);
            return { valid: true }; // Skip check on error
        }
    }

    /**
     * Self-correct answer based on issues
     * @param {string} answer - Original answer
     * @param {string} question - Question
     * @param {Array} issues - Validation issues
     * @param {object} context - User context
     * @returns {Promise<string>}
     */
    async selfCorrect(answer, question, issues, context) {
        try {
            await this.rateLimiter.acquire();

            const prompt = `You gave this answer to a Naukri.com job application question, but it has issues.

QUESTION: ${question}

YOUR ANSWER: ${answer}

ISSUES:
${issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

USER CONTEXT:
${context.userAnswersData ? JSON.stringify(context.userAnswersData, null, 2) : 'No context available'}

Please provide a CORRECTED answer that:
1. Addresses the issues above
2. Is very short (1-10 words)
3. Uses ONLY information from user context
4. Follows Naukri.com format (short, form-field style)

CORRECTED ANSWER:`;

            const response = await this.client.chat.completions.create({
                model: 'gpt-4',
                max_tokens: 100,
                temperature: 0.3,
                messages: [{ role: 'user', content: prompt }]
            });

            const correctedAnswer = response.choices[0]?.message?.content?.trim();
            return correctedAnswer || answer;
        } catch (error) {
            console.error('[Validator] Self-correction error:', error.message);
            return answer; // Return original on error
        }
    }
}

export default AnswerValidator;
