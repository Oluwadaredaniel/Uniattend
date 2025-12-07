// src/routes/admin.routes.js
import express from 'express';
import multer from 'multer';
import { isAdmin } from '../middleware/role.middleware.js';
import protect from '../middleware/auth.middleware.js';
import {
    createFaculty,
    createDepartment,
    manageDepartmentDetails,
    assignClassRep,
    uploadStudentList,
    adminExtendSession,
    adminCloseSession,
} from '../controllers/admin.controller.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); 

router.use(protect, isAdmin);

// Onboarding & Management
router.post('/faculty', createFaculty);
router.post('/department', createDepartment);
router.put('/department/:deptId', manageDepartmentDetails); // Manage courses/options
router.post('/rep', assignClassRep);

// Student List Upload (Full Roster)
router.post('/students/upload', upload.single('studentListFile'), uploadStudentList);

// Session Overrides
router.put('/session/:sessionId/extend', adminExtendSession);
router.put('/session/:sessionId/close', adminCloseSession);

export default router;