"use client";

import { useState, useEffect } from "react";
import { generatePDF } from "@/lib/pdfUtils";
import { normalizeUrl } from "@/lib/googleDriveUtils";

const DEFAULT_DATA = {
    candidateName: "",
    workContent: "",
    bgImages: [],
    instagram: "",
    facebook: "",
    whatsapp: "",
    twitter: "",
};

// Social icons as inline SVGs
const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
);
const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);
const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);
const TwitterXIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

export default function FrontPage() {
    const [data, setData] = useState(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/front")
            .then((r) => r.json())
            .then((d) => {
                if (d && d.candidateName !== undefined) setData(d);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = () => {
        setIsPrinting(true);
        const originalTitle = document.title;
        document.title = `${data.candidateName || "Candidate"}_Profile`;

        const handleAfterPrint = () => {
            setIsPrinting(false);
            document.title = originalTitle;
            window.removeEventListener('afterprint', handleAfterPrint);
        };
        window.addEventListener('afterprint', handleAfterPrint);

        setTimeout(() => {
            window.print();
        }, 500);
    };

    const socialLinks = [
        { key: "instagram", label: "Instagram", Icon: InstagramIcon, color: "#E1306C", href: data.instagram },
        { key: "facebook", label: "Facebook", Icon: FacebookIcon, color: "#1877F2", href: data.facebook },
        { key: "whatsapp", label: "WhatsApp", Icon: WhatsAppIcon, color: "#25D366", href: data.whatsapp ? `https://wa.me/${data.whatsapp.replace(/\D/g, "")}` : "" },
        { key: "twitter", label: "Twitter / X", Icon: TwitterXIcon, color: "#ffffff", href: data.twitter },
    ].filter((s) => s.href);

    const paragraphs = (data.workContent || "").split("\n").filter((p) => p.trim());

    return (
        <div className="min-h-screen bg-gray-100 py-10 print:py-0 font-sans flex flex-col items-center">
            {/* ── Floating Action Bar (No Print) ── */}
            <div className="no-print fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-white/90 backdrop-blur-xl p-4 rounded-[2rem] shadow-2xl border border-white/50 ring-1 ring-black/5">
                <button
                    onClick={() => window.location.href = "/admin"}
                    className="px-6 py-4 bg-white text-gray-800 rounded-2xl hover:bg-gray-50 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm border border-gray-100"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                </button>
                <button
                    onClick={() => generatePDF('a4-front-page', `${data.candidateName || 'Candidate'}_Profile.pdf`)}
                    className="px-6 py-4 bg-white text-emerald-600 rounded-2xl hover:bg-emerald-50 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm border border-emerald-100"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Download PDF
                </button>
                <button
                    onClick={handlePrint}
                    disabled={isPrinting}
                    className="px-8 py-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    {isPrinting ? "Wait..." : "Print or Save PDF"}
                </button>
            </div>

            <div id="a4-front-page" className="a4-container fp-root">
                {/* ── Watermark Background (Grid Layout) ── */}
                <div className="fp-bg" aria-hidden="true">
                    {data.bgImages && data.bgImages.length > 0 ? (
                        <div className="fp-grid">
                            {data.bgImages.map((img, i) => {
                                const url = typeof img === 'object' ? img.url : img;
                                const cols = typeof img === 'object' ? (img.cols || 4) : 4;
                                const rows = typeof img === 'object' ? (img.rows || 4) : 4;

                                return (
                                    <div
                                        key={i}
                                        className="fp-grid-item"
                                        style={{
                                            gridColumn: `span ${cols}`,
                                            gridRow: `span ${rows}`
                                        }}
                                    >
                                        <img src={normalizeUrl(url)} alt="" draggable={false} />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="fp-bg-placeholder" />
                    )}
                </div>

                {/* ── Main Content ── */}
                <div className="fp-content">
                    {/* HEADER — Candidate Name */}
                    <header className="fp-header">
                        {isLoading ? (
                            <div className="fp-name-skeleton" />
                        ) : (
                            <h1 className="fp-name">{data.candidateName || "Candidate Name"}</h1>
                        )}
                        <div className="fp-header-divider" />
                    </header>

                    {/* BODY — Why I work for NSUI */}
                    <main className="fp-main">
                        <div className="fp-card">
                            <div className="fp-card-tag">MY MISSION</div>
                            <h2 className="fp-title">Why I work for NSUI</h2>
                            <div className="fp-title-rule" />
                            <div className="fp-body-text">
                                {isLoading ? (
                                    <>
                                        <div className="fp-text-skeleton" />
                                        <div className="fp-text-skeleton short" />
                                        <div className="fp-text-skeleton" />
                                    </>
                                ) : paragraphs.length > 0 ? (
                                    paragraphs.map((p, i) => <p key={i}>{p}</p>)
                                ) : (
                                    <p className="fp-placeholder-text">Your message will appear here after you fill in the details from the admin panel.</p>
                                )}
                            </div>
                        </div>
                    </main>

                    {/* FOOTER — Social Links */}
                    <footer className="fp-footer">
                        <p className="fp-footer-label">CONNECT WITH ME</p>
                        <div className="fp-social-row">
                            {socialLinks.length > 0 ? (
                                socialLinks.map(({ key, label, Icon, color, href }) => (
                                    <a
                                        key={key}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="fp-social-btn"
                                        style={{ "--social-color": color }}
                                        title={label}
                                    >
                                        <span className="fp-social-icon"><Icon /></span>
                                        <span className="fp-social-label">{label}</span>
                                    </a>
                                ))
                            ) : (
                                !isLoading && (
                                    <p className="fp-placeholder-text">Add your social links in the admin panel.</p>
                                )
                            )}
                        </div>
                    </footer>
                </div>
            </div>

            <style>{`
                /* ── Root & background ── */
                .fp-root {
                    position: relative;
                    background: #08090d;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    font-family: 'Poppins', sans-serif;
                    min-height: 100%;
                }
                .fp-bg {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                }
                .fp-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 12px;
                    auto-rows: 25px;
                    padding: 20px;
                    opacity: 0.30;
                    min-height: 100%;
                }
                @media (max-width: 600px) {
                    .fp-grid { 
                        gap: 8px;
                        auto-rows: 15px;
                        padding: 10px;
                    }
                }
                .fp-grid-item {
                    border-radius: 8px;
                    overflow: hidden;
                }
                .fp-grid-item img {
                    width: 100%;
                    height: 100%;
                    display: block;
                    object-fit: cover;
                    border-radius: 8px;
                }
                .fp-bg-placeholder {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(ellipse at 30% 40%, #1a2a6c44 0%, transparent 60%),
                                radial-gradient(ellipse at 70% 60%, #b21f1f22 0%, transparent 60%);
                }
                .fp-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        to bottom,
                        #08090dee 0%,
                        #08090dbb 30%,
                        #08090dcc 60%,
                        #08090dee 100%
                    );
                }

                /* ── Main content ── */
                .fp-content {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 100%;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0;
                }

                /* ── Header ── */
                .fp-header {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 40px 0 30px;
                    text-align: center;
                }
                .fp-header-badge {
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 0.35em;
                    color: #f0c040;
                    background: rgba(240,192,64,0.12);
                    border: 1px solid rgba(240,192,64,0.3);
                    padding: 5px 16px;
                    border-radius: 100px;
                    margin-bottom: 20px;
                }
                .fp-name {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2.2rem, 6vw, 4.5rem);
                    font-weight: 900;
                    line-height: 1.05;
                    letter-spacing: -0.02em;
                    color: #ffffff;
                    text-shadow: 0 4px 40px rgba(0,0,0,0.6);
                    margin: 0;
                    background: linear-gradient(135deg, #ffffff 40%, #d4af6a 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .fp-name-skeleton {
                    width: 320px; height: 72px;
                    background: rgba(255,255,255,0.08);
                    border-radius: 12px;
                    animation: fp-pulse 1.5s ease-in-out infinite;
                }
                .fp-header-divider {
                    width: 80px; height: 3px;
                    background: linear-gradient(90deg, #f0c040, #e07b39);
                    border-radius: 100px;
                    margin-top: 28px;
                }

                /* ── Main card ── */
                .fp-main {
                    width: 100%;
                    padding: 20px 0 40px;
                }
                .fp-card {
                    background: rgba(255,255,255,0.04);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 28px;
                    padding: 40px 40px 44px;
                    box-shadow: 0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
                }
                @media (max-width: 600px) {
                    .fp-card { padding: 32px 24px 36px; }
                }
                .fp-card-tag {
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 0.3em;
                    color: #e07b39;
                    margin-bottom: 14px;
                }
                .fp-title {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(1.6rem, 4vw, 2.6rem);
                    font-weight: 800;
                    color: #ffffff;
                    line-height: 1.2;
                    margin: 0 0 20px;
                }
                .fp-title-rule {
                    width: 50px; height: 2px;
                    background: linear-gradient(90deg, #f0c040, transparent);
                    border-radius: 100px;
                    margin-bottom: 28px;
                }
                .fp-body-text {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    color: rgba(255,255,255,0.78);
                    font-size: 1rem;
                    line-height: 1.85;
                    font-weight: 400;
                }
                .fp-text-skeleton {
                    height: 18px;
                    background: rgba(255,255,255,0.08);
                    border-radius: 6px;
                    animation: fp-pulse 1.5s ease-in-out infinite;
                }
                .fp-text-skeleton.short { width: 65%; }
                .fp-placeholder-text {
                    color: rgba(255,255,255,0.3);
                    font-style: italic;
                }

                /* ── Footer ── */
                .fp-footer {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px 0 72px;
                    gap: 24px;
                }
                .fp-footer-label {
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 0.3em;
                    color: rgba(255,255,255,0.3);
                    margin: 0;
                }
                .fp-social-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 14px;
                    justify-content: center;
                }
                .fp-social-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 22px 12px 18px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 100px;
                    color: var(--social-color, #fff);
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 600;
                    transition: all 0.25s ease;
                    backdrop-filter: blur(8px);
                }
                .fp-social-btn:hover {
                    background: rgba(255,255,255,0.12);
                    border-color: var(--social-color, #fff);
                    transform: translateY(-3px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                }
                .fp-social-icon { display: flex; align-items: center; }
                .fp-social-label { font-family: 'Poppins', sans-serif; }

                @media print {
                    .fp-root {
                        background: #08090d !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .fp-bg {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .fp-card {
                        backdrop-filter: none;
                        -webkit-backdrop-filter: none;
                        background: rgba(255,255,255,0.08); /* Fallback for blur */
                    }
                }

                @keyframes fp-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}
