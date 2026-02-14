/**
 * ==================== RECOMMENDED JOBS AUTOMATION ====================
 * Runs Puppeteer automation for Naukri Recommended Jobs page
 * Navigates to https://www.naukri.com/mnjuser/recommendedjobs
 * Applies to all recommended jobs using same answer management
 * Runs entirely on user's computer with visible browser
 */

import { launchBrowser } from '../../server/utils/puppeteerHelper.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Global state
let browser = null;
let isRunning = false;

// User data for AI answers (loaded from AWS)
let userAnswersData = null;
let skillsData = [];

/**
 * Delay helper
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Find matching skill from database
 */
function findMatchingSkill(question) {
    if (!question || skillsData.length === 0) return null;

    const normalizedQuestion = question.toLowerCase();

    // Try to find exact or partial match with skill_name or display_name
    for (const skill of skillsData) {
        const skillName = (skill.skill_name || skill.name || '').toLowerCase();
        const displayName = (skill.display_name || skill.name || '').toLowerCase();

        if (normalizedQuestion.includes(skillName) || normalizedQuestion.includes(displayName)) {
            return skill;
        }
    }

    return null;
}

/**
 * Generate answer for skill-related questions
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
 * Validate if question is a valid interview question
 * Returns false for greetings, messages without '?', etc.
 */
function isValidInterviewQuestion(question) {
    if (!question || question.trim() === '') return false;

    // Ignore greetings or generic messages
    const greetings = [
        'hi', 'hello', 'thank you', 'kindly answer', 'please answer',
        'showing interest', 'successfully apply'
    ];

    const lowerQ = question.toLowerCase();
    for (const greet of greetings) {
        if (lowerQ.includes(greet)) {
            return false; // It's a greeting or non-question
        }
    }

    // ✅ Check if question ends with '?'
    if (!question.trim().endsWith('?')) {
        return false; // Not a proper question
    }

    return true; // Valid question
}

/**
 * Generate intelligent answer for chatbot question
 * Uses pattern matching based on user data from database + SKILLS
 */
function getIntelligentAnswer(question) {
    // ✅ VALIDATE QUESTION FIRST
    if (!isValidInterviewQuestion(question)) {
        console.log(`⚠️ Ignored non-interview question: "${question}"`);
        return ''; // Return empty for invalid questions
    }

    if (!userAnswersData) {
        return "Yes, I'm interested";
    }

    const lowerQuestion = question.toLowerCase();

    // ✅ STEP 1: Check if question is skill-related
    const matchingSkill = findMatchingSkill(question);
    if (matchingSkill) {
        const skillAnswer = generateSkillAnswer(question, matchingSkill);
        console.log(`✓ Skill Question: "${question}" → "${skillAnswer}" (from skills DB)`);
        return skillAnswer;
    }

    // Check for city residence questions
    const residingPattern = /(?:residing|living|staying|located|reside|live|stay)\s+(?:in|at)\s+([a-zA-Z\s]+?)(?:\?|$)/i;
    const residingMatch = question.match(residingPattern);

    if (residingMatch && userAnswersData.location) {
        const askedCity = residingMatch[1].trim().toLowerCase();
        const storedLocation = userAnswersData.location.toLowerCase();
        if (storedLocation.includes(askedCity) || askedCity.includes(storedLocation)) {
            return 'Yes';
        } else {
            return 'No';
        }
    }

    // Pattern matching for common questions
    const patterns = {
        // Experience
        experience: () => userAnswersData.yearsOfExperience ? `${userAnswersData.yearsOfExperience} years` : null,
        totalexperience: () => userAnswersData.yearsOfExperience ? `${userAnswersData.yearsOfExperience} years` : null,

        // Location
        location: () => userAnswersData.location || null,
        city: () => userAnswersData.location || null,

        // Notice Period
        notice: () => userAnswersData.noticePeriod || null,
        noticeperiod: () => userAnswersData.noticePeriod || null,
        joining: () => userAnswersData.noticePeriod || null,

        // Salary
        currentsalary: () => userAnswersData.currentCTC || null,
        salary: () => userAnswersData.currentCTC || null,
        currentctc: () => userAnswersData.currentCTC || null,
        ctc: () => userAnswersData.currentCTC || null,

        expectedsalary: () => userAnswersData.expectedCTC || null,
        expectedctc: () => userAnswersData.expectedCTC || null,
        expectation: () => userAnswersData.expectedCTC || null,

        // Availability
        availability: () => userAnswersData.availability || null,
        facetoface: () => userAnswersData.availability || null,
        meeting: () => userAnswersData.availability || null,

        // Name
        name: () => userAnswersData.name || null,
        fullname: () => userAnswersData.name || null,
    };

    // Try to find matching pattern
    for (const [key, answerFn] of Object.entries(patterns)) {
        if (lowerQuestion.includes(key)) {
            const answer = answerFn();
            if (answer) {
                return answer;
            }
        }
    }

    // Default fallback for valid questions with no pattern match
    // (Question has '?' and is not a greeting, but we don't have specific data)
    return "Yes, I'm interested";
}

