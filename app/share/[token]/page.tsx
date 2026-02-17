"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Badge } from "@/components/ui/badge";
import { Lock, History, AlertCircle, CheckCircle2, ShieldCheck, Check } from "lucide-react";
import { motion } from "framer-motion";

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

export default function SharedProjectPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<Project | null>(null);
    const [revisions, setRevisions] = useState<Revision[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data, error } = await supabase.rpc("get_shared_project", {
                    p_token: token,
                });

                if (error) throw error;
                if (!data) throw new Error("Project not found or link expired");

                setProject(data.project);
                setRevisions(data.revisions);
            } catch (err: unknown) {
                console.error("Fetch error:", err);
                setError("This link is invalid or has expired.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [token]);

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

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center text-foreground">
                <AnimatedBackground />
                <p className="text-sm text-muted-foreground animate-pulse">Loading secure project view...</p>
            </main>
        );
    }

    if (error || !project) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center text-foreground p-6 text-center">
                <AnimatedBackground />
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 backdrop-blur-md max-w-md w-full">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
                    <p className="text-muted-foreground">{error || "Project not found."}</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen text-foreground px-4 py-12 relative overflow-hidden">
            <AnimatedBackground />

            {/* Top Bar / Brand */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
                <div className="text-lg font-bold tracking-tight text-foreground/50">Revisify</div>
                <Badge variant="outline" className="border-amber-500/20 text-amber-500 bg-amber-500/5 gap-1">
                    <ShieldCheck className="h-3 w-3" /> Read-only Proof
                </Badge>
            </div>

            <div className="mx-auto max-w-5xl relative z-10 pt-16 grid gap-8 lg:grid-cols-[1fr_380px]">

                {/* ── Left Column: Contract & Log ────────────────────────── */}
                <div className="space-y-8">
                    {/* Header */}
                    <div>
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
                                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
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

                {/* ── Right Column: Status ─────────────────────── */}
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
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </div>

                            <div className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium ${getStatusColor()}`}>
                                {isLimitReached ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                {getStatusText()}
                            </div>

                            {isLimitReached && (
                                <div className="mt-6 rounded-lg bg-red-500/10 p-4 border border-red-500/20">
                                    <p className="text-xs text-red-300 font-medium">
                                        ⚠️ Contract Limit Reached
                                    </p>
                                    <p className="mt-1 text-xs text-red-400/80">
                                        The agreed revision limit has been executed. Additional changes may incur extra costs as per the agreement.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="text-center">
                            <p className="text-xs text-muted-foreground/40">
                                Generated by Revisify. Trusted by freelancers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
