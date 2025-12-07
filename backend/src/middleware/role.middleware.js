// src/middleware/role.middleware.js

const checkRole = (roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
            message: 'Forbidden: You do not have the required permissions.',
        });
    }
    next();
};

export const isAdmin = checkRole(['super_admin']);
export const isRep = checkRole(['class_rep', 'course_rep']);
export const isStudent = checkRole(['student']);
export const isRepOrAdmin = checkRole(['super_admin', 'class_rep', 'course_rep']);