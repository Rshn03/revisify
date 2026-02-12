"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkSession() {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                router.replace("/login");
                return;
            }

            setUser(session.user);
            setLoading(false);
        }

        checkSession();
    }, [router]);

    async function handleLogout() {
        await supabase.auth.signOut();
        router.replace("/login");
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-950">
                <p className="text-sm text-gray-400">Loading…</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-950 px-4 py-12">
            <div className="mx-auto max-w-3xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Welcome to Revisify
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-950"
                    >
                        Log out
                    </button>
                </div>
                <p className="mt-4 text-gray-400">
                    Your projects will appear here
                </p>
            </div>
        </main>
    );
}
