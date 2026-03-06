/**
 * Generates a high-quality A4 PDF from a DOM element.
 * @param {string} elementId - The ID of the container to convert to PDF.
 * @param {string} filename - The name of the resulting PDF file.
 */
export const generatePDF = async (elementId, filename = 'Event_Summary.pdf') => {
    // Dynamic import to prevent SSR errors (self is not defined)
    const html2pdf = (await import('html2pdf.js')).default;

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
            windowHeight: element.scrollHeight,
            // Fix for "lab" and other modern color functions not supported by html2canvas
            onclone: (clonedDoc) => {
                const root = clonedDoc.getElementById(elementId);
                if (!root) return;

                // Include the root element itself and all its descendants
                const elements = [root, ...root.querySelectorAll('*')];

                elements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    // More exhaustive list of color-related properties
                    const props = [
                        'color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor',
                        'borderBottomColor', 'borderLeftColor', 'fill', 'stroke', 'outlineColor',
                        'columnRuleColor', 'textDecorationColor', 'caretColor'
                    ];

                    props.forEach(prop => {
                        const val = style[prop];
                        if (val && (val.includes('lab(') || val.includes('oklch(') || val.includes('oklab('))) {
                            // Create a temp element to let the browser normalize the color to RGB
                            const temp = document.createElement('div');
                            temp.style.color = val;
                            document.body.appendChild(temp);
                            // The browser will automatically convert modern colors to rgb(...) in computed styles
                            const normalized = window.getComputedStyle(temp).color;
                            el.style[prop] = normalized;
                            document.body.removeChild(temp);
                        }
                    });
                });
            }
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
