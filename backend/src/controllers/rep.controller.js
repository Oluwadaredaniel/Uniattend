// src/controllers/rep.controller.js
import Session from '../models/session.model.js';
import User from '../models/user.model.js';
import Student from '../models/student.model.js';
import Department from '../models/department.model.js';
import { parseStudentList } from '../utils/excelParser.js';
import { hashPassword } from '../utils/passwords.js';
import initSocket from '../socket.js'; 

const DURATION_OPTIONS = [10, 30, 60, 180, 240];
const getSessionRoom = (deptId, level) => `dept-${deptId}-level-${level}`;

// @desc    Create a new attendance session
// @route   POST /api/rep/sessions
export const createSession = async (req, res) => {
    const { title, course, durationMinutes } = req.body;
    const rep = req.user; 

    if (!DURATION_OPTIONS.includes(parseInt(durationMinutes))) {
        return res.status(400).json({ message: 'Invalid duration selected.' });
    }

    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

    const session = await Session.create({
        title,
        course: course.toUpperCase(),
        departmentId: rep.deptId,
        level: rep.level,
        createdBy: rep._id,
        startsAt,
        expiresAt,
        durationMinutes,
        isActive: true,
    });

    const sessionObject = session.toObject();
    const room = getSessionRoom(rep.deptId, rep.level);
    initSocket.broadcastEvent('new-session', sessionObject, room);

    res.status(201).json(sessionObject);
};

// @desc    Extend an active session
// @route   PUT /api/rep/sessions/:sessionId/extend
export const extendSession = async (req, res) => {
    const { sessionId } = req.params;
    const { minutes } = req.body; 

    if (![5, 10, 30, 60].includes(parseInt(minutes))) {
        return res.status(400).json({ message: 'Invalid extension duration.' });
    }
    
    // Rep must be the creator OR an admin could use the admin route
    const session = await Session.findOne({ 
        _id: sessionId, 
        createdBy: req.user._id, 
        isActive: true,
    });

    if (!session) {
        return res.status(404).json({ message: 'Active session not found or you are not the creator.' });
    }
    
    session.expiresAt = new Date(session.expiresAt.getTime() + minutes * 60 * 1000);
    await session.save();

    const room = getSessionRoom(session.departmentId, session.level);
    initSocket.broadcastEvent('session-updated', session, room);

    res.status(200).json(session);
};

// @desc    End an active session early
// @route   PUT /api/rep/sessions/:sessionId/close
export const closeSession = async (req, res) => {
    const { sessionId } = req.params;

    const session = await Session.findOne({ 
        _id: sessionId, 
        createdBy: req.user._id, 
        isActive: true,
    });

    if (!session) {
        return res.status(404).json({ message: 'Active session not found or you are not the creator.' });
    }
    
    session.expiresAt = new Date();
    session.isActive = false;
    await session.save();

    const room = getSessionRoom(session.departmentId, session.level);
    initSocket.broadcastEvent('session-ended', { sessionId: session._id, message: 'Session closed by Class Rep.' }, room);

    res.status(200).json({ message: 'Session closed successfully.', session });
};

// @desc    Upload partial student list (adds missing students to Rep's class)
// @route   POST /api/rep/students/upload-partial
export const uploadPartialStudentList = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const rep = req.user;
    
    try {
        const studentData = parseStudentList(req.file.buffer, req.file.originalname);
        
        // Filter for the Rep's department/level
        const dept = await Department.findById(rep.deptId);
        
        const studentsToProcess = studentData.filter(s => 
            s.deptName.toUpperCase() === dept.name.toUpperCase() && 
            s.level === rep.level
        );
        
        if (studentsToProcess.length === 0) {
             return res.status(400).json({ message: 'No student data found relevant to your class in the file.' });
        }

        const bulkUserOps = [];
        const bulkRosterOps = [];
        let newStudentsCount = 0;
        
        for (const s of studentsToProcess) {
            
            // Roster Upsert
            bulkRosterOps.push({
                updateOne: {
                    filter: { regNo: s.regNo },
                    update: { $set: {
                        regNo: s.regNo,
                        surname: s.surname,
                        firstname: s.firstname,
                        deptId: rep.deptId,
                        level: rep.level,
                        option: s.option,
                    } },
                    upsert: true,
                }
            });

            // User Upsert
            bulkUserOps.push({
                updateOne: {
                    filter: { regNo: s.regNo },
                    update: {
                        $setOnInsert: {
                            regNo: s.regNo,
                            surname: s.surname,
                            firstname: s.firstname,
                            role: 'student',
                            deptId: rep.deptId,
                            level: rep.level,
                            option: s.option,
                            password: await hashPassword(s.surname),
                            passwordChanged: false,
                        }
                    },
                    upsert: true, 
                }
            });
        }
        
        // Count new inserts before execution to ensure accuracy
        const result = await User.bulkWrite(bulkUserOps);
        await Student.bulkWrite(bulkRosterOps);
        newStudentsCount = result.upsertedCount;

        res.status(200).json({
            message: 'Partial student list processed. New students added.',
            summary: {
                totalRowsProcessed: studentsToProcess.length,
                newStudentsAdded: newStudentsCount,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing partial student list file.', error: error.message });
    }
};