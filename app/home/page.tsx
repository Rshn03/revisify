"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AnimatedBackground from "@/components/AnimatedBackground";

/* ─── Shared Animations ───────────────────────────────────────────────────── */
// Reusing animations from the main waitlist page for consistency
const fadeUp = {
    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};

/* ─── Components ──────────────────────────────────────────────────────────── */

function CheckIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 text-amber-500"
        >
            <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                clipRule="evenodd"
            />
        </svg>
    );
}

function XIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 text-muted-foreground/50"
        >
            <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                clipRule="evenodd"
            />
        </svg>
    );
}

export default function LaunchPage() {
    return (
        <main className="relative min-h-screen text-foreground overflow-hidden">
            <AnimatedBackground />

            <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 md:py-32">
                {/* ─── 1. HERO SECTION ──────────────────────────────────────────────── */}
                <section className="text-center">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                        className="mx-auto max-w-3xl"
                    >
                        <motion.div variants={fadeUp}>
                            <Badge
                                variant="secondary"
                                className="mb-6 border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-500"
                            >
                                Built for freelance video editors
                            </Badge>
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl"
                        >
                            Stop working for free on "just one small change".
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground"
                        >
                            Set clear revision limits before you start.
                            <br />
                            <span className="text-foreground/80">
                                When the limit is crossed, the client pays to unlock more.
                            </span>
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-col items-center gap-4">
                            <Link href="/signup">
                                <Button
                                    size="lg"
                                    className="h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 text-base font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-xl hover:shadow-amber-500/30"
                                >
                                    Start free (1 project)
                                </Button>
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                No credit card • No awkward conversations
                            </p>
                        </motion.div>
                    </motion.div>
                </section>

                {/* ─── 2. PROBLEM SECTION ────────────────────────────────────────────── */}
                <section id="how-it-works" className="mt-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mx-auto max-w-3xl text-center"
                    >
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            "Just one small change..."
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            ...turns into hours of unpaid labor. Stop relying on handshake deals. Use
                            enforceable boundaries that trigger payment the moment scope is breached.
                        </p>
                    </motion.div>
                </section>

                {/* ─── 3. WHY CURRENT METHODS FAIL ───────────────────────────────────── */}
                <section className="mt-24 grid gap-8 sm:grid-cols-3">
                    {[
                        {
                            title: "WhatsApp Messages",
                            desc: "Buried in chat history. Impossible to track scope changes.",
                        },
                        {
                            title: "Google Docs",
                            desc: "Clients ignore them or leave comments everywhere.",
                        },
                        {
                            title: "Verbal Agreements",
                            desc: '"I thought that was included" is the worst sentence to hear.',
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm"
                        >
                            <h3 className="mb-2 text-lg font-semibold text-foreground">
                                {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </motion.div>
                    ))}
                </section>

                {/* ─── 4. SOLUTION: WHAT REVISIFY DOES ───────────────────────────────── */}
                <section className="mt-32 flex flex-col items-center gap-16 md:flex-row md:items-start">
                    <div className="flex-1 space-y-8">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            A boundary your clients can see.
                        </h2>
                        <ul className="space-y-4 text-muted-foreground">
                            {[
                                "Define scope before work starts",
                                "Set revision limits per project",
                                "Track every revision request",
                                "Show exactly when free work ends",
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                                        <svg
                                            className="h-3.5 w-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ─── 5. DASHBOARD VISUAL PLACEHOLDER ───────────────────────────── */}
                    <div className="flex-1 rounded-2xl border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur-md">
                        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <div className="text-sm font-medium text-foreground">
                                    Nike Commercial - V1
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Client: Brand Agency
                                </div>
                            </div>
                            <Badge
                                variant="destructive"
                                className="bg-red-500/10 text-red-500 hover:bg-red-500/20"
                            >
                                Limit Reached
                            </Badge>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Revision Limit</span>
                                <span className="font-medium text-foreground">2 Rounds</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Current Round</span>
                                <span className="font-bold text-red-500">3rd Request</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                                <div className="h-full w-full bg-red-500" />
                            </div>
                            <div className="rounded-lg bg-red-500/5 p-3 text-xs text-red-400">
                                ⚠️ Client is requesting changes beyond the agreed scope. Payment required to proceed.
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── 6. WHO IT’S FOR / NOT FOR ───────────────────────────────────── */}
                <section className="mt-32">
                    <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
                        Is this for you?
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* FOR */}
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8">
                            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-emerald-400">
                                <CheckIcon /> For You If:
                            </h3>
                            <ul className="space-y-3 text-sm text-foreground/80">
                                <li className="flex gap-2">
                                    <CheckIcon /> Freelance video editors
                                </li>
                                <li className="flex gap-2">
                                    <CheckIcon /> Editors managing multiple clients
                                </li>
                                <li className="flex gap-2">
                                    <CheckIcon /> Tired of unpaid revisions
                                </li>
                            </ul>
                        </div>

                        {/* NOT FOR */}
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
                            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-red-400">
                                <XIcon /> Not For You If:
                            </h3>
                            <ul className="space-y-3 text-sm text-foreground/80">
                                <li className="flex gap-2">
                                    <XIcon /> You don't mind doing free work
                                </li>
                                <li className="flex gap-2">
                                    <XIcon /> Hobby or one-off projects
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* ─── 7. PRICING ────────────────────────────────────────────────────── */}
                <section id="pricing" className="mt-32 text-center">
                    <h2 className="mb-12 text-3xl font-bold text-foreground">
                        Simple Pricing
                    </h2>
                    <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-2">
                        {/* Free */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                            <div className="mb-2 text-lg font-semibold text-foreground">
                                Free
                            </div>
                            <div className="mb-6 text-3xl font-bold text-foreground">$0</div>
                            <ul className="mb-8 space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-center justify-center gap-2">
                                    <CheckIcon /> 1 Active Project
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <CheckIcon /> Basic Tracking
                                </li>
                            </ul>
                            <Link href="/signup" className="w-full">
                                <Button
                                    variant="outline"
                                    className="w-full border-white/10 hover:bg-white/5"
                                >
                                    Start Free
                                </Button>
                            </Link>
                        </div>

                        {/* Pro */}
                        <div className="relative rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 backdrop-blur-sm">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-amber-500/20">
                                POPULAR
                            </div>
                            <div className="mb-2 text-lg font-semibold text-amber-500">
                                Pro
                            </div>
                            <div className="mb-6 text-3xl font-bold text-foreground">
                                $12<span className="text-sm font-normal text-muted-foreground">/mo</span>
                            </div>
                            <ul className="mb-8 space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-center justify-center gap-2">
                                    <CheckIcon /> Unlimited Projects
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <CheckIcon /> Scope + Revision Tracking
                                </li>
                            </ul>
                            <Link href="/signup" className="w-full">
                                <Button className="w-full bg-amber-500 text-white hover:bg-amber-600">
                                    Get Pro
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <p className="mt-6 text-sm text-muted-foreground">
                        Start free. Upgrade only when limits are crossed.
                    </p>
                </section>

                {/* ─── 8. FINAL CTA ──────────────────────────────────────────────────── */}
                <section className="mt-32 mb-20 text-center">
                    <h2 className="mb-8 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Protect your next project.
                    </h2>
                    <div className="flex flex-col items-center gap-4">
                        <Link href="/signup">
                            <Button
                                size="lg"
                                className="h-14 rounded-full bg-foreground px-10 text-lg font-semibold text-background transition-transform hover:scale-105"
                            >
                                Start free
                            </Button>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            No credit card required.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
