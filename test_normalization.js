
const normalizeUrl = (url) => {
    if (!url) return "";

    // Extract ID from various Google Drive/User Content formats
    let imageId = null;

    if (url.includes("googleusercontent.com")) {
        // Already a user content link, but ensure it's in the /d/ format if possible
        const idMatch = url.match(/(?:lh\d+\.googleusercontent\.com\/d\/|id=)([a-zA-Z0-9-_]+)/);
        if (idMatch && idMatch[1]) {
            imageId = idMatch[1];
        } else {
            // Return as is if it's a valid lh3 link but doesn't match the pattern exactly
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
        return `https://lh3.googleusercontent.com/d/${imageId}`;
    }

    return url;
};

const testUrls = [
    "https://drive.google.com/file/d/1TivTGgAUx6aSWlwFCLJOlUtK6KSjSFdh/view?usp=drive_link",
    "https://lh3.googleusercontent.com/d/1mCma1Von4hTDg5opfTiVL8EM7pQoGcFT",
    "https://docs.google.com/uc?id=123ABCTEST",
    "https://drive.google.com/open?id=456XYZTEST",
    "https://someotherlink.com/photo.jpg"
];

testUrls.forEach(url => {
    console.log(`Original: ${url}`);
    console.log(`Normalized: ${normalizeUrl(url)}`);
    console.log('---');
});
