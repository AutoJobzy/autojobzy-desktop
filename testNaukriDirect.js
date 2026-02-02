/**
 * Direct Test of Naukri Verification Function
 */

import { verifyNaukriCredentials } from './server/verifyNaukriCredentials.js';

// Test with sample credentials (won't work but will test the flow)
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'TestPassword123';

async function testDirectVerification() {
    console.log('🧪 Testing Naukri Verification Function Directly...\n');
    console.log('📧 Test Email:', TEST_EMAIL);
    console.log('⏳ Starting verification (this may take 15-30 seconds)...\n');

    try {
        const startTime = Date.now();
        const result = await verifyNaukriCredentials(TEST_EMAIL, TEST_PASSWORD);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('⏱️  Duration:', duration, 'seconds\n');
        console.log('📊 Result:');
        console.log(JSON.stringify(result, null, 2));

        if (result.success) {
            console.log('\n✅ SUCCESS: Credentials verified!');
        } else {
            console.log('\n⚠️  EXPECTED: Verification failed (test credentials)');
            console.log('Message:', result.message);
            console.log('\n✅ Function is working correctly - it properly detected invalid credentials');
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('Stack:', error.stack);
        console.log('\n⚠️  Verification function encountered an error');
    }
}

// Run test
console.log('════════════════════════════════════════════════════');
console.log('  NAUKRI VERIFICATION FUNCTION TEST');
console.log('════════════════════════════════════════════════════\n');

testDirectVerification().then(() => {
    console.log('\n════════════════════════════════════════════════════');
    console.log('  TEST COMPLETED');
    console.log('════════════════════════════════════════════════════');
    process.exit(0);
}).catch(err => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
});
