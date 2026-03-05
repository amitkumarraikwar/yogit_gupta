import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');

    if (!folderId) {
        return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    try {
        // Authenticate using the service account file
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(process.cwd(), 'service-account.json'),
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });

        const drive = google.drive({ version: 'v3', auth });

        const response = await drive.files.list({
            // We use 'trashed = false' to exclude deleted files
            q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
            fields: 'files(id, name, mimeType, thumbnailLink, webViewLink)',
            pageSize: 100,
        });

        if (!response.data.files || response.data.files.length === 0) {
            return NextResponse.json({ files: [] });
        }

        const files = response.data.files.map((file) => ({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            // Direct view link pattern
            src: `https://drive.google.com/uc?export=view&id=${file.id}`,
            thumbnail: file.thumbnailLink,
            link: file.webViewLink,
        }));

        return NextResponse.json({ files });
    } catch (error) {
        console.error('Google Drive API Error:', error);

        // Check if the error is due to missing service account file
        if (error.code === 'ENOENT') {
            return NextResponse.json(
                { error: 'Service account credentials missing. Please ensure service-account.json is present in the root directory.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch files from Google Drive', details: error.message },
            { status: 500 }
        );
    }
}
