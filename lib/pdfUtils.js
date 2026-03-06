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
            // SUPER-NUCLEAR SANITIZATION for modern color functions (lab, oklch, oklab)
            onclone: (clonedDoc) => {
                // 1. Remove non-print elements
                clonedDoc.querySelectorAll('.no-print').forEach(el => el.remove());

                // 2. Helper to purge problematic color strings
                const purgeModernColors = (text) => {
                    if (!text || typeof text !== 'string') return text;
                    return text
                        .replace(/lab\([^)]*\)/g, 'rgb(0,0,0)')
                        .replace(/oklch\([^)]*\)/g, 'rgb(0,0,0)')
                        .replace(/oklab\([^)]*\)/g, 'rgb(0,0,0)');
                };

                // 3. Strip from style tags
                clonedDoc.querySelectorAll('style').forEach(tag => {
                    tag.textContent = purgeModernColors(tag.textContent);
                });

                // 4. Strip from inline style attributes
                clonedDoc.querySelectorAll('*').forEach(el => {
                    if (el.hasAttribute('style')) {
                        el.setAttribute('style', purgeModernColors(el.getAttribute('style')));
                    }
                });

                const root = clonedDoc.getElementById(elementId);
                if (!root) return;

                // 5. Build a canvas-based RGB converter for computed styles
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
                        return (normalized && normalized !== 'null') ? normalized : 'rgb(0,0,0)';
                    } catch (e) {
                        return 'rgb(0,0,0)';
                    }
                };

                // 6. Force override of computed styles that might be inherited
                const elements = [root, ...root.querySelectorAll('*')];
                elements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    const props = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'];

                    props.forEach(prop => {
                        const val = style[prop];
                        if (val && (val.includes('lab(') || val.includes('oklch(') || val.includes('oklab('))) {
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
        await html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error('PDF Generation Error:', error);
    }
};
