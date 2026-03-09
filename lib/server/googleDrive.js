import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

let driveClient = null;

/**
 * Gets a singleton Google Drive client instance.
 * Optimizes performance by reusing authentication and client objects.
 */
export async function getDriveClient() {
    if (driveClient) {
        return driveClient;
    }

    let auth;
    const keyFile = path.join(process.cwd(), 'service-account.json');

    if (fs.existsSync(keyFile)) {
        auth = new google.auth.GoogleAuth({
            keyFile: keyFile,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
    } else {
        throw new Error('Google Drive credentials missing. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY.');
    }

    driveClient = google.drive({ version: 'v3', auth });
    return driveClient;
}
