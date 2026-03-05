"use client";

import React, { useState } from "react";

const AdminPanel = ({ event, onUpdate, onSave, onCancel }) => {
    const [activeTab, setActiveTab] = useState("content");

    const updateField = (field, value) => {
        onUpdate({ ...event, [field]: value });
    };

    const updateStyle = (key, value) => {
        onUpdate({
            ...event,
            styles: {
                ...(event.styles || {}),
                [key]: value
            }
        });
    };

    const handleImageChange = (index, value) => {
        const newImages = [...event.images];
        newImages[index] = value;
        updateField("images", newImages);
    };

    const addImageField = () => {
        updateField("images", [...event.images, ""]);
    };

    const removeImageField = (index) => {
        const newImages = event.images.filter((_, i) => i !== index);
        updateField("images", newImages);
    };

    const fonts = [
        { name: "Serif (Classic)", value: "Playfair Display, serif" },
        { name: "Sans (Modern)", value: "Poppins, sans-serif" },
        { name: "Inter (Technical)", value: "Inter, sans-serif" },
        { name: "Georgia", value: "Georgia, serif" },
        { name: "Arial", value: "Arial, sans-serif" },
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Premium Header */}
            <header className="h-20 border-b border-gray-100 px-4 md:px-8 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3 md:gap-6 min-w-0">
                    <button
                        onClick={onCancel}
                        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-900"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="min-w-0">
                        <h2 className="text-[9px] md:text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase truncate">EDITOR</h2>
                        <h1 className="text-base md:text-xl font-bold text-gray-900 truncate">{event.heading || "Untitled Event"}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <button
                        onClick={onCancel}
                        className="hidden sm:block px-6 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-all uppercase tracking-widest"
                    >
                        Discard
                    </button>
                    <button
                        onClick={onSave}
                        className="px-5 md:px-8 py-2 md:py-3 bg-black text-white rounded-xl md:rounded-2xl font-bold text-[10px] md:text-sm shadow-xl hover:bg-gray-800 transition-all active:scale-95 uppercase tracking-widest"
                    >
                        Save
                    </button>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Editor Sidebar/Tabs - Scrollable Horizontal bar on mobile */}
                <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-100 flex md:flex-col bg-gray-50/50 overflow-x-auto no-scrollbar shrink-0">
                    <button
                        onClick={() => setActiveTab("content")}
                        className={`flex-1 md:flex-none px-6 md:px-8 py-4 md:py-6 text-center md:text-left transition-all flex items-center justify-center md:justify-start gap-4 border-r md:border-r-0 md:border-b border-gray-100 whitespace-nowrap ${activeTab === "content" ? "bg-white text-black font-bold" : "text-gray-400 hover:bg-gray-50"
                            }`}
                    >
                        <div className={`hidden md:block w-2 h-2 rounded-full ${activeTab === "content" ? "bg-blue-600" : "bg-transparent"}`}></div>
                        CONTENT
                    </button>
                    <button
                        onClick={() => setActiveTab("design")}
                        className={`flex-1 md:flex-none px-6 md:px-8 py-4 md:py-6 text-center md:text-left transition-all flex items-center justify-center md:justify-start gap-4 md:border-b border-gray-100 whitespace-nowrap ${activeTab === "design" ? "bg-white text-black font-bold" : "text-gray-400 hover:bg-gray-50"
                            }`}
                    >
                        <div className={`hidden md:block w-2 h-2 rounded-full ${activeTab === "design" ? "bg-blue-600" : "bg-transparent"}`}></div>
                        DESIGN
                    </button>
                </aside>

                {/* Form Area */}
                <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 md:py-12 scroll-smooth">
                    <div className="max-w-3xl mx-auto space-y-8 md:space-y-12">

                        {activeTab === "content" ? (
                            <>
                                {/* Basic Info Section */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">01</div>
                                        <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Basic Information</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Event Heading</span>
                                            <input
                                                type="text"
                                                value={event.heading}
                                                onChange={(e) => updateField("heading", e.target.value)}
                                                placeholder="e.g. Annual Gala 2024"
                                                className="mt-2 block w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium placeholder:text-gray-300"
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</span>
                                            <textarea
                                                value={event.description}
                                                onChange={(e) => updateField("description", e.target.value)}
                                                placeholder="Tell the story of the event..."
                                                rows={6}
                                                className="mt-2 block w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium placeholder:text-gray-300 resize-none"
                                            />
                                        </label>
                                    </div>
                                </section>

                                {/* Images Section */}
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">02</div>
                                            <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Image Gallery</h3>
                                        </div>
                                        <button
                                            onClick={addImageField}
                                            className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1 group"
                                        >
                                            <span className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-all">+</span>
                                            Add Image
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {event.images.map((img, idx) => (
                                            <div key={idx} className="flex gap-3 group">
                                                <div className="relative flex-1">
                                                    <input
                                                        type="text"
                                                        value={img}
                                                        onChange={(e) => handleImageChange(idx, e.target.value)}
                                                        placeholder="Pinterest image URL"
                                                        className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 transition-all outline-none font-medium placeholder:text-gray-300 pr-12 text-sm"
                                                    />
                                                    {img && (
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl overflow-hidden shadow-sm border border-white">
                                                            <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                </div>
                                                {event.images.length > 1 && (
                                                    <button
                                                        onClick={() => removeImageField(idx)}
                                                        className="bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 w-14 rounded-2xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </>
                        ) : (
                            // DESIGN TAB
                            <>
                                <section className="space-y-12">
                                    {/* Page Background */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">01</div>
                                            <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Canvas Style</h3>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-3xl flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-900 font-bold text-sm">Background Color</p>
                                                <p className="text-gray-400 text-xs mt-1">Set the primary color for your A4 page.</p>
                                            </div>
                                            <input
                                                type="color"
                                                value={event.styles?.pageBackground || "#ffffff"}
                                                onChange={(e) => updateStyle("pageBackground", e.target.value)}
                                                className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Heading Styles */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center font-bold text-sm">02</div>
                                            <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Heading Typography</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <label className="block">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Font Family</span>
                                                <select
                                                    value={event.styles?.headingFont || ""}
                                                    onChange={(e) => updateStyle("headingFont", e.target.value)}
                                                    className="mt-2 block w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-green-100 transition-all outline-none font-medium appearance-none"
                                                >
                                                    {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                                                </select>
                                            </label>

                                            <label className="block">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Font Size</span>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <input
                                                        type="range" min="2" max="10" step="0.1"
                                                        value={parseFloat(event.styles?.headingSize) || 4}
                                                        onChange={(e) => updateStyle("headingSize", `${e.target.value}rem`)}
                                                        className="flex-1 accent-black"
                                                    />
                                                    <span className="text-xs font-bold text-gray-600 w-12">{event.styles?.headingSize || "4rem"}</span>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="bg-gray-50 p-6 rounded-3xl flex items-center justify-between">
                                            <p className="text-gray-900 font-bold text-sm">Heading Color</p>
                                            <input
                                                type="color"
                                                value={event.styles?.headingColor || "#111827"}
                                                onChange={(e) => updateStyle("headingColor", e.target.value)}
                                                className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Body Styles */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">03</div>
                                            <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Body Typography</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <label className="block">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Font Family</span>
                                                <select
                                                    value={event.styles?.bodyFont || ""}
                                                    onChange={(e) => updateStyle("bodyFont", e.target.value)}
                                                    className="mt-2 block w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium appearance-none"
                                                >
                                                    {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                                                </select>
                                            </label>

                                            <label className="block">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Font Size</span>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <input
                                                        type="range" min="0.8" max="2.5" step="0.05"
                                                        value={parseFloat(event.styles?.bodySize) || 1.125}
                                                        onChange={(e) => updateStyle("bodySize", `${e.target.value}rem`)}
                                                        className="flex-1 accent-black"
                                                    />
                                                    <span className="text-xs font-bold text-gray-600 w-12">{event.styles?.bodySize || "1.125rem"}</span>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="bg-gray-50 p-6 rounded-3xl flex items-center justify-between">
                                            <p className="text-gray-900 font-bold text-sm">Text Color</p>
                                            <input
                                                type="color"
                                                value={event.styles?.bodyColor || "#1f2937"}
                                                onChange={(e) => updateStyle("bodyColor", e.target.value)}
                                                className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                                            />
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}

                        <div className="h-20" /> {/* Spacer */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
