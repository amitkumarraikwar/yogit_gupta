import { getDriveClient } from '@/lib/server/googleDrive';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
        return new NextResponse('File ID is required', { status: 400 });
    }

    try {
        const drive = await getDriveClient();

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

