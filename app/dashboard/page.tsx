"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Project {
    id: string;
    project_name: string;
    client_name: string;
    revision_limit: number;
    created_at: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.replace("/login");
                return;
            }

            setUser(user);

            const { data, error } = await supabase
                .from("projects")
                .select("id, project_name, client_name, revision_limit, created_at")
                .order("created_at", { ascending: false });

            if (!error && data) {
                setProjects(data);
            }

            setLoading(false);
        }

        init();
    }, [router]);



    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        // Check for upgraded=true param
        const params = new URLSearchParams(window.location.search);
        if (params.get("upgraded") === "true") {
            setShowSuccessModal(true);
            // Clean up URL
            window.history.replaceState({}, "", "/dashboard");
        }
    }, []);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center text-foreground">
                <AnimatedBackground />
                <p className="text-sm text-muted-foreground animate-pulse">Loading projects…</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen text-foreground px-4 pt-24 pb-12 relative overflow-hidden">
            <AnimatedBackground />

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-900 border border-green-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden text-center"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none" />

                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20">
                            <div className="h-10 w-10 text-green-500">
                                {/* Sparkles icon or Check icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">Pro Unlocked!</h2>
                        <p className="text-muted-foreground mb-8">
                            Welcome to the Pro plan. You can now create unlimited projects.
                        </p>

                        <Button
                            onClick={() => setShowSuccessModal(false)}
                            size="lg"
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 border-0"
                        >
                            Let's Build
                        </Button>
                    </motion.div>
                </div>
            )}

            <div className="mx-auto max-w-5xl relative z-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 sm:text-5xl">
                            Dashboard
                        </h1>
                        <p className="mt-2 text-lg text-muted-foreground max-w-lg">
                            Track your projects, manage revisions, and keep clients happy.
                        </p>
                    </div>
                </header>

                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                            Projects
                            <span className="text-sm font-normal text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                {projects.length}
                            </span>
                        </h2>
                        {projects.length > 0 && (
                            <Button
                                asChild
                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 hover:scale-[1.02]"
                            >
                                <Link href="/projects/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Project
                                </Link>
                            </Button>
                        )}
                    </div>

                    {projects.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-16 text-center backdrop-blur-sm relative group overflow-hidden"
                        >
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 group-hover:scale-110 transition-transform duration-500">
                                <Plus className="h-10 w-10 text-amber-500" />
                            </div>

                            <h3 className="text-xl font-semibold text-foreground">No projects created yet</h3>
                            <p className="mt-3 text-muted-foreground max-w-md mx-auto leading-relaxed">
                                Start by creating your first project to track scope, manage revisions, and keep clients happy.
                            </p>

                            <Button
                                asChild
                                size="lg"
                                className="relative z-20 mt-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all hover:scale-105 cursor-pointer"
                            >
                                <Link href="/projects/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create First Project
                                </Link>
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {projects.map((project, i) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1, duration: 0.4 }}
                                >
                                    <button
                                        onClick={() => router.push(`/projects/${project.id}`)}
                                        className="group w-full h-full text-left rounded-2xl border border-white/10 bg-zinc-900/40 p-1 backdrop-blur-md transition-all duration-300 hover:border-amber-500/50 hover:bg-zinc-900/60 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1"
                                    >
                                        <div className="h-full p-6 rounded-xl bg-gradient-to-br from-white/5 to-transparent flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/20 group-hover:border-amber-500/40 transition-colors">
                                                    <span className="text-amber-500 font-bold text-lg">
                                                        {project.project_name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-muted-foreground group-hover:text-foreground transition-colors">
                                                    Active
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold text-foreground group-hover:text-amber-400 transition-colors line-clamp-1">
                                                {project.project_name}
                                            </h3>

                                            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                                                {project.client_name}
                                            </p>

                                            <div className="mt-auto pt-6 space-y-3">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Revision Limit</span>
                                                    <span className="font-mono text-amber-500 font-medium">
                                                        {project.revision_limit}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full w-full opacity-50 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                                                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                                    <span className="group-hover:translate-x-1 transition-transform text-white group-hover:text-amber-500">View Details →</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
