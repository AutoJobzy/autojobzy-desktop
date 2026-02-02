// autoFilter.js - Automated job filter application for Naukri
import puppeteer from 'puppeteer';
import fs from 'fs';
import JobSettings from './models/JobSettings.js';
import UserFilter from './models/UserFilter.js';
import sequelize from './db/config.js';
import { launchBrowser } from './utils/puppeteerHelper.js';

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

/**
 * Safe navigation with retry logic
 * Uses domcontentloaded + element verification for better reliability on JavaScript-heavy pages
 * @param {Page} page - Puppeteer page object
 * @param {string} url - URL to navigate to
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<boolean>} - Success status
 */
async function safeGoto(page, url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Use domcontentloaded instead of networkidle2 (more reliable for JS-heavy pages)
            await page.goto(url, {
                waitUntil: "domcontentloaded",
                timeout: 45000  // Increased timeout
            });

            // Additional wait for JavaScript to render content
            await delay(2000);

            return true;
        } catch (error) {
            console.log(`⚠️ Page load attempt ${attempt} error: ${error.message}`);

            if (attempt === maxRetries) {
                console.log(`❌ Unable to load page after ${maxRetries} attempts. Please check your internet connection and try again.`);
                return false;
            }
            console.log(`⚠️ Page load issue detected. Retrying... (Attempt ${attempt + 1}/${maxRetries})`);

            // Longer delay between retries
            await delay(3000);
        }
    }
    return false;
}

/**
 * Fetch Naukri credentials from the database
 * @param {string} userId - The user's ID
 * @returns {Promise<{email: string, password: string, searchKeywords: string, yearsOfExperience: string}>}
 */
async function fetchCredentialsFromDB(userId) {
    try {
        await sequelize.authenticate();
        const jobSettings = await JobSettings.findOne({
            where: { userId },
            attributes: ['naukriEmail', 'naukriPassword', 'searchKeywords', 'yearsOfExperience']
        });

        if (!jobSettings || !jobSettings.naukriEmail || !jobSettings.naukriPassword) {
            throw new Error('Naukri credentials not found. Please add your Naukri.com email and password in the Job Profile settings to continue.');
        }

        return {
            email: jobSettings.naukriEmail,
            password: jobSettings.naukriPassword,
            searchKeywords: jobSettings.searchKeywords || 'java developer',
            yearsOfExperience: jobSettings.yearsOfExperience || '0 years'
        };
    } catch (error) {
        console.error('Error fetching credentials from database:', error.message);
        throw error;
    }
}

/**
 * Fetch user's saved filter selections from the database
 * Labels are stored directly in the database
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - User's filter selections (labels)
 */
async function fetchUserFiltersFromDB(userId) {
    try {
        const userFilters = await UserFilter.findOne({
            where: { userId }
        });

        if (!userFilters) {
            console.log('No saved filters found for user.');
            return null;
        }

        // Labels are stored directly in the database
        const filters = {
            salaryRange: userFilters.salaryRange || null,
            wfhType: userFilters.wfhType || null,
            citiesGid: userFilters.citiesGid || null,
            functionalAreaGid: userFilters.functionalAreaGid || null,
            industryTypeGid: userFilters.industryTypeGid || null,
            ugCourseGid: userFilters.ugCourseGid || null,
            pgCourseGid: userFilters.pgCourseGid || null,
            business_size: userFilters.business_size || null,
            employement: userFilters.employement || null,
            glbl_RoleCat: userFilters.glbl_RoleCat || null,
            topGroupId: userFilters.topGroupId || null,
            featuredCompanies: userFilters.featuredCompanies || null,
            freshness: userFilters.freshness || null,
            finalUrl: userFilters.finalUrl || null  // Include saved search URL
        };

        return filters;
    } catch (error) {
        console.error('Error fetching user filters from database:', error.message);
        return null;
    }
}

