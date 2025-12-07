// src/routes/auth.routes.js
import express from 'express';
import { loginUser, logoutUser, changePassword } from '../controllers/auth.controller.js';
import protect from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.put('/password', protect, changePassword);

export default router;