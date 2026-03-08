"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import EventList from "@/components/EventList";
import AdminPanel from "@/components/AdminPanel";
import GlobalSettings from "@/components/GlobalSettings";
import FrontPageSettings from "@/components/FrontPageSettings";
import { parseTextToEvents, validateEventData } from "@/lib/recoveryUtils";

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [events, setEvents] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null); // null means list view, -1 means new event
    const [currentEvent, setCurrentEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [globalStyles, setGlobalStyles] = useState({
        pageBackground: "#ffffff",
        headingFont: "Playfair Display, serif",
        headingSize: "4rem",
        headingColor: "#111827",
        bodyFont: "Poppins, sans-serif",
        bodySize: "1.125rem",
        bodyColor: "#1f2937",
        imageColumns: 3,
    });
    const [showPasteModal, setShowPasteModal] = useState(false);
    const [pasteText, setPasteText] = useState("");
    const [frontPageData, setFrontPageData] = useState({
        candidateName: "",
        workContent: "",
        bgImages: [],
        instagram: "",
        facebook: "",
        whatsapp: "",
        twitter: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Load Events from MongoDB
                const eventsRes = await fetch('/api/events');
                const eventsData = await eventsRes.json();
                if (Array.isArray(eventsData)) {
                    setEvents(eventsData);
                }

                // Load Global Styles from MongoDB
                const configRes = await fetch('/api/config');
                const configData = await configRes.json();
                if (configData && Object.keys(configData).length > 0) {
                    setGlobalStyles(configData);
                }

                // Load Front Page Data from MongoDB
                const frontRes = await fetch('/api/front');
                const frontData = await frontRes.json();
                if (frontData && frontData.candidateName !== undefined) {
                    setFrontPageData(frontData);
                }
            } catch (e) {
                console.error("Error loading data from MongoDB", e);
                // Optionally show an error state if needed
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const saveGlobalStyles = async (newStyles) => {
        setGlobalStyles(newStyles);
        try {
            await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStyles),
            });
        } catch (e) {
            console.error("Error saving global styles to MongoDB", e);
        }
    };

    // Save global styles AND reset all events to use global (clear per-event overrides)
    const applyGlobalStylesToAll = async (newStyles) => {
        setGlobalStyles(newStyles);
        try {
            // 1. Save the global config
            await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStyles),
            });

            // 2. Clear per-event styles so all events inherit from global
            const resetEvents = events.map(ev => ({ ...ev, styles: {} }));
            setEvents(resetEvents);
            await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resetEvents),
            });
        } catch (e) {
            console.error("Error applying global styles to all events", e);
        }
    };

    const handlePasteRestore = () => {
        if (!pasteText.trim()) {
            alert("Please paste some text from your document.");
            return;
        }

        const recoveredEvents = parseTextToEvents(pasteText);
        if (recoveredEvents.length === 0) {
            alert("Could not identify any events in the pasted text. Please make sure you copied the content correctly.");
            return;
        }

        if (confirm(`Identify ${recoveredEvents.length} events. Restoring them will overwrite the current list (but won't save until you click 'Save & Apply'). Proceed?`)) {
            setEvents(recoveredEvents);
            setShowPasteModal(false);
            setPasteText("");
            alert("Data restored to dashboard! Review the events and click 'Save & Apply' to persist to database.");
        }
    };

    const handleSaveAll = async () => {
        if (!confirm("This will overwrite all events in the database with the current list shown in your dashboard. Proceed?")) {
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(events),
            });
            if (res.ok) {
                alert("All events saved successfully to database!");
            } else {
                const error = await res.json();
                throw new Error(error.details || error.error || "Failed to save events");
            }
        } catch (e) {
            console.error("Error saving all events", e);
            alert(`Failed to save events: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestoreFile = async (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target.result;
            let recoveredEvents = [];

            try {
                if (file.name.endsWith('.json')) {
                    const data = JSON.parse(content);
                    if (validateEventData(data)) {
                        recoveredEvents = data;
                    } else if (data.events && validateEventData(data.events)) {
                        recoveredEvents = data.events;
                    } else {
                        throw new Error("Invalid JSON format for events.");
                    }
                } else {
                    // Try parsing as text (DOCX/TXT)
                    recoveredEvents = parseTextToEvents(content);
                }

                if (recoveredEvents.length === 0) {
                    alert("Could not find any event data in this file. Please check the file content.");
                    return;
                }

                if (confirm(`Found ${recoveredEvents.length} events. Do you want to restore them? This will overwrite your current list in the dashboard (but won't save to database until you click 'Save & Apply').`)) {
                    setEvents(recoveredEvents);
                    alert("Data restored to dashboard. Please review and click 'Save & Apply to All Events' or add/edit them as needed.");
                }

            } catch (err) {
                console.error("Restoration error:", err);
                alert("Failed to restore data: " + err.message);
            }
        };

        if (file.name.endsWith('.json') || file.name.endsWith('.txt')) {
            reader.readAsText(file);
        } else {
            // For .docx, we really need a parser like mammoth. 
            // For now, let's inform the user to copy-paste text or provide a JSON.
            alert("For .docx files, please copy the text from the document and paste it into the 'Paste Recovery' tool (Coming soon) or provide a .json backup. Reading .docx directly is currently limited.");
            // Actually, let's try reading as text anyway, sometimes it might have some strings.
            reader.readAsText(file);
        }
    };

    const handleImportLocalStorage = async () => {
        const savedEvents = localStorage.getItem("eventData");
        const savedStyles = localStorage.getItem("globalStyles");

        if (!savedEvents && !savedStyles) {
            alert("No data found in LocalStorage to import.");
            return;
        }

        if (!confirm("This will import data from your browser's LocalStorage into the database. Existing database data will be overwritten. Proceed?")) {
            return;
        }

        setIsLoading(true);
        let importSuccessful = false;
        try {
            // Import Events
            if (savedEvents) {
                const parsedEvents = JSON.parse(savedEvents);
                const res = await fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(parsedEvents),
                });
                if (res.ok) {
                    setEvents(parsedEvents);
                    importSuccessful = true;
                } else {
                    const error = await res.json();
                    throw new Error(error.details || error.error || "Failed to save events");
                }
            }

            // Import Global Styles
            if (savedStyles) {
                const parsedStyles = JSON.parse(savedStyles);
                const res = await fetch('/api/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(parsedStyles),
                });
                if (res.ok) {
                    setGlobalStyles(parsedStyles);
                    importSuccessful = true;
                } else {
                    const error = await res.json();
                    throw new Error(error.details || error.error || "Failed to save styles");
                }
            }

            if (importSuccessful) {
                alert("Data imported successfully!");
            } else {
                alert("Import finished but no data was updated because required fields were missing or empty.");
            }
        } catch (e) {
            console.error("Error importing data", e);
            alert(`Failed to import data: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const normalizeUrl = (url) => {
        if (!url || typeof url !== "string") return url;
        if (url.includes("drive.google.com")) {
            const regex = /(?:id=|\/d\/|folders\/)([a-zA-Z0-9-_]+)/;
            const match = url.match(regex);
            if (match && match[1]) {
                return `https://lh3.googleusercontent.com/d/${match[1]}`;
            }
        }
        return url;
    };

    const handleAddEvent = () => {
        setEditingIndex(-1);
        setCurrentEvent({
            heading: "",
            description: "",
            images: [""],
            styles: {} // Empty = inherit from Global Design Settings
        });
    };

    const handleEditEvent = (index) => {
        setEditingIndex(index);
        setCurrentEvent({ ...events[index] });
    };

    const handleReorder = async (reorderedEvents) => {
        // Optimistically update state immediately for smooth UI
        setEvents(reorderedEvents);
        // Persist new order to database silently
        try {
            await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reorderedEvents),
            });
        } catch (e) {
            console.error("Error saving reordered events to MongoDB", e);
        }
    };

    const handleDeleteEvent = async (index) => {
        if (confirm("Are you sure you want to delete this event?")) {
            const newEvents = events.filter((_, i) => i !== index);
            setEvents(newEvents);
            try {
                await fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newEvents),
                });
            } catch (e) {
                console.error("Error deleting event from MongoDB", e);
            }
        }
    };

    const handleSaveEvent = async () => {
        if (!currentEvent.heading || !currentEvent.description ||
            currentEvent.images.some(img => {
                const url = typeof img === 'object' ? img.url : img;
                return !url;
            })) {
            alert("Please fill in all fields.");
            return;
        }

        const normalizedEvent = {
            ...currentEvent,
            images: currentEvent.images.map(img => {
                if (typeof img === 'object' && img !== null) {
                    return { ...img, url: normalizeUrl(img.url) };
                }
                return normalizeUrl(img);
            })
        };

        let newEvents = [...events];
        if (editingIndex === -1) {
            newEvents.push(normalizedEvent);
        } else {
            newEvents[editingIndex] = normalizedEvent;
        }

        setEvents(newEvents);

        try {
            await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvents),
            });
        } catch (e) {
            console.error("Error saving event to MongoDB", e);
        }

        setEditingIndex(null);
        setCurrentEvent(null);
    };

    if (isLoading) {
        return (
            <main className="flex min-h-screen bg-[#0a0a0a] items-center justify-center">
                <div className="text-white text-sm font-bold uppercase tracking-widest animate-pulse">Loading Dashboard...</div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen bg-[#0a0a0a]">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 overflow-hidden">
                {activeTab === "dashboard" && (
                    <EventList
                        events={events}
                        onEdit={handleEditEvent}
                        onAdd={handleAddEvent}
                        onDelete={handleDeleteEvent}
                        onImport={handleImportLocalStorage}
                        onRestoreFile={handleRestoreFile}
                        onPasteRestore={() => setShowPasteModal(true)}
                        onSaveAll={handleSaveAll}
                        onReorder={handleReorder}
                    />
                )}

                {activeTab === "settings" && (
                    <GlobalSettings
                        styles={globalStyles}
                        onUpdate={saveGlobalStyles}
                        onApplyToAll={applyGlobalStylesToAll}
                    />
                )}

                {activeTab === "frontpage" && (
                    <FrontPageSettings
                        data={frontPageData}
                        onUpdate={setFrontPageData}
                    />
                )}

                {activeTab !== "dashboard" && activeTab !== "settings" && activeTab !== "frontpage" && (
                    <div className="flex-1 bg-[#fcfcfc] h-full flex items-center justify-center p-20">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-300">COMING SOON</h2>
                            <p className="text-gray-400 mt-2 font-medium">The {activeTab} module is under development.</p>
                        </div>
                    </div>
                )}
            </div>

            {editingIndex !== null && currentEvent && (
                <AdminPanel
                    event={currentEvent}
                    onUpdate={setCurrentEvent}
                    onSave={handleSaveEvent}
                    onCancel={() => setEditingIndex(null)}
                />
            )}

            {/* Paste Recovery Modal */}
            {showPasteModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPasteModal(false)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 md:p-12">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">PASTE RECOVERY</h2>
                                    <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">Restore from DOCX or Website Text</p>
                                </div>
                                <button onClick={() => setShowPasteModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100/50">
                                    <h4 className="text-blue-900 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Instructions
                                    </h4>
                                    <p className="text-blue-700/80 text-[11px] font-medium leading-relaxed">
                                        Open your ".docx" file or any saved text, copy the entire content, and paste it here.
                                        We will automatically detect event titles, descriptions, and images.
                                    </p>
                                </div>

                                <textarea
                                    value={pasteText}
                                    onChange={(e) => setPasteText(e.target.value)}
                                    placeholder="Paste your document text here..."
                                    className="w-full h-64 bg-gray-50 border border-gray-100 rounded-2xl p-6 outline-none focus:ring-2 ring-blue-500/20 focus:bg-white transition-all text-sm font-medium placeholder:text-gray-300"
                                />

                                <div className="flex gap-4 pt-2">
                                    <button
                                        onClick={() => setShowPasteModal(false)}
                                        className="flex-1 px-8 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handlePasteRestore}
                                        className="flex-[2] px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Identify & Restore Events
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
