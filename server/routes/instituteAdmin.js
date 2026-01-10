/**
 * ======================== INSTITUTE ADMIN ROUTES ========================
 * Routes for institute admins to manage students and staff
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Institute from '../models/Institute.js';
import InstituteSubscription from '../models/InstituteSubscription.js';
import Package from '../models/Package.js';
import InstituteStudent from '../models/InstituteStudent.js';
import InstituteStaff from '../models/InstituteStaff.js';
import InstituteAdmin from '../models/InstituteAdmin.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

const router = express.Router();

// Middleware to check if user is institute admin
const isInstituteAdmin = async (req, res, next) => {
    try {
        if (req.userRole !== 'institute_admin') {
            return res.status(403).json({ error: 'Access denied. Institute admin only.' });
        }

        // Get admin's institute
        const admin = await InstituteAdmin.findOne({
            where: { userId: req.userId },
            include: [{ model: Institute, as: 'institute' }],
        });

        if (!admin) {
            return res.status(404).json({ error: 'Institute admin not found' });
        }

        req.instituteId = admin.instituteId;
        req.institute = admin.institute;
        next();
    } catch (error) {
        console.error('Error in isInstituteAdmin middleware:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// ============================================================================
// DASHBOARD & SUBSCRIPTION INFO
// ============================================================================

/**
 * GET /api/institute-admin/packages
 * Get all available packages for institutes
 */
router.get('/packages', authenticateToken, isInstituteAdmin, async (req, res) => {
    try {
        const packages = await Package.findAll({
            where: {
                type: 'institute',
                isActive: true
            },
            order: [['pricePerMonth', 'ASC']],
        });

        res.json(packages);
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ error: 'Failed to fetch packages' });
    }
});

/**
 * GET /api/institute-admin/dashboard
 * Get dashboard with subscription and student info
 */
