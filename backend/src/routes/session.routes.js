// src/routes/session.routes.js
import express from 'express';
import protect from '../middleware/auth.middleware.js';
import { isRepOrAdmin, isStudent } from '../middleware/role.middleware.js';
import { getActiveSession, getAllSessions } from '../controllers/session.controller.js';

const router = express.Router();

router.get('/active', protect, isStudent, getActiveSession);
router.get('/all', protect, isRepOrAdmin, getAllSessions); 

export default router;