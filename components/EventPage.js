"use client";

import React from "react";
import MasonryGallery from "./MasonryGallery";

const EventPage = ({ data }) => {
    if (!data) return null;

    const { heading, description, images, styles: s } = data;

    return (
        <div
            className="a4-container print:m-0 print:shadow-none break-after-page"
            style={{ backgroundColor: s?.pageBackground || "#ffffff" }}
        >
            {/* Top Section: Masonry Gallery */}
            <section className="mb-12">
                <MasonryGallery images={images} />
            </section>

            {/* Middle Section: Event Heading */}
            <section className="text-center mb-12">
                <h1
                    style={{
                        fontFamily: s.headingFont,
                        fontSize: s.headingSize,
                        color: s.headingColor
                    }}
                    className="font-bold tracking-tight leading-tight"
                >
                    {heading}
                </h1>
                <div
                    className="w-24 h-1 mx-auto mt-6"
                    style={{ backgroundColor: s.headingColor }}
                ></div>
            </section>

            {/* Bottom Section: Description */}
            <section
                style={{
                    fontFamily: s.bodyFont,
                    fontSize: s.bodySize,
                    color: s.bodyColor
                }}
                className="leading-relaxed text-justify whitespace-pre-line"
            >
                {description}
            </section>

            {/* Footer (Optional, professional touch) */}
            <footer className="mt-auto pt-10 text-center text-gray-400 text-sm border-t border-gray-50 flex justify-between uppercase tracking-widest">
                <span>+91 9009407865</span>
                <span>Yogit Gupta</span>
            </footer>
        </div>
    );
};

export default EventPage;
