"use client";

import React, { useState } from "react";
import { normalizeUrl } from "@/lib/googleDriveUtils";

const MasonryGallery = ({ images = [], columns = 3 }) => {
    if (!images || images.length === 0) return null;

    // Detect if we have structured layout data
    const hasLayoutData = images.some(img => typeof img === 'object' && img !== null && (img.cols || img.rows));

    if (hasLayoutData) {
        // Render as a 12-column CSS Grid
        return (
            <div className="grid grid-cols-12 gap-4 auto-rows-[20px] mb-8">
                {images.map((img, index) => {
                    const data = typeof img === 'string' ? { url: img, cols: 4, rows: 4 } : img;
                    const normalizedSrc = normalizeUrl(data.url);

                    return (
                        <div
                            key={index}
                            className="masonry-item break-inside-avoid bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-md"
                            style={{
                                gridColumn: `span ${data.cols || 4}`,
                                gridRow: `span ${data.rows || 4}`,
                            }}
                        >
                            <img
                                src={normalizedSrc}
                                alt=""
                                className="w-full h-full object-cover block"
                                loading="eager"
                                onError={(e) => handleImageError(e)}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }

    // Default Masonry Layout (Legacy)
    const columnCount = columns || 3;

    return (
        <div
            className="masonry-gallery gap-4 mb-8"
            style={{ columnCount: columnCount }}
        >
            {images.map((url, index) => {
                const normalizedSrc = normalizeUrl(url);
                return (
                    <div key={index} className="masonry-item mb-4 break-inside-avoid bg-gray-50 rounded-lg overflow-hidden min-h-[100px] flex flex-col items-center justify-center border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <img
                            src={normalizedSrc}
                            alt=""
                            className="w-full h-auto block"
                            loading="eager"
                            onError={(e) => handleImageError(e)}
                        />
                    </div>
                );
            })}
        </div>
    );
};

const handleImageError = (e) => {
    const parent = e.target.parentElement;
    if (!parent) return;
    parent.classList.add("bg-gray-100");
    parent.classList.add("p-4");
    e.target.style.display = "none";

    // Remove any existing error messages
    const existing = parent.querySelector(".error-msg");
    if (existing) existing.remove();

    const span = document.createElement("span");
    span.className = "error-msg text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center leading-tight";
    span.innerText = "Check sharing settings or URL";
    parent.appendChild(span);
};

export default MasonryGallery;