(async () => {
    // Get userId from command line argument or environment variable
    const userId = process.argv[2] || process.env.USER_ID;
    if (!userId) {
        console.error('❌ Error: userId is required. Pass it as an argument or set USER_ID environment variable.');
        process.exit(1);
    }

    // Fetch credentials from database
    console.log('🔑 Fetching Naukri credentials from database...');
    let credentials;
    try {
        credentials = await fetchCredentialsFromDB(userId);
        console.log('✅ Credentials loaded successfully');
    } catch (error) {
        console.error('❌ Failed to fetch credentials:', error.message);
        process.exit(1);
    }

    // Fetch user's saved filters from database
    console.log('🔍 Fetching user filters from database...');
    let userFilters;
    try {
        userFilters = await fetchUserFiltersFromDB(userId);
        if (userFilters) {
            console.log('✅ User filters loaded successfully');
            // Log which filters are set
            const activeFilters = Object.entries(userFilters)
                .filter(([_, value]) => value)
                .map(([key, value]) => `${key}: ${value}`);
            if (activeFilters.length > 0) {
                console.log('📋 Active filters:', activeFilters.join(', '));
            } else {
                console.log('ℹ️ No filters selected');
            }
        } else {
            console.log('ℹ️ No saved filters found');
        }
    } catch (error) {
        console.error('⚠️ Warning: Failed to fetch user filters:', error.message);
        userFilters = null;
    }

    const keyword = credentials.searchKeywords;
    console.log(`🔎 Search keyword: "${keyword}"`);

    // Browser configuration
    const browserConfig = {
        headless: true,
        defaultViewport: null,
        args: ["--start-maximized", "--no-sandbox", "--disable-setuid-sandbox"]
    };

    // Use helper to launch browser with automatic Chrome detection
    const browser = await launchBrowser(browserConfig);

    const page = await browser.newPage();

    try {
        // 1️⃣ Login
        console.log("\n🌐 Opening Naukri login...");
        const loginSuccess = await safeGoto(page, "https://www.naukri.com/nlogin/login");
        if (!loginSuccess) {
            console.log("❌ Unable to open login page. Please try again later.");
            await browser.close();
            process.exit(1);
        }
        await delay(2500);

        console.log("🔐 Logging in...");
        await page.type("#usernameField", credentials.email, { delay: 80 });
        await page.type("#passwordField", credentials.password, { delay: 80 });
        await page.click("button[type='submit']");
        await delay(7000);

        // 2️⃣ Check if user has saved search URL
        if (userFilters && userFilters.finalUrl && userFilters.finalUrl.trim() !== '') {
            console.log("✅ Using saved search URL from 'ENTER YOUR SEARCH URL' field...");
            console.log(`🔗 Navigating to: ${userFilters.finalUrl}`);

            const urlSuccess = await safeGoto(page, userFilters.finalUrl);
            if (!urlSuccess) {
                console.log("❌ Unable to load search URL. Please check the URL and try again.");
                await browser.close();
                process.exit(1);
            }
            await delay(5000);
            console.log("✅ Search page loaded successfully from your saved URL!");
            console.log("⏭️  Skipping manual keyword/experience selection (URL already contains filters)");

            // Skip manual keyword/experience selection - URL already has everything
            // Continue to filter application...

        } else {
            // Fallback: Manual search if no saved URL
            console.log("ℹ️ No saved search URL found in database.");
            console.log("ℹ️ Using manual keyword search fallback...");

            // Go to home
            console.log("➡ Redirecting to Naukri home...");
            const homeSuccess = await safeGoto(page, "https://www.naukri.com/");
            if (!homeSuccess) {
                console.log("❌ Unable to load Naukri home page. Please try again later.");
                await browser.close();
                process.exit(1);
            }
            await delay(3000);

            // Type Keyword
            console.log("⌨️ Typing keyword...");
            await page.waitForSelector("input[placeholder='Enter keyword / designation / companies']", { timeout: 10000 });
            const keywordInput = await page.$("input[placeholder='Enter keyword / designation / companies']");
            await keywordInput.click({ clickCount: 3 });
            await keywordInput.type(keyword, { delay: 80 });
            await delay(1500);

            // Select experience
            console.log("📈 Selecting experience...");
            const experienceValue = credentials.yearsOfExperience + " years";

            await page.waitForSelector("#experienceDD", { timeout: 8000 });
            await page.click("#experienceDD");
            await delay(500);

            await page.waitForSelector('.dropDownPrimaryContainer .dropdownPrimary div', { timeout: 5000 });

            const selected = await page.evaluate((value) => {
                const options = Array.from(document.querySelectorAll('.dropDownPrimaryContainer .dropdownPrimary div'));
                const option = options.find(opt => opt.innerText.trim().toLowerCase() === value.toLowerCase());
                if (option) {
                    option.click();
                    return true;
                }
                return false;
            }, experienceValue);

            if (selected) {
                console.log(`✅ Experience selected: ${experienceValue}`);
            } else {
                console.warn(`⚠️ Experience value not found: ${experienceValue}`);
            }

            await delay(1000);

            // Click Search
            console.log("🔍 Clicking search...");
            await page.evaluate(() => {
                const searchBtn = document.querySelector("button.nI-gNb-sb__icon-wrapper span:nth-child(2)");
                if (searchBtn) searchBtn.click();
            });
            await delay(5000);
        }

        // Wait for the filter sidebar to load (for both URL-based and manual search)
        console.log("⏳ Waiting for filters sidebar to load...");
        try {
            console.log("⏳ Waiting for Freshness filter to load...");

            await page.waitForSelector('#filter-freshness', {
                timeout: 20000
            });

            console.log("✅ Filters loaded (Freshness detected)");

        } catch (e) {
            console.log("❌ Filters not loaded. Skipping filter automation.");
            return; // 🔥 VERY IMPORTANT
        }
    } catch (error) {
        console.log("❌ Unable to perform search. The page layout may have changed. Please try again later.");
        await browser.close();
        process.exit(1);
    }

    // 5️⃣ Apply sidebar filters from database
    const filterConfigs = [
        { id: 'wfhType', name: 'Work Type', dbKey: 'wfhType' },
        { id: 'functionalAreaGid', name: 'Department', dbKey: 'functionalAreaGid' },
        { id: 'citiesGid', name: 'Location', dbKey: 'citiesGid' },
        { id: 'salaryRange', name: 'Salary', dbKey: 'salaryRange' },
        { id: 'business_size', name: 'Company Type', dbKey: 'business_size' },
        { id: 'glbl_RoleCat', name: 'Role Category', dbKey: 'glbl_RoleCat' },
        { id: 'ugCourseGid', name: 'UG Education', dbKey: 'ugCourseGid' },
        { id: 'pgCourseGid', name: 'PG Education', dbKey: 'pgCourseGid' },
        { id: 'employement', name: 'Posted By', dbKey: 'employement' },
        { id: 'industryTypeGid', name: 'Industry', dbKey: 'industryTypeGid' },
        { id: 'topGroupId', name: 'Top Companies', dbKey: 'topGroupId' },
        { id: 'featuredCompanies', name: 'Featured Companies', dbKey: 'featuredCompanies' },
        { id: 'freshness', name: 'Freshness', dbKey: 'freshness' }
    ];

    let appliedCount = 0;

    for (let f of filterConfigs) {
        const savedFilterLabel = userFilters?.[f.dbKey];
        if (!savedFilterLabel) continue;
        console.log("🧪 FILTER CHECK →", f.dbKey, "=", userFilters?.[f.dbKey]);
        if (savedFilterLabel) {
            if (f.dbKey === 'wfhType') {
                const modes = savedFilterLabel
                    .split(',')
                    .map(v => v.trim())
                    .filter(Boolean);

                if (modes.length === 0) continue;

                console.log(`🏠 Applying Work Mode: ${modes.join(' | ')}`);

                for (const mode of modes) {
                    const selected = await page.evaluate((modeText) => {
                        try {
                            const container = document.querySelector(
                                'div[data-filter-id="wfhType"]'
                            );
                            if (!container) return false;

                            const spans = Array.from(
                                container.querySelectorAll('span[title]')
                            );

                            const normalize = t =>
                                t
                                    .replace(/\(\d+.*?\)/g, '')
                                    .replace(/\s+/g, ' ')
                                    .trim()
                                    .toLowerCase();

                            const span = spans.find(s =>
                                normalize(s.title).includes(normalize(modeText))
                            );
                            if (!span) return false;

                            const label = span.closest('label');
                            if (!label) return false;

                            const inputId = label.getAttribute('for');
                            const checkbox = document.getElementById(inputId);
                            if (!checkbox) return false;

                            if (checkbox.checked) return true;

                            label.scrollIntoView({ block: 'center' });
                            label.click();

                            return true;
                        } catch {
                            return false;
                        }
                    }, mode);

                    if (selected) {
                        console.log(`✅ Work mode selected: ${mode}`);
                    } else {
                        console.warn(`❌ Work mode not found: ${mode}`);
                    }

                    await delay(1200); // React settle
                }

                appliedCount++;
            } else if (f.dbKey === 'citiesGid') {  // Location filter Working
                const locationLabels = savedFilterLabel.split(',').map(l => l.trim()).filter(l => l);
                if (locationLabels.length > 0) {
                    console.log(`\n🔧 Applying Location filter: ${locationLabels.join(' | ')}`);

                    // Click View More
                    const viewMore = await page.$('a#cityTypeGid');
                    if (viewMore) {
                        await viewMore.click();
                        await page.waitForSelector('div.styles_expanded-filters-container__iPSSS', { timeout: 5000 });
                        await delay(2000);
                    }

                    // Click checkboxes in expanded modal
                    for (const label of locationLabels) {
                        await page.evaluate((text) => {
                            const modal = document.querySelector('div.styles_expanded-filters-container__iPSSS');
                            if (!modal) return;
                            const inputs = Array.from(modal.querySelectorAll('input[type="checkbox"]'));
                            const target = inputs.find(input => {
                                const parent = input.closest('label') || input.parentElement;
                                const labelEl = input.nextElementSibling || parent;
                                const labelText = labelEl?.querySelector('span[title]')?.title ||
                                    labelEl?.innerText?.trim() || '';
                                return labelText.toLowerCase() === text.toLowerCase();
                            });
                            if (target && !target.checked) {
                                const clickTarget = target.closest('label') || target;
                                clickTarget.click();
                            }
                        }, label);
                        await delay(2000);
                    }

                    // Click Apply button
                    const applyBtn = await page.$('div.styles_filter-apply-btn__MDAUd');
                    if (applyBtn) {
                        await applyBtn.click();
                        await delay(3000);
                    }

                    appliedCount++;
                }
            } else if (f.dbKey === 'salaryRange') {  //  Salary filter Working

                const salaryLabels = savedFilterLabel.split(',').map(l => l.trim()).filter(l => l);
                if (salaryLabels.length > 0) {
                    console.log(`\n🔧 Applying Salary filter: ${salaryLabels.join(' | ')}`);

                    // Click View More
                    const viewMore = await page.$(`div[data-filter-id="salaryRange"] a.styles_read-more-link__DU4hQ`);
                    if (viewMore) {
                        await viewMore.click();
                        await page.waitForSelector('div.styles_expanded-filters-container__iPSSS', { timeout: 5000 });
                        await delay(1000);
                    }

                    // Click checkboxes in expanded modal
                    for (const label of salaryLabels) {
                        await page.evaluate((text) => {
                            const modal = document.querySelector('div.styles_expanded-filters-container__iPSSS');
                            if (!modal) return;
                            const inputs = Array.from(modal.querySelectorAll('input[type="checkbox"]'));
                            const target = inputs.find(input => {
                                const parent = input.closest('label') || input.parentElement;
                                const labelEl = input.nextElementSibling || parent;
                                const labelText = labelEl?.querySelector('span[title]')?.title ||
                                    labelEl?.innerText?.trim() || '';
                                return labelText.toLowerCase() === text.toLowerCase();
                            });
                            if (target && !target.checked) {
                                const clickTarget = target.closest('label') || target;
                                clickTarget.click();
                            }
                        }, label);
                        await delay(500);
                    }

                    // Click Apply button
                    const applyBtn = await page.$('div.styles_filter-apply-btn__MDAUd');
                    if (applyBtn) {
                        await applyBtn.click();
                        await delay(1000);
                    }

                    appliedCount++;
                }
            } else if (f.dbKey === 'business_size') {  // Company type filter Working
                const companyLabels = savedFilterLabel.split(',').map(l => l.trim()).filter(l => l);
                if (companyLabels.length > 0) {
                    console.log(`\n🔧 Applying Company Type filter: ${companyLabels.join(' | ')}`);

                    // Click View More
                    const viewMore = await page.$('a#qbusinessSize');
                    if (viewMore) {
                        await viewMore.click();
                        await page.waitForSelector('div.styles_expanded-filters-container__iPSSS', { timeout: 5000 });
                        await delay(1000);
                    }

                    // Click checkboxes in expanded modal
                    for (const label of companyLabels) {
                        await page.evaluate((text) => {
                            const modal = document.querySelector('div.styles_expanded-filters-container__iPSSS');
                            if (!modal) return;
                            const inputs = Array.from(modal.querySelectorAll('input[type="checkbox"]'));
                            const target = inputs.find(input => {
                                const parent = input.closest('label') || input.parentElement;
                                const labelEl = input.nextElementSibling || parent;
                                const labelText = labelEl?.querySelector('span[title]')?.title ||
                                    labelEl?.innerText?.trim() || '';
                                return labelText.toLowerCase() === text.toLowerCase();
                            });
                            if (target && !target.checked) {
                                const clickTarget = target.closest('label') || target;
                                clickTarget.click();
                            }
                        }, label);
                        await delay(500);
                    }

                    // Click Apply button
                    const applyBtn = await page.$('div.styles_filter-apply-btn__MDAUd');
                    if (applyBtn) {
                        await applyBtn.click();
                        await delay(1000);
                    }

                    appliedCount++;
                }
            } else if (f.dbKey === 'topGroupId') { // Top Companies filter  Working
                const companyLabels = savedFilterLabel
                    .split(',')
                    .map(l => l.trim())
                    .filter(Boolean);

                if (companyLabels.length === 0) return;

                console.log(`🏢 Applying Top Companies: ${companyLabels.join(', ')}`);

                // 1️⃣ View More
                const viewMore = await page.$('#qctopGroupId');
                if (viewMore) {
                    await viewMore.click();
                    await page.waitForSelector('.styles_expanded-filters-container__iPSSS', { timeout: 5000 });
                    await delay(800);
                }

                // 2️⃣ Checkbox select (CORRECT WAY)
                for (const labelText of companyLabels) {
                    await page.evaluate((text) => {
                        const container = document.querySelector('.styles_expanded-filters-container__iPSSS');
                        if (!container) return;

                        const spans = Array.from(
                            container.querySelectorAll('span.styles_filterLabel__jRP04')
                        );

                        const span = spans.find(s => s.title.trim().toLowerCase() === text.toLowerCase());
                        if (!span) return;

                        const label = span.closest('label');
                        if (!label) return;

                        const inputId = label.getAttribute('for');
                        const checkbox = document.getElementById(inputId);

                        if (checkbox && !checkbox.checked) {
                            label.click(); // 🔥 THIS works
                        }
                    }, labelText);

                    await delay(300);
                }

                // 3️⃣ Apply
                const applyBtn = await page.$('.styles_filter-apply-btn__MDAUd');
                if (applyBtn) {
                    await applyBtn.click();
                    await delay(1000);
                }

                appliedCount++;
            } else if (f.dbKey === 'industryTypeGid') { // Industry filter Working
                const industryLabels = savedFilterLabel
                    .split(',')
                    .map(l => l.trim())
                    .filter(Boolean);

                if (industryLabels.length === 0) return;

                console.log(`🏭 Applying Industry filter: ${industryLabels.join(' | ')}`);

                // 1️⃣ View More (MANDATORY)
                const viewMore = await page.$('#industryTypeIdGid');
                if (viewMore) {
                    await viewMore.click();
                    await page.waitForSelector('.styles_expanded-filters-container__iPSSS', {
                        timeout: 5000
                    });
                    await delay(800);
                }

                // 2️⃣ Select industries (ONLY expanded modal)
                for (const industry of industryLabels) {
                    const selected = await page.evaluate((targetText) => {
                        const modal = document.querySelector('.styles_expanded-filters-container__iPSSS');
                        if (!modal) return false;

                        const spans = Array.from(
                            modal.querySelectorAll('span.styles_filterLabel__jRP04[title]')
                        );

                        const span = spans.find(s =>
                            s.title.trim().toLowerCase() === targetText.toLowerCase()
                        );

                        if (!span) return false;

                        const label = span.closest('label');
                        if (!label) return false;

                        const forId = label.getAttribute('for');
                        const checkbox = document.getElementById(forId);

                        if (checkbox && !checkbox.checked) {
                            label.scrollIntoView({ block: 'center' });
                            label.click(); // ✅ REAL USER CLICK
                        }

                        return true;
                    }, industry);

                    if (!selected) {
                        console.warn(`⚠️ Industry not found: ${industry}`);
                    }

                    await delay(300);
                }

                // 3️⃣ Apply
                const applyBtn = await page.$('.styles_filter-apply-btn__MDAUd');
                if (applyBtn) {
                    await applyBtn.click();
                    await delay(1000);
                }

                appliedCount++;
            } else if (f.dbKey === 'glbl_RoleCat') { // Role Category filter 
                const roleCategories = savedFilterLabel
                    .split(',')
                    .map(l => l.trim())
                    .filter(Boolean);

                if (roleCategories.length === 0) return;

                console.log(`🎭 Applying Role Category: ${roleCategories.join(' | ')}`);

                // 1️⃣ Open View More (MANDATORY)
                const viewMore = await page.$('#glbl_qcrc');
                if (viewMore) {
                    await viewMore.click();
                    await page.waitForSelector(
                        '.styles_expanded-filters-container__iPSSS',
                        { timeout: 5000 }
                    );
                    await delay(800);
                }

                // 2️⃣ Select roles (EXPANDED MODAL ONLY)
                for (const role of roleCategories) {
                    const selected = await page.evaluate((targetText) => {
                        const modal = document.querySelector(
                            '.styles_expanded-filters-container__iPSSS'
                        );
                        if (!modal) return false;

                        const spans = Array.from(
                            modal.querySelectorAll('span.styles_filterLabel__jRP04[title]')
                        );

                        const span = spans.find(s =>
                            s.title.trim().toLowerCase() === targetText.toLowerCase()
                        );

                        if (!span) return false;

                        const label = span.closest('label');
                        if (!label) return false;

                        const forId = label.getAttribute('for');
                        const checkbox = document.getElementById(forId);

                        if (checkbox && !checkbox.checked) {
                            label.scrollIntoView({ block: 'center' });
                            label.click(); // ✅ real user click
                        }

                        return true;
                    }, role);

                    if (!selected) {
                        console.warn(`⚠️ Role Category not found: ${role}`);
                    }

                    await delay(300);
                }

                // 3️⃣ Apply
                const applyBtn = await page.$('.styles_filter-apply-btn__MDAUd');
                if (applyBtn) {
                    await applyBtn.click();
                    await delay(1000);
                }

                appliedCount++;
            } else if (f.dbKey === 'functionalAreaGid') {  // Department filter NW
                const deptLabels = savedFilterLabel.split(',').map(l => l.trim()).filter(l => l);
                if (deptLabels.length > 0) {
                    console.log(`\n🔧 Applying Department filter: ${deptLabels.join(' | ')}`);

                    // Click View More
                    const viewMore = await page.$('a#functionAreaIdGid');
                    if (viewMore) {
                        await viewMore.click();
                        await page.waitForSelector('div.styles_expanded-filters-container__iPSSS', { timeout: 5000 });
                        await delay(1000);
                    }

                    // Click checkboxes in expanded modal
                    for (const label of deptLabels) {
                        await page.evaluate((text) => {
                            const modal = document.querySelector('div.styles_expanded-filters-container__iPSSS');
                            if (!modal) return;
                            const inputs = Array.from(modal.querySelectorAll('input[type="checkbox"]'));
                            const target = inputs.find(input => {
                                const parent = input.closest('label') || input.parentElement;
                                const labelEl = input.nextElementSibling || parent;
                                const labelText = labelEl?.querySelector('span[title]')?.title ||
                                    labelEl?.innerText?.trim() || '';
                                return labelText.toLowerCase() === text.toLowerCase();
                            });
                            if (target && !target.checked) {
                                const clickTarget = target.closest('label') || target;
                                clickTarget.click();
                            }
                        }, label);
                        await delay(500);
                    }

                    // Click Apply button
                    const applyBtn = await page.$('div.styles_filter-apply-btn__MDAUd');
                    if (applyBtn) {
                        await applyBtn.click();
                        await delay(1000);
                    }

                    appliedCount++;
                }
            } else if (f.dbKey === 'education') {   // Education filter
                const eduLabels = savedFilterLabel
                    .split(',')
                    .map(l => l.trim())
                    .filter(Boolean);

                if (eduLabels.length > 0) {
                    console.log(`\n🎓 Applying Education filter: ${eduLabels.join(' | ')}`);

                    // 1️⃣ Click View More
                    const viewMore = await page.$('a#educationViewMoreId');
                    if (viewMore) {
                        await viewMore.click();
                        await page.waitForSelector(
                            'div.styles_expanded-filters-container__iPSSS',
                            { timeout: 5000 }
                        );
                        await delay(800);
                    }

                    // 2️⃣ Select matching UG / PG checkboxes
                    for (const label of eduLabels) {
                        await page.evaluate((text) => {
                            const modal = document.querySelector(
                                'div.styles_expanded-filters-container__iPSSS'
                            );
                            if (!modal) return;

                            const inputs = Array.from(
                                modal.querySelectorAll('input[type="checkbox"]')
                            );

                            const target = inputs.find(input => {
                                const lbl =
                                    input.closest('label')
                                        ?.querySelector('span[title]')
                                        ?.title ||
                                    input.closest('label')?.innerText?.trim() ||
                                    '';

                                return lbl.toLowerCase() === text.toLowerCase();
                            });

                            if (target && !target.checked) {
                                target.closest('label')?.click();
                            }
                        }, label);

                        await delay(400);
                    }

                    // 3️⃣ Apply
                    const applyBtn = await page.$('div.styles_filter-apply-btn__MDAUd');
                    if (applyBtn) {
                        await applyBtn.click();
                        await delay(1000);
                    }

                    appliedCount++;
                }
            } else if (f.dbKey === 'freshness') {
                await applyFreshness(page, savedFilterLabel);
                appliedCount++;
            } else {
                await applyFilterAuto(page, f.id, f.name, savedFilterLabel);
            }
            await delay(500);
        }
    }

    // 6️⃣ Print final URL
    console.log("\n===============================");
    console.log(`✅ SEARCH + FILTERS COMPLETE`);
    console.log(`📊 Applied ${appliedCount} filters`);
    console.log("🔗 Final URL:", page.url());
    console.log("===============================\n");

    // Keep browser open for user to see results
    console.log("ℹ️ Browser will remain open. Close it manually when done.");

})().catch(error => {
    console.log("\n❌ An unexpected error occurred.");
    console.log("💡 Please try the following:");
    console.log("   1. Check your internet connection");
    console.log("   2. Verify your Naukri login credentials");
    console.log("   3. Try running the automation again");
    console.log("\nIf the problem persists, please contact support.\n");
    process.exit(1);
});





