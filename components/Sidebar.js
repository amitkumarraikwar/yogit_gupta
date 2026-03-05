"use client";

import React from "react";

const Sidebar = ({ activeTab, setActiveTab }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const navItems = [
        { id: "dashboard", label: "DASHBOARD", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
        { id: "settings", label: "GLOBAL DESIGN", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-6 left-6 z-[120] w-12 h-12 bg-white text-black rounded-2xl shadow-2xl flex items-center justify-center no-print"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] animate-in fade-in duration-300 no-print"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`
                fixed md:relative top-0 left-0 z-[115] w-64 bg-[#0a0a0a] min-h-screen h-full flex flex-col text-gray-400 font-sans border-r border-white/5 no-print transition-transform duration-500 ease-out
                ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                <div className="p-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-widest uppercase">
                            EVENT<span className="text-blue-500 underline decoration-2 underline-offset-4">GEN</span>
                        </h1>
                        <p className="text-[10px] text-gray-500 mt-1 tracking-[0.2em] font-bold">ADMIN CONSOLE</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-xs tracking-wider ${activeTab === item.id
                                ? "bg-white text-black shadow-[0_10px_20px_-10px_rgba(255,255,255,0.2)]"
                                : "hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                            </svg>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                            AR
                        </div>
                        <div className="flex-1 truncate">
                            <p className="text-white text-xs font-bold truncate">AMIT RAIKWAR</p>
                            <p className="text-[10px] text-gray-500 truncate">amit.raikwar@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
