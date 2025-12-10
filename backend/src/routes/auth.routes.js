// src/routes/auth.routes.js

import express from 'express';
import { loginUser, logoutUser, changePassword, signupUser } from '../controllers/auth.controller.js'; // 👈 ADD signupUser
import protect from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signupUser); // 👈 NEW ROUTE
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.put('/password', protect, changePassword);

export default router;