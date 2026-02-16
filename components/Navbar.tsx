"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        // Check auth state
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleLogoClick = () => {
        if (user) {
            window.location.href = "/dashboard";
        } else {
            window.location.href = "/home";
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/home");
        setIsMobileMenuOpen(false);
    };

    const scrollToSection = (id: string) => {
        setIsMobileMenuOpen(false);

        // Debug: Log what we are trying to find
        console.log(`Trying to scroll to: ${id}, current path: ${pathname}`);

        if (pathname !== "/home" && pathname !== "/") {
            router.push(`/home#${id}`);
            return;
        }

        // Add a small delay for mobile menu close animation
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                const offset = 80;
                const elementRect = element.getBoundingClientRect();
                const absoluteElementTop = elementRect.top + window.scrollY;
                const offsetPosition = absoluteElementTop - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                });
            } else {
                console.warn(`Element with id ${id} not found.`);
            }
        }, 100);
    };

    return (
        <motion.nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-background/5 backdrop-blur-md"
                : "bg-transparent"
                }`}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="mx-auto flex h-16 w-full items-center justify-between px-6">
                {/* Logo */}
                <div
                    onClick={handleLogoClick}
                    className="cursor-pointer text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
                >
                    Revisify
                </div>

                {/* Desktop Menu */}
                <div className="hidden items-center gap-8 md:flex">
                    {!user && (
                        <>
                            <button
                                onClick={() => scrollToSection("how-it-works")}
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                How it works
                            </button>
                            <button
                                onClick={() => scrollToSection("pricing")}
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Pricing
                            </button>
                        </>
                    )}

                    {user ? (
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground hover:border-white/20 transition-all group"
                        >
                            <LogOut className="mr-2 h-4 w-4 group-hover:text-red-400 transition-colors" />
                            Log out
                        </Button>
                    ) : (
                        <Link href="/signup">
                            <Button
                                size="sm"
                                className="h-9 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-xl hover:shadow-amber-500/30"
                            >
                                Start free
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-white/5 md:hidden"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-6 w-6"
                    >
                        {isMobileMenuOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-b border-foreground/5 bg-background/95 backdrop-blur-xl md:hidden"
                    >
                        <div className="flex flex-col space-y-4 px-6 py-6">
                            {!user && (
                                <>
                                    <button
                                        onClick={() => scrollToSection("how-it-works")}
                                        className="text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        How it works
                                    </button>
                                    <button
                                        onClick={() => scrollToSection("pricing")}
                                        className="text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        Pricing
                                    </button>
                                </>
                            )}

                            <div className="pt-2">
                                {user ? (
                                    <Button
                                        onClick={handleLogout}
                                        className="w-full justify-start text-muted-foreground hover:text-foreground border border-white/5 bg-white/5 hover:bg-white/10"
                                        variant="ghost"
                                    >
                                        <LogOut className="mr-2 h-4 w-4 text-red-400" />
                                        Log out
                                    </Button>
                                ) : (
                                    <Link href="/signup" className="w-full">
                                        <Button className="w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30">
                                            Start free
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
