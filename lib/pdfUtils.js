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

                // 2. GLOBAL CSS SANITIZATION:
                // html2canvas parses document.styleSheets. We must neutralize "lab(" and "oklch("
                // everywhere in the cloned document's head to prevent parsing errors.
                const styleTags = clonedDoc.querySelectorAll('style');
                styleTags.forEach(tag => {
                    if (tag.innerHTML.includes('lab(') || tag.innerHTML.includes('oklch(')) {
                        // Replace modern color functions with a safe fallback in the CSS text
                        // We use a simple regex to replace the function with "rgb(0,0,0)" or similar.
                        // This is aggressive but necessary to prevent the library from crashing.
                        tag.innerHTML = tag.innerHTML
                            .replace(/lab\([^)]*\)/g, 'rgb(0,0,0)')
                            .replace(/oklch\([^)]*\)/g, 'rgb(0,0,0)')
                            .replace(/oklab\([^)]*\)/g, 'rgb(0,0,0)');
                    }
                });

                const root = clonedDoc.getElementById(elementId);
                if (!root) return;

                // 3. Include the root element itself and all its descendants
                const elements = [root, ...root.querySelectorAll('*')];

                // 4. Helper to convert any modern color function to RGB using a canvas
                const canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                const ctx = canvas.getContext('2d');

                const convertToRGB = (colorStr) => {
                    if (!colorStr || typeof colorStr !== 'string') return colorStr;
                    if (!(colorStr.includes('lab(') || colorStr.includes('oklch(') || colorStr.includes('oklab(') || colorStr.includes('p3'))) {
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

                // 5. Sanitize all color-related properties on elements
                elements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    const props = [
                        'color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor',
                        'borderBottomColor', 'borderLeftColor', 'fill', 'stroke', 'outlineColor'
                    ];

                    props.forEach(prop => {
                        const val = style[prop];
                        if (val) {
                            const normalized = convertToRGB(val);
                            if (normalized !== val) {
                                el.style[prop] = normalized;
                            }
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
