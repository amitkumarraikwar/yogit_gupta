"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import EventList from "@/components/EventList";
import AdminPanel from "@/components/AdminPanel";
import GlobalSettings from "@/components/GlobalSettings";

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
        if (!url) return "";
        if (url.includes("drive.google.com")) {
            const regex = /(?:id=|\/d\/|folders\/)([\w-]+)/;
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
        if (!currentEvent.heading || !currentEvent.description || currentEvent.images.some(img => !img)) {
            alert("Please fill in all fields.");
            return;
        }

        const normalizedEvent = {
            ...currentEvent,
            images: currentEvent.images.map(img => normalizeUrl(img))
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
                    />
                )}

                {activeTab === "settings" && (
                    <GlobalSettings
                        styles={globalStyles}
                        onUpdate={saveGlobalStyles}
                        onApplyToAll={applyGlobalStylesToAll}
                    />
                )}

                {activeTab !== "dashboard" && activeTab !== "settings" && (
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
        </main>
    );
}
