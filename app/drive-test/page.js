import DriveGallery from '@/components/DriveGallery';

export const metadata = {
    title: 'Google Drive Image Importer',
    description: 'Easily import and view images from Google Drive folders.',
};

export default function DriveTestPage() {
    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12">
            <div className="container mx-auto px-4 text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white mb-4 tracking-tight">
                    Import from Google Drive
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto text-lg pt-4 pb-4">
                    Paste your Google Drive folder link below to fetch all images automatically.
                    Make sure the folder is shared as <strong>"Anyone with the link can view"</strong>.
                </p>
            </div>

            <DriveGallery />
        </main>
    );
}
