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
                // 1. Remove all elements with the "no-print" class
                const noPrintElements = clonedDoc.querySelectorAll('.no-print');
                noPrintElements.forEach(el => el.remove());

                // 2. NUCLEAR COLOR SANITIZATION:
                // html2canvas crashes on any internal parsing that sees "lab(", "oklch(", etc.
                // We will perform a global string replacement on the entire document body's HTML
                // and all style tags to ensure these strings simply do not exist.

                // Clean all <style> tags
                const styleTags = clonedDoc.querySelectorAll('style');
                styleTags.forEach(tag => {
                    tag.innerHTML = tag.innerHTML
                        .replace(/lab\([^)]*\)/g, 'rgb(0,0,0)')
                        .replace(/oklch\([^)]*\)/g, 'rgb(0,0,0)')
                        .replace(/oklab\([^)]*\)/g, 'rgb(0,0,0)');
                });

                // Clean the entire body's outerHTML to catch inline styles or attributes
                // This is radical but prevents the fatal parser crash.
                const body = clonedDoc.body;
                if (body) {
                    body.innerHTML = body.innerHTML
                        .replace(/lab\([^)]*\)/g, 'rgb(0,0,0)')
                        .replace(/oklch\([^)]*\)/g, 'rgb(0,0,0)')
                        .replace(/oklab\([^)]*\)/g, 'rgb(0,0,0)');
                }

                const root = clonedDoc.getElementById(elementId);
                if (!root) return;

                // 3. Helper to convert any modern color function to RGB using a canvas (for computed styles)
                const canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                const ctx = canvas.getContext('2d');

                const convertToRGB = (colorStr) => {
                    if (!colorStr || typeof colorStr !== 'string') return colorStr;
                    if (!(colorStr.includes('lab(') || colorStr.includes('oklch(') || colorStr.includes('oklab('))) {
                        return colorStr;
                    }
                    try {
                        ctx.fillStyle = colorStr;
                        const normalized = ctx.fillStyle;
                        return normalized && normalized !== 'null' ? normalized : 'rgb(0,0,0)';
                    } catch (e) {
                        return 'rgb(0,0,0)';
                    }
                };

                // 4. Final pass on actual elements to ensure their inline styles are clean
                const elements = [root, ...root.querySelectorAll('*')];
                elements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    const props = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'];

                    props.forEach(prop => {
                        const val = style[prop];
                        if (val && (val.includes('lab(') || val.includes('oklch('))) {
                            el.style[prop] = convertToRGB(val);
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
