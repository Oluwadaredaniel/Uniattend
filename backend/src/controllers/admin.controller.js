// src/controllers/admin.controller.js
import Faculty from '../models/faculty.model.js';
import Department from '../models/department.model.js';
import User from '../models/user.model.js';
import Student from '../models/student.model.js';
import Session from '../models/session.model.js';
import { hashPassword } from '../utils/passwords.js';
import { parseStudentList } from '../utils/excelParser.js';
import initSocket from '../socket.js';

// Utility to find the correct socket room
const getSessionRoom = (deptId, level) => `dept-${deptId}-level-${level}`;

// --- FACULTY & DEPARTMENT MANAGEMENT ---

// @desc    Create a new Faculty
// @route   POST /api/admin/faculty
export const createFaculty = async (req, res) => {
    const { name } = req.body;
    const faculty = await Faculty.create({ name: name.trim() });
    res.status(201).json(faculty);
};

// @desc    Create a new Department
// @route   POST /api/admin/department
export const createDepartment = async (req, res) => {
    const { facultyId, name, levels, options } = req.body;
    
    if (!facultyId || !name || !levels || !Array.isArray(levels)) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    const department = await Department.create({
        facultyId,
        name: name.trim(),
        levels: levels.map(l => String(l).trim()),
        options: options ? options.map(o => String(o).trim()) : [],
    });
    res.status(201).json(department);
};

// @desc    Manage department courses/options
// @route   PUT /api/admin/department/:deptId
export const manageDepartmentDetails = async (req, res) => {
    const { deptId } = req.params;
    const { courses, options } = req.body;

    const department = await Department.findById(deptId);
    if (!department) return res.status(404).json({ message: 'Department not found.' });

    if (courses && Array.isArray(courses)) department.courses = courses;
    if (options && Array.isArray(options)) department.options = options;
    
    await department.save();
    res.status(200).json(department);
};

// --- USER MANAGEMENT ---

// @desc    Assign a Class Rep (creates a User record)
// @route   POST /api/admin/rep
export const assignClassRep = async (req, res) => {
    const { regNo, name, level, deptId, option } = req.body;
    
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length < 2) return res.status(400).json({ message: 'Please provide full name (first and surname).' });
    
    const surname = parts.pop();
    const firstname = parts.join(' ');
    const regNoUpper = regNo.toUpperCase();

    const dept = await Department.findById(deptId);
    if (!dept) return res.status(404).json({ message: 'Department not found.' });

    const initialPassword = surname;
    const hashedPassword = await hashPassword(initialPassword);

    const rep = await User.create({
        regNo: regNoUpper,
        surname,
        firstname,
        password: hashedPassword,
        role: 'class_rep',
        deptId,
        level,
        option: option || null,
        passwordChanged: false,
    });
    
    res.status(201).json({
        message: 'Class Rep assigned successfully.',
        rep: { _id: rep._id, regNo: rep.regNo, name: `${rep.firstname} ${rep.surname}` },
        initialPassword: surname, 
    });
};

// @desc    Upload Student List (Excel) - Full Upload
// @route   POST /api/admin/students/upload
export const uploadStudentList = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    
    try {
        const studentData = parseStudentList(req.file.buffer, req.file.originalname);
        
        // 1. Get Dept IDs
        const uniqueDeptNames = [...new Set(studentData.map(s => s.deptName))];
        const departments = await Department.find({ name: { $in: uniqueDeptNames } });
        const deptMap = departments.reduce((acc, dept) => {
            acc[dept.name.toUpperCase()] = dept._id;
            return acc;
        }, {});
        
        const bulkRosterOps = [];
        const bulkUserOps = [];
        const errors = [];
        
        for (const s of studentData) {
            const deptId = deptMap[s.deptName.toUpperCase()];
            if (!deptId) {
                errors.push(`RegNo ${s.regNo}: Department '${s.deptName}' not found.`);
                continue;
            }

            const studentDoc = {
                regNo: s.regNo,
                surname: s.surname,
                firstname: s.firstname,
                deptId,
                level: s.level,
                option: s.option,
            };

            // 2. Roster Upsert
            bulkRosterOps.push({
                updateOne: {
                    filter: { regNo: s.regNo },
                    update: { $set: studentDoc },
                    upsert: true,
                }
            });

            // 3. User Upsert (only set password/first-login status on initial insert)
            bulkUserOps.push({
                updateOne: {
                    filter: { regNo: s.regNo },
                    update: {
                        $setOnInsert: { 
                            password: await hashPassword(s.surname), 
                            passwordChanged: false,
                            role: 'student',
                        },
                        $set: studentDoc // Update basic info regardless
                    },
                    upsert: true, 
                }
            });
        }
        
        const bulkRosterResult = await Student.bulkWrite(bulkRosterOps);
        const bulkUserResult = await User.bulkWrite(bulkUserOps);
        
        res.status(200).json({
            message: 'Student list uploaded and processed.',
            summary: {
                totalRows: studentData.length,
                rosterUpserted: bulkRosterResult.upsertedCount + bulkRosterResult.modifiedCount,
                userUpserted: bulkUserResult.upsertedCount + bulkUserResult.modifiedCount,
                errorsCount: errors.length,
            },
            errors,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing student list file.', error: error.message });
    }
};

// --- SESSION OVERRIDES ---

// @desc    Extend session
// @route   PUT /api/admin/session/:sessionId/extend
export const adminExtendSession = async (req, res) => {
    const { sessionId } = req.params;
    const { minutes } = req.body; 

    if (![5, 10, 30, 60].includes(parseInt(minutes))) {
        return res.status(400).json({ message: 'Invalid extension duration.' });
    }
    
    const session = await Session.findById(sessionId);

    if (!session || !session.isActive) {
        return res.status(404).json({ message: 'Active session not found.' });
    }
    
    session.expiresAt = new Date(session.expiresAt.getTime() + minutes * 60 * 1000);
    await session.save();

    const room = getSessionRoom(session.departmentId, session.level);
    initSocket.broadcastEvent('session-updated', session, room);

    res.status(200).json(session);
};

// @desc    Close session
// @route   PUT /api/admin/session/:sessionId/close
export const adminCloseSession = async (req, res) => {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session || !session.isActive) {
        return res.status(404).json({ message: 'Active session not found.' });
    }
    
    session.isActive = false;
    session.expiresAt = new Date();
    await session.save();

    const room = getSessionRoom(session.departmentId, session.level);
    initSocket.broadcastEvent('session-ended', { sessionId: session._id, message: 'Session closed by Super Admin.' }, room);

    res.status(200).json({ message: 'Session closed successfully.', session });
};