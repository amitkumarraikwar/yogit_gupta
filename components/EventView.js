"use client";

import { useEffect, useState } from "react";
import EventPage from "@/components/EventPage";

export default function EventView() {
    const [events, setEvents] = useState([]);
    const [globalStyles, setGlobalStyles] = useState(null);

    useEffect(() => {
        const data = localStorage.getItem("eventData");
        if (data) {
            try {
                const parsed = JSON.parse(data);
                setEvents(Array.isArray(parsed) ? parsed : [parsed]);
            } catch (e) {
                console.error("Error parsing event data", e);
            }
        }

        const savedGlobal = localStorage.getItem("globalStyles");
        if (savedGlobal) {
            try {
                setGlobalStyles(JSON.parse(savedGlobal));
            } catch (e) {
                console.error("Error parsing global styles", e);
            }
        }
    }, []);

    if (!events || events.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-10">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Your Event Pages await!</h2>
                    <p className="text-gray-500 mt-2 max-w-xs mx-auto">Create beautiful pinterest-style event summaries in seconds using our admin panel.</p>
                    <a href="/admin" className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-gray-800 transition-all active:scale-95 uppercase tracking-widest">
                        Go to Admin Panel
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col items-center min-h-screen py-10 print:py-0 bg-gray-100 print:bg-white pb-20 font-sans">
            {/* Global Action Buttons (Hidden on Print) */}
            <div className="no-print fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-white/90 backdrop-blur-xl p-4 rounded-[2rem] shadow-2xl border border-white/50 ring-1 ring-black/5">
                <button
                    onClick={() => window.location.href = "/admin"}
                    className="px-6 py-4 bg-white text-gray-800 rounded-2xl hover:bg-gray-50 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm border border-gray-100"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit All Events
                </button>
                <button
                    onClick={handlePrint}
                    className="px-8 py-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print or Save PDF
                </button>
            </div>

            {/* Render All Event Pages */}
            <div className="space-y-0 flex flex-col items-center">
                {events.map((event, index) => (
                    <EventPage
                        key={index}
                        data={{
                            ...event,
                            styles: { ...globalStyles, ...event.styles } // Apply global default, then event override
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
