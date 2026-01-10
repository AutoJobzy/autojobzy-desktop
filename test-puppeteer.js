/**
 * Puppeteer EC2 Test Script
 * Run this on your EC2 instance to verify Puppeteer is working correctly
 *
 * Usage: node test-puppeteer.js
 */

import puppeteer from 'puppeteer';

console.log('🔍 Testing Puppeteer on EC2...\n');

const tests = {
    passed: 0,
    failed: 0,
    results: []
};

function addResult(testName, passed, message) {
    const status = passed ? '✅' : '❌';
    const result = `${status} ${testName}: ${message}`;
    console.log(result);
    tests.results.push(result);
    if (passed) tests.passed++;
    else tests.failed++;
}

async function runTests() {
    let browser;

    try {
        // Test 1: Check Puppeteer installation
        console.log('Test 1: Checking Puppeteer installation...');
        const execPath = puppeteer.executablePath();
        addResult('Puppeteer Installation', true, `Found at ${execPath}`);

        // Test 2: Check if Chromium executable exists
        console.log('\nTest 2: Checking Chromium executable...');
        const fs = await import('fs');
        const exists = fs.existsSync(execPath);
        addResult('Chromium Exists', exists, exists ? 'Chromium found' : 'Chromium not found');

        // Test 3: Launch browser with minimal config
        console.log('\nTest 3: Launching browser (minimal config)...');
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            addResult('Browser Launch (Minimal)', true, 'Browser launched successfully');
        } catch (error) {
            addResult('Browser Launch (Minimal)', false, error.message);
            throw error;
        }

        // Test 4: Create a new page
        console.log('\nTest 4: Creating new page...');
        let page;
        try {
            page = await browser.newPage();
            addResult('Page Creation', true, 'Page created successfully');
        } catch (error) {
            addResult('Page Creation', false, error.message);
            throw error;
        }

        // Test 5: Navigate to a website
        console.log('\nTest 5: Navigating to Google...');
        try {
            await page.goto('https://www.google.com', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });
            const title = await page.title();
            addResult('Navigation', true, `Loaded: "${title}"`);
        } catch (error) {
            addResult('Navigation', false, error.message);
        }

        // Test 6: Take a screenshot
        console.log('\nTest 6: Taking screenshot...');
        try {
            await page.screenshot({ path: 'test-screenshot.png' });
            addResult('Screenshot', true, 'Screenshot saved as test-screenshot.png');
        } catch (error) {
            addResult('Screenshot', false, error.message);
        }

        // Test 7: Test production configuration
        console.log('\nTest 7: Testing production configuration...');
        await browser.close();

        const isLinux = process.platform === 'linux';
        browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--window-size=1920,1080',
            ],
            ignoreHTTPSErrors: true,
            ...(isLinux && {
                executablePath: '/usr/bin/google-chrome-stable',
            })
        });

        addResult('Production Config Launch', true, 'Production config works');

        // Test 8: Test Naukri.com navigation (your actual use case)
        console.log('\nTest 8: Testing Naukri.com navigation...');
        page = await browser.newPage();
        try {
            await page.goto('https://www.naukri.com', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });
            const title = await page.title();
            addResult('Naukri.com Access', true, `Loaded: "${title}"`);
        } catch (error) {
            addResult('Naukri.com Access', false, error.message);
        }

        // Test 9: Memory usage check
        console.log('\nTest 9: Checking memory usage...');
        const used = process.memoryUsage();
        const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
        const rssMB = Math.round(used.rss / 1024 / 1024);
        addResult('Memory Usage', heapUsedMB < 500, `Heap: ${heapUsedMB}MB, RSS: ${rssMB}MB`);

        // Test 10: Multiple pages test
        console.log('\nTest 10: Testing multiple pages...');
        try {
            const pages = await Promise.all([
                browser.newPage(),
                browser.newPage(),
                browser.newPage()
            ]);

            await Promise.all(pages.map((p, i) =>
                p.goto(`https://www.google.com/search?q=test${i}`, {
                    waitUntil: 'domcontentloaded',
                    timeout: 10000
                })
            ));

            for (const p of pages) {
                await p.close();
            }

            addResult('Multiple Pages', true, 'Successfully handled 3 concurrent pages');
        } catch (error) {
            addResult('Multiple Pages', false, error.message);
        }

    } catch (error) {
        console.error('\n❌ Fatal Error:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${tests.passed}`);
    console.log(`❌ Failed: ${tests.failed}`);
    console.log(`📈 Total:  ${tests.passed + tests.failed}`);
    console.log('='.repeat(60));

    if (tests.failed === 0) {
        console.log('\n🎉 All tests passed! Your EC2 instance is ready for Puppeteer automation.');
        console.log('\nNext steps:');
        console.log('1. Start your server: npm run server');
        console.log('2. Test job automation with 1-2 jobs first');
        console.log('3. Monitor logs and memory usage');
    } else {
        console.log('\n⚠️  Some tests failed. Check the errors above.');
        console.log('\nCommon fixes:');
        console.log('1. Run setup script: ./setup-ec2-puppeteer.sh');
        console.log('2. Install missing dependencies');
        console.log('3. Check Chrome installation: google-chrome --version');
        console.log('4. See PUPPETEER-EC2-GUIDE.md for detailed troubleshooting');
    }

    console.log('\n');
    process.exit(tests.failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
});
