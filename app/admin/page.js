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
        // Load Events
        const savedData = localStorage.getItem("eventData");
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setEvents(Array.isArray(parsed) ? parsed : [parsed]);
            } catch (e) {
                console.error("Error loading events", e);
            }
        }

        // Load Global Styles
        const savedStyles = localStorage.getItem("globalStyles");
        if (savedStyles) {
            try {
                setGlobalStyles(JSON.parse(savedStyles));
            } catch (e) {
                console.error("Error loading global styles", e);
            }
        }
    }, []);

    const saveGlobalStyles = (newStyles) => {
        setGlobalStyles(newStyles);
        localStorage.setItem("globalStyles", JSON.stringify(newStyles));
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
            styles: { ...globalStyles } // Inherit global styles by default
        });
    };

    const handleEditEvent = (index) => {
        setEditingIndex(index);
        setCurrentEvent({ ...events[index] });
    };

    const handleDeleteEvent = (index) => {
        if (confirm("Are you sure you want to delete this event?")) {
            const newEvents = events.filter((_, i) => i !== index);
            setEvents(newEvents);
            localStorage.setItem("eventData", JSON.stringify(newEvents));
        }
    };

    const handleSaveEvent = () => {
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
        localStorage.setItem("eventData", JSON.stringify(newEvents));
        setEditingIndex(null);
        setCurrentEvent(null);
    };

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
                    />
                )}

                {activeTab === "settings" && (
                    <GlobalSettings
                        styles={globalStyles}
                        onUpdate={saveGlobalStyles}
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
