/**
 * ======================== ANSWER AGENT ========================
 * Main reasoning agent using ReAct loop (Reasoning + Acting)
 * Implements multi-step reasoning for intelligent answer generation
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import { getToolDescriptions } from './AgentTools.js';

dotenv.config();

class AnswerAgent {
    constructor(dataRetriever, validator, rateLimiter) {
        this.dataRetriever = dataRetriever;
        this.validator = validator;
        this.rateLimiter = rateLimiter;
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    /**
     * Process question using ReAct loop
     * @param {string} question - Question to answer
     * @returns {Promise<object>} { answer, reasoning, confidence, toolsUsed }
     */
    async processQuestion(question) {
        const startTime = Date.now();

        try {
            console.log(`[AnswerAgent] ========== Processing Question ==========`);
            console.log(`[AnswerAgent] Question: "${question}"`);

            // Step 1: REASON about the question
            console.log(`[AnswerAgent] Step 1: Reasoning about question...`);
            const reasoning = await this.reason(question);
            console.log(`[AnswerAgent] Reasoning complete:`, {
                thought: reasoning.thought,
                category: reasoning.category,
                actions: reasoning.actions,
                answerFormat: reasoning.answerFormat
            });

            // Step 2: ACT - Execute tools identified in reasoning
            console.log(`[AnswerAgent] Step 2: Executing ${reasoning.actions.length} tools...`);
            const toolResults = await this.executeTools(reasoning.actions);
            console.log(`[AnswerAgent] Tool execution complete:`, toolResults);

            // Step 3: GENERATE answer based on reasoning and tool results
            console.log(`[AnswerAgent] Step 3: Generating answer...`);
            const answer = await this.generateAnswer(question, reasoning, toolResults);
            console.log(`[AnswerAgent] Generated answer: "${answer}"`);

            // Step 4: VALIDATE and self-correct if needed
            console.log(`[AnswerAgent] Step 4: Validating answer...`);
            const context = await this.dataRetriever.getContext();
            const validated = await this.validator.validate(answer, question, context);
            console.log(`[AnswerAgent] Validation result:`, {
                valid: validated.valid,
                answer: validated.answer,
                confidence: validated.confidence,
                issues: validated.issues
            });

            const latency = Date.now() - startTime;
            console.log(`[AnswerAgent] ========== Complete (${latency}ms) ==========`);

            return {
                answer: validated.answer,
                reasoning: reasoning.steps,
                confidence: validated.confidence,
                toolsUsed: reasoning.actions.map(a => a.tool),
                latency
            };
        } catch (error) {
            console.error('[AnswerAgent] ========== ERROR ==========');
            console.error('[AnswerAgent] Error message:', error.message);
            console.error('[AnswerAgent] Error stack:', error.stack);
            console.error('[AnswerAgent] Question that failed:', question);
            console.error('[AnswerAgent] ============================');
            return {
                answer: '',
                reasoning: ['Error occurred during processing'],
                confidence: 0,
                toolsUsed: [],
                error: error.message,
                latency: Date.now() - startTime
            };
        }
    }

    /**
     * Reason about the question and decide which tools to use
     * @param {string} question - Question
     * @returns {Promise<object>} { thought, actions, steps }
     */
    async reason(question) {
        try {
            console.log('[AnswerAgent.reason] Acquiring rate limiter...');
            await this.rateLimiter.acquire();

            const toolDescriptions = getToolDescriptions();
            console.log('[AnswerAgent.reason] Available tools:', toolDescriptions);

            const prompt = `You are answering a Naukri.com job application question. Think step by step about what data you need.

QUESTION: ${question}

AVAILABLE TOOLS:
${toolDescriptions}

THINK STEP BY STEP:
1. What category is this question? (personal/skill/experience/salary/availability/complex)
2. What specific data do I need to answer this?
3. Which tool(s) should I call to get this data?
4. What format should the answer be? (number/date/yes-no/short-text)

FORMAT YOUR RESPONSE:
THOUGHT: [your reasoning about the question]
CATEGORY: [personal|skill|experience|salary|availability|complex]
ACTIONS: [list of tool calls needed, one per line]
  - tool_name(arg_value)
  - tool_name(arg_value)
ANSWER_FORMAT: [how the final answer should look]

Example:
THOUGHT: This asks about Java programming experience
CATEGORY: skill
ACTIONS:
  - get_skill_info("Java")
ANSWER_FORMAT: Number of years (e.g., "3 years")

Now analyze the question:`;

            console.log('[AnswerAgent.reason] Calling Claude API...');
            console.log('[AnswerAgent.reason] API Key present:', !!process.env.OPENAI_API_KEY);

            const response = await this.client.chat.completions.create({
                model: 'gpt-4',
                max_tokens: 300,
                temperature: 0.3,
                messages: [{ role: 'user', content: prompt }]
            });

            console.log('[AnswerAgent.reason] API response received');
            const reasoningText = response.choices[0]?.message?.content || '';
            console.log('[AnswerAgent.reason] Reasoning text:', reasoningText);

            const parsed = this.parseReasoning(reasoningText);
            console.log('[AnswerAgent.reason] Parsed reasoning:', parsed);

            return parsed;
        } catch (error) {
            console.error('[AnswerAgent.reason] ERROR in reason method:');
            console.error('[AnswerAgent.reason] Error type:', error.constructor.name);
            console.error('[AnswerAgent.reason] Error message:', error.message);
            console.error('[AnswerAgent.reason] Error stack:', error.stack);

            if (error.response) {
                console.error('[AnswerAgent.reason] API Response:', error.response);
            }

            throw error; // Re-throw to be caught by processQuestion
        }
    }

    /**
     * Parse reasoning response into structured format
     * @param {string} reasoningText - Raw reasoning text
     * @returns {object}
     */
    parseReasoning(reasoningText) {
        const lines = reasoningText.split('\n');
        const result = {
            thought: '',
            category: 'complex',
            actions: [],
            answerFormat: '',
            steps: []
        };

        let currentSection = '';

        for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith('THOUGHT:')) {
                currentSection = 'thought';
                result.thought = trimmed.replace('THOUGHT:', '').trim();
                result.steps.push(result.thought);
            } else if (trimmed.startsWith('CATEGORY:')) {
                result.category = trimmed.replace('CATEGORY:', '').trim().toLowerCase();
            } else if (trimmed.startsWith('ACTIONS:')) {
                currentSection = 'actions';
            } else if (trimmed.startsWith('ANSWER_FORMAT:')) {
                currentSection = 'format';
                result.answerFormat = trimmed.replace('ANSWER_FORMAT:', '').trim();
            } else if (currentSection === 'actions' && trimmed.startsWith('-')) {
                // Parse tool call: - tool_name(arg)
                const toolMatch = trimmed.match(/- (\w+)\((["']?)(.*?)\2\)/);
                if (toolMatch) {
                    result.actions.push({
                        tool: toolMatch[1],
                        args: this.parseToolArgs(toolMatch[1], toolMatch[3])
                    });
                }
            }
        }

        return result;
    }

    /**
     * Parse tool arguments based on tool name
     * @param {string} toolName - Tool name
     * @param {string} argString - Argument string
     * @returns {object}
     */
    parseToolArgs(toolName, argString) {
        switch (toolName) {
            case 'get_user_profile':
                return { field: argString };
            case 'get_skill_info':
                return { skill_name: argString };
            case 'search_resume':
                return { query: argString };
            case 'get_checkbox_context':
                return {};
            default:
                return {};
        }
    }

    /**
     * Execute tools identified in reasoning
     * @param {Array} actions - Tool actions
     * @returns {Promise<Array>}
     */
    async executeTools(actions) {
        const results = [];

        for (const action of actions) {
            try {
                const result = await this.dataRetriever.executeTool(action.tool, action.args);
                results.push({
                    tool: action.tool,
                    args: action.args,
                    result
                });
            } catch (error) {
                console.error(`[AnswerAgent] Tool ${action.tool} failed:`, error.message);
                results.push({
                    tool: action.tool,
                    args: action.args,
                    result: null,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Generate final answer based on reasoning and tool results
     * @param {string} question - Original question
     * @param {object} reasoning - Reasoning object
     * @param {Array} toolResults - Tool execution results
     * @returns {Promise<string>}
     */
    async generateAnswer(question, reasoning, toolResults) {
        await this.rateLimiter.acquire();

        // Build context from tool results
        const toolContext = toolResults
            .map(tr => `${tr.tool}(${JSON.stringify(tr.args)}) → ${JSON.stringify(tr.result)}`)
            .join('\n');

        const prompt = `You are answering a Naukri.com job application question. Give a VERY SHORT answer (like filling a form field).

QUESTION: ${question}

YOUR REASONING:
${reasoning.thought}

TOOL RESULTS:
${toolContext}

ANSWER FORMAT REQUIREMENT:
${reasoning.answerFormat}

CRITICAL RULES:
1. Answer MUST be very short (1-10 words maximum)
2. Use ONLY information from tool results above
3. If tool results are null/empty, give the best possible answer or empty string
4. No explanations, just the answer
5. Examples of good answers: "3 years", "Yes", "12 LPA", "Immediate"

ANSWER:`;

        const response = await this.client.chat.completions.create({
            model: 'gpt-4',
            max_tokens: 50,
            temperature: 0.3,
            messages: [{ role: 'user', content: prompt }]
        });

        const answer = response.choices[0]?.message?.content?.trim() || '';
        return answer;
    }
}

export default AnswerAgent;
