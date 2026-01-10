/**
 * ======================== AGENT TOOLS ========================
 * Tool definitions for the agentic AI system
 * Each tool can be called by the AI to retrieve specific data
 */

/**
 * Get user profile field value
 * @param {object} args - Tool arguments
 * @param {object} context - Execution context
 * @returns {string|null}
 */
async function getUserProfile(args, context) {
    const { field } = args;
    const { userAnswersData } = context;

    if (!userAnswersData) {
        return null;
    }

    // Map common field names to actual data properties
    const fieldMap = {
        name: userAnswersData.name,
        email: userAnswersData.naukriEmail,
        phone: 'Will be shared during interview',
        currentctc: userAnswersData.currentCTC,
        expectedctc: userAnswersData.expectedCTC,
        location: userAnswersData.location,
        experience: userAnswersData.yearsOfExperience,
        noticeperiod: userAnswersData.noticePeriod,
        availability: userAnswersData.availability,
        dob: userAnswersData.dob
    };

    const normalizedField = field.toLowerCase().replace(/[_\s]/g, '');
    return fieldMap[normalizedField] || null;
}

/**
 * Get skill information with fuzzy matching
 * @param {object} args - Tool arguments
 * @param {object} context - Execution context
 * @returns {object|null}
 */
async function getSkillInfo(args, context) {
    const { skill_name } = args;
    const { skillsData } = context;

    if (!skillsData || skillsData.length === 0) {
        return null;
    }

    const normalizedSearch = skill_name.toLowerCase();

    // Try exact match first
    let skill = skillsData.find(s =>
        (s.skill_name || '').toLowerCase() === normalizedSearch ||
        (s.display_name || '').toLowerCase() === normalizedSearch
    );

    // Try partial match if exact match fails
    if (!skill) {
        skill = skillsData.find(s =>
            (s.skill_name || '').toLowerCase().includes(normalizedSearch) ||
            (s.display_name || '').toLowerCase().includes(normalizedSearch)
        );
    }

    if (!skill) {
        return null;
    }

    return {
        name: skill.display_name || skill.skill_name,
        rating: skill.rating,
        out_of: skill.out_of,
        experience: skill.experience
    };
}

/**
 * Search resume text for keywords
 * @param {object} args - Tool arguments
 * @param {object} context - Execution context
 * @returns {string|null}
 */
async function searchResume(args, context) {
    const { query } = args;
    const { resumeText } = context;

    if (!resumeText || resumeText.trim() === '') {
        return null;
    }

    const normalizedQuery = query.toLowerCase();
    const lines = resumeText.split('\n');

    // Find lines containing the query
    const matchingLines = lines.filter(line =>
        line.toLowerCase().includes(normalizedQuery)
    );

    if (matchingLines.length === 0) {
        return null;
    }

    // Return up to 3 matching lines
    return matchingLines.slice(0, 3).join('\n');
}

/**
 * Get checkbox selection context (user skills and preferences)
 * @param {object} args - Tool arguments
 * @param {object} context - Execution context
 * @returns {object}
 */
async function getCheckboxContext(args, context) {
    const { userAnswersData, skillsData } = context;

    return {
        targetRole: userAnswersData?.targetRole || '',
        location: userAnswersData?.location || '',
        experience: userAnswersData?.yearsOfExperience || 0,
        skills: skillsData?.map(s => s.display_name || s.skill_name) || [],
        availability: userAnswersData?.availability || '',
        noticePeriod: userAnswersData?.noticePeriod || ''
    };
}

/**
 * Tool definitions with schemas
 */
export const AGENT_TOOLS = {
    get_user_profile: {
        name: 'get_user_profile',
        description: 'Get specific user profile field (name, email, currentCTC, expectedCTC, location, experience, noticePeriod, availability, dob)',
        parameters: {
            type: 'object',
            properties: {
                field: {
                    type: 'string',
                    description: 'The profile field to retrieve (e.g., "name", "currentCTC", "location")'
                }
            },
            required: ['field']
        },
        execute: getUserProfile
    },

    get_skill_info: {
        name: 'get_skill_info',
        description: 'Get skill information (rating, experience) with fuzzy matching on skill name',
        parameters: {
            type: 'object',
            properties: {
                skill_name: {
                    type: 'string',
                    description: 'The skill name to search for (e.g., "Java", "React", "Spring Boot")'
                }
            },
            required: ['skill_name']
        },
        execute: getSkillInfo
    },

    search_resume: {
        name: 'search_resume',
        description: 'Search resume text for keywords and return relevant lines',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'The keyword to search for in the resume'
                }
            },
            required: ['query']
        },
        execute: searchResume
    },

    get_checkbox_context: {
        name: 'get_checkbox_context',
        description: 'Get user preferences context for checkbox/radio button selection',
        parameters: {
            type: 'object',
            properties: {}
        },
        execute: getCheckboxContext
    }
};

/**
 * Execute a tool by name
 * @param {string} toolName - Name of the tool
 * @param {object} args - Tool arguments
 * @param {object} context - Execution context
 * @returns {Promise<any>}
 */
export async function executeTool(toolName, args, context) {
    const tool = AGENT_TOOLS[toolName];

    if (!tool) {
        throw new Error(`Tool "${toolName}" not found`);
    }

    try {
        const result = await tool.execute(args, context);
        console.log(`[Tool: ${toolName}] Args:`, args, '→ Result:', result);
        return result;
    } catch (error) {
        console.error(`[Tool: ${toolName}] Error:`, error.message);
        return null;
    }
}

/**
 * Get tool descriptions for AI prompt
 * @returns {string}
 */
export function getToolDescriptions() {
    return Object.values(AGENT_TOOLS)
        .map((tool, index) => `${index + 1}. ${tool.name}(${Object.keys(tool.parameters.properties).join(', ')}) - ${tool.description}`)
        .join('\n');
}
