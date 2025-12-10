// src/config/initialSetup.js
import User from '../models/user.model.js';
import Student from '../models/student.model.js';
import Faculty from '../models/faculty.model.js';
import Department from '../models/department.model.js';
import { hashPassword } from '../utils/passwords.js';

const SUPER_ADMIN_DETAILS = {
    regNo: '202550604111HA',
    surname: 'Oluwadare',
    firstname: 'Daniel Anuoluwapo',
    password: 'Daniel_2009',
    role: 'super_admin',
    facultyName: 'Faculty of Computing',
    deptName: 'Dept of Computer Science and Cyber Security',
    level: '100 Level',
    option: 'Computer Science with Mathematics',
};

const createSuperAdmin = async () => {
    try {
        const { regNo, surname, firstname, password, role, facultyName, deptName, level, option } = SUPER_ADMIN_DETAILS;
        const regNoUpper = regNo.toUpperCase();
        
        // 1. Check if Super Admin User and Student profile already exists
        let superAdminUser = await User.findOne({ regNo: regNoUpper });
        let superAdminStudent = await Student.findOne({ regNo: regNoUpper });

        if (superAdminUser && superAdminStudent) {
             return console.log('Super Admin account and Student profile already set up.');
        }
        
        // 2. Find or Create Faculty
        let faculty = await Faculty.findOneAndUpdate(
            { name: facultyName }, 
            { $setOnInsert: { name: facultyName } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // 3. Find or Create Department
        let department = await Department.findOneAndUpdate(
            { name: deptName },
            { 
                $setOnInsert: { 
                    facultyId: faculty._id, 
                    name: deptName, 
                    levels: [level], 
                    options: [option] 
                } 
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        const deptId = department._id;
        const hashedPassword = await hashPassword(password);
        
        // 4. Upsert/Create User record
        await User.findOneAndUpdate(
            { regNo: regNoUpper },
            {
                regNo: regNoUpper,
                surname,
                firstname,
                password: hashedPassword,
                role,
                deptId, 
                level,
                option,
                passwordChanged: false, // Forces a change on first login
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        // 5. Upsert/Create Student Roster record (for attendance marking)
        await Student.findOneAndUpdate(
            { regNo: regNoUpper },
            {
                regNo: regNoUpper,
                surname,
                firstname,
                deptId,
                level,
                option,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log('--- Super Admin Account Setup Complete ---');

    } catch (error) {
        console.error('Error during initial Super Admin setup:', error.message);
    }
};

export default createSuperAdmin;