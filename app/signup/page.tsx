"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                router.replace("/dashboard");
            } else {
                setChecking(false);
            }
        });
    }, [router]);

    if (checking) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
                <AnimatedBackground />
                <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
            </main>
        );
    }

    async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) throw signUpError;

            // Redirect to login (user must confirm email & log in to create session)
            router.push("/login");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
            <AnimatedBackground />

            <div className="w-full max-w-sm space-y-8 relative z-10">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Create your account
                    </h1>
                    <p className="text-muted-foreground">
                        Get started with Revisify for free
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur-md shadow-2xl">
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-foreground"
                            >
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-foreground"
                            >
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-500"
                            />
                        </div>

                        {error && (
                            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:from-amber-600 hover:to-orange-600 transition-all font-semibold"
                        >
                            {loading ? "Creating account…" : "Sign up"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link
                            href="/login"
                            className="font-medium text-amber-500 hover:text-amber-400 transition-colors"
                        >
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
