"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

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

                <h2 className="mt-10 text-xl font-semibold text-white">
                    Your Projects
                </h2>

                {projects.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
                        <p className="text-gray-400">
                            No projects yet. Create your first project.
                        </p>
                        <button
                            onClick={() => router.push("/projects/new")}
                            className="mt-4 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                        >
                            Create Project
                        </button>
                    </div>
                ) : (
                    <div className="mt-6 grid gap-4">
                        {projects.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => router.push(`/projects/${project.id}`)}
                                className="w-full rounded-2xl border border-gray-800 bg-gray-900 p-5 text-left transition-colors hover:border-gray-700 hover:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-950"
                            >
                                <h3 className="text-lg font-semibold text-white">
                                    {project.project_name}
                                </h3>
                                <p className="mt-1 text-sm text-gray-400">
                                    Client: {project.client_name}
                                </p>
                                <p className="mt-0.5 text-sm text-gray-500">
                                    Revision limit: {project.revision_limit}
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
