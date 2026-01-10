/**
 * ======================== AUTH MIDDLEWARE ========================
 * JWT token validation and user authentication
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';

/**
 * Generate JWT token with role
 */
export const generateToken = (userId, role = 'user') => {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '30d' });
};

/**
 * Verify JWT token middleware
 */
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.userId = user.userId;
        req.userRole = user.role || 'user';
        next();
    });
};

/**
 * Verify admin role middleware
 * Must be used after authenticateToken
 */
export const authenticateAdmin = async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (!req.userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Fetch user from database to verify role
        const user = await User.findByPk(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                error: 'Admin access required',
                message: 'You do not have permission to access this resource'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                error: 'Account deactivated',
                message: 'Your admin account has been deactivated'
            });
        }

        // Attach user object to request for further use
        req.user = user;
        next();
    } catch (error) {
        console.error('Admin authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

export default { generateToken, authenticateToken, authenticateAdmin };
