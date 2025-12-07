// src/models/student.model.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    regNo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    surname: {
        type: String,
        required: true,
        trim: true,
    },
    firstname: {
        type: String,
        required: true,
        trim: true,
    },
    deptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    option: {
        type: String,
        default: null,
    },
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;