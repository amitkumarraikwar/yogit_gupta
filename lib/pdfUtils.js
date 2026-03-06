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

                // 2. REFINED COLOR SANITIZATION:
                // html2canvas crashes on any internal parsing that sees "lab(", "oklch(", etc.
                // We sanitize all <style> tags and individual element styles.

                const purgeModernColors = (cssText) => {
                    if (!cssText) return cssText;
                    return cssText
                        .replace(/lab\([^)]*\)/g, 'rgb(0,0,0)')
                        .replace(/oklch\([^)]*\)/g, 'rgb(0,0,0)')
                        .replace(/oklab\([^)]*\)/g, 'rgb(0,0,0)');
                };

                // Target all style tags specifically. 
                const styleTags = clonedDoc.querySelectorAll('style');
                styleTags.forEach(tag => {
                    if (tag.innerHTML) {
                        tag.innerHTML = purgeModernColors(tag.innerHTML);
                    }
                });

                const root = clonedDoc.getElementById(elementId);
                if (!root) return;

                // 3. Helper to convert any modern color function to RGB using a canvas
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

                // 4. Final pass on elements to ensure their COMPUTED styles are overridden.
                const elements = [root, ...root.querySelectorAll('*')];
                elements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    const props = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'];

                    props.forEach(prop => {
                        const val = style[prop];
                        if (val && (val.includes('lab(') || val.includes('oklch(') || val.includes('oklab('))) {
                            // Apply direct style override with !important
                            el.style.setProperty(prop, convertToRGB(val), 'important');
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
