// src/routes/attendance.routes.js
import express from 'express';
import protect from '../middleware/auth.middleware.js';
import { isStudent, isRepOrAdmin } from '../middleware/role.middleware.js';
import { 
    markAttendance, 
    overrideMarkAttendance,
    exportAttendance 
} from '../controllers/attendance.controller.js';

const router = express.Router();

router.post('/mark', protect, isStudent, markAttendance);
router.post('/override', protect, isRepOrAdmin, overrideMarkAttendance);
router.get('/export/:sessionId', protect, isRepOrAdmin, exportAttendance);

export default router;