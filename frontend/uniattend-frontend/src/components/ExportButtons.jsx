// src/components/ExportButtons.jsx
import React from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from './ui/Button';
import { exportSessionApi } from '../api/attendance.api';
import { exportFromApiToExcel } from '../utils/exportToExcel';
import { exportFromApiToPDF } from '../utils/exportToPDF';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Handles exporting session attendance data.
 * @param {string} sessionId - The ID of the session to export.
 * @param {string} courseName - Name of the course/session for the filename.
 */
const ExportButtons = ({ sessionId, courseName }) => {
  const { user } = useAuthStore();
  const filename = `${courseName}_Attendance_${new Date().toISOString().slice(0, 10)}`;
  
  const handleExport = (format) => {
    const url = exportSessionApi(sessionId, format);
    
    if (format === 'xlsx') {
      exportFromApiToExcel(url, filename);
    } else if (format === 'pdf') {
      exportFromApiToPDF(url, filename, `${courseName} Attendance Report`);
    }
  };

  return (
    <div className="flex flex-wrap gap-4">
      <Button 
        onClick={() => handleExport('xlsx')} 
        variant="secondary"
        className="flex items-center space-x-2"
        disabled={!sessionId}
      >
        <FileSpreadsheet className="h-4 w-4" />
        <span>Export to XLSX</span>
      </Button>
      
      <Button 
        onClick={() => handleExport('csv')} 
        variant="secondary"
        className="flex items-center space-x-2"
        disabled={!sessionId}
      >
        <FileSpreadsheet className="h-4 w-4" />
        <span>Export to CSV</span>
      </Button>

      <Button 
        onClick={() => handleExport('pdf')} 
        variant="secondary"
        className="flex items-center space-x-2"
        disabled={!sessionId}
      >
        <FileText className="h-4 w-4" />
        <span>Export to PDF</span>
      </Button>
    </div>
  );
};

export default ExportButtons;