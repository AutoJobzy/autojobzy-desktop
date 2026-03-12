/**
 * ======================== LOCAL PROFILE UPDATE BOT ========================
 * Runs Puppeteer automation locally in Electron with VISIBLE browser
 * Updates Naukri resume headline to keep profile fresh
 */

import { launchBrowser } from '../../server/utils/puppeteerHelper.js';

// Global state
let browser = null;
let isRunning = false;

/**
 * Delay helper
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
 * Login to Naukri
 */
async function loginToNaukri(page, email, password, addLog) {
    try {
        addLog('🔐 Bhai, Naukri login page kholat aaho... tension nahi lene ka!', 'info');
        const loginPageLoaded = await safeGoto(page, 'https://www.naukri.com/nlogin/login');
        if (!loginPageLoaded) {
            return false;
        }
        await delay(3000);

        addLog('🔍 Email aani password fields dhundhat aaho Circuit... sab milega bidu!', 'info');

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
                    addLog(`✅ Email field mil gaya bidu! Ekdum solid!`, 'success');
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!emailSelector) {
            addLog('❌ Aye bhai, email field hi nahi mili! Naukri ne chhupa ke rakha kya?', 'error');
            return false;
        }

        // Find password field
        let passSelector = null;
        for (const selector of passwordSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    passSelector = selector;
                    addLog(`✅ Password field bhi mil gaya bhai! Ek number!`, 'success');
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!passSelector) {
            addLog('❌ Bhai, password field gaayab hai! Login page ka scene samajh nahi aa raha!', 'error');
            return false;
        }

        // Enter credentials
        addLog('✏️  Credentials type karat aaho... Circuit ka full plan hai bidu!', 'info');
        await page.click(emailSelector, { clickCount: 3 }).catch(() => {});
        await delay(200);
        await page.type(emailSelector, email, { delay: 100 });
        await delay(800);

        await page.click(passSelector, { clickCount: 3 }).catch(() => {});
        await delay(200);
        await page.type(passSelector, password, { delay: 100 });
        await delay(800);

        // Submit
        addLog('🚀 Login button dabaat aaho bhai... abhi hoga scene!', 'info');
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
                    addLog(`✅ Submit button daba diya bhai! Jaadoo ho gaya!`, 'info');
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!submitted) {
            addLog('Button nahi mila bidu, Enter dabaake kaam chalata hai Circuit!', 'info');
            await page.focus(passSelector);
            await page.keyboard.press('Enter');
        }

        // Wait for login response
        addLog('⏳ Naukri ka jawab aane de bhai... thoda patience rakho!', 'info');
        await delay(5000);

        // Check if login successful
        const currentUrl = page.url();
        if (currentUrl.includes('nlogin')) {
            addLog('❌ Bhai, login fail ho gaya — abhi bhi login page par hai! Username password check kar ek baar!', 'error');
            return false;
        }

        addLog('✅ Login ekdum ek number ho gaya bhai! Bindaas!', 'success');

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

        addLog('✅ Session solid ho gaya bidu, aage badhte hai... Circuit ready hai!', 'success');
        return true;

    } catch (error) {
        addLog(`❌ Bhai, login mein gadbad ho gayi: ${error.message}`, 'error');
        return false;
    }
}

/**
 * Main profile update function - runs locally in Electron
 */
