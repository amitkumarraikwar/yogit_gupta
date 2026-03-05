'use client';

import { useState, useEffect } from 'react';
import { extractFolderId } from '@/lib/googleDriveUtils';

export default function DriveGallery() {
    const [url, setUrl] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchImages = async (folderId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/drive?folderId=${folderId}`);
            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setImages(data.files || []);
        } catch (err) {
            setError(err.message);
            setImages([]);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = () => {
        const folderId = extractFolderId(url);
        if (folderId) {
            fetchImages(folderId);
        } else {
            setError('Invalid Google Drive folder URL');
            setImages([]);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Search Header */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-zinc-300/50 dark:hover:shadow-black/50">
                <h2 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-white tracking-tight">
                    Drive Image Importer
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <input
                            type="text"
                            placeholder="Paste Google Drive folder link here..."
                            className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all text-zinc-800 dark:text-zinc-200"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <div className="absolute inset-0 rounded-2xl pointer-events-none border border-transparent group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-all"></div>
                    </div>
                    <button
                        onClick={handleImport}
                        disabled={loading || !url}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-semibold rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/30"
                    >
                        {loading ? 'Fetching...' : 'Fetch Images'}
                    </button>
                </div>

                {error && (
                    <p className="mt-4 text-red-500 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {error}
                    </p>
                )}
            </div>

            {/* Gallery Grid */}
            {images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {images.map((img) => (
                        <div
                            key={img.id}
                            className="group relative bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 transition-all hover:-translate-y-1 shadow-md hover:shadow-xl"
                        >
                            <div className="aspect-[4/5] relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                <img
                                    src={img.src}
                                    alt={img.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x500?text=Private+or+Missing';
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <a
                                        href={img.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
                                        title="View on Drive"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                    </a>
                                    <button
                                        onClick={() => {
                                            window.open(img.src, '_blank');
                                        }}
                                        className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
                                        title="Direct Link"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 truncate">
                                    {img.name}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : url && !loading && !error && (
                <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-950 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                        No images found in this folder.
                    </p>
                </div>
            )}

            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse bg-zinc-200 dark:bg-zinc-800 aspect-[4/5] rounded-3xl"></div>
                    ))}
                </div>
            )}
        </div>
    );
}
