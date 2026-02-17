"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FREE_PROJECT_LIMIT = 1;

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [limitReached, setLimitReached] = useState(false);

    // Form state
    const [projectName, setProjectName] = useState("");
    const [clientName, setClientName] = useState("");
    const [revisionLimit, setRevisionLimit] = useState(3);
    const [extraRevisionCost, setExtraRevisionCost] = useState(0);
    const [scope, setScope] = useState("");

    useEffect(() => {
        async function init() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.replace("/login");
                return;
            }

            // Ensure user row exists (needed for FK on projects/payments)
            await supabase
                .from("users")
                .upsert({ id: user.id, email: user.email });

            // Check pro status
            const { data: payments } = await supabase
                .from("payments")
                .select("is_active")
                .eq("user_id", user.id)
                .eq("is_active", true);

            const isPro = payments && payments.length > 0;

            // Check free-tier project limit
            const { data, error } = await supabase
                .from("projects")
                .select("id");

            if (!isPro && !error && data && data.length >= FREE_PROJECT_LIMIT) {
                setLimitReached(true);
            }

            setLoading(false);
        }

        init();
    }, [router]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.replace("/login");
                return;
            }

            // Ensure user row exists first (FK dependency)
            const { error: upsertError } = await supabase
                .from("users")
                .upsert({
                    id: user.id,
                    email: user.email,
                });

            if (upsertError) throw upsertError;

            // Re-check pro status & limit before inserting
            const { data: payments } = await supabase
                .from("payments")
                .select("is_active")
                .eq("user_id", user.id)
                .eq("is_active", true);

            const isPro = payments && payments.length > 0;

            if (!isPro) {
                const { data: existing } = await supabase
                    .from("projects")
                    .select("id");

                if (existing && existing.length >= FREE_PROJECT_LIMIT) {
                    setLimitReached(true);
                    return;
                }
            }

            const { data, error: insertError } = await supabase
                .from("projects")
                .insert({
                    user_id: user.id,
                    project_name: projectName.trim(),
                    client_name: clientName.trim(),
                    revision_limit: revisionLimit,
                    extra_revision_cost: extraRevisionCost,
                    scope: scope.trim(),
                })
                .select("id")
                .single();

            if (insertError) throw insertError;

            router.push(`/projects/${data.id}`);
        } catch (err: unknown) {
            setError(
                err instanceof Error ? err.message : "Something went wrong."
            );
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
                <AnimatedBackground />
                <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
            </main>
        );
    }

    // ── Upgrade modal ──────────────────────────────────────────────────
    if (limitReached) {
        return (
            <main className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
                <AnimatedBackground />
                <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-black/40 p-8 text-center backdrop-blur-md shadow-2xl relative z-10">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                        <Sparkles className="h-8 w-8 text-amber-500" />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Free plan limit reached
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Your free plan includes{" "}
                        <span className="font-semibold text-foreground">
                            {FREE_PROJECT_LIMIT} project
                        </span>
                        . Upgrade to Pro for unlimited projects.
                    </p>

                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4">
                        <p className="text-lg font-bold text-foreground">
                            Pro Plan
                        </p>
                        <p className="mt-1 text-2xl font-extrabold text-amber-500">
                            $5
                            <span className="text-sm font-normal text-muted-foreground">
                                /month
                            </span>
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Unlimited projects & priority support
                        </p>
                    </div>

                    <Button
                        onClick={() => router.push("/upgrade")}
                        className="w-full bg-amber-500 text-white hover:bg-amber-600"
                    >
                        Upgrade to Pro
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard")}
                        className="w-full border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                    >
                        Back to Dashboard
                    </Button>
                </div>
            </main>
        );
    }

    // ── Create project form ────────────────────────────────────────────
    return (
        <main className="min-h-screen items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden flex">
            <AnimatedBackground />

            <div className="w-full max-w-lg space-y-8 relative z-10">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Create a new project
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Define the scope up front — set a clear revision limit.
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur-md shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="projectName"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Project Name
                                </label>
                                <Input
                                    id="projectName"
                                    type="text"
                                    required
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="Wedding Highlight Reel"
                                    className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="clientName"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Client Name
                                </label>
                                <Input
                                    id="clientName"
                                    type="text"
                                    required
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder="John & Jane"
                                    className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="revisionLimit"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Revision Limit
                                    </label>
                                    <Input
                                        id="revisionLimit"
                                        type="number"
                                        required
                                        min={1}
                                        value={revisionLimit}
                                        onChange={(e) =>
                                            setRevisionLimit(Number(e.target.value))
                                        }
                                        className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-500"
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Rounds included
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="extraRevisionCost"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Extra Cost ($)
                                    </label>
                                    <Input
                                        id="extraRevisionCost"
                                        type="number"
                                        required
                                        min={0}
                                        step="0.01"
                                        value={extraRevisionCost}
                                        onChange={(e) =>
                                            setExtraRevisionCost(Number(e.target.value))
                                        }
                                        className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-500"
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Per extra round
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="scope"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Scope of Work
                                </label>
                                <textarea
                                    id="scope"
                                    required
                                    rows={4}
                                    value={scope}
                                    onChange={(e) => setScope(e.target.value)}
                                    placeholder="• 3-5 minute wedding highlight video&#10;• Color grading included&#10;• Music licensing handled by client"
                                    className="flex w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Define exactly what is included. This text will be locked in the project contract.
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:from-amber-600 hover:to-orange-600 transition-all font-semibold h-11"
                            >
                                {submitting ? "Creating…" : "Create Project"}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <Button
                            variant="link"
                            onClick={() => router.push("/dashboard")}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
