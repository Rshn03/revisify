"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowUp } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";



/* ─── Morphing Word Rotator ───────────────────────────────────────────────── */
const ROTATE_WORDS = [
  "revision 7",
  "one more tweak",
  "a quick re-cut",
  "final final v3",
];

function MorphingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATE_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const word = ROTATE_WORDS[index];

  return (
    <span className="relative inline-block min-w-[200px] overflow-hidden align-bottom sm:min-w-[250px] md:min-w-[320px]">
      <AnimatePresence mode="wait">
        <motion.span
          key={word}
          className="inline-block bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent"
          initial={{ y: "100%", opacity: 0, filter: "blur(10px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, filter: "blur(10px)" }}
          transition={{
            y: { type: "spring", stiffness: 200, damping: 22 },
            opacity: { duration: 0.3 },
            filter: { duration: 0.3 },
          }}
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ─── Animation Variants ──────────────────────────────────────────────────── */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
      setShowScrollTop(scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Force scroll to top on refresh
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const { error } = await supabase
        .from("waitlist")
        .insert({ email: email.trim().toLowerCase() });

      if (error) {
        if (error.code === "23505") {
          setStatus("success");
          return;
        }
        throw error;
      }

      setStatus("success");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-background">
      <AnimatedBackground />

      {/* ── Navigation Removed (using global Navbar) ── */}

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 pb-16 pt-24 text-center md:pb-24 md:pt-36">
        <motion.div
          className="mx-auto max-w-3xl"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={fadeUp}>
            <Badge
              variant="secondary"
              className="mb-6 gap-2 border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-sm font-normal text-amber-300"
            >
              <span className="badge-sparkle">✦</span>
              Built for freelance video editors
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="mx-auto text-center text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="whitespace-nowrap">You agreed to 2 rounds.</span>
            <br />
            You&apos;re now on{" "}
            <MorphingText />
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            The client said &quot;just one more pass.&quot; That was three
            hours ago. You&apos;re re-exporting for the sixth time, and nobody
            mentioned paying for any of it.{" "}
            <span className="font-medium text-foreground/80">
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Revisify</span> tracks every revision so you know exactly when
              free ends and paid begins.
            </span>
          </motion.p>

          {/* ── Waitlist Form ────────────────────────────────────────── */}
          <motion.div variants={fadeUp} className="mt-10">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="mx-auto max-w-md rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-6 py-5 backdrop-blur-md"
                >
                  <p className="text-lg font-semibold text-emerald-400">
                    You&apos;re on the list! 🎉
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We&apos;ll let you know the moment Revisify is ready.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 flex-1 rounded-xl border-border/60 bg-card/30 text-sm backdrop-blur-md placeholder:text-muted-foreground/50 focus:border-amber-500/50 focus:ring-amber-500/20"
                  />
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      type="submit"
                      disabled={status === "loading"}
                      size="lg"
                      className="btn-shine relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 text-sm font-semibold text-white shadow-lg shadow-amber-600/25 transition-all hover:shadow-xl hover:shadow-amber-600/40 sm:w-auto"
                    >
                      <span className="relative">
                        {status === "loading" ? (
                          <span className="flex items-center gap-2">
                            <span className="spinner inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                            Joining…
                          </span>
                        ) : (
                          "Join the waitlist →"
                        )}
                      </span>
                    </Button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-3 text-sm text-destructive"
                >
                  {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Trust text */}
          <motion.p
            variants={fadeUp}
            className="mt-5 text-xs text-muted-foreground/60"
          >
            For editors only · First 200 get lifetime early pricing · No credit card
          </motion.p>
        </motion.div>
      </section>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 mx-auto h-px w-full max-w-xl"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="h-full w-full bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
      </motion.div>

      {/* ── Supporting Section: Why editors lose money ────────────────── */}
      <section className="relative z-10 w-full px-4 py-20 md:py-28">
        <motion.div
          className="mx-auto max-w-2xl"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.h2
            variants={fadeUp}
            className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            How editors lose money
          </motion.h2>

          <div className="mt-12 space-y-10">
            {/* Step 1 */}
            <motion.div variants={fadeUp} className="flex gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-sm text-amber-400 ring-1 ring-amber-500/20">
                1
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  You quote a flat rate. Revisions aren&apos;t discussed.
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  The project starts with good vibes and a handshake. Nobody
                  talks about what happens after the first cut — how many rounds
                  of changes are included, or what counts as &quot;out of scope.&quot;
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeUp} className="flex gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-sm text-amber-400 ring-1 ring-amber-500/20">
                2
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  &quot;Can you just…&quot; turns into 6 hours of free editing.
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Swap the music. Tighten this cut. Try a warmer grade. Move
                  the text over. Each request is 10 minutes — but there are
                  thirty of them, and none were in the original brief.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeUp} className="flex gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-sm text-amber-400 ring-1 ring-amber-500/20">
                3
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  You eat the cost — because the alternative is losing the client.
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  There&apos;s no paper trail, no revision log, and no easy way
                  to say &quot;this is extra.&quot; So you just do the work, resent
                  the project, and hope the next client is better.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Closing line */}
          <motion.p
            variants={fadeUp}
            className="mt-14 text-center text-sm leading-relaxed text-muted-foreground"
          >
            Revisify gives you a system —{" "}
            <span className="font-medium text-foreground/80">
              so the work has a boundary before the relationship needs one.
            </span>
          </motion.p>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <motion.footer
        className="relative z-10 w-full border-t border-border/20 py-8 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-xs text-muted-foreground/50">
          Made with <span className="text-red-500">❤️</span> by Rishin
        </p>
      </motion.footer>

      {/* ── Scroll To Top ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 bg-background/80 text-amber-500 backdrop-blur-md shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-500/10 hover:border-amber-500/50"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}