/**
 * Extracts the Google Drive folder ID from a URL.
 * Supports various formats:
 * - https://drive.google.com/drive/folders/FOLDER_ID
 * - https://drive.google.com/drive/u/0/folders/FOLDER_ID
 * - https://drive.google.com/open?id=FOLDER_ID
 * 
 * @param {string} url - The Google Drive folder URL.
 * @returns {string|null} - The folder ID or null if not found.
 */
export function extractFolderId(url) {
    if (!url) return null;

    // Pattern for /folders/FOLDER_ID
    const foldersMatch = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);
    if (foldersMatch && foldersMatch[1]) {
        return foldersMatch[1];
    }

    // Pattern for ?id=FOLDER_ID or &id=FOLDER_ID
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
    if (idMatch && idMatch[1]) {
        return idMatch[1];
    }

    // If it's already just the ID
    if (/^[a-zA-Z0-9-_]{25,}$/.test(url)) {
        return url;
    }

    return null;
}

/**
 * Normalizes Google Drive and lh3 URLs for direct image embedding.
 */
export function normalizeUrl(url) {
    if (!url || typeof url !== "string") return "";

    // Extract ID from various Google Drive/User Content formats
    let imageId = null;

    if (url.includes("googleusercontent.com")) {
        const idMatch = url.match(/(?:lh\d+\.googleusercontent\.com\/d\/|id=)([a-zA-Z0-9-_]+)/);
        if (idMatch && idMatch[1]) {
            imageId = idMatch[1];
        } else {
            return url;
        }
    } else if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
        const regex = /(?:id=|\/d\/|folders\/)([a-zA-Z0-9-_]+)/;
        const match = url.match(regex);
        if (match && match[1]) {
            imageId = match[1];
        }
    }

    if (imageId) {
        return `/api/image-proxy?fileId=${imageId}`;
    }

    return url;
}
