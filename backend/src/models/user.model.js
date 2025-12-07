// src/models/user.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
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
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['super_admin', 'class_rep', 'course_rep', 'student'],
        required: true,
    },
    deptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null,
    },
    level: {
        type: String,
        default: null,
    },
    option: {
        type: String,
        default: null,
    },
    passwordChanged: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;