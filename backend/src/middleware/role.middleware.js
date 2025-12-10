// src/middleware/role.middleware.js

const checkRole = (roles) => (req, res, next) => {
    // New Logic: A Super Admin implicitly passes ALL permission checks.
    // We handle the 'student' role specifically for SuperAdmin for elegance,
    // but SuperAdmin should conceptually pass any non-admin/rep specific check.
    
    // Feature 3: Super Admin is implicitly a student
    if (roles.includes('student') && req.user && req.user.role === 'super_admin') {
        return next();
    }
    
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
            message: 'Forbidden: You do not have the required permissions.',
        });
    }
    next();
};

export const isAdmin = checkRole(['super_admin']);
export const isRep = checkRole(['class_rep', 'course_rep']);

// --- CORRECTION APPLIED HERE ---
// Class Reps are students and must be able to access student routes like attendance marking.
export const isStudent = checkRole(['student', 'class_rep', 'course_rep']); 
// -------------------------------

export const isRepOrAdmin = checkRole(['super_admin', 'class_rep', 'course_rep']);