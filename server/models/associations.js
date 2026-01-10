/**
 * ======================== MODEL ASSOCIATIONS ========================
 * Define all model associations after all models are loaded
 * This file should be imported in server/index.js after model imports
 */

import Institute from './Institute.js';
import Package from './Package.js';
import InstituteSubscription from './InstituteSubscription.js';
import InstituteAdmin from './InstituteAdmin.js';
import InstituteStaff from './InstituteStaff.js';
import InstituteStudent from './InstituteStudent.js';
import User from './User.js';

// Institute -> InstituteSubscription (one-to-many)
Institute.hasMany(InstituteSubscription, {
    foreignKey: 'instituteId',
    as: 'subscriptions',
});
InstituteSubscription.belongsTo(Institute, {
    foreignKey: 'instituteId',
    as: 'institute',
});

// Package -> InstituteSubscription (one-to-many)
Package.hasMany(InstituteSubscription, {
    foreignKey: 'packageId',
    as: 'subscriptions',
});
InstituteSubscription.belongsTo(Package, {
    foreignKey: 'packageId',
    as: 'package',
});

// Institute -> InstituteAdmin (one-to-many)
Institute.hasMany(InstituteAdmin, {
    foreignKey: 'instituteId',
    as: 'admins',
});
InstituteAdmin.belongsTo(Institute, {
    foreignKey: 'instituteId',
    as: 'institute',
});

// User -> InstituteAdmin (one-to-many)
User.hasMany(InstituteAdmin, {
    foreignKey: 'userId',
    as: 'instituteAdminRoles',
});
InstituteAdmin.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});

// Institute -> InstituteStaff (one-to-many)
Institute.hasMany(InstituteStaff, {
    foreignKey: 'instituteId',
    as: 'staff',
});
InstituteStaff.belongsTo(Institute, {
    foreignKey: 'instituteId',
    as: 'institute',
});

// User -> InstituteStaff (one-to-many)
User.hasMany(InstituteStaff, {
    foreignKey: 'userId',
    as: 'instituteStaffRoles',
});
InstituteStaff.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});

// Institute -> InstituteStudent (one-to-many)
Institute.hasMany(InstituteStudent, {
    foreignKey: 'instituteId',
    as: 'students',
});
InstituteStudent.belongsTo(Institute, {
    foreignKey: 'instituteId',
    as: 'institute',
});

// User -> InstituteStudent (one-to-many)
User.hasMany(InstituteStudent, {
    foreignKey: 'userId',
    as: 'instituteStudentRoles',
});
InstituteStudent.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});

// User (added_by) -> InstituteStaff (one-to-many)
User.hasMany(InstituteStaff, {
    foreignKey: 'addedBy',
    as: 'addedStaff',
});
InstituteStaff.belongsTo(User, {
    foreignKey: 'addedBy',
    as: 'admin',
});

// User (added_by) -> InstituteStudent (one-to-many)
User.hasMany(InstituteStudent, {
    foreignKey: 'addedBy',
    as: 'addedStudents',
});
InstituteStudent.belongsTo(User, {
    foreignKey: 'addedBy',
    as: 'admin',
});

console.log('✅ Model associations defined');

export default {
    Institute,
    Package,
    InstituteSubscription,
    InstituteAdmin,
    InstituteStaff,
    InstituteStudent,
    User,
};
