import { getDriveClient } from '@/lib/server/googleDrive';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');

    if (!folderId) {
        return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    try {
        const drive = await getDriveClient();

        const response = await drive.files.list({
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
            src: `https://lh3.googleusercontent.com/d/${file.id}`,
            thumbnail: file.thumbnailLink,
            link: file.webViewLink,
        }));

        return NextResponse.json({ files });
    } catch (error) {
        console.error('Google Drive API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch files from Google Drive', details: error.message },
            { status: 500 }
        );
    }
}
