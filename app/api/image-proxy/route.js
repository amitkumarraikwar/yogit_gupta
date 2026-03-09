import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
        return new NextResponse('File ID is required', { status: 400 });
    }

    try {
        let auth;
        const keyFile = path.join(process.cwd(), 'service-account.json');

        if (fs.existsSync(keyFile)) {
            auth = new google.auth.GoogleAuth({
                keyFile: keyFile,
                scopes: ['https://www.googleapis.com/auth/drive.readonly'],
            });
        }
        else if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                },
                scopes: ['https://www.googleapis.com/auth/drive.readonly'],
            });
        } else {
            return new NextResponse('Credentials missing', { status: 500 });
        }

        const drive = google.drive({ version: 'v3', auth });

        // Get the actual file content as a stream directly
        // We'll trust the stream's headers or use a default
        const response = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        // Try to get contentType from response headers, fallback to image/jpeg
        const contentType = response.headers['content-type'] || 'image/jpeg';

        return new NextResponse(response.data, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24h
            },
        });
    } catch (error) {
        console.error('Image Proxy Error:', error);
        // If it's a 404/403, it might be permissions
        const status = error.code || 500;
        return new NextResponse(`Failed to fetch image: ${error.message}`, { status });
    }
}

