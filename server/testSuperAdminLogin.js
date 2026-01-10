/**
 * Test Super Admin Login
 * Run: node server/testSuperAdminLogin.js
 */

import fetch from 'node-fetch';
import { jwtDecode } from 'jwt-decode';

const testLogin = async () => {
    console.log('🧪 Testing Super Admin Login...\n');

    const API_BASE_URL = 'https://api.autojobzy.com/api';

    try {
        // Step 1: Login
        console.log('1️⃣  Attempting login...');
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'superadmin@jobautomation.com',
                password: 'Admin@123'
            })
        });

        if (!loginResponse.ok) {
            const error = await loginResponse.json();
            console.error('❌ Login failed:', error);
            return;
        }

        const loginData = await loginResponse.json();
        console.log('✅ Login successful!');
        console.log('   Token:', loginData.token.substring(0, 50) + '...');

        // Step 2: Decode token
        console.log('\n2️⃣  Decoding token...');
        const decoded = jwtDecode(loginData.token);
        console.log('   User ID:', decoded.userId);
        console.log('   Role:', decoded.role);
        console.log('   Email:', decoded.email);

        if (decoded.role !== 'superadmin') {
            console.error('❌ Role is not superadmin!');
            return;
        }

        console.log('✅ Role verified: superadmin');

        // Step 3: Test dashboard API
        console.log('\n3️⃣  Testing dashboard API...');
        const dashboardResponse = await fetch(`${API_BASE_URL}/superadmin/dashboard-stats`, {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });

        if (!dashboardResponse.ok) {
            const error = await dashboardResponse.json();
            console.error('❌ Dashboard API failed:', error);
            return;
        }

        const dashboardData = await dashboardResponse.json();
        console.log('✅ Dashboard API working!');
        console.log('\n📊 Dashboard Stats:');
        console.log('   Total Institutes:', dashboardData.totalInstitutes);
        console.log('   Active Institutes:', dashboardData.activeInstitutes);
        console.log('   Total Students:', dashboardData.totalStudents);
        console.log('   Total Revenue: ₹', dashboardData.totalRevenue);

        // Step 4: Test packages API
        console.log('\n4️⃣  Testing packages API...');
        const packagesResponse = await fetch(`${API_BASE_URL}/superadmin/packages`, {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });

        if (!packagesResponse.ok) {
            const error = await packagesResponse.json();
            console.error('❌ Packages API failed:', error);
            return;
        }

        const packagesData = await packagesResponse.json();
        console.log('✅ Packages API working!');
        console.log(`   Found ${packagesData.length} packages:`);
        packagesData.forEach(pkg => {
            console.log(`   - ${pkg.name}: ${pkg.studentLimit} students, ₹${pkg.pricePerMonth}/month`);
        });

        // Step 5: Test institutes API
        console.log('\n5️⃣  Testing institutes API...');
        const institutesResponse = await fetch(`${API_BASE_URL}/superadmin/institutes`, {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });

        if (!institutesResponse.ok) {
            const error = await institutesResponse.json();
            console.error('❌ Institutes API failed:', error);
            return;
        }

        const institutesData = await institutesResponse.json();
        console.log('✅ Institutes API working!');
        console.log(`   Found ${institutesData.length} institutes`);

        console.log('\n🎉 All tests passed! Super admin is ready to use.');
        console.log('\n📝 Next steps:');
        console.log('   1. Open browser and go to: http://localhost:3000/auth');
        console.log('   2. Login with: superadmin@jobautomation.com / Admin@123');
        console.log('   3. You should be redirected to: /superadmin/dashboard');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

testLogin();
