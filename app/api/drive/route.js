import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');

    if (!folderId) {
        return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    try {
        let auth;
        const keyFile = path.join(process.cwd(), 'service-account.json');

        // Check if service-account.json exists (usually for local development)
        if (fs.existsSync(keyFile)) {
            auth = new google.auth.GoogleAuth({
                keyFile: keyFile,
                scopes: ['https://www.googleapis.com/auth/drive.readonly'],
            });
        }
        // fallback to environment variables (for production/Vercel)
        else if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                },
                scopes: ['https://www.googleapis.com/auth/drive.readonly'],
            });
        } else {
            return NextResponse.json(
                { error: 'Service account credentials missing. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in your environment variables.' },
                { status: 500 }
            );
        }

        const drive = google.drive({ version: 'v3', auth });

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
