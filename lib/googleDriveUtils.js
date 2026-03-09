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
 * Prioritizes direct links for speed, with proxy fallback for permission control.
 * Supports an optional width parameter for Google lh3 links.
 */
export function normalizeUrl(url, width = null) {
    if (!url || typeof url !== "string") return "";

    // If it's already a local proxy link, return as is
    if (url.startsWith("/api/image-proxy")) return url;

    // Extract ID from various Google Drive/User Content formats
    let imageId = null;

    if (url.includes("googleusercontent.com")) {
        // Matches lh3.googleusercontent.com/d/ID or .../u/0/d/ID
        const idMatch = url.match(/(?:googleusercontent\.com\/d\/|id=)([a-zA-Z0-9-_]+)/);
        if (idMatch && idMatch[1]) {
            imageId = idMatch[1];
        } else {
            return url;
        }
    } else if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
        // Matches /d/ID/view, /file/d/ID, ?id=ID, etc.
        const regex = /(?:id=|\/d\/|\/file\/d\/)([a-zA-Z0-9-_]+)/;
        const match = url.match(regex);
        if (match && match[1]) {
            imageId = match[1];
        }
    } else if (/^[a-zA-Z0-9-_]{25,}$/.test(url)) {
        // If it looks like a lone Google Drive ID
        imageId = url;
    }

    if (imageId) {
        // FASTEST: Use direct Google User Content link (requires "Anyone with link can view")
        // We use this by default for speed. If it fails, the browser onError will trigger fallback if implemented.
        const suffix = width ? `=w${width}` : "";
        return `https://lh3.googleusercontent.com/d/${imageId}${suffix}`;

        // PROXY: Use this if privacy/service account is required (slower)
        // return `/api/image-proxy?fileId=${imageId}`;
    }

    return url;
}

