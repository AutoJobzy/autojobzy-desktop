/**
 * Quick test script for Naukri login only
 * Tests the updated login function with new selectors
 */

import puppeteer from 'puppeteer';

// Test credentials (use your actual credentials)
const TEST_EMAIL = 'rohankadam474@gmail.com';
const TEST_PASSWORD = 'your_password_here';  // Update this!

console.log('🔍 Testing Naukri Login...\n');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function safeGoto(page, url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
            return true;
        } catch (error) {
            if (attempt === maxRetries) {
                console.log(`❌ Unable to load page after ${maxRetries} attempts`);
                return false;
            }
            console.log(`⚠️  Page load issue. Retrying... (${attempt + 1}/${maxRetries})`);
            await delay(2000);
        }
    }
    return false;
}

async function testLogin() {
    let browser;

    try {
        console.log('📊 Launching browser...');
        browser = await puppeteer.launch({
            headless: true,  // Change to false to watch
            defaultViewport: null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--window-size=1920,1080',
            ]
        });

        const page = await browser.newPage();

        console.log('📄 Opening Naukri login page...');
        const loaded = await safeGoto(page, 'https://www.naukri.com/nlogin/login');

        if (!loaded) {
            throw new Error('Failed to load login page');
        }

        await delay(3000);

        // Wait for page to be fully loaded
        await page.evaluate(() => {
            return new Promise((resolve) => {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    window.addEventListener('load', resolve);
                }
            });
        });

        await delay(1000);

        console.log('🔍 Looking for login fields...\n');

        // Email field selectors
        const emailSelectors = [
            '#usernameField',
            'input[type="text"]',
            'input[placeholder*="Email"]',
            'input[placeholder*="Username"]',
        ];

        // Find email field
        let emailSelector = null;
        for (const selector of emailSelectors) {
            try {
                const element = await page.waitForSelector(selector, { timeout: 2000 });

                const isUsable = await page.evaluate((sel) => {
                    const el = document.querySelector(sel);
                    if (!el) return false;
                    const rect = el.getBoundingClientRect();
                    return rect.width > 0 || rect.height > 0;
                }, selector);

                if (element && isUsable) {
                    emailSelector = selector;
                    console.log(`✅ Found email field: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!emailSelector) {
            throw new Error('❌ Could not find email field');
        }

        // Password field selectors
        const passwordSelectors = [
            '#passwordField',
            'input[type="password"]',
            'input[placeholder*="Password"]',
        ];

        // Find password field
        let passSelector = null;
        for (const selector of passwordSelectors) {
            try {
                const element = await page.waitForSelector(selector, { timeout: 2000 });

                const isUsable = await page.evaluate((sel) => {
                    const el = document.querySelector(sel);
                    if (!el) return false;
                    const rect = el.getBoundingClientRect();
                    return rect.width > 0 || rect.height > 0;
                }, selector);

                if (element && isUsable) {
                    passSelector = selector;
                    console.log(`✅ Found password field: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!passSelector) {
            throw new Error('❌ Could not find password field');
        }

        console.log('\n📝 Entering credentials...');

        // Enter email
        await page.click(emailSelector, { clickCount: 3 });
        await delay(200);
        await page.type(emailSelector, TEST_EMAIL, { delay: 100 });

        await delay(800);

        // Enter password
        await page.click(passSelector, { clickCount: 3 });
        await delay(200);
        await page.type(passSelector, TEST_PASSWORD, { delay: 100 });

        await delay(800);

        console.log('🚀 Submitting form...');

        // Find and click submit button
        const submitSelectors = [
            "button[type='submit'].blue-btn",
            "button[type='submit']",
            "form button",
        ];

        let submitted = false;
        for (const selector of submitSelectors) {
            try {
                const submitBtn = await page.$(selector);
                if (submitBtn) {
                    await submitBtn.click();
                    submitted = true;
                    console.log(`✅ Clicked submit: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!submitted) {
            console.log('⚠️  No submit button found, pressing Enter...');
            await page.focus(passSelector);
            await page.keyboard.press('Enter');
        }

        console.log('⏳ Waiting for response...');
        await delay(5000);

        // Check result
        const currentUrl = page.url();
        console.log(`\n📍 Current URL: ${currentUrl}\n`);

        if (currentUrl.includes('nlogin')) {
            console.log('❌ Login FAILED - still on login page');
            console.log('   Possible reasons:');
            console.log('   1. Wrong credentials');
            console.log('   2. CAPTCHA appeared');
            console.log('   3. Naukri blocked automation');

            // Take screenshot
            await page.screenshot({ path: 'login-failed.png' });
            console.log('📸 Screenshot saved: login-failed.png');

            return false;
        } else {
            console.log('✅ Login SUCCESSFUL! 🎉');
            console.log(`   Redirected to: ${currentUrl}`);

            // Take screenshot
            await page.screenshot({ path: 'login-success.png' });
            console.log('📸 Screenshot saved: login-success.png');

            return true;
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        return false;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run test
console.log('================================');
console.log('Naukri Login Test');
console.log('================================\n');

testLogin().then(success => {
    console.log('\n================================');
    if (success) {
        console.log('✅ TEST PASSED');
        console.log('================================\n');
        process.exit(0);
    } else {
        console.log('❌ TEST FAILED');
        console.log('================================\n');
        console.log('Next steps:');
        console.log('1. Update TEST_PASSWORD in this script');
        console.log('2. Check login-failed.png screenshot');
        console.log('3. Try running with headless: false to watch');
        console.log('');
        process.exit(1);
    }
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
