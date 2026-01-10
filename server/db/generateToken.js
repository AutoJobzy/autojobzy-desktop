/**
 * Generate JWT Token for User
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const userId = 'da81d7b7-e5ce-4576-a328-364008e15ab0';
const role = 'user';

const token = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
);

console.log('\n=== Token Generated ===\n');
console.log('User ID:', userId);
console.log('Role:', role);
console.log('\nToken:');
console.log(token);
console.log('\n');
