/**
 * Debug script to find current Naukri login page selectors
 * This will help identify the correct input fields on the login page
 */

import puppeteer from 'puppeteer';

async function findLoginSelectors() {
    console.log('🔍 Inspecting Naukri login page...\n');

    const browser = await puppeteer.launch({
        headless: false,  // Show browser so you can see what's happening
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    try {
        console.log('📄 Navigating to Naukri login page...');
        await page.goto('https://www.naukri.com/nlogin/login', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        console.log('✅ Page loaded!\n');

        // Wait a bit for any dynamic content
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Find all input fields on the page
        const inputFields = await page.evaluate(() => {
            const inputs = document.querySelectorAll('input');
            return Array.from(inputs).map(input => ({
                id: input.id || 'N/A',
                name: input.name || 'N/A',
                type: input.type || 'N/A',
                placeholder: input.placeholder || 'N/A',
                className: input.className || 'N/A',
                value: input.value || '',
                visible: input.offsetParent !== null
            })).filter(input => input.visible); // Only visible inputs
        });

        console.log('📋 Found Input Fields:\n');
        console.log('=' .repeat(80));

        inputFields.forEach((field, index) => {
            console.log(`\nInput ${index + 1}:`);
            console.log(`  ID:          ${field.id}`);
            console.log(`  Name:        ${field.name}`);
            console.log(`  Type:        ${field.type}`);
            console.log(`  Placeholder: ${field.placeholder}`);
            console.log(`  Class:       ${field.className}`);
        });

        console.log('\n' + '='.repeat(80));

        // Try common selector patterns
        console.log('\n🔍 Testing Common Selectors:\n');

        const selectorsToTest = [
            // Old selectors
            '#usernameField',
            '#passwordField',

            // Common ID patterns
            '#username',
            '#password',
            '#email',
            '#usernameInput',
            '#passwordInput',

            // Common name patterns
            'input[name="username"]',
            'input[name="password"]',
            'input[name="email"]',
            'input[name="login"]',

            // Type-based
            'input[type="text"]',
            'input[type="email"]',
            'input[type="password"]',

            // Placeholder-based
            'input[placeholder*="Email"]',
            'input[placeholder*="email"]',
            'input[placeholder*="Username"]',
            'input[placeholder*="username"]',
            'input[placeholder*="Password"]',
            'input[placeholder*="password"]',

            // Class-based common patterns
            '.username-field',
            '.password-field',
            '.email-input',
            '.login-input'
        ];

        const foundSelectors = [];

        for (const selector of selectorsToTest) {
            try {
                const element = await page.$(selector);
                if (element) {
                    const info = await page.evaluate(el => ({
                        selector: el.tagName.toLowerCase() +
                                 (el.id ? `#${el.id}` : '') +
                                 (el.className ? `.${el.className.split(' ').join('.')}` : ''),
                        id: el.id,
                        name: el.name,
                        type: el.type,
                        placeholder: el.placeholder
                    }), element);

                    console.log(`✅ Found: ${selector}`);
                    console.log(`   → ${JSON.stringify(info, null, 2)}`);
                    foundSelectors.push({ selector, info });
                }
            } catch (e) {
                // Selector not found, continue
            }
        }

        if (foundSelectors.length === 0) {
            console.log('❌ None of the common selectors found!');
            console.log('\n💡 Recommendation: Check the input fields list above and identify:');
            console.log('   1. Which field is for email/username (check placeholder or type)');
            console.log('   2. Which field is for password (type="password")');
        }

        // Take a screenshot for reference
        await page.screenshot({ path: 'naukri-login-page.png', fullPage: true });
        console.log('\n📸 Screenshot saved: naukri-login-page.png');

        // Keep browser open for manual inspection
        console.log('\n⏸️  Browser will stay open for 30 seconds for manual inspection...');
        console.log('   You can inspect the page elements manually.');
        await new Promise(resolve => setTimeout(resolve, 30000));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
        console.log('\n✅ Done! Check the output above to find the correct selectors.');
    }
}

findLoginSelectors().catch(console.error);
