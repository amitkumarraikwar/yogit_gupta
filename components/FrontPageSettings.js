"use client";

import React, { useState } from "react";
import { extractFolderId, normalizeUrl } from "@/lib/googleDriveUtils";
import GalleryDesigner from "./GalleryDesigner";

const FrontPageSettings = ({ data, onUpdate }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [driveUrl, setDriveUrl] = useState("");
    const [isFetchingDrive, setIsFetchingDrive] = useState(false);
    const [driveError, setDriveError] = useState("");
    const [designerOpen, setDesignerOpen] = useState(false);

    const update = (key, value) => onUpdate({ ...data, [key]: value });

    const updateImage = (index, value) => {
        const imgs = [...(data.bgImages || [])];
        imgs[index] = value;
        onUpdate({ ...data, bgImages: imgs });
    };
    const addImage = () => onUpdate({ ...data, bgImages: [...(data.bgImages || []), ""] });
    const removeImage = (index) => {
        const imgs = (data.bgImages || []).filter((_, i) => i !== index);
        onUpdate({ ...data, bgImages: imgs });
    };

    const fetchFromDrive = async () => {
        const folderId = extractFolderId(driveUrl);
        if (!folderId) {
            setDriveError("Invalid Google Drive folder URL. Make sure it's a folder link.");
            return;
        }
        setIsFetchingDrive(true);
        setDriveError("");
        try {
            const res = await fetch(`/api/drive?folderId=${folderId}`);
            const result = await res.json();
            if (result.error) throw new Error(result.error);
            if (result.files && result.files.length > 0) {
                const newUrls = result.files.map(f => f.src);
                const existing = (data.bgImages || []).filter(u => u.trim() !== "");
                onUpdate({ ...data, bgImages: [...existing, ...newUrls] });
                setDriveUrl("");
            } else {
                setDriveError("No images found in this folder.");
            }
        } catch (err) {
            setDriveError(err.message || "Failed to fetch images from Drive.");
        } finally {
            setIsFetchingDrive(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaved(false);
        try {
            await fetch("/api/front", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            alert("Failed to save: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass =
        "mt-2 block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all outline-none font-medium text-sm";
    const labelClass = "block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1";

    const socialFields = [
        {
            key: "instagram",
            label: "Instagram URL",
            placeholder: "https://instagram.com/yourprofile",
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-pink-500">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
            ),
        },
        {
            key: "facebook",
            label: "Facebook URL",
            placeholder: "https://facebook.com/yourprofile",
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            ),
        },
        {
            key: "whatsapp",
            label: "WhatsApp Number",
            placeholder: "+91 98765 43210 (primary calling no.)",
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            ),
        },
        {
            key: "twitter",
            label: "Twitter / X URL",
            placeholder: "https://twitter.com/yourhandle",
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-700">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="flex-1 bg-[#fcfcfc] min-h-screen overflow-y-auto px-6 md:px-12 py-10 md:py-16 scroll-smooth animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-10">
                    <h2 className="text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase">CAMPAIGN</h2>
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mt-2">Front Page Settings</h1>
                    <p className="text-gray-500 mt-4 max-w-2xl leading-relaxed text-sm">
                        Configure your public campaign page at{" "}
                        <a href="/front" target="_blank" className="text-orange-500 font-semibold underline underline-offset-2">
                            /front
                        </a>
                        . Fill in your name, your message, background images, and contact links.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    {/* ── Section 1: Candidate Name ── */}
                    <section className="space-y-6 md:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">01</div>
                            <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Candidate Identity</h3>
                        </div>
                        <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
                            <label className="block">
                                <span className={labelClass}>Candidate Full Name</span>
                                <input
                                    type="text"
                                    value={data.candidateName || ""}
                                    onChange={(e) => update("candidateName", e.target.value)}
                                    placeholder="e.g. Yogit Gupta"
                                    className={inputClass}
                                />
                            </label>
                        </div>
                    </section>

                    {/* ── Section 2: Work Content ── */}
                    <section className="space-y-6 md:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center font-bold text-sm">02</div>
                            <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Why I Work for NSUI</h3>
                        </div>
                        <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
                            <label className="block">
                                <span className={labelClass}>Your Message (one paragraph per line)</span>
                                <textarea
                                    value={data.workContent || ""}
                                    onChange={(e) => update("workContent", e.target.value)}
                                    placeholder={"Write your message here...\n\nPress Enter for a new paragraph.\nEach line will be displayed as a separate paragraph on the front page."}
                                    rows={10}
                                    className={`${inputClass} resize-y leading-relaxed`}
                                />
                            </label>
                        </div>
                    </section>

                    {/* ── Section 3: Background Images ── */}
                    <section className="space-y-6 md:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">03</div>
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Background Images (Watermark)</h3>
                                <button
                                    onClick={() => setDesignerOpen(true)}
                                    className="text-[10px] font-black text-purple-600 hover:text-purple-700 uppercase tracking-widest flex items-center gap-1 group"
                                >
                                    <span className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-all">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                        </svg>
                                    </span>
                                    Edit Layout
                                </button>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm space-y-5">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                These images appear at 30% opacity in a Pinterest-style grid behind your content.
                            </p>

                            {/* Google Drive Bulk Import */}
                            <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 transition-all hover:bg-blue-50">
                                <div className="flex items-center gap-2 mb-3">
                                    <svg className="w-4 h-4 text-blue-600" viewBox="0 0 87.3 78" fill="currentColor">
                                        <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066DA" />
                                        <path d="M43.65 25L29.9 1.75C28.55 2.55 27.4 3.65 26.6 5L1.2 48.5C.4 49.9 0 51.45 0 53h27.5l16.15-28z" fill="#00AC47" />
                                        <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.9 10.45 7.85 13.35z" fill="#EA4335" />
                                        <path d="M43.65 25L57.4 1.75C56.05 1 54.55.6 53 .6H34.3c-1.55 0-3.05.4-4.4 1.15L43.65 25z" fill="#00832D" />
                                        <path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.85 1.2 4.4 1.2h50.5c1.55 0 3.05-.4 4.4-1.2L59.8 53z" fill="#2684FC" />
                                        <path d="M73.4 26.5l-12.7-21.9C59.85 3.2 58.7 2.1 57.4 1.3L43.65 24.5 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5L73.4 26.5z" fill="#FFBA00" />
                                    </svg>
                                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Bulk Import from Google Drive Folder</span>
                                </div>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={driveUrl}
                                        onChange={(e) => { setDriveUrl(e.target.value); setDriveError(""); }}
                                        placeholder="Paste Google Drive folder link (Anyone with link can view)"
                                        className="flex-1 px-4 py-3 bg-white border border-blue-100 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium text-sm placeholder:text-gray-300"
                                    />
                                    <button
                                        onClick={fetchFromDrive}
                                        disabled={isFetchingDrive || !driveUrl.trim()}
                                        className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:bg-gray-200 disabled:shadow-none transition-all active:scale-95 uppercase tracking-widest whitespace-nowrap flex items-center gap-2"
                                    >
                                        {isFetchingDrive ? (
                                            <>
                                                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Fetching...
                                            </>
                                        ) : "Fetch All"}
                                    </button>
                                </div>
                                {driveError && (
                                    <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest">{driveError}</p>
                                )}
                            </div>

                            {/* Manual URL list */}
                            <div className="space-y-3">
                                {(data.bgImages || []).map((img, i) => {
                                    const url = typeof img === 'object' ? (img?.url || "") : img;
                                    return (
                                        <div key={i} className="flex items-center gap-3 group">
                                            {url && (
                                                <img
                                                    src={normalizeUrl(url)}
                                                    alt=""
                                                    className="w-12 h-12 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                                                    onError={(e) => { e.target.style.display = "none"; }}
                                                />
                                            )}
                                            <input
                                                type="text"
                                                value={url}
                                                onChange={(e) => updateImage(i, e.target.value)}
                                                placeholder={`Image URL ${i + 1}`}
                                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-medium text-sm"
                                            />
                                            <button
                                                onClick={() => removeImage(i)}
                                                className="p-2.5 text-gray-200 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={addImage}
                                className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Image URL Manually
                            </button>
                        </div>
                    </section>

                    {/* ── Section 4: Social Links ── */}
                    <section className="space-y-6 md:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">04</div>
                            <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Contact & Social Links</h3>
                        </div>
                        <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                            {socialFields.map(({ key, label, placeholder, icon }) => (
                                <label key={key} className="block">
                                    <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">
                                        {icon} {label}
                                    </span>
                                    <input
                                        type="text"
                                        value={data[key] || ""}
                                        onChange={(e) => update(key, e.target.value)}
                                        placeholder={placeholder}
                                        className={inputClass}
                                    />
                                </label>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="h-24" />

                {/* ── Sticky Save CTA ── */}
                <div className="sticky bottom-0 pt-6 pb-8 bg-gradient-to-t from-[#fcfcfc] to-transparent">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-orange-200 hover:from-orange-600 hover:to-amber-600 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-3"
                    >
                        {isSaving ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Saving Front Page...
                            </>
                        ) : saved ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                                Front Page Saved!
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Save Front Page
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-3 font-medium tracking-wide">
                        Changes will be live immediately at{" "}
                        <a href="/front" target="_blank" className="text-orange-400 underline underline-offset-2">
                            /front
                        </a>
                    </p>
                </div>
            </div>

            {designerOpen && (
                <GalleryDesigner
                    images={data.bgImages || []}
                    onUpdate={(newImages) => update("bgImages", newImages)}
                    onSave={() => setDesignerOpen(false)}
                    onCancel={() => setDesignerOpen(false)}
                />
            )}
        </div>
    );
};

export default FrontPageSettings;
