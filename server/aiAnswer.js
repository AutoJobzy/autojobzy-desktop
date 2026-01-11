/**
 * ======================== AI ANSWER MODULE (ENHANCED) ========================
 * Handles Naukri.com bot questions with SHORT, RELEVANT answers
 *
 * FEATURES:
 * ✅ Very short answers (like form fields) - e.g., "3 years", "Yes", "8 LPA"
 * ✅ Uses user's resume text + personal data from database
 * ✅ Smart skill matching from skills table
 * ✅ Intelligent fallback - gives best answer from available data
 * ✅ AI-powered for complex questions with strict short answer prompt
 *
 * DATA SOURCES:
 * - Resume text (uploaded by user)
 * - User personal data (name, CTC, location, notice period, DOB, availability)
 * - Skills data (with ratings and experience)
 * - AI model (Claude 3.5 Sonnet) for complex questions
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import AgenticAnswerService from './services/AgenticAnswerService.js';

dotenv.config();

// Store resume text, user data, and skills for current session
let resumeText = '';
let userAnswersData = null;
let skillsData = [];

// Agentic AI service (initialized when user logs in)
let agenticService = null;

/**
 * Initialize resume text from file or default resume
 * @param {string} fileText - Optional resume text from uploaded file
 */
export function initializeResume(fileText) {
    if (fileText) {
        resumeText = fileText;
        console.log('📄 Resume initialized from uploaded file');
    } else {
        // No default resume - must be provided by user
        resumeText = '';
        console.log('⚠️  No resume provided - answers will be limited to skill data and common questions');
    }
}

/**
 * Set user answers data from database
 * @param {object} data - User data from database (name, ctc, location, etc.)
 */
export function setUserAnswersData(data) {
    userAnswersData = data;
    console.log('✅ User answers data loaded from database');
}

// Export alias for backward compatibility
export const setUserData = setUserAnswersData;

/**
 * Initialize skills from database for a specific user
 * @param {string} userId - User ID
 * @param {object} dbConfig - Database configuration
 */
export async function initializeSkillsFromDB(userId, dbConfig) {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            "SELECT skill_name, display_name, rating, out_of, experience FROM skills WHERE user_id = ?",
            [userId]
        );
        skillsData = rows;
        await connection.end();
        console.log(`✅ Loaded ${rows.length} skills from database for user ${userId}`);
    } catch (err) {
        console.error("❌ Error loading skills from DB:", err.message);
        skillsData = [];
    }
}

/**
 * Initialize agentic AI service for intelligent answer generation
 * @param {string} userId - User ID
 * @param {object} dbConfig - Database configuration
 */
export function initializeAgenticService(userId, dbConfig) {
    try {
        agenticService = new AgenticAnswerService(userId, dbConfig);
        console.log('✅ Agentic AI system initialized');
    } catch (error) {
        console.error('❌ Error initializing agentic service:', error.message);
        agenticService = null;
    }
}

/**
 * Detect if question is skill-related and find matching skill
 * @param {string} question - Interview question
 * @returns {object|null} Matching skill or null
 */
function findMatchingSkill(question) {
    if (!question || skillsData.length === 0) return null;

    const normalizedQuestion = question.toLowerCase();

    // Try to find exact or partial match with skill_name or display_name
    for (const skill of skillsData) {
        const skillName = (skill.skill_name || '').toLowerCase();
        const displayName = (skill.display_name || '').toLowerCase();

        if (normalizedQuestion.includes(skillName) || normalizedQuestion.includes(displayName)) {
            return skill;
        }
    }

    return null;
}

/**
 * Generate answer for skill-related questions
 * @param {string} question - Interview question
 * @param {object} skill - Skill data from database
 * @returns {string} Answer
 */
function generateSkillAnswer(question, skill) {
    const normalizedQuestion = question.toLowerCase();

    // Experience-related questions
    if (normalizedQuestion.includes('experience') || normalizedQuestion.includes('worked') ||
        normalizedQuestion.includes('using') || normalizedQuestion.includes('years')) {
        if (skill.experience) {
            return `${skill.experience}`;
        }
        return `3 years`;
    }

    // Rating/Proficiency questions
    if (normalizedQuestion.includes('rate') || normalizedQuestion.includes('rating') ||
        normalizedQuestion.includes('proficient') || normalizedQuestion.includes('good') ||
        normalizedQuestion.includes('scale') || normalizedQuestion.includes('expertise')) {
        if (skill.rating && skill.out_of) {
            return `${skill.rating}/${skill.out_of}`;
        } else if (skill.rating) {
            return `${skill.rating}/10`;
        }
        return `7/10`;
    }

    // General skill questions - just return experience or default
    if (skill.experience) {
        return `${skill.experience}`;
    }

    // Skill exists but no detailed data
    return `Working knowledge`;
}

