"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (user) {
                // Ensure public.users row exists (covers auto-session from signup)
                await supabase
                    .from("users")
                    .upsert({ id: user.id, email: user.email });
                router.replace("/dashboard");
            } else {
                setChecking(false);
            }
        });
    }, [router]);

    if (checking) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-950">
                <p className="text-sm text-gray-400">Loading…</p>
            </main>
        );
    }

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 1. Authenticate user
            const { error: signInError } =
                await supabase.auth.signInWithPassword({ email, password });

            if (signInError) throw signInError;

            // 2. Verify user with server
            const { data: { user }, error: userError } =
                await supabase.auth.getUser();

            if (userError || !user) {
                throw new Error("Login succeeded but no user was returned.");
            }

            const { error: upsertError } = await supabase
                .from("users")
                .upsert({
                    id: user.id,
                    email: user.email,
                });

            if (upsertError) throw upsertError;


            // 3. Redirect to dashboard
            router.push("/dashboard");
        } catch (err: unknown) {
            setError(
                err instanceof Error ? err.message : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
            <div className="w-full max-w-sm space-y-6 rounded-2xl bg-gray-900 p-8 shadow-lg shadow-black/30 border border-gray-800">
                <h1 className="text-center text-2xl font-bold tracking-tight text-white">
                    Welcome back
                </h1>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1 block text-sm font-medium text-gray-300"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-1 block text-sm font-medium text-gray-300"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    {error && (
                        <p className="rounded-lg bg-red-900/30 border border-red-800 px-3 py-2 text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Logging in…" : "Log in"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400">
                    Don&apos;t have an account?{" "}
                    <a
                        href="/signup"
                        className="font-medium text-indigo-400 hover:text-indigo-300"
                    >
                        Sign up
                    </a>
                </p>
            </div>
        </main>
    );
}
