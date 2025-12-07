// src/utils/excelParser.js
import * as XLSX from 'xlsx';

/**
 * Parses a student list Excel/CSV file into an array of student objects.
 * Assumes the following columns: regNo, surname, firstname, dept, level, option
 */
export const parseStudentList = (fileBuffer, filename) => {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonStudents = XLSX.utils.sheet_to_json(worksheet, {
        header: [
            'regNo', 
            'surname', 
            'firstname', 
            'deptName', 
            'level', 
            'option'
        ],
        range: 1, 
        defval: '', 
    });

    return jsonStudents.map(student => ({
        regNo: String(student.regNo).trim().toUpperCase(),
        surname: String(student.surname).trim(),
        firstname: String(student.firstname).trim(),
        deptName: String(student.deptName).trim(),
        level: String(student.level).trim(),
        option: student.option ? String(student.option).trim() : null,
    }));
};


/**
 * Converts attendance data to a buffer for CSV/XLSX export.
 */
export const exportToBuffer = (data, format) => {
    const exportData = data.map(record => ({
        'Reg No': record.regNo,
        'Name': `${record.surname} ${record.firstname}`,
        'Status': record.status,
        'Timestamp': record.timestamp ? new Date(record.timestamp).toLocaleString() : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    
    const type = (format === 'csv') ? 'csv' : 'buffer';
    return XLSX.write(workbook, { bookType: format, type });
};