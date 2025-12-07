// src/models/department.model.js
import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    levels: [{
        type: String, // e.g., '100', '200'
        required: true,
    }],
    options: [{
        type: String, // e.g., 'CS+Eco', 'CS+Math'
    }],
    courses: [{
        type: String, // Course codes, e.g., 'CSC101'
    }],
}, { timestamps: true });

departmentSchema.index({ facultyId: 1, name: 1 }, { unique: true });

const Department = mongoose.model('Department', departmentSchema);
export default Department;