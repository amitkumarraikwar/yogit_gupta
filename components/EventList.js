"use client";

import React, { useState } from "react";

const EventList = ({ events, onEdit, onAdd, onDelete, onImport }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredEvents = events.filter(e =>
        e.heading.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 bg-[#fcfcfc] p-4 md:p-10 font-sans h-screen overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-6 md:gap-0">
                    <div>
                        <h2 className="text-gray-400 text-xs font-bold tracking-[0.2em] mb-1">PRODUCTS</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
                        <button
                            onClick={onImport}
                            className="flex-1 md:flex-none bg-white border border-gray-100 text-gray-500 px-4 md:px-6 py-3 rounded-2xl font-bold text-[10px] md:text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider group"
                        >
                            <svg className="w-3 md:w-4 h-3 md:h-4 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Import LocalStorage
                        </button>
                        <a
                            href="/"
                            target="_blank"
                            className="flex-1 md:flex-none bg-white border border-gray-100 text-blue-600 px-4 md:px-6 py-3 rounded-2xl font-bold text-[10px] md:text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                        >
                            <svg className="w-3 md:w-4 h-3 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="hidden sm:inline">View Generated Pages</span>
                            <span className="sm:hidden">View</span>
                        </a>
                        <button
                            onClick={onAdd}
                            className="flex-1 md:flex-none bg-black text-white px-6 md:px-8 py-3 rounded-2xl font-bold text-[10px] md:text-xs shadow-xl hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
                        >
                            <svg className="w-3 md:w-4 h-3 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            New Event
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8 max-w-2xl">
                    <input
                        type="text"
                        className="w-full bg-white border border-transparent focus:border-gray-200 p-4 md:p-5 pl-12 md:pl-14 rounded-2xl md:rounded-[2rem] shadow-sm outline-none transition-all placeholder:text-gray-300 font-bold text-xs md:text-sm"
                        placeholder="SEARCH EVENTS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="w-5 h-5 md:w-6 md:h-6 absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
                    <div className="hidden md:grid grid-cols-12 p-6 border-b border-gray-50 text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase">
                        <div className="col-span-8">PRODUCT</div>
                        <div className="col-span-4 text-right">ACTIONS</div>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {filteredEvents.map((event, index) => (
                            <div key={index} className="flex flex-col md:grid md:grid-cols-12 p-5 md:p-8 hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => onEdit(index)}>
                                <div className="md:col-span-8 flex items-center gap-4 md:gap-6 mb-4 md:mb-0">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                        {event.images && event.images[0] ? (
                                            <img src={event.images[0]} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-gray-900 font-bold text-sm md:text-base leading-tight group-hover:text-blue-600 transition-colors mb-1 truncate">{event.heading || "Untitled Event"}</h3>
                                        <p className="text-[9px] md:text-[10px] text-gray-300 font-bold tracking-widest uppercase">ID: {index.toString(36).toUpperCase()}</p>
                                    </div>
                                    <div className="md:hidden">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                                                className="p-2 text-red-300 hover:text-red-500 transition-all"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:col-span-4 md:flex items-center justify-end">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                        <button className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredEvents.length === 0 && (
                            <div className="p-20 text-center">
                                <p className="text-gray-300 font-bold text-sm">NO EVENTS FOUND</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventList;
