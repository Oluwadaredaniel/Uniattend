// src/controllers/auth.controller.js
import User from '../models/user.model.js';
import generateToken from '../utils/token.js';
import { hashPassword } from '../utils/passwords.js';

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { regNo, password } = req.body;
    const regNoUpper = regNo.toUpperCase();

    // Find user record (Reps/Admins/Students are all in User)
    const user = await User.findOne({ regNo: regNoUpper });

    if (user) {
        let isFirstLogin = false;
        let passwordIsValid = false;

        if (!user.passwordChanged) {
            // Check against unhashed surname (initial password)
            if (password === user.surname) {
                isFirstLogin = true;
                passwordIsValid = true;
            }
        } else {
            // Check against hashed password
            passwordIsValid = await user.matchPassword(password);
        }

        if (!passwordIsValid) {
             return res.status(401).json({ message: 'Invalid registration number or password.' });
        }

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
            requiresPasswordChange: isFirstLogin,
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
    
    // Check if old password matches (hashed or initial surname)
    const isInitialChange = !user.passwordChanged && oldPassword === user.surname;
    
    if (isInitialChange || await user.matchPassword(oldPassword)) {
        user.password = newPassword; // Pre-save hook hashes this
        user.passwordChanged = true;
        await user.save();
        
        res.status(200).json({ message: 'Password updated successfully.' });
    } else {
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
    res.status(200).json({ message: 'Logged out successfully' });
};