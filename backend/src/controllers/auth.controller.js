// src/controllers/auth.controller.js

import User from '../models/user.model.js';
import Student from '../models/student.model.js'; // Added for roster check
import generateToken from '../utils/token.js';
import { hashPassword } from '../utils/passwords.js'; // Added for signup

// @desc    Validate student & create account (Signup)
// @route   POST /api/auth/signup
// @access  Public
export const signupUser = async (req, res) => {
    const { 
        regNo, surname, password, 
        deptId, level, option
    } = req.body;
    
    if (!regNo || !surname || !password || !deptId || !level) {
        return res.status(400).json({ message: 'Missing required fields for signup.' });
    }
    
    // Feature 4 & 6: Case-insensitive and trimmed checks
    const regNoUpper = regNo.toUpperCase().trim();
    const surnameClean = surname.trim();

    // 1. Check if user already exists (User table)
    const existingUser = await User.findOne({ regNo: regNoUpper });
    if (existingUser) {
        return res.status(400).json({ message: 'Account already exists for this registration number. Please login.' });
    }

    // 2. Feature 1 & 5: Validate against the class list (Student table)
    const rosterEntry = await Student.findOne({
        regNo: regNoUpper,
        // Using $regex for robust case-insensitive check on surname
        surname: { $regex: new RegExp(`^${surnameClean}$`, 'i') }, 
        deptId: deptId,
        level: level,
        ...(option && { option: option }), // Include option if provided
    });

    if (!rosterEntry) {
        // Feature 1: Not in class list error
        return res.status(401).json({ 
            message: 'You are not on the class list for the selected program. Contact your class rep or check your credentials.' 
        });
    }

    // 3. Create User account using validated roster data
    const hashedPassword = await hashPassword(password);
    
    const newUser = await User.create({
        regNo: regNoUpper,
        surname: rosterEntry.surname,
        firstname: rosterEntry.firstname,
        password: hashedPassword,
        role: 'student',
        deptId: rosterEntry.deptId,
        level: rosterEntry.level,
        option: rosterEntry.option,
        passwordChanged: false, // Feature 2: Force change on first login
    });
    
    generateToken(res, newUser._id);

    res.status(201).json({
        _id: newUser._id,
        regNo: newUser.regNo,
        firstname: newUser.firstname,
        surname: newUser.surname,
        role: newUser.role,
        deptId: newUser.deptId,
        level: newUser.level,
        option: newUser.option,
        requiresPasswordChange: true, // Always true after successful signup
        message: 'Registration successful. You must change your password now.',
    });
};


// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { regNo, password } = req.body;
    const regNoUpper = regNo.toUpperCase(); // Feature 4: Case-insensitive check

    const user = await User.findOne({ regNo: regNoUpper });

    // Login check relies only on Hashed Password now.
    if (user && await user.matchPassword(password)) { 
        
        // Feature 4: Flag indicates if password change is required
        const requiresPasswordChange = !user.passwordChanged; 

        generateToken(res, user._id);

        res.status(200).json({
            _id: user._id,
            regNo: user.regNo,
            firstname: user.firstname,
            surname: user.surname,
            role: user.role,
            deptId: user.deptId,
            level: user.level,
            option: user.option,
            requiresPasswordChange, // Pass this flag to the frontend
        });

    } else {
        res.status(401).json({ message: 'Invalid registration number or password.' });
    }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req, res) => {
    const user = await User.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;
    
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }
    
    // Check old password against the HASHED password in the DB
    if (await user.matchPassword(oldPassword)) {
        user.password = newPassword; // Pre-save hook hashes this
        user.passwordChanged = true; // Feature 2: Update flag
        await user.save();
        
        res.status(200).json({ message: 'Password updated successfully.' });
    } else {
        // This covers cases where initial password was used (which is now hashed on creation)
        res.status(401).json({ message: 'Invalid current password.' });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'User logged out successfully' });
};