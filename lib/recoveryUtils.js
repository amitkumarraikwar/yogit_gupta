/**
 * Utility functions for data recovery from backups/text.
 */

/**
 * Validates if the data matches the expected event schema.
 */
export const validateEventData = (data) => {
    if (!Array.isArray(data)) return false;
    return data.every(event =>
        typeof event === 'object' &&
        event !== null &&
        typeof event.heading === 'string'
    );
};

/**
 * Parses pasted text (likely from the app's DOCX format) into event objects.
 * 
 * Expected DOCX Format:
 * [Heading - H1]
 * [Description]
 * 
 * Included Images: [H3]
 * Image 1: [URL]
 * Image 2: [URL]
 * ...
 * [Page Break]
 */
export const parseTextToEvents = (text) => {
    if (!text || typeof text !== 'string') return [];

    // Simple splitting by a common pattern.
    // In our docxUtils, events are separated by a page break, but in plain text paste
    // we might just have double newlines or similar.

    // Let's try to detect headings. 
    // We'll split the text into chunks. 
    // A primitive assume: Heading is followed by description, then "Included Images:" prefix.

    const events = [];
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

    let currentEvent = null;
    let captureState = 'heading'; // heading, description, images

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // If line looks like "Included Images:", switch to images mode
        if (line.toLowerCase().includes('included images:')) {
            captureState = 'images';
            continue;
        }

        // If line looks like "Image X: [URL]", extract URL
        if (captureState === 'images' && line.toLowerCase().startsWith('image ')) {
            const match = line.match(/image \d+: (https?:\/\/\S+)/i);
            if (match && match[1]) {
                if (currentEvent) {
                    currentEvent.images.push(match[1]);
                }
            }
            continue;
        }

        // If we find a new heading (maybe all caps or just first line after an event)
        // This is tricky. Let's assume a new event starts if we see a line after an "images" block 
        // OR if it's the very first line.
        if (captureState === 'images' || currentEvent === null) {
            // New event start (unless it was just another image line that didn't match)
            if (currentEvent && captureState === 'images') {
                events.push(currentEvent);
                currentEvent = null;
                captureState = 'heading';
            }
        }

        if (captureState === 'heading') {
            currentEvent = {
                heading: line,
                description: '',
                images: [],
                styles: {},
                order: events.length
            };
            captureState = 'description';
        } else if (captureState === 'description') {
            currentEvent.description += (currentEvent.description ? '\n' : '') + line;
        }
    }

    if (currentEvent) {
        events.push(currentEvent);
    }

    return events;
};
