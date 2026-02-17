"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Check, X, Shield, Zap, Sparkles, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

export default function UpgradePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [showRedirectMessage, setShowRedirectMessage] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [paddle, setPaddle] = useState<any>(null);

    useEffect(() => {
        const initPaddle = async () => {
            const { initializePaddle } = await import('@paddle/paddle-js');
            const paddleInstance = await initializePaddle({
                environment: process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production' : 'sandbox',
                token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
                eventCallback: async (data: any) => {
                    console.log("Paddle Event:", data.name, data);
                    if (data.name === 'checkout.completed') {
                        await handleCheckoutCompleted();
                    }
                }
            });
            setPaddle(paddleInstance);
        };

        if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
            initPaddle();
        }
    }, []);

    const handleCheckoutCompleted = async () => {
        console.log("Processing checkout completion...");

        // Fetch user directly to avoid stale closure issues
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!currentUser) {
            console.error("No user found processing checkout");
            alert("Error: User not found. Please verify your login status.");
            return;
        }

        console.log("Updating payment for user:", currentUser.id);

        // In a real app, you should rely on Webhooks for this. 
        // For dev/demo, we update client-side.
        const { error } = await supabase
            .from("payments")
            .insert({
                user_id: currentUser.id,
                stripe_payment_id: `paddle_${Date.now()}`,
                is_active: true
            });

        if (!error) {
            console.log("Database updated successfully");
            setLoading(false);
            setShowRedirectMessage(true);

            // Start countdown
            let timer = 5;
            const interval = setInterval(() => {
                timer -= 1;
                setCountdown(timer);
                if (timer <= 0) {
                    clearInterval(interval);
                    // Force a hard refresh to ensure new data is fetched
                    window.location.href = "/dashboard?upgraded=true";
                }
            }, 1000);
        } else {
            console.error("Database update failed:", error);
            alert(`Failed to activate Pro plan: ${error.message}`);
        }
    };

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login?redirect=/upgrade");
                return;
            }
            setUser(user);
        };
        checkUser();
    }, [router]);

    const handleUpgrade = () => {
        if (!paddle || !user) return;
        setLoading(true);

        const checkoutOptions = {
            items: [{
                priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID,
                quantity: 1
            }],
            customer: {
                email: user.email
            },
            settings: {
                displayMode: "overlay" as const, // explicitly Typed
                theme: "dark" as const,
                locale: "en" as const
            }
        };

        console.log("Initializing Paddle Checkout with options:", checkoutOptions);
        console.log("Environment:", process.env.NEXT_PUBLIC_PADDLE_ENV);

        if (process.env.NEXT_PUBLIC_PADDLE_PRICE_ID) {
            paddle.Checkout.open(checkoutOptions);

            // Note: loading state will eventually be cleared by success or manual close
            // We set a timeout to clear loading in case they close the overlay manually without paying
            setTimeout(() => setLoading(false), 3000);
        } else {
            console.error("Paddle Price ID is missing");
            alert("Paddle Price ID is missing in environment variables.");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen text-foreground relative overflow-hidden flex flex-col">
            <AnimatedBackground />

            <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-20 flex flex-col items-center justify-center relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
                            Upgrade to <span className="text-amber-500">Pro</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Unlock unlimited projects and take control of your scope.
                        </p>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                    {/* Free Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="rounded-3xl border border-white/10 bg-white/5 p-8 flex flex-col"
                    >
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-foreground">Free</h3>
                            <div className="mt-4 flex items-baseline text-5xl font-bold tracking-tight text-foreground">
                                $0
                                <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Perfect for trying out Revisify on a single project.
                            </p>
                        </div>
                        <ul className="mt-8 space-y-4 flex-1">
                            {["1 Active Project", "Basic Scope Tracking", "Revision History", "Public Share Link"].map((feature) => (
                                <li key={feature} className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <Check className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <p className="ml-3 text-sm text-foreground">{feature}</p>
                                </li>
                            ))}
                            <li className="flex items-start text-muted-foreground/50">
                                <div className="flex-shrink-0">
                                    <X className="h-5 w-5" />
                                </div>
                                <p className="ml-3 text-sm">Unlimited Projects</p>
                            </li>
                        </ul>
                        <div className="mt-8">
                            <Button
                                variant="outline"
                                className="w-full h-12 border-white/10 hover:bg-white/5 cursor-default"
                                disabled
                            >
                                Current Plan
                            </Button>
                        </div>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="relative rounded-3xl border border-amber-500/50 bg-black/40 backdrop-blur-md p-8 flex flex-col shadow-2xl shadow-amber-500/10"
                    >
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3">
                            <span className="inline-flex items-center rounded-full bg-amber-500 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-amber-500/30">
                                POPULAR
                            </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent rounded-3xl pointer-events-none" />

                        <div className="mb-4 relative">
                            <h3 className="text-lg font-medium text-amber-500 flex items-center gap-2">
                                <Zap className="h-5 w-5 fill-amber-500" /> Pro
                            </h3>
                            <div className="mt-4 flex items-baseline text-5xl font-bold tracking-tight text-foreground">
                                $5
                                <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground">
                                For freelancers handling multiple clients and projects.
                            </p>
                        </div>
                        <ul className="mt-8 space-y-4 flex-1 relative">
                            {[
                                "Unlimited Active Projects",
                                "Advanced Scope Tracking",
                                "Priority Support",
                                "Custom Branding (Coming Soon)",
                                "Everything in Free"
                            ].map((feature) => (
                                <li key={feature} className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
                                            <Check className="h-3.5 w-3.5" />
                                        </div>
                                    </div>
                                    <p className="ml-3 text-sm text-foreground font-medium">{feature}</p>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8 relative">
                            <Button
                                onClick={handleUpgrade}
                                disabled={loading}
                                className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/35 hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="mr-2 h-5 w-5" />
                                        Upgrade to Pro
                                    </>
                                )}
                            </Button>
                            <p className="mt-4 text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                                <Shield className="h-3 w-3" /> Secure payment processing
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

{/* Redirect Message & Countdown */ }
{
    showRedirectMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900 border border-amber-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden text-center"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 animate-pulse">
                    <Sparkles className="h-10 w-10 text-amber-500" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                <p className="text-muted-foreground mb-4">
                    Your account has been upgraded.
                </p>

                <div className="text-4xl font-mono font-bold text-amber-500 mb-4">
                    {countdown}s
                </div>

                <p className="text-sm text-muted-foreground">
                    Redirecting you to dashboard...
                </p>
            </motion.div>
        </div>
    )
}
        </main>
    );
}
