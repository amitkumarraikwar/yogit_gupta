"use client";

import React, { useState } from "react";

const MasonryGallery = ({ images = [] }) => {
    if (!images || images.length === 0) return null;

    const normalizeUrl = (url) => {
        if (!url) return "";
        // Handle Google Drive URLs
        if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
            const regex = /(?:id=|\/d\/|folders\/)([\w-]+)/;
            const match = url.match(regex);
            if (match && match[1]) {
                // Using the thumbnail service is often more reliable for high-quality embedding
                return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
            }
        }
        return url;
    };

    return (
        <div className="masonry-gallery columns-2 md:columns-3 gap-4 mb-8">
            {images.map((url, index) => {
                const normalizedSrc = normalizeUrl(url);
                return (
                    <div key={index} className="masonry-item mb-4 break-inside-avoid bg-gray-50 rounded-lg overflow-hidden min-h-[100px] flex items-center justify-center border border-gray-100 shadow-sm">
                        <img
                            src={normalizedSrc}
                            alt={`Event image ${index + 1}`}
                            className="w-full h-auto block"
                            loading="eager"
                            onError={(e) => {
                                const parent = e.target.parentElement;
                                if (!parent) return;
                                parent.classList.add("bg-gray-100");
                                e.target.style.display = "none";

                                // Remove any existing error messages
                                const existing = parent.querySelector(".error-msg");
                                if (existing) existing.remove();

                                const span = document.createElement("span");
                                span.className = "error-msg text-[10px] text-gray-400 p-2 text-center";
                                span.innerText = "Check sharing settings or URL";
                                parent.appendChild(span);
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default MasonryGallery;