/**
 * Extract years of experience from resume
 * @param {string} text - Resume text
 * @returns {string|null} Years of experience
 */
function extractExperience(text) {
    const regex = /(\d+)\+?\s+years?/i;
    const match = text.match(regex);
    return match ? match[1] : null;
}

/**
 * Format date from YYYY-MM-DD to DD/MM/YYYY
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Date in DD/MM/YYYY format
 */
function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (error) {
        return null;
    }
}

/**
 * Generate answer for interview question using OpenAI + Database
 * Fetches dynamic data from user's database profile
 * @param {string} question - Interview question
 * @returns {Promise<string>} AI-generated answer
 */
export async function getAnswer(question) {
    try {


        // ✅ Validate question first
        if (!isValidInterviewQuestion(question)) {
            console.log(`⚠️ Ignored non-interview question: "${question}"`);
            return ''; // Empty answer, or you can return a polite message like:
            // return 'This does not seem like a valid interview question.';
        }

        // DISABLED AGENTIC AI - Using pattern matching only
        // if (agenticService) {
        //     try {
        //         const result = await agenticService.getAnswer(question);
        //         console.log(`🤖 Agentic: "${result.answer}" (confidence: ${result.confidence}%)`);
        //         return result.answer;
        //     } catch (agenticError) {
        //         console.error('⚠️ Agentic service error, falling back to legacy system:', agenticError.message);
        //     }
        // }

        // Use pattern matching logic
        // STEP 1: Check if question is skill-related
        const matchingSkill = findMatchingSkill(question);
        if (matchingSkill) {
            const skillAnswer = generateSkillAnswer(question, matchingSkill);
            console.log(`✓ Question: "${question}" → "${skillAnswer}" (from skills DB)`);
            return skillAnswer;
        }

        // STEP 2: Get data from database if available, else use defaults
        // STEP 2: Get data from database (NO DEFAULTS)
        const name = userAnswersData?.name;
        const currentCTC = userAnswersData?.currentCTC;
        const expectedCTC = userAnswersData?.expectedCTC;
        const noticePeriod = userAnswersData?.noticePeriod;
        const location = userAnswersData?.location;
        const yearsOfExperience = userAnswersData?.yearsOfExperience;
        const naukriEmail = userAnswersData?.naukriEmail;
        const dob = userAnswersData?.dob;
        const availability = userAnswersData?.availability;

        // STEP 2.5: Check for city residence questions (e.g., "Are you currently residing in Pune?")
        const residingPattern = /(?:residing|living|staying|located|reside|live|stay)\s+(?:in|at)\s+([a-zA-Z\s]+?)(?:\?|$)/i;
        const residingMatch = question.match(residingPattern);

        if (residingMatch) {
            const askedCity = residingMatch[1].trim().toLowerCase();
            if (!location || location.trim() === '') {
                return ''; // No location data available
            }
            const storedLocation = location.toLowerCase();
            // Check if stored location contains the asked city
            if (storedLocation.includes(askedCity) || askedCity.includes(storedLocation)) {
                console.log(`✓ Question: "${question}" → "Yes" (city match)`);
                return 'Yes';
            } else {
                console.log(`✓ Question: "${question}" → "No" (city mismatch)`);
                return 'No';
            }
        }

        // STEP 3: Predefined answers for common questions (using dynamic DB values)
        const commonAnswers = {

            // Personal
            name: () => name,
            fullname: () => name,
            email: () => naukriEmail,
            phone: () => 'Will be shared during interview',

            // Date of Birth
            dob: () => dob ? formatDateToDDMMYYYY(dob) : null,
            dateofbirth: () => dob ? formatDateToDDMMYYYY(dob) : null,
            birthdate: () => dob ? formatDateToDDMMYYYY(dob) : null,
            birthday: () => dob ? formatDateToDDMMYYYY(dob) : null,
            age: () => {
                if (!dob) return null;
                const birthDate = new Date(dob);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                return `${age} years`;
            },

            // Experience
            experience: () => `${yearsOfExperience} years`,
            totalExperience: () => `${yearsOfExperience} years`,

            // Location
            location: () => location || '',
            city: () => location || '',
            state: () => 'Maharashtra',
            country: () => 'India',

            // Notice Period
            notice: () => noticePeriod || '',
            noticePeriod: () => noticePeriod || '',
            joining: () => noticePeriod || '',

            // Availability (face-to-face meetings)
            availability: () => availability || '',
            faceToFace: () => availability || '',
            meeting: () => availability || '',

            // Salary - Short answers (just numbers)
            currentSalary: () => currentCTC || '',
            salary: () => currentCTC || '',
            currentctc: () => currentCTC || '',
            ctc: () => currentCTC || '',

            expectedSalary: () => expectedCTC || '',
            expectedctc: () => expectedCTC || '',
            expectation: () => expectedCTC || '',

            // Interview
            interviewMode: () => 'Online',
            mode: () => 'Online',

            // Default fallback
            default: () => '',
        };


        // const commonAnswers = {
        //     experience: () => `${yearsOfExperience} years`,
        //     notice: () => noticePeriod,
        //     noticePeriod: () => noticePeriod,
        //     name: () => name,
        //     fullname: () => name,
        //     location: () => location,
        //     city: () => location,
        //     state: () => 'Not specified',
        //     country: () => 'India',
        //     currentSalary: () => currentCTC,
        //     salary: () => currentCTC,
        //     currentctc: () => currentCTC,
        //     expectedSalary: () => expectedCTC,
        //     expectedctc: () => expectedCTC,
        //     faceToFace: () => 'Not available for face-to-face interviews at the moment',
        //     interviewMode: () => 'Online preferred',
        //     availability: () => 'Available immediately',
        //     email: () => naukriEmail,
        //     phone: () => 'Available upon request',
        // };

        // Check for common questions (case-insensitive)
        const lowerQuestion = question.toLowerCase();
        for (const [key, answerFn] of Object.entries(commonAnswers)) {
            if (lowerQuestion.includes(key)) {
                const answer = answerFn();
                console.log(`✓ Question: "${question}" → "${answer}" (from DB)`);
                return answer;
            }
        }

        // AI DISABLED - No complex question handling, just return empty
        console.log(`⚠️  Question: "${question}" → No match in pattern matching, returning empty`);
        const answer = '';
        return answer;
    } catch (error) {
        console.error('❌ Error in getAnswer:', error.message);
        return 'I prefer not to answer this question at the moment.';
    }
}

