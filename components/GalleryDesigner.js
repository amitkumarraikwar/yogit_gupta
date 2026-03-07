"use client";

import React, { useState, useEffect, useRef } from "react";
import { normalizeUrl } from "@/lib/googleDriveUtils";

const GalleryDesigner = ({ images = [], onUpdate, onSave, onCancel }) => {
    // Normalize images: convert strings to objects if necessary
    const [localImages, setLocalImages] = useState(
        images.map((img, index) => {
            if (typeof img === "string") {
                return { url: img, cols: 4, rows: 4, order: index };
            }
            return { cols: 4, rows: 4, order: index, ...img };
        })
    );

    const [selectedIndices, setSelectedIndices] = useState([]);
    const [interaction, setInteraction] = useState(null); // { type: 'resize'|'move'|'marquee', ... }
    const [marqueeBox, setMarqueeBox] = useState(null);

    const gridRef = useRef(null);

    const handleMouseDown = (e, index = null, type = 'marquee') => {
        const isShift = e.shiftKey;
        const rect = gridRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (index !== null) {
            // Clicked on an item
            if (type === 'resize') {
                setInteraction({
                    type: 'resize',
                    index,
                    startPos: { x: e.clientX, y: e.clientY },
                    initialImages: JSON.parse(JSON.stringify(localImages)),
                    startSize: { cols: localImages[index].cols, rows: localImages[index].rows }
                });
            } else {
                // Moving or selecting
                let newSelected = [...selectedIndices];
                if (isShift) {
                    if (newSelected.includes(index)) {
                        newSelected = newSelected.filter(i => i !== index);
                    } else {
                        newSelected.push(index);
                    }
                } else {
                    if (!newSelected.includes(index)) {
                        newSelected = [index];
                    }
                }
                setSelectedIndices(newSelected);
                setInteraction({
                    type: 'move',
                    index,
                    startPos: { x: e.clientX, y: e.clientY },
                    initialImages: [...localImages]
                });
            }
        } else {
            // Clicked background
            if (!isShift) setSelectedIndices([]);
            setInteraction({
                type: 'marquee',
                startPos: { x: mouseX, y: mouseY }
            });
        }
    };

    const handleMouseMove = (e) => {
        if (!interaction) return;

        if (interaction.type === 'resize') {
            const deltaX = e.clientX - interaction.startPos.x;
            const deltaY = e.clientY - interaction.startPos.y;
            const colDelta = Math.round(deltaX / 60);
            const rowDelta = Math.round(deltaY / 20);

            const newImages = [...localImages];
            const indicesToResize = selectedIndices.includes(interaction.index) ? selectedIndices : [interaction.index];

            indicesToResize.forEach(idx => {
                const original = interaction.initialImages[idx];
                newImages[idx] = {
                    ...newImages[idx],
                    cols: Math.max(1, Math.min(12, original.cols + colDelta)),
                    rows: Math.max(1, original.rows + rowDelta)
                };
            });
            setLocalImages(newImages);
        } else if (interaction.type === 'move') {
            const target = document.elementFromPoint(e.clientX, e.clientY);
            const itemElement = target?.closest('[data-index]');
            if (itemElement) {
                const hoverIndex = parseInt(itemElement.getAttribute('data-index'));
                if (hoverIndex !== interaction.index) {
                    const newImages = [...localImages];

                    // Group Move Logic
                    const movingIndices = selectedIndices.includes(interaction.index) ? [...selectedIndices].sort((a, b) => a - b) : [interaction.index];
                    const movingItems = movingIndices.map(i => localImages[i]);

                    // Remove items
                    movingIndices.sort((a, b) => b - a).forEach(i => {
                        newImages.splice(i, 1);
                    });

                    // Insert at new position
                    const shift = movingIndices.filter(i => i < hoverIndex).length;
                    let insertPos = Math.max(0, hoverIndex - (interaction.index > hoverIndex ? 0 : shift));

                    // Correcting insertPos logic for group moves
                    // Actually simpler: if moving forward, it's hoverIndex - items_removed_before_it + 1? No.
                    // Let's use a simpler swap-if-adjacent or just a robust splice.
                    // For a group of N items, we insert them all at the hoverIndex.
                    newImages.splice(hoverIndex, 0, ...movingItems);
                    setLocalImages(newImages);

                    // Update selection and interaction
                    const newSelected = [];
                    newImages.forEach((img, idx) => {
                        if (movingItems.includes(img)) newSelected.push(idx);
                    });
                    setSelectedIndices(newSelected);

                    const newDragIndex = newImages.indexOf(movingItems[movingIndices.indexOf(interaction.index)]);
                    setInteraction({ ...interaction, index: newDragIndex });
                }
            }
        } else if (interaction.type === 'marquee') {
            const rect = gridRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            setMarqueeBox({
                left: Math.min(interaction.startPos.x, mouseX),
                top: Math.min(interaction.startPos.y, mouseY),
                width: Math.abs(interaction.startPos.x - mouseX),
                height: Math.abs(interaction.startPos.y - mouseY)
            });
        }
    };

    const handleMouseUp = (e) => {
        if (interaction?.type === 'marquee' && marqueeBox) {
            const items = gridRef.current.querySelectorAll('[data-index]');
            const newSelected = e.shiftKey ? [...selectedIndices] : [];
            items.forEach(item => {
                const itemRect = item.getBoundingClientRect();
                const gridRect = gridRef.current.getBoundingClientRect();
                const localItem = {
                    left: itemRect.left - gridRect.left,
                    top: itemRect.top - gridRect.top,
                    right: itemRect.right - gridRect.left,
                    bottom: itemRect.bottom - gridRect.top
                };

                if (!(localItem.left > marqueeBox.left + marqueeBox.width ||
                    localItem.right < marqueeBox.left ||
                    localItem.top > marqueeBox.top + marqueeBox.height ||
                    localItem.bottom < marqueeBox.top)) {
                    const idx = parseInt(item.getAttribute('data-index'));
                    if (!newSelected.includes(idx)) newSelected.push(idx);
                }
            });
            setSelectedIndices(newSelected);
        }
        setInteraction(null);
        setMarqueeBox(null);
    };

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [interaction, marqueeBox, localImages, selectedIndices]);

    const handleSave = () => {
        onUpdate(localImages);
        onSave();
    };

    return (
        <div className="fixed inset-0 z-[110] bg-white flex flex-col p-4 md:p-8 select-none">
            <header className="flex items-center justify-between mb-8 border-b pb-4 shrink-0">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">Gallery Layout Designer</h2>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wider">Canvas Mode</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Select multiple with Shift. Drag to marquee. Move images together like Figma.</p>
                </div>
                <div className="flex gap-4">
                    {selectedIndices.length > 0 && (
                        <div className="flex items-center gap-3 mr-4 bg-gray-50 border border-gray-200 px-4 py-2 rounded-2xl text-gray-600 font-bold text-sm shadow-sm transition-all animate-in fade-in slide-in-from-right-4">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            {selectedIndices.length} Selected
                            <button
                                onClick={() => setSelectedIndices([])}
                                className="ml-3 hover:text-red-500 transition-colors bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm"
                            >
                                Clear
                            </button>
                        </div>
                    )}
                    <button onClick={onCancel} className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">Cancel</button>
                    <button onClick={handleSave} className="px-8 py-3 bg-black text-white rounded-2xl font-bold shadow-xl hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm">Apply Layout</button>
                </div>
            </header>

            <div className="flex-1 overflow-auto bg-[#fafafa] rounded-[40px] p-12 border border-dashed border-gray-200 shadow-inner">
                <div
                    ref={gridRef}
                    onMouseDown={(e) => handleMouseDown(e)}
                    className="relative grid grid-cols-12 gap-6 auto-rows-[25px] max-w-6xl mx-auto bg-white p-12 rounded-[32px] shadow-2xl min-h-full cursor-crosshair pb-32 border border-gray-100"
                >
                    {localImages.map((img, index) => (
                        <div
                            key={index}
                            data-index={index}
                            onMouseDown={(e) => handleMouseDown(e, index, 'move')}
                            className={`relative group rounded-3xl overflow-hidden border transition-all duration-300 ${selectedIndices.includes(index)
                                    ? "border-blue-500 ring-8 ring-blue-50/50 shadow-2xl z-30 scale-[1.02] bg-blue-50"
                                    : "border-gray-100 bg-gray-50 z-10 hover:border-blue-200 hover:shadow-lg"
                                } cursor-move`}
                            style={{
                                gridColumn: `span ${img.cols || 4}`,
                                gridRow: `span ${img.rows || 4}`,
                            }}
                        >
                            <img
                                src={normalizeUrl(img.url)}
                                alt=""
                                className={`w-full h-full object-cover pointer-events-none transition-transform duration-700 ${selectedIndices.includes(index) ? 'scale-110' : 'group-hover:scale-105'}`}
                            />

                            {/* Glassmorphism Status Overlay */}
                            <div className="absolute top-4 left-4 backdrop-blur-md bg-black/40 text-white text-[10px] px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all transform -translate-y-2 group-hover:translate-y-0 font-bold uppercase tracking-wider">
                                {img.cols} COL × {img.rows} ROW
                            </div>

                            {/* Multi-select indicator */}
                            {selectedIndices.includes(index) && (
                                <div className="absolute top-4 right-4 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl animate-in zoom-in-50 duration-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}

                            {/* Deluxe Resize Handle */}
                            <div
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    handleMouseDown(e, index, 'resize');
                                }}
                                className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl cursor-nwse-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white group-hover:translate-x-0 translate-x-4 z-40"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 19v-4M19 19h-4" />
                                </svg>
                            </div>

                            {/* Selection Overlay */}
                            <div className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${selectedIndices.includes(index) ? 'bg-blue-600/5' : 'bg-transparent'}`}></div>
                        </div>
                    ))}

                    {/* Designer Marquee Overlay */}
                    {marqueeBox && (
                        <div
                            className="absolute bg-blue-500/10 border-2 border-blue-500/50 z-[100] pointer-events-none rounded-xl backdrop-blur-[1px]"
                            style={{
                                left: marqueeBox.left,
                                top: marqueeBox.top,
                                width: marqueeBox.width,
                                height: marqueeBox.height
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default GalleryDesigner;
