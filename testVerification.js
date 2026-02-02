/**
 * Test Naukri Verification Endpoint
 */

import fetch from 'node-fetch';

const API_URL = 'https://api.autojobzy.comapi';

// Test credentials - you can change these
const TEST_EMAIL = 'rohankadam474@gmail.com';
const TEST_PASSWORD = 'Rohan@123';

async function testVerification() {
    console.log('🧪 Testing Naukri Verification...\n');

    try {
        // Step 1: Login first to get token
        console.log('1️⃣ Logging in to get auth token...');
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            })
        });

        if (!loginResponse.ok) {
            console.error('❌ Login failed:', loginResponse.status);
            const error = await loginResponse.json();
            console.error('Error:', error);
            return;
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ Login successful! Token received.\n');

        // Step 2: Test Naukri verification
        console.log('2️⃣ Testing Naukri credential verification...');
        console.log(`   Using email: ${TEST_EMAIL}`);
        console.log('   Testing verification endpoint...\n');

        const verifyResponse = await fetch(`${API_URL}/auth/verify-naukri-credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                naukriUsername: TEST_EMAIL,
                naukriPassword: TEST_PASSWORD
            })
        });

        const verifyData = await verifyResponse.json();

        if (verifyResponse.ok) {
            console.log('✅ Verification request completed!');
            console.log('\n📊 Response:');
            console.log(JSON.stringify(verifyData, null, 2));

            if (verifyData.success) {
                console.log('\n🎉 SUCCESS: Naukri credentials verified!');
            } else {
                console.log('\n⚠️  FAILED: Credentials could not be verified');
                console.log('Message:', verifyData.message);
            }
        } else {
            console.error('❌ Verification request failed:', verifyResponse.status);
            console.error('Response:', verifyData);
        }

    } catch (error) {
        console.error('\n❌ Test Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run test
testVerification().then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
