"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

    useEffect(() => {
        async function init() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.replace("/login");
                return;
            }

            // Check free-tier project limit
            const { data, error } = await supabase
                .from("projects")
                .select("id");

            if (!error && data && data.length >= FREE_PROJECT_LIMIT) {
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

            // Re-check limit before inserting (guard against race conditions)
            const { data: existing } = await supabase
                .from("projects")
                .select("id");

            if (existing && existing.length >= FREE_PROJECT_LIMIT) {
                setLimitReached(true);
                return;
            }

            // Ensure user row exists (mirrors login upsert)
            const { error: upsertError } = await supabase
                .from("users")
                .upsert({
                    id: user.id,
                    email: user.email,
                });

            if (upsertError) throw upsertError;

            const { data, error: insertError } = await supabase
                .from("projects")
                .insert({
                    user_id: user.id,
                    project_name: projectName.trim(),
                    client_name: clientName.trim(),
                    revision_limit: revisionLimit,
                    extra_revision_cost: extraRevisionCost,
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
            <main className="flex min-h-screen items-center justify-center bg-gray-950">
                <p className="text-sm text-gray-400">Loading…</p>
            </main>
        );
    }

    // ── Upgrade modal ──────────────────────────────────────────────────
    if (limitReached) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
                <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center shadow-lg shadow-black/30">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600/20">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-7 w-7 text-indigo-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 115.636 5.636a9 9 0 0113.728 0z"
                            />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Free plan limit reached
                    </h1>

                    <p className="text-sm text-gray-400">
                        Your free plan includes{" "}
                        <span className="font-semibold text-gray-200">
                            {FREE_PROJECT_LIMIT} project
                        </span>
                        . Upgrade to Pro for unlimited projects.
                    </p>

                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-600/10 px-5 py-4">
                        <p className="text-lg font-bold text-white">
                            Pro Plan
                        </p>
                        <p className="mt-1 text-2xl font-extrabold text-indigo-400">
                            $5
                            <span className="text-sm font-normal text-gray-400">
                                /month
                            </span>
                        </p>
                        <p className="mt-2 text-sm text-gray-400">
                            Unlimited projects & priority support
                        </p>
                    </div>

                    <button
                        disabled
                        className="w-full cursor-not-allowed rounded-lg bg-indigo-600/50 px-4 py-2.5 text-sm font-semibold text-white/60"
                    >
                        Coming soon
                    </button>

                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </main>
        );
    }

    // ── Create project form ────────────────────────────────────────────
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
            <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-lg shadow-black/30">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Create a new project
                    </h1>
                    <p className="mt-1 text-sm text-gray-400">
                        Define the scope up front — set a clear revision limit.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="projectName"
                            className="mb-1 block text-sm font-medium text-gray-300"
                        >
                            Project Name
                        </label>
                        <input
                            id="projectName"
                            type="text"
                            required
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Wedding Highlight Reel"
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="clientName"
                            className="mb-1 block text-sm font-medium text-gray-300"
                        >
                            Client Name
                        </label>
                        <input
                            id="clientName"
                            type="text"
                            required
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="John & Jane"
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="revisionLimit"
                            className="mb-1 block text-sm font-medium text-gray-300"
                        >
                            Revision Limit
                        </label>
                        <input
                            id="revisionLimit"
                            type="number"
                            required
                            min={1}
                            value={revisionLimit}
                            onChange={(e) =>
                                setRevisionLimit(Number(e.target.value))
                            }
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            How many revision rounds are included in this
                            project?
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="extraRevisionCost"
                            className="mb-1 block text-sm font-medium text-gray-300"
                        >
                            Extra Revision Cost ($)
                        </label>
                        <input
                            id="extraRevisionCost"
                            type="number"
                            required
                            min={0}
                            step="0.01"
                            value={extraRevisionCost}
                            onChange={(e) =>
                                setExtraRevisionCost(Number(e.target.value))
                            }
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            How much to charge per extra revision beyond the
                            limit. Set to 0 if unsure.
                        </p>
                    </div>

                    {error && (
                        <p className="rounded-lg border border-red-800 bg-red-900/30 px-3 py-2 text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? "Creating…" : "Create Project"}
                    </button>
                </form>

                <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full text-center text-sm text-gray-400 transition-colors hover:text-gray-200"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </main>
    );
}
