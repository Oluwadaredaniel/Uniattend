// src/utils/exportToExcel.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

/**
 * Downloads data from a server API endpoint as an XLSX file.
 * @param {string} url - The API endpoint URL to fetch the file buffer from.
 * @param {string} filename - The desired name for the downloaded file.
 */
export const exportFromApiToExcel = async (url, filename) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server returned error: ${errorText || response.statusText}`);
    }
    
    // Get the blob/buffer and save it
    const blob = await response.blob();
    saveAs(blob, `${filename}.xlsx`);
    toast.success("Export successful! Download starting...");
  } catch (error) {
    console.error('Excel export failed:', error);
    toast.error(`Export failed: ${error.message}`);
  }
};