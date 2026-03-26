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
import Skill from './models/Skill.js';
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
 * Initialize skills from database for a specific user.
 * Uses Sequelize connection pool — no new TCP connection created.
 * @param {string} userId - User ID
 */
export async function initializeSkillsFromDB(userId) {
    try {
        const rows = await Skill.findAll({
            where: { userId },
            attributes: ['skillName', 'displayName', 'rating', 'outOf', 'experience'],
            raw: true,
        });
        // Normalize to snake_case keys expected by findMatchingSkill
        skillsData = rows.map(r => ({
            skill_name: r.skillName,
            display_name: r.displayName,
            rating: r.rating,
            out_of: r.outOf,
            experience: r.experience,
        }));
        console.log(`✅ Loaded ${skillsData.length} skills from DB for user ${userId}`);
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
        // Skill exists in DB but no experience field — use totalExp - 1 as default
        const totalExp = parseInt(userAnswersData?.yearsOfExperience) || 0;
        const defaultExp = Math.max(1, totalExp - 1);
        return `${defaultExp}`;
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

        // ✅ Normalize question first — remove non-breaking spaces, trim
        question = (question || '').replace(/[\u00A0\u200B\t]+/g, ' ').trim();

        const lowerQRaw = question.toLowerCase();

        console.log(`[getAnswer] Received: "${question}"`);

        // ✅ DOB — SIMPLEST check: if 'birth', 'dob', or 'date of birth' anywhere in question → return DOB
        if (lowerQRaw.includes('birth') || lowerQRaw.includes('dob') || lowerQRaw.includes('date of birth')) {
            const dob = userAnswersData?.dob;
            if (dob) {
                const ans = formatDateToDDMMYYYY(dob);
                console.log(`✓ DOB: "${question}" → "${ans}"`);
                return ans;
            }
            console.log(`⚠️ DOB question but no DOB in DB: "${question}"`);
            return '';
        }

        // ✅ DATE-RELATED EARLY DETECTION — catches date questions without '?'
        // Joining date / when can you join
        if (lowerQRaw.includes('joining date') || lowerQRaw.includes('date of joining') ||
            lowerQRaw.includes('when can you join') || lowerQRaw.includes('when will you join') ||
            lowerQRaw.includes('earliest joining') || lowerQRaw.includes('join by')) {
            const ans = userAnswersData?.noticePeriod || '';
            console.log(`✓ Joining Date: "${question}" → "${ans}"`);
            return ans;
        }

        // Availability date
        if (lowerQRaw.includes('availability date') || lowerQRaw.includes('date of availability') ||
            lowerQRaw.includes('available from') || lowerQRaw.includes('available date')) {
            const ans = userAnswersData?.availability || userAnswersData?.noticePeriod || '';
            console.log(`✓ Availability Date: "${question}" → "${ans}"`);
            return ans;
        }

        // ✅ INFORMATIONAL MESSAGE DETECTION — silently skip, no "Ignored" log
        // These are chatbot instructions, not questions requiring text input
        const informationalPatterns = [
            'you can choose', 'please choose', 'please select',
            'upto 10', 'up to 10', 'select upto', 'select up to',
            'cities that you', 'cities you\'d like', 'cities you would like',
            'choose your preferred', 'select your preferred'
        ];
        const isInformational = informationalPatterns.some(k => lowerQRaw.includes(k));
        if (isInformational) {
            console.log(`[getAnswer] Informational message — skipping silently: "${question}"`);
            return '';
        }

        // ✅ DIRECT SKILL EXPERIENCE CHECK (most common chatbot pattern)
        // e.g. "What is your experience working with Angular"
        // e.g. "How many years of experience do you have in React"
        if (lowerQRaw.includes('experience') || lowerQRaw.includes('years of experience')) {
            const matchingSkillDirect = findMatchingSkill(question);
            if (matchingSkillDirect) {
                const ans = generateSkillAnswer(question, matchingSkillDirect);
                console.log(`✓ Direct Skill: "${question}" → "${ans}"`);
                return ans;
            }
            // Skill not in DB but question is about skill experience
            if (lowerQRaw.includes('working') || lowerQRaw.includes(' with ') ||
                lowerQRaw.includes(' in ') || lowerQRaw.includes(' using ')) {
                const totalExp = parseInt(userAnswersData?.yearsOfExperience) || 0;
                const ans = `${Math.max(1, totalExp - 1)}`;
                console.log(`✓ Direct Skill (not in DB): "${question}" → "${ans}"`);
                return ans;
            }
        }

        // ✅ Location early detection - before isValidInterviewQuestion filter
        // (Chatbot often sends "Current Location" without '?' — same fix as DOB)
        const locationKeywords = [
            'current location', 'current city', 'current place', 'current residence',
            'present location', 'present city', 'residential location', 'residential city',
            'preferred location', 'preferred city', 'work location', 'home location',
            'hometown', 'home town', 'home city', 'where are you based',
            'where do you live', 'where are you located', 'where are you currently',
            'place of residence', 'office location', 'job location',
            'select the city', 'select your city', 'select city',
            'residing', 'relocate to', 'relocation',
            'location', 'city'
        ];
        const isLocationQuestion = locationKeywords.some(k => lowerQRaw.includes(k));

        if (isLocationQuestion) {
            const loc = userAnswersData?.location;
            if (loc && loc.trim() !== '') {
                console.log(`✓ Location Question: "${question}" → "${loc}" (from DB)`);
                return loc;
            }
            console.log(`⚠️  Location question found but no location in DB: "${question}"`);
            return '';
        }

        // ✅ YES/NO early detection - before validation filter
        // Questions like "Are you ok with permanent?", "Are you comfortable with contract?" etc.
        const yesNoKeywords = [
            'are you ok', 'are you comfortable', 'are you willing', 'are you open',
            'are you fine', 'are you agreeable', 'are you available',
            'ok with permanent', 'ok with contract', 'ok with full time', 'ok with fulltime',
            'comfortable with', 'willing to', 'open to relocation', 'open to work',
            'do you agree', 'do you accept', 'would you be ok', 'would you be willing',
            'can you work', 'can you join', 'are you interested'
        ];
        const isYesNoQuestion = yesNoKeywords.some(k => lowerQRaw.includes(k));
        if (isYesNoQuestion) {
            console.log(`✓ Yes/No Question: "${question}" → "Yes"`);
            return 'Yes';
        }

        // ✅ Skill early detection - before isValidInterviewQuestion filter
        // Normalize whitespace first (chatbot may send non-breaking spaces \u00A0)
        const lowerQSkill = lowerQRaw.replace(/\s+/g, ' ').trim();
        const isSkillExpQuestion =
            (lowerQSkill.includes('experience') || lowerQSkill.includes('years') || lowerQSkill.includes('worked')) &&
            /\b(with|in|using|on|working)\b/.test(lowerQSkill);

        if (isSkillExpQuestion) {
            const matchingSkillEarly = findMatchingSkill(question);
            if (matchingSkillEarly) {
                const skillAnswer = generateSkillAnswer(question, matchingSkillEarly);
                console.log(`✓ Skill Question (early): "${question}" → "${skillAnswer}" (from skills DB)`);
                return skillAnswer;
            }
            // Skill not in DB - use totalExp - 1
            const totalExpEarly = parseInt(userAnswersData?.yearsOfExperience) || 0;
            const defaultExpEarly = Math.max(1, totalExpEarly - 1);
            console.log(`✓ Skill Question (early): "${question}" → "${defaultExpEarly}" (skill not in DB)`);
            return `${defaultExpEarly}`;
        }

        // ✅ Validate question first
        if (!isValidInterviewQuestion(question)) {
            console.log(`⚠️ Ignored non-interview question: "${question}"`);
            return '';
        }

        // DISABLED AGENTIC AI - Using pattern matching only
        // if (agenticService) { ... }

        // Use pattern matching logic
        // STEP 1: Check if question is skill-related
        const matchingSkill = findMatchingSkill(question);
        if (matchingSkill) {
            const skillAnswer = generateSkillAnswer(question, matchingSkill);
            console.log(`✓ Question: "${question}" → "${skillAnswer}" (from skills DB)`);
            return skillAnswer;
        }

        // STEP 1.5: Skill not found in DB — if question is skill-specific experience, use totalExp - 1
        const isSkillExpQuestionLate =
            (lowerQSkill.includes('experience') || lowerQSkill.includes('years') || lowerQSkill.includes('worked')) &&
            (lowerQSkill.includes(' with ') || lowerQSkill.includes(' in ') || lowerQSkill.includes(' using ') || lowerQSkill.includes(' on '));

        if (isSkillExpQuestionLate) {
            const totalExp = parseInt(userAnswersData?.yearsOfExperience) || 0;
            const defaultExp = Math.max(1, totalExp - 1);
            console.log(`✓ Question: "${question}" → "${defaultExp}" (skill not in DB, using yearsOfExp-1)`);
            return `${defaultExp}`;
        }

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

            // Location — specific multi-word keys first, then generic fallbacks
            'current location': () => location || '',
            'current city': () => location || '',
            'current place': () => location || '',
            'current residence': () => location || '',
            'place of residence': () => location || '',
            'residential location': () => location || '',
            'residential city': () => location || '',
            'residential address': () => location || '',
            'present location': () => location || '',
            'present city': () => location || '',
            'where are you based': () => location || '',
            'where do you live': () => location || '',
            'where do you currently live': () => location || '',
            'where are you located': () => location || '',
            'where are you currently located': () => location || '',
            'where are you currently residing': () => location || '',
            'preferred location': () => location || '',
            'preferred city': () => location || '',
            'preferred work location': () => location || '',
            'work location': () => location || '',
            'office location': () => location || '',
            'job location': () => location || '',
            'home location': () => location || '',
            'home city': () => location || '',
            'hometown': () => location || '',
            'home town': () => location || '',
            // generic fallbacks
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

            // Salary - specific checks FIRST (expected before current, to avoid wrong match)
            'expected salary': () => expectedCTC || '',
            'expected ctc': () => expectedCTC || '',
            'hike': () => expectedCTC || '',
            expectation: () => expectedCTC || '',
            'current salary': () => currentCTC || '',
            'current ctc': () => currentCTC || '',
            // generic fallbacks — only reached if neither 'expected' nor 'current' matched above
            salary: () => currentCTC || '',
            ctc: () => currentCTC || '',

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
 * Set skills data directly (used by Electron automation bots that already have skills in config)
 * @param {Array} skills - Array of {skill_name, display_name, rating, out_of, experience}
 */
export function setSkillsData(skills) {
    skillsData = Array.isArray(skills) ? skills : [];
    console.log(`✅ Skills data set directly: ${skillsData.length} skills`);
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

    // Ignore greetings or generic messages (NOT '?' check — chatbot forms rarely end with '?')
    const greetings = [
        'hi ', 'hello ', 'thank you', 'thanks', 'showing interest',
        'congratulations', 'great job', 'well done'
    ];

    const lowerQ = question.toLowerCase().trim();

    // ✅ Always treat DOB/date-of-birth questions as valid, regardless of word count
    if (lowerQ.includes('birth') || lowerQ.includes('dob') || lowerQ.includes('date of birth')) {
        return true;
    }

    // Ignore very short strings (1-2 words, likely labels not questions)
    if (lowerQ.split(' ').length < 3) return false;

    for (const greet of greetings) {
        if (lowerQ.startsWith(greet) || lowerQ.includes(greet)) {
            return false;
        }
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
