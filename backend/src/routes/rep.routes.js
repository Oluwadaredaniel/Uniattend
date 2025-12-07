// src/routes/rep.routes.js
import express from 'express';
import multer from 'multer';
import { isRep } from '../middleware/role.middleware.js';
import protect from '../middleware/auth.middleware.js';
import {
    createSession,
    extendSession,
    closeSession,
    uploadPartialStudentList,
} from '../controllers/rep.controller.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect, isRep);

// Session Management
router.post('/sessions', createSession);
router.put('/sessions/:sessionId/extend', extendSession);
router.put('/sessions/:sessionId/close', closeSession);

// Student Management (Partial Upload)
router.post('/students/upload-partial', upload.single('partialListFile'), uploadPartialStudentList);

export default router;