/**
 * Get resume text for display
 * @returns {string} Resume text
 */
export function getResumeText() {
    return resumeText;
}

function isValidInterviewQuestion(question) {
    if (!question || question.trim() === '') return false;

    // Ignore greetings or generic messages
    const greetings = [
        'hi', 'hello', 'thank you', 'kindly answer', 'please answer', 'showing interest'
    ];

    const lowerQ = question.toLowerCase();
    for (const greet of greetings) {
        if (lowerQ.includes(greet)) {
            return false; // It's a greeting or non-question
        }
    }

    // Check if question ends with '?'
    if (!question.trim().endsWith('?')) {
        return false; // Not a proper question
    }

    return true; // Valid question
}

/**
 * Get checkbox/radio selection using agentic AI
 * @param {Array} options - Array of option objects with label
 * @param {string} question - Question text
 * @param {string} userId - User ID (optional, for context)
 * @returns {Promise<number>} Selected option index
 */
export async function getCheckboxSelection(options, question, userId = null) {
    if (agenticService) {
        try {
            const result = await agenticService.analyzeCheckboxOptions(options, question);
            return result.selectedIndex;
        } catch (error) {
            console.error('[getCheckboxSelection] Error:', error.message);
            return 0; // Fallback to first option
        }
    }

    // Fallback to first option if agentic service not available
    return 0;
}

/**
 * Get reasoning log from agentic service
 * @returns {Array} Reasoning log entries
 */
export function getReasoningLog() {
    if (agenticService) {
        return agenticService.getReasoningLog();
    }
    return [];
}
