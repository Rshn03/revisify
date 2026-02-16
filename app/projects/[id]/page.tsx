"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Lock, History, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
    id: string;
    project_name: string;
    client_name: string;
    scope: string;
    revision_limit: number;
    created_at: string;
}

interface Revision {
    id: string;
    note: string;
    created_at: string;
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<Project | null>(null);
    const [revisions, setRevisions] = useState<Revision[]>([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [revisionNote, setRevisionNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            // 1. Get User
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace("/login");
                return;
            }

            // 2. Get Project
            const { data: projectData, error: projectError } = await supabase
                .from("projects")
                .select("*")
                .eq("id", id)
                .single();

            if (projectError || !projectData) {
                console.error(projectError);
                // Handle 404 or access denied
                return;
            }
            setProject(projectData);

            // 3. Get Revisions
            const { data: revisionsData, error: revisionsError } = await supabase
                .from("revisions")
                .select("*")
                .eq("project_id", id)
                .order("created_at", { ascending: true }); // Chronological for timeline

            if (revisionsData) {
                setRevisions(revisionsData);
            }

            setLoading(false);
        }

        fetchData();
    }, [id, router]);

    // Derived state
    const revisionsUsed = revisions.length;
    const limit = project?.revision_limit || 0;
    const isLimitReached = revisionsUsed >= limit;
    const isLastRevision = revisionsUsed === limit - 1;

    // Status Badge Logic
    const getStatusColor = () => {
        if (isLimitReached) return "text-red-400 bg-red-400/10 border-red-400/20";
        if (isLastRevision) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
        return "text-green-400 bg-green-400/10 border-green-400/20";
    };

    const getStatusText = () => {
        if (isLimitReached) return "Out of Scope";
        if (isLastRevision) return "Last Free Revision";
        return "Within Scope";
    };

    async function handleAddRevision(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        if (isLimitReached) {
            setError("Revision limit exceeded. Cannot add more revisions.");
            setSubmitting(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("revisions")
                .insert({
                    project_id: id,
                    note: revisionNote.trim()
                })
                .select()
                .single();

            if (error) throw error;

            setRevisions([...revisions, data]);
            setRevisionNote("");
            setIsModalOpen(false);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to add revision");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center text-foreground">
                <AnimatedBackground />
                <p className="text-sm text-muted-foreground animate-pulse">Loading contract details…</p>
            </main>
        );
    }

    if (!project) return null; // Or 404 component

    return (
        <main className="min-h-screen text-foreground px-4 pt-24 pb-12 relative overflow-hidden">
            <AnimatedBackground />

            <div className="mx-auto max-w-5xl relative z-10 grid gap-8 lg:grid-cols-[1fr_380px]">

                {/* ── Left Column: Contract & Log ────────────────────────── */}
                <div className="space-y-8">
                    {/* Header */}
                    <div>
                        <Button
                            variant="link"
                            onClick={() => router.push("/dashboard")}
                            className="pl-0 text-muted-foreground hover:text-foreground mb-4"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">
                            {project.project_name}
                        </h1>
                        <p className="text-lg text-muted-foreground mt-2">
                            Client: <span className="text-foreground font-medium">{project.client_name}</span>
                        </p>
                    </div>

                    {/* Contract Scope */}
                    <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
                        <div className="border-b border-white/10 bg-white/5 px-6 py-4 flex items-center gap-2">
                            <Lock className="h-4 w-4 text-amber-500" />
                            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                                Contract Scope
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="prose prose-invert prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                                {project.scope || "No scope defined."}
                            </div>
                            <p className="mt-6 text-xs text-muted-foreground/50 border-t border-white/5 pt-4">
                                This scope was defined at project creation on {new Date(project.created_at).toLocaleDateString()}.
                            </p>
                        </div>
                    </div>

                    {/* Revision Log */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                <History className="h-5 w-5 text-muted-foreground" />
                                Revision Log
                            </h2>
                        </div>

                        <div className="relative border-l border-white/10 ml-3 space-y-8 pl-8 pb-4">
                            {revisions.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">No revisions recorded yet.</p>
                            ) : (
                                revisions.map((rev, index) => (
                                    <div key={rev.id} className="relative">
                                        <span className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full bg-background border border-white/10 text-[10px] font-mono text-muted-foreground">
                                            {index + 1}
                                        </span>
                                        <div className="rounded-xl border border-white/5 bg-white/5 p-4 hover:border-white/10 transition-colors">
                                            <p className="text-sm text-foreground whitespace-pre-wrap">{rev.note}</p>
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Requested on {new Date(rev.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Right Column: Status & Action ─────────────────────── */}
                <div className="space-y-6">
                    <div className="sticky top-24 space-y-6">
                        {/* Status Card */}
                        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6 shadow-xl">
                            <h3 className="text-sm font-medium text-muted-foreground mb-4">Revision Usage</h3>

                            <div className="flex items-baseline justify-between mb-2">
                                <span className="text-4xl font-bold text-foreground">{revisionsUsed}</span>
                                <span className="text-sm text-muted-foreground">/ {limit} allowed</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                                <motion.div
                                    className={`h-full ${isLimitReached ? "bg-red-500" : isLastRevision ? "bg-yellow-500" : "bg-green-500"}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((revisionsUsed / limit) * 100, 100)}%` }}
                                />
                            </div>

                            <div className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium ${getStatusColor()}`}>
                                {isLimitReached ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                {getStatusText()}
                            </div>

                            <Button
                                onClick={() => setIsModalOpen(true)}
                                disabled={isLimitReached}
                                className={`w-full mt-6 ${isLimitReached ? "bg-white/5 text-muted-foreground cursor-not-allowed hover:bg-white/5" : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30"}`}
                            >
                                {isLimitReached ? "Limit Exceeded" : "Add Revision"}
                            </Button>
                            {isLimitReached && (
                                <p className="mt-3 text-xs text-center text-red-400">
                                    Further changes require a new agreement.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* ── Add Revision Modal ────────────────────────────────────── */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl"
                        >
                            <h3 className="text-xl font-bold text-foreground mb-2">Record a Revision</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Revision request(as received from client)
                            </p>

                            <form onSubmit={handleAddRevision}>
                                <textarea
                                    autoFocus
                                    required
                                    rows={5}
                                    value={revisionNote}
                                    onChange={(e) => setRevisionNote(e.target.value)}
                                    placeholder="Client requested changes to..."
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none placeholder:text-muted-foreground/50 mb-6"
                                />

                                {error && (
                                    <p className="mb-4 text-sm text-red-400 bg-red-400/10 p-2 rounded border border-red-400/20">
                                        {error}
                                    </p>
                                )}

                                <div className="flex justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-white text-black hover:bg-white/90"
                                    >
                                        {submitting ? "Adding..." : "Confirm Revision"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