async function applyFilterAuto(page, filterId, displayName, filterLabels) {
    try {
        // Split comma-separated labels into array
        const labels = filterLabels.split(',').map(l => l.trim()).filter(l => l);

        if (labels.length === 0) {
            return false;
        }

        console.log(`   📝 Values to apply (${labels.length}): ${labels.join(' | ')}`);

        // Wait for filter section (one time for the entire section)
        try {
            await page.waitForSelector(`div[data-filter-id="${filterId}"]`, { timeout: 8000 });
        } catch (e) {
            console.log(`   ⚠️ Filter section "${filterId}" not visible`);
            return false;
        }

        // Scroll filter section into view and expand if collapsed
        await page.evaluate((filterId) => {
            const filterSection = document.querySelector(`div[data-filter-id="${filterId}"]`);
            if (filterSection) {
                // Scroll into view
                filterSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Try to expand if collapsed - look for expand button/arrow
                const expandButton = filterSection.querySelector('.filter-expand') ||
                    filterSection.querySelector('[class*="expand"]') ||
                    filterSection.querySelector('[class*="toggle"]');
                if (expandButton && expandButton.click) {
                    expandButton.click();
                }
            }
        }, filterId);

        await delay(800);

        // Click "Show more" buttons multiple times to reveal all hidden options
        for (let i = 0; i < 5; i++) {
            const clicked = await page.evaluate((filterId) => {
                const filterSection = document.querySelector(`div[data-filter-id="${filterId}"]`);
                if (!filterSection) return false;

                // Look for "Show more" / "View all" buttons by class or text content
                const showMoreButton = filterSection.querySelector('[class*="view-more"]') ||
                    filterSection.querySelector('[class*="show-more"]') ||
                    filterSection.querySelector('[class*="viewMore"]') ||
                    filterSection.querySelector('[class*="showMore"]') ||
                    Array.from(filterSection.querySelectorAll('a, span, div, button')).find(el => {
                        const text = el.textContent?.toLowerCase() || '';
                        const style = window.getComputedStyle(el);
                        // Element must be visible and clickable
                        if (style.display === 'none' || style.visibility === 'hidden') return false;
                        return (text.includes('view more') ||
                            text.includes('show more') ||
                            text.includes('view all') ||
                            text.includes('see all')) &&
                            text.length < 50; // Avoid matching large text blocks
                    });

                if (showMoreButton && typeof showMoreButton.click === 'function') {
                    showMoreButton.click();
                    return true;
                }
                return false;
            }, filterId);

            if (!clicked) {
                break; // No more "show more" buttons found
            }
            await delay(600); // Wait for new options to load
        }

        await delay(500); // Final wait for all options to be visible

        let appliedCount = 0;

        // Apply each filter label one by one
        for (const filterLabel of labels) {
            // Wait for filter section to be available (it may refresh after each click)
            try {
                await page.waitForSelector(`div[data-filter-id="${filterId}"]`, { timeout: 8000 });
                await delay(500); // Small delay for section to stabilize
            } catch (e) {
                console.log(`   ⚠️ Filter section "${filterId}" not available for "${filterLabel}"`);
                continue;
            }

            // Try to click the filter option by label with diagnostic info
            const result = await page.evaluate((filterId, text) => {
                const filterSection = document.querySelector(`div[data-filter-id="${filterId}"]`);
                if (!filterSection) return { success: false, reason: 'section_not_found' };

                const inputs = Array.from(filterSection.querySelectorAll('input[type="checkbox"]'));
                if (inputs.length === 0) {
                    return { success: false, reason: 'no_checkboxes', detail: `Found 0 checkboxes in section` };
                }

                const target = inputs.find(input => {
                    const parent = input.closest('label') || input.parentElement;
                    const labelEl = input.nextElementSibling || parent;
                    const labelText = labelEl?.querySelector('span[title]')?.title ||
                        labelEl?.querySelector('span')?.innerText?.trim() ||
                        labelEl?.innerText?.trim() ||
                        parent?.innerText?.trim() || '';

                    // Remove count numbers like (123) from label text
                    const normalizedLabel = labelText.replace(/\(\d+\)/g, '').trim();
                    const normalizedText = text.trim();

                    // Try exact match first, then case-insensitive match
                    return normalizedLabel === normalizedText ||
                        normalizedLabel.toLowerCase() === normalizedText.toLowerCase() ||
                        normalizedLabel.includes(normalizedText) ||
                        labelText.toLowerCase().includes(normalizedText.toLowerCase());
                });

                if (target) {
                    if (target.checked) {
                        return { success: 'already_checked' };
                    } else {
                        const clickTarget = target.closest('label') || target;
                        clickTarget.click();
                        return { success: true };
                    }
                }

                // If not found, return available options for debugging
                const availableLabels = inputs.slice(0, 5).map(input => {
                    const parent = input.closest('label') || input.parentElement;
                    const labelEl = input.nextElementSibling || parent;
                    return (labelEl?.querySelector('span[title]')?.title ||
                        labelEl?.querySelector('span')?.innerText?.trim() ||
                        labelEl?.innerText?.trim() ||
                        parent?.innerText?.trim() || '').replace(/\(\d+\)/g, '').trim();
                }).filter(l => l);

                return { success: false, reason: 'not_found', availableLabels };
            }, filterId, filterLabel);

            if (result.success === true) {
                console.log(`   ✅ Selected: ${filterLabel}`);
                appliedCount++;
                await delay(2000); // Wait 2 seconds for page to update before next filter
            } else if (result.success === 'already_checked') {
                console.log(`   ✓ Already selected: ${filterLabel}`);
                appliedCount++;
                await delay(500); // Small delay even for already checked items
            } else {
                if (result.availableLabels && result.availableLabels.length > 0) {
                    console.log(`   ⚠️ Not found: "${filterLabel}" (Available: ${result.availableLabels.slice(0, 3).join(', ')}...)`);
                } else {
                    console.log(`   ⚠️ Not found: "${filterLabel}" (${result.reason || 'unknown reason'})`);
                }
            }
        }

        return appliedCount > 0;

    } catch (err) {
        console.log(`⚠️ Unable to apply ${displayName} filter. Continuing with other filters...`);
        return false;
    }
}




async function applyFreshness(page, freshnessValue) {
    console.log("🧪 Applying Freshness:", freshnessValue);

    try {
        // 1️⃣ Open the dropdown
        await page.waitForSelector('#filter-freshness', { timeout: 5000 });
        const button = await page.$('#filter-freshness');
        await button.click();
        await page.waitForSelector('ul[data-filter-id="freshness"] li a', { timeout: 5000 });
        await delay(500);

        // 2️⃣ Click the correct option
        const applied = await page.evaluate((text) => {
            const items = Array.from(document.querySelectorAll('ul[data-filter-id="freshness"] li a'));
            const target = items.find(a => a.parentElement.getAttribute('title') === text);
            if (!target) return false;

            target.scrollIntoView({ block: 'center' });
            target.click(); // 🔥 click <a> inside <li>
            return true;
        }, freshnessValue);

        if (applied) {
            console.log("✅ Freshness applied successfully");
        } else {
            console.warn("❌ Freshness value not found in dropdown");
        }

        await delay(1000); // allow page to update

    } catch (err) {
        console.log("⚠️ Error applying freshness filter:", err.message);
    }
}
