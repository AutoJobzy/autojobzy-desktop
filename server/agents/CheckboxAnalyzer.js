/**
 * ======================== CHECKBOX ANALYZER ========================
 * AI-powered checkbox/radio button selection
 * Uses reasoning to match options with user profile
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class CheckboxAnalyzer {
    constructor(dataRetriever, rateLimiter) {
        this.dataRetriever = dataRetriever;
        this.rateLimiter = rateLimiter;
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    /**
     * Select best option from checkbox/radio list
     * @param {Array} options - Array of option objects with label
     * @param {string} question - Question text
     * @returns {Promise<object>} { selectedIndex, reasoning, confidence }
     */
    async selectBestOption(options, question) {
        try {
            // Get user context
            const context = await this.dataRetriever.getContext();

            // Fallback if no API key
            if (!process.env.OPENAI_API_KEY) {
                console.log('[CheckboxAnalyzer] No API key, using fallback');
                return this.fallbackSelection(options, context);
            }

            await this.rateLimiter.acquire();

            // Build options list for prompt
            const optionsList = options
                .map((opt, i) => `${i + 1}. ${opt.label}`)
                .join('\n');

            // Build user profile summary
            const profileSummary = this.buildProfileSummary(context);

            const prompt = `You are helping select the best checkbox/radio option for a Naukri.com job application.

QUESTION: ${question}

OPTIONS:
${optionsList}

USER PROFILE:
${profileSummary}

THINK STEP BY STEP:
1. What is this question asking about?
2. Which user profile details are relevant?
3. Which option best matches the user's profile?
4. If no good match, what's the safest default option?

RESPOND IN THIS FORMAT:
REASONING: [step-by-step thinking]
SELECTED_OPTION: [number between 1 and ${options.length}]
CONFIDENCE: [LOW|MEDIUM|HIGH]

Example:
REASONING: Question asks about willingness to relocate. User is already in Bangalore. Option 1 "Yes" shows flexibility even though relocation not needed.
SELECTED_OPTION: 1
CONFIDENCE: HIGH

Now analyze:`;

            const response = await this.client.chat.completions.create({
                model: 'gpt-4',
                max_tokens: 200,
                temperature: 0.3,
                messages: [{ role: 'user', content: prompt }]
            });

            const analysisText = response.choices[0]?.message?.content || '';
            return this.parseAnalysis(analysisText, options);
        } catch (error) {
            console.error('[CheckboxAnalyzer] Error:', error.message);
            // Fallback to first option on error
            return {
                selectedIndex: 0,
                reasoning: 'Error occurred, selected first option',
                confidence: 'LOW'
            };
        }
    }

    /**
     * Build profile summary for prompt
     * @param {object} context - User context
     * @returns {string}
     */
    buildProfileSummary(context) {
        const { userAnswersData, skillsData } = context;

        const parts = [];

        if (userAnswersData.targetRole) {
            parts.push(`- Target Role: ${userAnswersData.targetRole}`);
        }
        if (userAnswersData.location) {
            parts.push(`- Location: ${userAnswersData.location}`);
        }
        if (userAnswersData.yearsOfExperience) {
            parts.push(`- Experience: ${userAnswersData.yearsOfExperience} years`);
        }
        if (userAnswersData.currentCTC) {
            parts.push(`- Current CTC: ${userAnswersData.currentCTC} LPA`);
        }
        if (userAnswersData.noticePeriod) {
            parts.push(`- Notice Period: ${userAnswersData.noticePeriod}`);
        }
        if (userAnswersData.availability) {
            parts.push(`- Availability: ${userAnswersData.availability}`);
        }
        if (skillsData && skillsData.length > 0) {
            const skillNames = skillsData
                .map(s => s.display_name || s.skill_name)
                .slice(0, 10) // Top 10 skills
                .join(', ');
            parts.push(`- Skills: ${skillNames}`);
        }

        return parts.length > 0 ? parts.join('\n') : 'No profile data available';
    }

    /**
     * Parse AI analysis response
     * @param {string} analysisText - Raw analysis
     * @param {Array} options - Original options
     * @returns {object}
     */
    parseAnalysis(analysisText, options) {
        const lines = analysisText.split('\n');
        let reasoning = '';
        let selectedOption = 1;
        let confidence = 'MEDIUM';

        for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith('REASONING:')) {
                reasoning = trimmed.replace('REASONING:', '').trim();
            } else if (trimmed.startsWith('SELECTED_OPTION:')) {
                const match = trimmed.match(/\d+/);
                if (match) {
                    selectedOption = parseInt(match[0], 10);
                }
            } else if (trimmed.startsWith('CONFIDENCE:')) {
                confidence = trimmed.replace('CONFIDENCE:', '').trim().toUpperCase();
            }
        }

        // Validate selected option is within range
        if (selectedOption < 1 || selectedOption > options.length) {
            selectedOption = 1;
        }

        return {
            selectedIndex: selectedOption - 1, // Convert to 0-based index
            reasoning,
            confidence
        };
    }

    /**
     * Fallback selection using simple pattern matching
     * @param {Array} options - Options
     * @param {object} context - User context
     * @returns {object}
     */
    fallbackSelection(options, context) {
        const { userAnswersData } = context;

        // Try to match with user location
        if (userAnswersData.location) {
            const locationMatch = options.findIndex(opt =>
                opt.label.toLowerCase().includes(userAnswersData.location.toLowerCase())
            );
            if (locationMatch !== -1) {
                return {
                    selectedIndex: locationMatch,
                    reasoning: 'Matched user location (fallback)',
                    confidence: 'MEDIUM'
                };
            }
        }

        // Default to first option
        return {
            selectedIndex: 0,
            reasoning: 'Selected first option (fallback)',
            confidence: 'LOW'
        };
    }
}

export default CheckboxAnalyzer;
