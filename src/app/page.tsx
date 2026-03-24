"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  Trophy,
  Target,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

/* ── tiny hook: is element visible? ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── how it works steps ── */
const STEPS = [
  {
    icon: Target,
    title: "Subscribe",
    desc: "Choose a monthly or yearly plan. A portion of every payment goes straight to your chosen charity.",
  },
  {
    icon: Trophy,
    title: "Enter your scores",
    desc: "Log your last 5 Stableford scores. They're used to enter you into the monthly draw automatically.",
  },
  {
    icon: Heart,
    title: "Win & give",
    desc: "Match numbers in the monthly draw to win prizes — while your subscription keeps supporting a cause you care about.",
  },
];

/* ── draw tiers ── */
const TIERS = [
  { match: "5-Number Match", share: "40%", note: "Jackpot — rolls over if unclaimed" },
  { match: "4-Number Match", share: "35%", note: "Split equally among winners" },
  { match: "3-Number Match", share: "25%", note: "Split equally among winners" },
];

export default function LandingPage() {
  /* hero text fade-in on mount */
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t); }, []);

  const steps  = useInView();
  const tiers  = useInView();
  const charity = useInView();
  const cta    = useInView();

  return (
    <div
      className="min-h-screen bg-[#0d1812] text-white overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ─────────────────────────────── NAV ─────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 border-b border-white/[0.06] bg-[#0d1812]/80 backdrop-blur-md">
        <span className="font-bold text-white tracking-tight">⛳</span>
        <div className="flex items-center gap-3">
          <Link href="/signin">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4">
              Get started
            </Button>
          </Link>
        </div>
      </nav>

      {/* ─────────────────────────────── HERO ────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 pt-16 overflow-hidden">
        {/* background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px]"
            style={{ background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)" }}
          />
        </div>

        <div
          className="relative z-10 max-w-2xl mx-auto transition-all duration-700 ease-out"
          style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(24px)" }}
        >
          <Badge className="mb-6 bg-emerald-500/15 text-emerald-400 border-emerald-500/25 px-3 py-1 text-xs tracking-wide">
            Monthly draws · Charity giving · Score tracking
          </Badge>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Golf that gives
            <br />
            <span className="text-emerald-400 italic">back.</span>
          </h1>

          <p className="mt-6 text-white/50 text-lg leading-relaxed max-w-md mx-auto">
            Subscribe, track your Stableford scores, enter monthly prize draws, and support a charity — all in one place.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link prefetch href="/signup">
              <Button className="h-12 px-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-base transition-all group shadow-xl shadow-emerald-950/50">
                Start your subscription
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="ghost" className="h-12 px-6 text-white/50 hover:text-white hover:bg-white/5 rounded-xl">
                How it works
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>

        {/* scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000 delay-700"
          style={{ opacity: heroVisible ? 0.3 : 0 }}
        >
          <div className="w-px h-10 bg-gradient-to-b from-white/0 to-white/60 animate-pulse" />
        </div>
      </section>

      <Separator className="bg-white/[0.06]" />

      {/* ───────────────────────── HOW IT WORKS ──────────────────────────── */}
      <section id="how-it-works" className="py-28 px-6 md:px-12">
        <div
          ref={steps.ref}
          className="max-w-4xl mx-auto transition-all duration-700 ease-out"
          style={{ opacity: steps.visible ? 1 : 0, transform: steps.visible ? "translateY(0)" : "translateY(32px)" }}
        >
          <p className="text-white/30 text-xs tracking-widest uppercase mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
            Three simple steps.
          </h2>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] transition-all duration-500"
                style={{ transitionDelay: `${i * 100}ms`, opacity: steps.visible ? 1 : 0, transform: steps.visible ? "translateY(0)" : "translateY(20px)" }}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-white/20 text-xs font-mono">0{i + 1}</span>
                <h3 className="text-white font-semibold text-lg mt-1 mb-2">{title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="bg-white/[0.06]" />

      {/* ───────────────────────── PRIZE TIERS ───────────────────────────── */}
      <section className="py-28 px-6 md:px-12">
        <div
          ref={tiers.ref}
          className="max-w-4xl mx-auto transition-all duration-700 ease-out"
          style={{ opacity: tiers.visible ? 1 : 0, transform: tiers.visible ? "translateY(0)" : "translateY(32px)" }}
        >
          <p className="text-white/30 text-xs tracking-widest uppercase mb-3">Monthly draw</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
            Match numbers,<br />win a share.
          </h2>
          <p className="mt-4 text-white/45 text-sm max-w-sm leading-relaxed">
            Every active subscriber is entered automatically. Prize pools are calculated from subscription revenue each month.
          </p>

          <div className="mt-12 space-y-3">
            {TIERS.map(({ match, share, note }, i) => (
              <div
                key={match}
                className="flex items-center justify-between p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] transition-all duration-500"
                style={{ transitionDelay: `${i * 80}ms`, opacity: tiers.visible ? 1 : 0, transform: tiers.visible ? "translateX(0)" : "translateX(-16px)" }}
              >
                <div>
                  <p className="text-white font-semibold">{match}</p>
                  <p className="text-white/35 text-xs mt-0.5">{note}</p>
                </div>
                <span className="text-emerald-400 font-bold text-xl tabular-nums">{share}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="bg-white/[0.06]" />

      {/* ───────────────────────── CHARITY ───────────────────────────────── */}
      <section className="py-28 px-6 md:px-12">
        <div
          ref={charity.ref}
          className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center transition-all duration-700 ease-out"
          style={{ opacity: charity.visible ? 1 : 0, transform: charity.visible ? "translateY(0)" : "translateY(32px)" }}
        >
          <div>
            <p className="text-white/30 text-xs tracking-widest uppercase mb-3">Charity</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug" style={{ fontFamily: "'Georgia', serif" }}>
              Every subscription<br />
              <span className="text-emerald-400">supports a cause.</span>
            </h2>
            <p className="mt-5 text-white/45 text-sm leading-relaxed">
              When you sign up, you choose a charity from our directory. At least 10% of your subscription goes directly to them each month. You can increase that percentage any time, or make a standalone donation.
            </p>
            <Link prefetch href="/signup">
              <Button variant="ghost" className="mt-6 px-0 text-emerald-400 hover:text-emerald-300 hover:bg-transparent group">
                Choose your charity when you sign up
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* visual block */}
          <div className="space-y-3">
            {["Choose your charity at signup", "Minimum 10% of your subscription donated", "Increase your contribution anytime", "Independent donations also accepted"].map((line, i) => (
              <div
                key={line}
                className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all duration-500"
                style={{ transitionDelay: `${i * 80}ms`, opacity: charity.visible ? 1 : 0, transform: charity.visible ? "translateX(0)" : "translateX(16px)" }}
              >
                <Heart className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-white/60 text-sm">{line}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="bg-white/6" />

      {/* ───────────────────────── FINAL CTA ─────────────────────────────── */}
      <section className="py-28 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] blur-[120px]"
            style={{ background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)" }}
          />
        </div>
        <div
          ref={cta.ref}
          className="max-w-xl mx-auto text-center relative z-10 transition-all duration-700 ease-out"
          style={{ opacity: cta.visible ? 1 : 0, transform: cta.visible ? "translateY(0)" : "translateY(32px)" }}
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
            Ready to play<br />
            <span className="text-emerald-400 italic">with purpose?</span>
          </h2>
          <p className="mt-5 text-white/40 text-sm leading-relaxed">
            Subscribe today, pick your charity, and you're automatically entered in the next monthly draw.
          </p>
          <Link href="/signup">
            <Button className="mt-8 h-12 px-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-base transition-all group shadow-xl shadow-emerald-950/50">
              Get started
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ───────────────────────── FOOTER ────────────────────────────────── */}
      <footer className="border-t border-white/6 py-8 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-white/20 text-xs">© {new Date().getFullYear()} · All rights reserved</span>
        <div className="flex items-center gap-6">
          <a href="#" className="text-white/20 hover:text-white/50 text-xs transition-colors">Terms</a>
          <a href="#" className="text-white/20 hover:text-white/50 text-xs transition-colors">Privacy</a>
          <Link href="/signin" className="text-white/20 hover:text-white/50 text-xs transition-colors">Sign in</Link>
        </div>
      </footer>
    </div>
  );
}