// src/controllers/session.controller.js
import Session from '../models/session.model.js';
import Student from '../models/student.model.js';
import User from '../models/user.model.js';

// @desc    Get current active session for a student's department/level
// @route   GET /api/sessions/active
// @access  Private/Student
export const getActiveSession = async (req, res) => {
    const studentUser = req.user;

    const session = await Session.findOne({
        departmentId: studentUser.deptId,
        level: studentUser.level,
        isActive: true,
        expiresAt: { $gt: new Date() }
    })
    .select('-attendedStudents') 
    .populate('createdBy', 'regNo firstname surname');

    res.status(200).json({ session });
};

// @desc    Get all sessions for a rep's/admin's scope (past and active)
// @route   GET /api/sessions/all
// @access  Private/RepOrAdmin
export const getAllSessions = async (req, res) => {
    const user = req.user;
    let filter = {};

    if (user.role === 'class_rep' || user.role === 'course_rep') {
        filter = { 
            departmentId: user.deptId, 
            level: user.level 
        };
    } 

    const sessions = await Session.find(filter)
        .sort({ startsAt: -1 })
        .populate('createdBy', 'regNo firstname surname');

    res.status(200).json(sessions);
};