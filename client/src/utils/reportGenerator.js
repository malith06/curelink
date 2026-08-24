import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generates a PDF report using jsPDF and jspdf-autotable.
 * 
 * @param {string} title - The title of the report (e.g. "Registered Pharmacies Report").
 * @param {Array<string>} columns - An array of column headers (e.g. ["Name", "Email", "Status"]).
 * @param {Array<Array<any>>} rows - An array of row data, where each row is an array matching the columns.
 * @param {string} filename - The desired filename for the downloaded PDF.
 */
export const generatePDFReport = (title, columns, rows, filename = 'report.pdf') => {
  const doc = new jsPDF();
  
  // Define colors
  const primaryColor = [14, 165, 233]; // Tailwind sky-500
  const textColor = [51, 65, 85]; // Tailwind slate-700
  
  // Header section
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text('CureLink', 14, 20);
  
  doc.setFontSize(14);
  doc.setTextColor(...textColor);
  doc.text(title, 14, 30);
  
  // Timestamp
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Tailwind slate-500
  const dateStr = new Date().toLocaleString();
  doc.text(`Generated on: ${dateStr}`, 14, 38);
  
  // Line separator
  doc.setDrawColor(226, 232, 240); // Tailwind slate-200
  doc.line(14, 42, 196, 42);

  // Table
  doc.autoTable({
    startY: 48,
    head: [columns],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Tailwind slate-50
    },
    margin: { top: 48 },
    didDrawPage: (data) => {
      // Footer text
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Tailwind slate-400
      doc.text(
        `Page ${pageCount}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
      doc.text(
        '© CureLink System. All rights reserved.',
        14,
        doc.internal.pageSize.height - 10
      );
    },
  });

  doc.save(filename);
};
