// src/socket.js
import Session from './models/session.model.js';

const initSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Join room based on department and level (Class Reps and Students)
        socket.on('join-dept', ({ deptId, level }) => {
            const room = `dept-${deptId}-level-${level}`;
            socket.join(room);
            // console.log(`Socket ${socket.id} joined room: ${room}`);
        });

        socket.on('disconnect', () => {
            // console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    // Central function to broadcast events from controllers (used globally)
    io.broadcastEvent = (event, data, room) => {
        if (room) {
            io.to(room).emit(event, data);
        } else {
            io.emit(event, data);
        }
    };
    
    // Auto-expiry checker (runs every minute)
    setInterval(async () => {
        const now = new Date();
        const expiredSessions = await Session.find({ expiresAt: { $lte: now }, isActive: true });

        for (const session of expiredSessions) {
            session.isActive = false;
            await session.save();

            const room = `dept-${session.departmentId}-level-${session.level}`;
            io.broadcastEvent('session-ended', { sessionId: session._id, message: 'Session expired automatically.' }, room);
            
            console.log(`Session ${session._id} expired.`);
        }
    }, 60000); 
    
    return io; // Return the configured io instance
};

export default initSocket;