/**
 * Safe navigation with retry
 */
async function safeGoto(page, url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await page.goto(url, {
                waitUntil: "domcontentloaded",
                timeout: 45000
            });
            await delay(2000);
            return true;
        } catch (error) {
            if (attempt === maxRetries) {
                return false;
            }
            await delay(3000);
        }
    }
    return false;
}

/**
 * Auto-scroll page
 */
async function autoScroll(page) {
    await page.evaluate(() => {
        return new Promise(resolve => {
            let totalHeight = 0;
            const distance = 400;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 300);
        });
    });
}

/**
 * Login to Naukri
 */
async function loginToNaukri(page, email, password, addLog) {
    try {
        addLog('Opening Naukri login page...', 'info');
        const loginPageLoaded = await safeGoto(page, 'https://www.naukri.com/nlogin/login');
        if (!loginPageLoaded) {
            return false;
        }
        await delay(3000);

        addLog('Locating login fields...', 'info');

        // Email selectors
        const emailSelectors = [
            '#usernameField',
            'input[type="text"]',
            'input[placeholder*="Email"]',
            'input[placeholder*="email"]',
        ];

        // Password selectors
        const passwordSelectors = [
            '#passwordField',
            'input[type="password"]',
        ];

        // Find email field
        let emailSelector = null;
        for (const selector of emailSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    emailSelector = selector;
                    addLog(`✅ Found email field: ${selector}`, 'success');
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!emailSelector) {
            addLog('❌ Could not find email field', 'error');
            return false;
        }

        // Find password field
        let passSelector = null;
        for (const selector of passwordSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    passSelector = selector;
                    addLog(`✅ Found password field: ${selector}`, 'success');
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!passSelector) {
            addLog('❌ Could not find password field', 'error');
            return false;
        }

        // Enter credentials
        addLog('Entering credentials...', 'info');
        await page.click(emailSelector, { clickCount: 3 }).catch(() => {});
        await delay(200);
        await page.type(emailSelector, email, { delay: 100 });
        await delay(800);

        await page.click(passSelector, { clickCount: 3 }).catch(() => {});
        await delay(200);
        await page.type(passSelector, password, { delay: 100 });
        await delay(800);

        // Submit
        addLog('Submitting login form...', 'info');
        const submitSelectors = [
            "button[type='submit'].blue-btn",
            "button[type='submit']",
            "button.btn-large.blue-btn",
        ];

        let submitted = false;
        for (const selector of submitSelectors) {
            try {
                const submitBtn = await page.$(selector);
                if (submitBtn) {
                    await submitBtn.click();
                    submitted = true;
                    addLog(`✅ Clicked submit button`, 'info');
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!submitted) {
            addLog('No submit button found, pressing Enter...', 'info');
            await page.focus(passSelector);
            await page.keyboard.press('Enter');
        }

        // Wait for login response
        addLog('Waiting for login response...', 'info');
        await delay(5000);

        // Check if login successful
        const currentUrl = page.url();
        if (currentUrl.includes('nlogin')) {
            addLog('Login failed - still on login page', 'error');
            return false;
        }

        addLog('Login successful!', 'success');

        // Close popups
        try {
            const closeButtons = ['.crossIcon', '[class*="close"]', '.styles_modal-close__'];
            for (const selector of closeButtons) {
                try {
                    const closeBtn = await page.$(selector);
                    if (closeBtn) {
                        await closeBtn.click().catch(() => {});
                        await delay(500);
                    }
                } catch (e) {
                    // Ignore
                }
            }
            await page.keyboard.press('Escape').catch(() => {});
            await delay(500);
        } catch (e) {
            // Popups are optional
        }

        addLog('Session stabilized, ready to proceed', 'success');
        return true;

    } catch (error) {
        addLog(`Login error: ${error.message}`, 'error');
        return false;
    }
}

/**
 * Handle chatbot checkbox questions
 */
async function handleCheckBox(page, addLog) {
    try {
        const checkboxSelector = ".checkBoxContainer input[type='radio'], .checkBoxContainer input[type='checkbox']";
        const checkboxes = await page.$$(checkboxSelector);

        if (!checkboxes || checkboxes.length === 0) {
            return false;
        }

        addLog(`Found ${checkboxes.length} checkbox options`, 'info');

        // Get checkbox data
        const checkboxData = await page.evaluate((selector) => {
            const inputs = document.querySelectorAll(selector);
            return Array.from(inputs).map((input, index) => {
                let labelText = '';
                if (input.id) {
                    const label = document.querySelector(`label[for="${input.id}"]`);
                    if (label) labelText = label.innerText.trim();
                }
                if (!labelText) {
                    const parent = input.closest('.checkBoxContainer') || input.parentElement;
                    if (parent) {
                        labelText = Array.from(parent.childNodes)
                            .filter(node => node.nodeType === Node.TEXT_NODE ||
                                (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'INPUT'))
                            .map(node => node.textContent)
                            .join(' ')
                            .trim();
                    }
                }
                return {
                    index: index,
                    label: labelText,
                    value: input.value || '',
                    type: input.type
                };
            });
        }, checkboxSelector);

        addLog(`Checkbox options: ${checkboxData.map(c => c.label || c.value).join(', ')}`, 'info');

        // Select first option (simple strategy for local automation)
        const selectedIndex = 0;

        try {
            await checkboxes[selectedIndex].click();
            await delay(300);
            addLog(`Clicked checkbox: ${checkboxData[selectedIndex].label || checkboxData[selectedIndex].value}`, 'success');
        } catch (err) {
            addLog(`Failed to click checkbox: ${err.message}`, 'warning');
        }

        await delay(500);
        return true;

    } catch (err) {
        addLog(`Checkbox handler error: ${err.message}`, 'error');
        return false;
    }
}

/**
 * Handle chatbot questions
 */
async function handleChatbot(jobPage, addLog) {
    try {
        await jobPage.waitForSelector('.chatbot_MessageContainer', { timeout: 5000 });

        const answered = new Set();
        const maxPolls = 20;

        for (let j = 0; j < maxPolls; j++) {
            const questions = await jobPage.$$eval('.botItem .botMsg span', spans =>
                spans.map(s => s.innerText.trim()).filter(Boolean)
            );

            for (let q of questions) {
                if (answered.has(q)) continue;
                answered.add(q);

                addLog(`Question: ${q}`, 'info');

                // Try checkbox
                const checkboxHandled = await handleCheckBox(jobPage, addLog);
                if (checkboxHandled) {
                    addLog('Checkbox question auto-answered', 'success');
                    const nextBtn = await jobPage.$('.sendMsg');
                    if (nextBtn) await nextBtn.click();
                    continue;
                }

                // Intelligent answer using user data
                const intelligentAnswer = getIntelligentAnswer(q);
                addLog(`Answer: ${intelligentAnswer}`, 'success');

                const inputSelector = ".textArea[contenteditable='true']";
                const exists = await jobPage.$(inputSelector);
                if (!exists) {
                    addLog('Chat input not found, skipping this question', 'warning');
                    continue;
                }

                await jobPage.focus(inputSelector);
                await jobPage.evaluate((sel, answer) => {
                    const el = document.querySelector(sel);
                    if (el) {
                        el.innerText = answer;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }, inputSelector, intelligentAnswer);

                const sendBtn = await jobPage.$('.sendMsg');
                if (sendBtn) await sendBtn.click();

                await delay(1000);
            }

            await delay(1000);
        }

        addLog('Chatbot answers completed!', 'success');
    } catch (err) {
        addLog(`Error in chatbot auto-answer: ${err.message}`, 'warning');
    }
}

/**
 * Scrape job details
 */
async function scrapeJobDetails(jobPage) {
    try {
        const jobDetails = await jobPage.evaluate(() => {
            const getText = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.innerText.trim() : null;
            };

            const jobTitle = getText('h1.styles_jd-header-title__rZwM1');
            const companyName = getText('.styles_jd-header-comp-name__MvqAI > a');
            const location = getText('.styles_jhc__location__W_pVs a');
            const salary = getText('.styles_jhc__salary__jdfEC span');

            return {
                jobTitle,
                companyName,
                location,
                salary
            };
        });

        return jobDetails;
    } catch (error) {
        return {
            jobTitle: null,
            companyName: null,
            location: null,
            salary: null
        };
    }
}

/**
 * Main automation function for Recommended Jobs - runs locally in Electron
 */
export async function runRecommendedJobsAutomation(config, onLog = () => {}) {
    const {
        naukriEmail,
        naukriPassword,
        searchKeywords = 'Software Engineer',
        maxPages = 1,  // Recommended jobs typically on single page
        userSettings = null  // User data from AWS database
    } = config;

    // Load user data for intelligent answers
    if (userSettings) {
        // Normalize years of experience
        let normalizedYears = userSettings.yearsOfExperience;
        if (!normalizedYears || normalizedYears === 'Not specified' || normalizedYears === '0') {
            // Try to extract from resume text if available
            if (userSettings.resumeText) {
                const match = userSettings.resumeText.match(/(\d+)\s*\+?\s*years?/i);
                if (match) {
                    normalizedYears = match[1];
                }
            }
        }

        userAnswersData = {
            ...userSettings,
            yearsOfExperience: normalizedYears || '0',
            // Ensure name field exists
            name: userSettings.name || userSettings.fullName || 'User'
        };

        // ✅ Load skills data from userSettings
        if (userSettings.skills && Array.isArray(userSettings.skills)) {
            skillsData = userSettings.skills.map(skill => ({
                skill_name: skill.skillName || skill.name || '',
                display_name: skill.displayName || skill.name || '',
                name: skill.name || skill.skillName || '',
                rating: skill.rating || 0,
                out_of: skill.out_of || 10,
                experience: skill.experience || '0 years'
            }));
            console.log(`✅ Loaded ${skillsData.length} skills for intelligent answers`);
        } else {
            console.log('⚠️  No skills data found in userSettings');
            skillsData = [];
        }

        console.log('✅ User data loaded for AI answers:', {
            name: userAnswersData.name,
            location: userAnswersData.location,
            experience: normalizedYears,
            skillsCount: skillsData.length
        });
    }

    if (isRunning) {
        return {
            success: false,
            error: 'Automation already running'
        };
    }

    isRunning = true;
    const logs = [];
    let totalJobsApplied = 0;
    const jobResults = []; // ✅ Store job results for database

    const addLog = (message, type = 'info') => {
        const log = {
            timestamp: new Date().toLocaleTimeString(),
            message,
            type
        };
        logs.push(log);
        onLog(log);
        console.log(`[${type.toUpperCase()}] ${message}`);
    };

    try {
        addLog('🖥️  Starting Naukri automation LOCALLY in Electron...', 'info');
        addLog(`Using account: ${naukriEmail}`, 'info');

        // Launch Puppeteer with VISIBLE browser (headful mode)
        const browserConfig = {
            headless: false,  // VISIBLE BROWSER - user can see automation
            defaultViewport: null,
            args: [
                '--start-maximized',
                '--disable-blink-features=AutomationControlled',
                '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ],
            ignoreHTTPSErrors: true,
        };

        addLog('Launching browser window...', 'info');
        browser = await launchBrowser(browserConfig); // ✅ Auto-installs Chrome if missing

        const page = await browser.newPage();

        // Hide automation detection
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
            window.chrome = { runtime: {} };
        });

        await page.setViewport({ width: 1920, height: 1080 });

        // Login
        const loginSuccess = await loginToNaukri(page, naukriEmail, naukriPassword, addLog);
        if (!loginSuccess) {
            throw new Error('Login failed. Please check your credentials.');
        }

        // ========== HOMEPAGE REDIRECT AFTER LOGIN ==========
        addLog('✅ Login successful! Verifying homepage...', 'success');

        // Navigate to homepage first
        const currentUrl = page.url();
        if (!currentUrl.includes('naukri.com')) {
            addLog('Navigating to Naukri homepage...', 'info');
            await safeGoto(page, 'https://www.naukri.com/mnjuser/homepage');
            await delay(2000);
        }

        addLog('📍 Currently on homepage', 'info');
        await delay(1000);

        // ========== REDIRECT TO RECOMMENDED JOBS PAGE ==========
        const recommendedJobsUrl = 'https://www.naukri.com/mnjuser/recommendedjobs';

        addLog('🚀 Redirecting to Recommended Jobs page...', 'info');
        addLog(`🔗 URL: ${recommendedJobsUrl}`, 'info');

        // Navigate to recommended jobs page
        const pageLoaded = await safeGoto(page, recommendedJobsUrl);
        if (!pageLoaded) {
            addLog('Failed to load recommended jobs page', 'error');
            throw new Error('Could not load recommended jobs page');
        }

        await autoScroll(page);
        await delay(2000);

        addLog('Searching for job listings on recommended jobs page...', 'info');

        // Debug: Log page structure
        try {
            const pageInfo = await page.evaluate(() => {
                const articles = document.querySelectorAll('article.jobTuple');
                const titles = document.querySelectorAll('.title');
                const allLinks = document.querySelectorAll('a[href*="job"]');
                return {
                    articleCount: articles.length,
                    titleCount: titles.length,
                    linkCount: allLinks.length
                };
            });
            addLog(`📊 Page has ${pageInfo.articleCount} job cards, ${pageInfo.titleCount} titles, ${pageInfo.linkCount} job links`, 'info');
        } catch (e) {
            addLog(`Debug analysis failed: ${e.message}`, 'warning');
        }

        // Find job links on recommended jobs page using correct selector
        let jobLinks = [];

        try {
            // Use the correct selector for recommended jobs page: .reco-container .left-sec .sim-jobs .list article
            const links = await page.$$eval('.reco-container .left-sec .sim-jobs .list article', articles =>
                articles.map(a => {
                    const link = a.querySelector('a')?.href;
                    const id = a.getAttribute('data-job-id');
                    if (link) return link;
                    if (id) return `https://www.naukri.com/job-listings-${id}`;
                    return null;
                }).filter(Boolean)
            );

            if (links.length > 0) {
                jobLinks = [...new Set(links)];
                addLog(`✅ Found ${jobLinks.length} recommended jobs`, 'success');
            } else {
                addLog('⚠️  Primary selector returned 0 jobs, trying fallback...', 'warning');
            }
        } catch (e) {
            addLog(`Primary selector error: ${e.message}`, 'warning');
        }

        // Fallback to alternative selectors if primary fails
        if (jobLinks.length === 0) {
            addLog('⚠️  Trying fallback selectors...', 'warning');

            const alternativeSelectors = [
                '.jobTuple a[href*="job-listings"]',
                'article[data-job-id] a[href*="job-listings"]',
                '.jobTupleHeader a',
                'a.title[href*="job-listings"]',
                '.jobTuple a'
            ];

            for (const selector of alternativeSelectors) {
                try {
                    addLog(`Trying selector: ${selector}`, 'info');
                    const links = await page.$$eval(selector, elements =>
                        elements
                            .map(a => a.href)
                            .filter(x => typeof x === 'string' && (x.includes('job-listings') || x.includes('/job/')))
                    );

                    if (links.length > 0) {
                        jobLinks = [...new Set(links)];
                        addLog(`✅ Found ${jobLinks.length} jobs using fallback selector: ${selector}`, 'success');
                        break;
                    }
                } catch (e) {
                    addLog(`Selector ${selector} failed: ${e.message}`, 'warning');
                    continue;
                }
            }
        }

        // Final check
        if (jobLinks.length === 0) {
            addLog('❌ No jobs found on recommended jobs page!', 'error');
            addLog('This could mean: 1) No recommended jobs available, 2) Page structure changed, 3) Page not fully loaded', 'warning');
        } else {
            addLog(`✅ Total jobs to process: ${jobLinks.length}`, 'success');
        }

        // Process each recommended job
        for (let i = 0; i < jobLinks.length && isRunning; i++) {
            const link = jobLinks[i];
            addLog(`Opening recommended job ${i + 1}/${jobLinks.length}`, 'info');

            const jobPage = await browser.newPage();
            try {
                await jobPage.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });
            } catch (navError) {
                addLog(`Failed to load job page: ${navError.message}`, 'warning');
                await jobPage.close();
                continue;
            }
            await delay(2000);

            // Check if stopped
            if (!isRunning) {
                await jobPage.close();
                break;
            }

            // Scrape details
            const jobDetails = await scrapeJobDetails(jobPage);
            if (jobDetails.jobTitle) {
                addLog(`Job: ${jobDetails.jobTitle} at ${jobDetails.companyName || 'Unknown'}`, 'info');
            }

            // Check apply button
            const externalApply = await jobPage.$('#company-site-button');
            const applyBtn = await jobPage.$('#apply-button');

            // Determine apply type and status
            let applyType = 'No Apply Button';
            let applicationStatus = 'Skipped';
            if (externalApply) applyType = 'External Apply';
            else if (applyBtn) applyType = 'Direct Apply';

            // Create job result record
            const jobResult = {
                datetime: new Date(),
                pageNumber: 1,  // Recommended jobs are on single page
                jobNumber: `${i + 1}/${jobLinks.length}`,
                    companyUrl: link,
                    applyType: applyType,
                    applicationStatus: applicationStatus,
                    jobTitle: jobDetails.jobTitle,
                    companyName: jobDetails.companyName,
                    location: jobDetails.location,
                    salary: jobDetails.salary,
                    matchStatus: 'Good Match', // Default for now
                    MatchScore: '4/5' // Default for now
                };

                if (externalApply || !applyBtn) {
                    addLog('Skipping job (external apply or no button)', 'warning');
                    jobResults.push(jobResult); // Save skipped job
                    await jobPage.close();
                    await delay(1000);
                    continue;
                }

                // Apply
                addLog('Clicking apply button...', 'info');
                await applyBtn.click();
                await delay(5000);

                // Handle chatbot
                await handleChatbot(jobPage, addLog);

                // Mark as applied and save
                jobResult.applicationStatus = 'Applied';
                jobResults.push(jobResult);

                totalJobsApplied++;
                addLog(`✅ Job application submitted! Total applied: ${totalJobsApplied}`, 'success');

                await jobPage.close();
                await delay(2000); // Delay between applications
        }

        // Summary
        addLog('', 'info');
        addLog('========================================', 'info');
        addLog('📊 AUTOMATION COMPLETE', 'success');
        addLog('========================================', 'info');
        addLog(`✅ Jobs Applied: ${totalJobsApplied}`, 'success');
        addLog('========================================', 'info');

        return {
            success: true,
            jobsApplied: totalJobsApplied,
            jobResults: jobResults, // ✅ Return job results for DB save
            logs,
            message: `Successfully applied to ${totalJobsApplied} jobs`
        };

    } catch (error) {
        addLog(`Fatal error: ${error.message}`, 'error');
        return {
            success: false,
            jobsApplied: totalJobsApplied,
            jobResults: jobResults, // ✅ Return job results even on error
            logs,
            error: error.message
        };
    } finally {
        if (browser) {
            addLog('Closing browser...', 'info');
            await browser.close();
            browser = null;
        }
        isRunning = false;
    }
}

/**
 * Stop automation
 */
export async function stopAutomation() {
    if (!isRunning) {
        return { success: false, message: 'No automation running' };
    }

    isRunning = false;

    if (browser) {
        try {
            await browser.close();
            browser = null;
        } catch (err) {
            // Ignore close errors
        }
    }

    return { success: true, message: 'Automation stopped' };
}
