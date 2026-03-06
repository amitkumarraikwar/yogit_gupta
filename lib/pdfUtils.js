import html2pdf from 'html2pdf.js';

/**
 * Generates a high-quality A4 PDF from a DOM element.
 * @param {string} elementId - The ID of the container to convert to PDF.
 * @param {string} filename - The name of the resulting PDF file.
 */
export const generatePDF = async (elementId, filename = 'Event_Summary.pdf') => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id ${elementId} not found.`);
        return;
    }

    const opt = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            scrollX: 0,
            scrollY: 0,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
        // Generate the PDF
        await html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error('PDF Generation Error:', error);
    }
};
