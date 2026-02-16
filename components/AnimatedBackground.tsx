"use client";

import { useState, useEffect } from "react";

/* ─── CSS-only Particles ──────────────────────────────────────────────────── */

function FloatingParticles() {
    const [particles, setParticles] = useState<
        Array<{
            id: number;
            x: number;
            y: number;
            size: number;
            duration: number;
            delay: number;
        }>
    >([]);

    useEffect(() => {
        setParticles(
            Array.from({ length: 16 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 2.5 + 1,
                duration: Math.random() * 18 + 12,
                delay: Math.random() * 8,
            }))
        );
    }, []);

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="particle absolute rounded-full bg-amber-400/15"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}

function AnimatedOrbs() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Radial gradient wash */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(251,146,60,0.15),transparent_70%)]" />

            {/* Primary blob — large, top-center */}
            <div className="orb-primary absolute -top-[200px] left-1/2 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-transparent blur-[160px]" />

            {/* Secondary blob — bottom-right, warm pink */}
            <div className="orb-secondary absolute -bottom-[100px] -right-[100px] h-[600px] w-[700px] rounded-full bg-gradient-to-tl from-rose-500/25 via-orange-400/15 to-transparent blur-[140px]" />

            {/* Tertiary blob — mid-left, golden */}
            <div className="orb-tertiary absolute top-1/3 -left-[150px] h-[500px] w-[600px] rounded-full bg-gradient-to-r from-yellow-500/20 via-amber-400/10 to-transparent blur-[130px]" />

            {/* Accent blob — lower center for depth */}
            <div className="orb-secondary absolute bottom-[20%] left-1/2 h-[400px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-t from-orange-500/12 via-amber-500/8 to-transparent blur-[120px]" />
        </div>
    );
}

export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-background text-foreground overflow-hidden">
            {/* Background layers */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            <AnimatedOrbs />
            <FloatingParticles />
        </div>
    );
}
