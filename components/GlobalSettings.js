"use client";

import React from "react";

const GlobalSettings = ({ styles, onUpdate, onApplyToAll }) => {
    const [isSaving, setIsSaving] = React.useState(false);
    const [saved, setSaved] = React.useState(false);

    const updateStyle = (key, value) => {
        onUpdate({
            ...styles,
            [key]: value
        });
    };

    const handleApplyToAll = async () => {
        setIsSaving(true);
        setSaved(false);
        await onApplyToAll(styles);
        setIsSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const fonts = [
        { name: "Serif (Classic)", value: "Playfair Display, serif" },
        { name: "Sans (Modern)", value: "Poppins, sans-serif" },
        { name: "Inter (Technical)", value: "Inter, sans-serif" },
        { name: "Georgia", value: "Georgia, serif" },
        { name: "Arial", value: "Arial, sans-serif" },
    ];

    return (
        <div className="flex-1 bg-[#fcfcfc] min-h-screen overflow-y-auto px-6 md:px-12 py-10 md:py-16 scroll-smooth animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 md:mb-12">
                    <h2 className="text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase">MASTER THEME</h2>
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mt-2">Global Design Settings</h1>
                    <p className="text-gray-500 mt-4 max-w-2xl leading-relaxed text-sm">
                        Configure the default styling for all your event pages. Changes made here will reflect globally unless overridden
                        by individual event settings.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {/* Section 1: Surface & Background */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm underline decoration-2 underline-offset-4">01</div>
                            <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Global Canvas</h3>
                        </div>

                        <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-900 font-bold text-sm">Base Background Color</p>
                                    <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-tight font-medium">Default for all A4 sheets</p>
                                </div>
                                <input
                                    type="color"
                                    value={styles.pageBackground}
                                    onChange={(e) => updateStyle("pageBackground", e.target.value)}
                                    className="w-14 h-14 rounded-2xl cursor-pointer border-4 border-gray-50 bg-transparent overflow-hidden shadow-sm hover:scale-110 transition-transform"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Heading Typography */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center font-bold text-sm underline decoration-2 underline-offset-4">02</div>
                            <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Master Headings</h3>
                        </div>

                        <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm space-y-8">
                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Default Font Family</span>
                                    <select
                                        value={styles.headingFont}
                                        onChange={(e) => updateStyle("headingFont", e.target.value)}
                                        className="mt-2 block w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-green-100 transition-all outline-none font-bold text-sm appearance-none cursor-pointer"
                                    >
                                        {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                                    </select>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <label className="block">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Master Font Size</span>
                                        <span className="text-[10px] font-black text-gray-900 bg-gray-100 px-2 py-1 rounded-md">{styles.headingSize}</span>
                                    </div>
                                    <input
                                        type="range" min="2" max="10" step="0.1"
                                        value={parseFloat(styles.headingSize) || 4}
                                        onChange={(e) => updateStyle("headingSize", `${e.target.value}rem`)}
                                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                                    />
                                </label>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <p className="text-gray-900 font-bold text-sm">Default Text Color</p>
                                <input
                                    type="color"
                                    value={styles.headingColor}
                                    onChange={(e) => updateStyle("headingColor", e.target.value)}
                                    className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Body Typography */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm underline decoration-2 underline-offset-4">03</div>
                            <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Global Copy</h3>
                        </div>

                        <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm space-y-8">
                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Default Font Family</span>
                                    <select
                                        value={styles.bodyFont}
                                        onChange={(e) => updateStyle("bodyFont", e.target.value)}
                                        className="mt-2 block w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none font-bold text-sm appearance-none cursor-pointer"
                                    >
                                        {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                                    </select>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <label className="block">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Master Font Size</span>
                                        <span className="text-[10px] font-black text-gray-900 bg-gray-100 px-2 py-1 rounded-md">{styles.bodySize}</span>
                                    </div>
                                    <input
                                        type="range" min="0.8" max="2.5" step="0.05"
                                        value={parseFloat(styles.bodySize) || 1.125}
                                        onChange={(e) => updateStyle("bodySize", `${e.target.value}rem`)}
                                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                                    />
                                </label>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <p className="text-gray-900 font-bold text-sm">Default Text Color</p>
                                <input
                                    type="color"
                                    value={styles.bodyColor}
                                    onChange={(e) => updateStyle("bodyColor", e.target.value)}
                                    className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Live Global Preview */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm underline decoration-2 underline-offset-4">04</div>
                            <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Master Preview</h3>
                        </div>

                        <div
                            className="border border-gray-100 p-8 rounded-[2.5rem] shadow-xl overflow-hidden min-h-[300px] flex flex-col justify-center text-center transition-all"
                            style={{ backgroundColor: styles.pageBackground }}
                        >
                            <h1
                                style={{
                                    fontFamily: styles.headingFont,
                                    fontSize: `calc(${styles.headingSize} * 0.6)`,
                                    color: styles.headingColor
                                }}
                                className="font-bold leading-tight"
                            >
                                Global Preview Heading
                            </h1>
                            <div className="w-12 h-1 bg-current mx-auto mt-4 mb-6" style={{ color: styles.headingColor }}></div>
                            <p
                                style={{
                                    fontFamily: styles.bodyFont,
                                    fontSize: `calc(${styles.bodySize} * 0.9)`,
                                    color: styles.bodyColor
                                }}
                                className="leading-relaxed opacity-80"
                            >
                                Changing settings in this panel will update all events that haven't been individually customized.
                                Experience consistent branding across your entire PDF output.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="h-20" />

                {/* Save & Apply CTA */}
                <div className="sticky bottom-0 pt-6 pb-8 bg-gradient-to-t from-[#fcfcfc] to-transparent">
                    <button
                        onClick={handleApplyToAll}
                        disabled={isSaving}
                        className="w-full py-5 rounded-[2rem] bg-black text-white font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-3"
                    >
                        {isSaving ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Applying to All Events...
                            </>
                        ) : saved ? (
                            <>
                                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                                Design Applied to All Events!
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Save & Apply to All Events
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-3 font-medium tracking-wide">
                        This will override any individual event styling and apply the global theme
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GlobalSettings;
