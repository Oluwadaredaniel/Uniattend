// src/controllers/attendance.controller.js
import Session from '../models/session.model.js';
import Attendance from '../models/attendance.model.js';
import Student from '../models/student.model.js';
import initSocket from '../socket.js';
import { exportToBuffer } from '../utils/excelParser.js';

const getSessionRoom = (deptId, level) => `dept-${deptId}-level-${level}`;

// @desc    Student marks their own attendance
// @route   POST /api/attendance/mark
// @access  Private/Student
export const markAttendance = async (req, res) => {
    const { sessionId } = req.body;
    const studentUser = req.user;
    
    const studentRoster = await Student.findOne({ regNo: studentUser.regNo });
    if (!studentRoster) {
        return res.status(404).json({ message: 'Student roster entry not found. Contact Admin.' });
    }

    const session = await Session.findById(sessionId);

    if (!session || !session.isActive || session.expiresAt <= new Date()) {
        return res.status(400).json({ message: 'Session is inactive or expired.' });
    }
    
    const existingAttendance = await Attendance.findOne({
        studentId: studentRoster._id,
        sessionId,
    });

    if (existingAttendance) {
        return res.status(400).json({ message: 'Attendance already marked for this session.' });
    }

    const newAttendance = await Attendance.create({
        studentId: studentRoster._id,
        sessionId,
        timestamp: new Date(),
    });

    await Session.updateOne(
        { _id: sessionId },
        { $push: { attendedStudents: { studentId: studentRoster._id, timestamp: newAttendance.timestamp } } }
    );
    
    const room = getSessionRoom(session.departmentId, session.level);
    initSocket.broadcastEvent('attendance-marked', {
        sessionId,
        studentId: studentRoster._id,
        regNo: studentUser.regNo,
        name: `${studentUser.firstname} ${studentUser.surname}`,
        timestamp: newAttendance.timestamp,
    }, room);

    res.status(201).json({ message: 'Attendance marked successfully.' });
};


// @desc    Rep/Admin marks attendance for any student (including themselves)
// @route   POST /api/attendance/override
// @access  Private/RepOrAdmin
export const overrideMarkAttendance = async (req, res) => {
    const { sessionId, regNo } = req.body;
    const marker = req.user;

    // 1. Find the target student's roster entry
    const studentRoster = await Student.findOne({ regNo: regNo.toUpperCase() });
    if (!studentRoster) {
        return res.status(404).json({ message: `Student with Reg No ${regNo} not found in roster.` });
    }
    
    // 2. Check session validity/scope
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    // Rep scope check (Admins can override any)
    if (marker.role !== 'super_admin' && (String(marker.deptId) !== String(session.departmentId) || marker.level !== session.level)) {
        return res.status(403).json({ message: 'Forbidden: You cannot mark attendance for this session.' });
    }

    // 3. Check for existing attendance
    const existingAttendance = await Attendance.findOne({ studentId: studentRoster._id, sessionId });
    if (existingAttendance) {
        return res.status(400).json({ message: 'Attendance already marked for this student and session.' });
    }
    
    // 4. Record attendance
    const newAttendance = await Attendance.create({
        studentId: studentRoster._id,
        sessionId,
        timestamp: new Date(),
    });

    // 5. Update session's attendedStudents list
    await Session.updateOne(
        { _id: sessionId },
        { $push: { attendedStudents: { studentId: studentRoster._id, timestamp: newAttendance.timestamp } } }
    );
    
    // 6. Broadcast update
    const room = getSessionRoom(session.departmentId, session.level);
    initSocket.broadcastEvent('attendance-marked', {
        sessionId,
        studentId: studentRoster._id,
        regNo: studentRoster.regNo,
        name: `${studentRoster.firstname} ${studentRoster.surname}`,
        timestamp: newAttendance.timestamp,
        markedBy: `${marker.role}`,
    }, room);

    res.status(201).json({ message: `Attendance marked for ${regNo} successfully.` });
};

// @desc    Export attendance sheet
// @route   GET /api/attendance/export/:sessionId
// @access  Private/RepOrAdmin
export const exportAttendance = async (req, res) => {
    const { sessionId } = req.params;
    const { format = 'xlsx' } = req.query;

    if (!['xlsx', 'csv'].includes(format.toLowerCase())) {
        return res.status(400).json({ message: 'Invalid export format. Use csv or xlsx.' });
    }

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    // Scope check
    const user = req.user;
    if (user.role !== 'super_admin' && (String(user.deptId) !== String(session.departmentId) || user.level !== session.level)) {
         return res.status(403).json({ message: 'Forbidden: You cannot export this session.' });
    }
    
    // Fetch all relevant data
    const [allStudents, attendanceRecords] = await Promise.all([
        Student.find({ departmentId: session.departmentId, level: session.level }),
        Attendance.find({ sessionId }).populate('studentId', 'regNo surname firstname')
    ]);

    const attendedMap = attendanceRecords.reduce((acc, record) => {
        acc[record.studentId._id.toString()] = record;
        return acc;
    }, {});

    // Combine and structure data
    const exportData = allStudents.map(student => {
        const record = attendedMap[student._id.toString()];
        
        return {
            regNo: student.regNo,
            surname: student.surname,
            firstname: student.firstname,
            status: record ? 'Present' : 'Absent',
            timestamp: record ? record.timestamp : null,
        };
    });
    
    const fileBuffer = exportToBuffer(exportData, format);
    const filename = `Attendance_Export_${session.course}_${session.title.replace(/\s/g, '_')}.${format}`;

    res.setHeader('Content-Type', `application/${format === 'csv' ? 'csv' : 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'}`);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(fileBuffer);
};