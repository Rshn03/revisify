"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Twitter } from "lucide-react";

export default function Footer() {
    const pathname = usePathname();

    // Don't render footer on share pages
    if (pathname?.startsWith("/share")) return null;

    return (
        <footer className="border-t border-white/5 bg-black/20 backdrop-blur-sm relative z-10 mt-auto">
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {/* Brand */}
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <span className="text-xl font-bold tracking-tight text-foreground">Revisify</span>
                        <p className="text-sm text-muted-foreground text-center md:text-left">
                            Clarity before extra work.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-center gap-8">
                        <Link href="/home#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            How it works
                        </Link>
                        <Link href="/home#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Pricing
                        </Link>
                        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Login
                        </Link>
                    </div>

                    {/* Socials & Copyright */}
                    <div className="flex flex-col items-center md:items-end gap-4">
                        <div className="flex gap-4">
                            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                <span className="sr-only">Twitter</span>
                                <Twitter className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                <span className="sr-only">GitHub</span>
                                <Github className="h-4 w-4" />
                            </Link>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            &copy; {new Date().getFullYear()} Revisify. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
