// src/models/session.model.js
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    course: {
        type: String,
        required: true,
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    startsAt: {
        type: Date,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    durationMinutes: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    // Used for quick check and Rep dashboard update
    attendedStudents: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
        },
        timestamp: Date,
    }],
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);
export default Session;