export async function runProfileUpdate(config, onLog = () => {}) {
    const {
        naukriEmail,
        naukriPassword
    } = config;

    if (isRunning) {
        return {
            success: false,
            error: 'Profile update already running'
        };
    }

    isRunning = true;
    const logs = [];

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
        addLog('🖥️  Bhai, Naukri profile update shuru karat aaho — ek dum local Electron mein!', 'info');
        addLog(`🔑 Account use karat aaho: ${naukriEmail} — solid!`, 'info');

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

        addLog('🌐 Browser window kholat aaho bidu... Chrome wala jugaad on!', 'info');
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

        // Navigate to profile page
        addLog('📋 Bhai, profile page par ja raha hai Circuit... wahan apna kaam hai!', 'info');
        const profileLoaded = await safeGoto(page, 'https://www.naukri.com/mnjuser/profile');
        if (!profileLoaded) {
            throw new Error('Failed to load profile page');
        }
        await delay(3000);

        // Click edit button for resume headline
        addLog('✏️  Resume Headline wala edit button dhundhat aaho bhai... sab milega tension nahi!', 'info');
        await delay(2000);

        const editButtonSelectors = [
            '[data-qa="edit_resume_headline"]',
            '.widgetHead .edit',
            '.resumeHeadline .edit',
            '.editResume',
            '.edit-icon',
            '.pencil-edit',
            'span.edit',
            'i.edit',
            '[class*="editBtn"]',
            '[class*="edit-btn"]',
        ];

        let editClicked = false;
        for (const selector of editButtonSelectors) {
            try {
                const editBtn = await page.$(selector);
                if (editBtn) {
                    await page.evaluate(el => el.scrollIntoView({ block: 'center' }), editBtn).catch(() => {});
                    await editBtn.click();
                    addLog(`✅ Edit button daba diya bidu! Jaadoo ki jhappi!`, 'success');
                    editClicked = true;
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        // Fallback: find edit button near "Resume Headline" text
        if (!editClicked) {
            editClicked = await page.evaluate(() => {
                // Find section with "Resume Headline" text and look for edit button near it
                const allElements = Array.from(document.querySelectorAll('*'));
                for (const el of allElements) {
                    if (el.children.length === 0 && el.textContent.trim() === 'Resume Headline') {
                        let parent = el.parentElement;
                        for (let i = 0; i < 5; i++) {
                            if (!parent) break;
                            const editBtn = parent.querySelector('[class*="edit"], .pencil, svg[class*="edit"]');
                            if (editBtn) {
                                editBtn.scrollIntoView();
                                editBtn.click();
                                return true;
                            }
                            parent = parent.parentElement;
                        }
                    }
                }
                return false;
            });
            if (editClicked) addLog('✅ Text dhundh ke edit button daba diya bhai! Circuit ka jugaad kaam aaya!', 'success');
        }

        if (!editClicked) {
            throw new Error('Could not find resume headline edit button');
        }

        await delay(2000);

        // ── Update textarea ──────────────────────────────────────────────────
        // Exact selectors from Naukri's real HTML:
        //   <textarea id="resumeHeadlineTxt" name="resumeHeadline" class="fue__text-area" ...>
        addLog('📝 Bhai, Resume Headline mein ek chhota sa space daaltay aaho... sirf ek space — jaadoo!', 'info');

        const taSelector = await page.evaluate(() => {
            // Try exact selectors first
            const exact = [
                '#resumeHeadlineTxt',
                'textarea.fue__text-area',
                'textarea[name="resumeHeadline"]',
                'textarea[id*="headline"]',
                'textarea[id*="Headline"]',
            ];
            for (const sel of exact) {
                const el = document.querySelector(sel);
                if (el) return sel;
            }
            // Any visible textarea fallback
            const ta = Array.from(document.querySelectorAll('textarea'))
                .find(t => t.getBoundingClientRect().height > 0);
            return ta ? 'textarea' : null;
        });

        if (!taSelector) throw new Error('Could not find resume headline textarea');

        // Click → End → type space (keyboard approach triggers React state properly)
        const taEl = await page.$(taSelector);
        if (!taEl) throw new Error('Textarea element not found after selector matched');

        await taEl.click({ clickCount: 1 });
        await delay(400);
        await page.keyboard.press('End');
        await delay(200);
        await page.keyboard.type(' ');
        await delay(300);

        // Also fire React synthetic events
        await page.evaluate(sel => {
            const el = document.querySelector(sel);
            if (el) {
                el.dispatchEvent(new Event('input',  { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }, taSelector);

        addLog('✅ Space laga diya bidu! Naukri ko lagega abhi recently update kiya — bindaas jugaad!', 'success');
        await delay(1500);

        // ── Click Save button ────────────────────────────────────────────────
        // Exact button from Naukri's real HTML:
        //   <button class="btn-dark-ot" type="submit">Save</button>
        //   inside <form name="resumeHeadlineForm">
        addLog('💾 Save button dabaat aaho bhai... bas ek click aur kaam tamam!', 'info');

        const saveResult = await page.evaluate(() => {
            // Priority 1: exact known selectors from Naukri's HTML
            const exact = [
                'button.btn-dark-ot',
                'form[name="resumeHeadlineForm"] button[type="submit"]',
                'form[name="resumeHeadlineForm"] button',
                '.action button',
                '.form-actions button',
            ];
            for (const sel of exact) {
                const el = document.querySelector(sel);
                if (el) {
                    el.scrollIntoView({ block: 'center' });
                    el.click();
                    return { success: true, method: 'exact', sel, text: (el.innerText || '').trim() };
                }
            }

            // Priority 2: submit the form directly
            const form = document.querySelector('form[name="resumeHeadlineForm"]');
            if (form) {
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                form.dispatchEvent(submitEvent);
                return { success: true, method: 'form-submit' };
            }

            // Priority 3: any button with text "Save" anywhere on page
            const allBtns = Array.from(document.querySelectorAll('button'));
            for (const btn of allBtns) {
                const t = (btn.innerText || btn.textContent || '').trim().toLowerCase();
                if (t === 'save' || t === 'submit') {
                    btn.scrollIntoView({ block: 'center' });
                    btn.click();
                    return { success: true, method: 'text', text: btn.innerText.trim() };
                }
            }

            // Debug: dump all buttons
            return {
                success: false,
                debug: allBtns.map(b => ({
                    cls: b.className,
                    text: (b.innerText || '').trim().substring(0, 40),
                    type: b.type,
                })),
            };
        });

        if (saveResult.success) {
            addLog(`✅ Save ho gaya bhai! Ekdum solid! (${saveResult.method}${saveResult.text ? ': "' + saveResult.text + '"' : ''})`, 'success');
        } else {
            if (saveResult.debug?.length) {
                addLog(`🔍 Bidu, page par yeh buttons aahe: ${saveResult.debug.map(b => `"${b.text}"[${b.cls}]`).join(' | ')}`, 'info');
            }
            throw new Error('Save button nahi mila bhai — kuch toh gadbad hai!');
        }

        await delay(3000);

        // Summary
        addLog('', 'info');
        addLog('━━━━━━ BHAI KA PROFILE UPDATE COMPLETE! ━━━━━━', 'info');
        addLog('✅ Naukri profile update ekdum solid ho gaya bhai!', 'success');
        addLog('🎉 Ab recruiters ko lagega profile fresh hai — jaadoo ki jhappi!', 'success');
        addLog('📈 Recruiter search mein visibility badhegi bidu — tension nahi!', 'info');
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');

        return {
            success: true,
            logs,
            message: `Profile update ekdum mast ho gaya bhai!`
        };

    } catch (error) {
        addLog(`❌ Bhai, bada scene ho gaya: ${error.message} — ek baar check kar, apun phir try karega!`, 'error');
        return {
            success: false,
            logs,
            error: error.message
        };
    } finally {
        if (browser) {
            addLog('🔒 Kaam tamam bidu! Browser band karat aaho... jaadoo ki jhappi Naukri ko!', 'info');
            await browser.close();
            browser = null;
        }
        isRunning = false;
    }
}

/**
 * Stop profile update
 */
export async function stopProfileUpdate() {
    if (!isRunning) {
        return { success: false, message: 'No profile update running' };
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

    return { success: true, message: 'Profile update stopped' };
}
