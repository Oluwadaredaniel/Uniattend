// src/utils/exportToPDF.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

/**
 * Downloads data from a server API endpoint as a PDF file.
 * @param {string} url - The API endpoint URL to fetch the file buffer from.
 * @param {string} filename - The desired name for the downloaded file.
 * @param {string} title - The title to display on the PDF.
 */
export const exportFromApiToPDF = async (url, filename, title) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server returned error: ${errorText || response.statusText}`);
    }
    
    // Assuming the backend sends a structured JSON response for PDF (if not sending PDF buffer)
    // ---
    // Since the API is designed to return the *file buffer*, we can't easily modify the PDF structure client-side.
    // However, the standard practice for PDF exports on the web is often to generate it *client-side* for simple tables
    // or request the PDF buffer from the server.
    
    // We will stick to the server-buffer approach for consistency with XLSX:
    const blob = await response.blob();
    const file = new Blob([blob], { type: 'application/pdf' });
    
    // Use FileSaver to trigger download
    saveAs(file, `${filename}.pdf`);
    toast.success("Export successful! Download starting...");
    
    // --- Alternative: Client-side PDF generation if server only returns JSON ---
    /*
    const data = await response.json(); // If server returned JSON array
    const doc = new jsPDF();
    
    doc.text(title, 14, 20);
    
    const tableColumn = ["Reg No", "Name", "Status", "Timestamp"];
    const tableRows = data.map(item => [
      item.regNo,
      `${item.surname} ${item.firstname}`,
      item.status,
      item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A',
    ]);

    doc.autoTable(tableColumn, tableRows, { startY: 25 });
    doc.save(`${filename}.pdf`);
    toast.success("Export successful (Client-side PDF)! Download starting...");
    */
    
  } catch (error) {
    console.error('PDF export failed:', error);
    toast.error(`Export failed: ${error.message}`);
  }
};