router.get('/dashboard', authenticateToken, isInstituteAdmin, async (req, res) => {
    try {
        // Get active subscription
        const subscription = await InstituteSubscription.findOne({
            where: {
                instituteId: req.instituteId,
                status: 'active',
                paymentStatus: 'paid',
            },
            include: [{ model: Package, as: 'package' }],
            order: [['createdAt', 'DESC']],
        });

        // Get student count
        const studentCount = await InstituteStudent.count({
            where: { instituteId: req.instituteId },
        });

        // Get staff count
        const staffCount = await InstituteStaff.count({
            where: { instituteId: req.instituteId },
        });

        // Get admin count
        const adminCount = await InstituteAdmin.count({
            where: { instituteId: req.instituteId },
        });

        // Check if can add more students
        const canAddStudents = subscription
            ? studentCount < subscription.package.studentLimit
            : false;

        const studentLimit = subscription ? subscription.package.studentLimit : 0;

        res.json({
            institute: req.institute,
            subscription: subscription ? {
                packageName: subscription.package.name,
                studentLimit: subscription.package.studentLimit,
                pricePerMonth: subscription.package.pricePerMonth,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                status: subscription.status,
                paymentStatus: subscription.paymentStatus,
            } : null,
            stats: {
                studentCount,
                studentLimit,
                remainingSlots: subscription ? studentLimit - studentCount : 0,
                hasActiveSubscription: !!subscription,
            },
            staffCount,
            adminCount,
            canAddStudents,
            remainingSlots: subscription ? studentLimit - studentCount : 0,
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// ============================================================================
// STUDENT MANAGEMENT
// ============================================================================

/**
 * GET /api/institute-admin/students
 * Get all students in institute
 */
router.get('/students', authenticateToken, isInstituteAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50, search, status } = req.query;

        const where = { instituteId: req.instituteId };

        if (status) {
            where.status = status;
        }

        const students = await InstituteStudent.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt', 'isActive'],
                    where: search
                        ? {
                              [Op.or]: [
                                  { firstName: { [Op.like]: `%${search}%` } },
                                  { lastName: { [Op.like]: `%${search}%` } },
                                  { email: { [Op.like]: `%${search}%` } },
                              ],
                          }
                        : undefined,
                },
                {
                    model: User,
                    as: 'admin',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                },
            ],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['createdAt', 'DESC']],
        });

        res.json({
            totalRecords: students.count,
            totalPages: Math.ceil(students.count / limit),
            currentPage: parseInt(page),
            students: students.rows,
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

/**
 * POST /api/institute-admin/students
 * Add new student to institute
 */
router.post('/students', authenticateToken, isInstituteAdmin, async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            enrollmentNumber,
            batch,
            course,
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check subscription and student limit
        const subscription = await InstituteSubscription.findOne({
            where: {
                instituteId: req.instituteId,
                status: 'active',
                paymentStatus: 'paid',
            },
            include: [{ model: Package, as: 'package' }],
        });

        if (!subscription) {
            return res.status(403).json({
                error: 'No active subscription. Please subscribe to a package first.',
            });
        }

        const studentCount = await InstituteStudent.count({
            where: { instituteId: req.instituteId },
        });

        if (studentCount >= subscription.package.studentLimit) {
            return res.status(403).json({
                error: `Student limit reached (${subscription.package.studentLimit}). Please upgrade your package.`,
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Create user (password will be hashed by User model's beforeCreate hook)
        const user = await User.create({
            id: uuidv4(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password: password, // Will be hashed by beforeCreate hook
            role: 'student',
            instituteId: req.instituteId,
            isActive: true,
        });

        // Add to institute students
        const student = await InstituteStudent.create({
            instituteId: req.instituteId,
            userId: user.id,
            addedBy: req.userId,
            enrollmentNumber,
            batch,
            course,
            status: 'active',
        });

        console.log(`✅ Student created: ${email} by institute admin ${req.userId}`);

        res.status(201).json({
            message: 'Student added successfully',
            student: {
                ...student.toJSON(),
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                },
            },
        });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ error: 'Failed to add student', details: error.message });
    }
});

/**
 * PUT /api/institute-admin/students/:id
 * Update student details
 */
router.put('/students/:id', authenticateToken, isInstituteAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { enrollmentNumber, batch, course, status } = req.body;

        const student = await InstituteStudent.findOne({
            where: {
                id,
                instituteId: req.instituteId,
            },
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        await student.update({
            enrollmentNumber,
            batch,
            course,
            status,
        });

        res.json({ message: 'Student updated successfully', student });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Failed to update student' });
    }
});

/**
 * DELETE /api/institute-admin/students/:id
 * Remove student from institute
 */
router.delete('/students/:id', authenticateToken, isInstituteAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const student = await InstituteStudent.findOne({
            where: {
                id,
                instituteId: req.instituteId,
            },
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        await student.destroy();
        res.json({ message: 'Student removed from institute successfully' });
    } catch (error) {
        console.error('Error removing student:', error);
        res.status(500).json({ error: 'Failed to remove student' });
    }
});

/**
 * PUT /api/institute-admin/students/:userId/password
 * Change student password
 */
router.put('/students/:userId/password', authenticateToken, isInstituteAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Get student and verify it belongs to this institute
        const student = await User.findOne({
            where: {
                id: userId,
                role: 'student',
                instituteId: req.instituteId,
            },
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found or does not belong to your institute' });
        }

        // Hash and update password
        const hashedPassword = await bcrypt.hash(password, 10);
        await student.update({ password: hashedPassword });

        console.log(`✅ Student password changed: ${student.email} by institute admin ${req.userId}`);

        res.json({ message: 'Student password updated successfully' });
    } catch (error) {
        console.error('Error updating student password:', error);
        res.status(500).json({ error: 'Failed to update student password' });
    }
});

/**
 * PUT /api/institute-admin/students/:userId/details
 * Update student user details (firstName, lastName, email)
 */
router.put('/students/:userId/details', authenticateToken, isInstituteAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, email, isActive } = req.body;

        // Get student and verify it belongs to this institute
        const student = await User.findOne({
            where: {
                id: userId,
                role: 'student',
                instituteId: req.instituteId,
            },
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found or does not belong to your institute' });
        }

        // Update student details
        await student.update({
            firstName: firstName?.trim() || student.firstName,
            lastName: lastName?.trim() || student.lastName,
            email: email?.trim() || student.email,
            isActive: isActive !== undefined ? isActive : student.isActive,
        });

        console.log(`✅ Student details updated: ${student.email} by institute admin ${req.userId}`);

        res.json({
            message: 'Student details updated successfully',
            student: {
                id: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                isActive: student.isActive,
            },
        });
    } catch (error) {
        console.error('Error updating student details:', error);
        res.status(500).json({ error: 'Failed to update student details' });
    }
});

/**
 * PUT /api/institute-admin/students/:userId/toggle-active
 * Toggle student active/inactive status
 */
