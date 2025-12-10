// src/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import { PORT, CLIENT_URL } from './config/env.js'; // 👈 IMPORT CLIENT_URL
import initSocket from './socket.js';

// --- Route Imports ---
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import repRoutes from './routes/rep.routes.js';
import sessionRoutes from './routes/session.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';


// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL, // 👈 USING ENV VARIABLE
        methods: ['GET', 'POST', 'PUT'],
    },
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: CLIENT_URL, // 👈 USING ENV VARIABLE
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rep', repRoutes); 
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);

// Base route
app.get('/', (req, res) => res.send('UniAttend API Running'));

// Socket.io initialization
initSocket(io);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));