router.put('/students/:userId/toggle-active', authenticateToken, isInstituteAdmin, async (req, res) => {
    try {
        const { userId } = req.params;

        // Get student and verify it belongs to this institute
        const student = await User.findOne({
            where: {
                id: userId,
                role: 'student',
                instituteId: req.instituteId,
            },
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found or does not belong to your institute' });
        }

        // Toggle active status
        await student.update({
            isActive: !student.isActive,
        });

        console.log(`✅ Student status toggled: ${student.email} is now ${student.isActive ? 'active' : 'inactive'} by institute admin ${req.userId}`);

        res.json({
            message: `Student ${student.isActive ? 'activated' : 'deactivated'} successfully`,
            student: {
                id: student.id,
                isActive: student.isActive,
            },
        });
    } catch (error) {
        console.error('Error toggling student status:', error);
        res.status(500).json({ error: 'Failed to toggle student status' });
    }
});

// ============================================================================
// SUBSCRIPTION & PAYMENT
// ============================================================================

/**
 * POST /api/institute-admin/create-subscription-order
 * Create Razorpay order for package subscription
 */
router.post('/create-subscription-order', authenticateToken, isInstituteAdmin, async (req, res) => {
    try {
        const { packageId } = req.body;

        if (!packageId) {
            return res.status(400).json({ error: 'Package ID is required' });
        }

        // Get package details
        const package_ = await Package.findByPk(packageId);
        if (!package_ || !package_.isActive) {
            return res.status(404).json({ error: 'Package not found or inactive' });
        }

        // Import Razorpay
        const Razorpay = (await import('razorpay')).default;
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Create Razorpay order
        const amount = Math.round(package_.pricePerMonth * 100); // Convert to paise
        const receipt = `inst_${req.instituteId}_${Date.now()}`;

        const order = await razorpay.orders.create({
            amount,
            currency: 'INR',
            receipt,
            notes: {
                instituteId: req.instituteId,
                packageId: package_.id,
                packageName: package_.name,
            },
        });

        console.log(`✅ Razorpay order created for institute ${req.instituteId}:`, order.id);

        res.json({
            success: true,
            orderId: order.id,
            amount: amount / 100,
            currency: 'INR',
            packageName: package_.name,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error('Error creating subscription order:', error);
        res.status(500).json({ error: 'Failed to create order', details: error.message });
    }
});

/**
 * POST /api/institute-admin/verify-payment
 * Verify payment and create subscription
 */
router.post('/verify-payment', authenticateToken, isInstituteAdmin, async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, packageId } = req.body;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Payment details required' });
        }

        // Verify signature
        const crypto = await import('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Get package
        const package_ = await Package.findByPk(packageId);
        if (!package_) {
            return res.status(404).json({ error: 'Package not found' });
        }

        // Create or update subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

        const [subscription, created] = await InstituteSubscription.upsert({
            instituteId: req.instituteId,
            packageId: package_.id,
            startDate,
            endDate,
            status: 'active',
            paymentStatus: 'paid',
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
        });

        console.log(`✅ Subscription ${created ? 'created' : 'updated'} for institute ${req.instituteId}`);

        res.json({
            success: true,
            message: 'Payment verified and subscription activated successfully',
            subscription,
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Failed to verify payment', details: error.message });
    }
});

// ============================================================================
// STAFF MANAGEMENT
// ============================================================================

/**
 * GET /api/institute-admin/staff
 * Get all staff in institute
 */
router.get('/staff', authenticateToken, isInstituteAdmin, async (req, res) => {
    try {
        const staff = await InstituteStaff.findAll({
            where: { instituteId: req.instituteId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt'],
                },
                {
                    model: User,
                    as: 'admin',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json(staff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
});

/**
 * POST /api/institute-admin/staff
 * Add new staff member
 */
router.post('/staff', authenticateToken, isInstituteAdmin, async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Create user (password will be hashed by User model's beforeCreate hook)
        const user = await User.create({
            id: uuidv4(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password: password, // Will be hashed by beforeCreate hook
            role: 'staff',
            instituteId: req.instituteId,
            isActive: true,
        });

        // Add to institute staff
        const staff = await InstituteStaff.create({
            instituteId: req.instituteId,
            userId: user.id,
            addedBy: req.userId,
            role,
        });

        res.status(201).json({
            message: 'Staff added successfully',
            staff: {
                ...staff.toJSON(),
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                },
            },
        });
    } catch (error) {
        console.error('Error adding staff:', error);
        res.status(500).json({ error: 'Failed to add staff', details: error.message });
    }
});

/**
 * DELETE /api/institute-admin/staff/:id
 * Remove staff member
 */
router.delete('/staff/:id', authenticateToken, isInstituteAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const staff = await InstituteStaff.findOne({
            where: {
                id,
                instituteId: req.instituteId,
            },
        });

        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }

        await staff.destroy();
        res.json({ message: 'Staff removed from institute successfully' });
    } catch (error) {
        console.error('Error removing staff:', error);
        res.status(500).json({ error: 'Failed to remove staff' });
    }
});

export default router;
