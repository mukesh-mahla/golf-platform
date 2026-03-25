"use client";

import { useState } from "react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  LogOut,
  CreditCard,
  Trophy,
  Heart,
  CircleDollarSign,
} from "lucide-react";

// ── types ──────────────────────────────────────────────────────────────────

type Score = {
  id: string;
  value: number;
  date: string;
  userId: string;
};

type Draw = {
  id: string;
  number: number[];
  status: "SIMULATION" | "PUBLISHED";
  createdAt: string;
};

type Subscription = {
  plan: "MONTHLY" | "YEARLY" | null;
  status: "ACTIVE" | "INACTIVE" | "CANCELLED";
  renewalDate: string | null;
};

type Winning = {
  id: string;
  amount: number;
  matchTier: number;        // 3, 4, or 5 
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  createdAt: string;
};
type Charity = {
  id: string;
  name: string;
};

type Profile = {
  selectedCharityId: string | null;
  charityPercentage: number;
  drawsEntered: number;
};

// ── helpers ────────────────────────────────────────────────────────────────

function getTrend(scores: Score[]) {
  if (scores.length < 2) return null;
  const latest = scores[0].value;
  const prev = scores[1].value;
  if (latest > prev) return "up";
  if (latest < prev) return "down";
  return "flat";
}

function getAverage(scores: Score[]) {
  if (!scores.length) return null;
  return (scores.reduce((s, sc) => s + sc.value, 0) / scores.length).toFixed(1);
}

function ScoreBar({ value }: { value: number }) {
  const pct = ((value - 1) / 44) * 100;
  return (
    <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
      <div
        className="h-full rounded-full bg-emerald-500 transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-white/30 text-[11px] uppercase tracking-widest mb-4">{children}</p>
  );
}

// ── main component ─────────────────────────────────────────────────────────

export const Dashboard = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ value: "", date: "" });
  const [formError, setFormError] = useState<string | null>(null);

  // ── queries ──

  const { data: scores } = useSuspenseQuery<Score[]>({
    queryKey: ["score"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/score`, { withCredentials: true });
      return res.data;
    },
  });

  const { data: draw } = useSuspenseQuery<Draw | null>({
    queryKey: ["draw"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/draw`, { withCredentials: true });
      return res.data;
    },
  });

  const { data: subscription } = useSuspenseQuery<Subscription>({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/subscription`, { withCredentials: true });
      return res.data;
    },
  });

  const { data: winnings } = useSuspenseQuery<Winning[]>({
    queryKey: ["winnings"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/winnings`, { withCredentials: true });
      return res.data;
    },
  });

  const { data: profile } = useSuspenseQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/profile`, { withCredentials: true });
      return res.data;
    },
  });

  const { data: charities } = useSuspenseQuery<Charity[]>({
    queryKey: ["charities"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/charity`, { withCredentials: true });
      return res.data;
    },
  });

  // ── mutations ──

  const addScore = useMutation({
    mutationFn: async (payload: { value: number; date: string }) => {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/score`, payload, { withCredentials: true });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["score"] });
      setForm({ value: "", date: "" });
      setOpen(false);
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) setFormError(err.response?.data?.message || "Failed to add score");
    },
  });

  const updateCharity = useMutation({
    mutationFn: async (payload: { charityId: string; percentage: number }) => {
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/charity`, payload, { withCredentials: true });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });

  const signOut = useMutation({
    mutationFn: async () => {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signout`, {}, { withCredentials: true });
    },
    onSuccess: () => { window.location.href = "/signin"; },
  });

  // ── local state ──

  const [charityPct, setCharityPct] = useState(profile?.charityPercentage ?? 10);

  // ── handlers ──

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const val = Number(form.value);
    if (!form.value || !form.date) return setFormError("Both fields are required");
    if (val < 1 || val > 45) return setFormError("Score must be between 1 and 45");
    addScore.mutate({ value: val, date: form.date });
  };

  const handleCharitySelect = (charityId: string) => {
    updateCharity.mutate({ charityId, percentage: charityPct });
  };

  const handleSliderRelease = () => {
    if (profile?.selectedCharityId) {
      updateCharity.mutate({ charityId: profile.selectedCharityId, percentage: charityPct });
    }
  };

  // ── derived ──

  const trend = getTrend(scores);
  const avg = getAverage(scores);
  const best = scores.length ? Math.max(...scores.map((s) => s.value)) : null;
  const userScoreValues = scores.map((s) => s.value);
  const drawNumbers = draw?.number ?? [];
  const matches = drawNumbers.filter((n) => userScoreValues.includes(n));
  const totalWon = winnings.reduce((sum, w) => sum + w.amount, 0);
  const pendingWinnings = winnings.filter((w) => w.status === "PENDING");

  // ── render ──

  return (
    <div
      className="min-h-screen bg-[#0d1812] text-white px-5 py-8 md:px-10 lg:px-16"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-white/30 text-xs tracking-widest uppercase mb-1">Dashboard</p>
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
              Overview
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); setFormError(null); }}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-4 h-10 font-medium shadow-lg shadow-emerald-950/40 group">
                  <Plus className="w-4 h-4 mr-1.5 group-hover:rotate-90 transition-transform duration-200" />
                  Add score
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#111f1b] border-white/[0.08] text-white rounded-2xl max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-white font-semibold">Log a score</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  <div className="space-y-1.5">
                    <Label className="text-white/50 text-[11px] tracking-widest uppercase">
                      Stableford score <span className="text-white/25 normal-case tracking-normal">(1–45)</span>
                    </Label>
                    <Input
                      type="number" min={1} max={45} placeholder="e.g. 36"
                      value={form.value}
                      onChange={(e) => { setForm({ ...form, value: e.target.value }); setFormError(null); }}
                      className="h-11 bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/50 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/50 text-[11px] tracking-widest uppercase">Date played</Label>
                    <Input
                      type="date" value={form.date}
                      onChange={(e) => { setForm({ ...form, date: e.target.value }); setFormError(null); }}
                      max={new Date().toISOString().split("T")[0]}
                      className="h-11 bg-white/[0.05] border-white/10 text-white [color-scheme:dark] focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/50 rounded-xl"
                    />
                  </div>
                  {formError && (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{formError}</p>
                  )}
                  <Button
                    type="submit" disabled={addScore.isPending}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold"
                  >
                    {addScore.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving…
                      </span>
                    ) : "Save score"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost" size="icon"
              onClick={() => signOut.mutate()}
              disabled={signOut.isPending}
              className="h-10 w-10 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.05]"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* ── Subscription status ── */}
        <div className="p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <SectionLabel>Subscription</SectionLabel>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-white/30" />
              <div>
                <p className="text-white font-medium text-sm">
                  {subscription.plan
                    ? `${subscription.plan.charAt(0) + subscription.plan.slice(1).toLowerCase()} plan`
                    : "No active plan"}
                </p>
                {subscription.renewalDate && (
                  <p className="text-white/35 text-xs mt-0.5">
                    Renews {new Date(subscription.renewalDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
            <Badge
              className={
                subscription.status === "ACTIVE"
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                  : subscription.status === "CANCELLED"
                  ? "bg-red-500/15 text-red-400 border-red-500/25"
                  : "bg-white/[0.05] text-white/40 border-white/10"
              }
            >
              {subscription.status.charAt(0) + subscription.status.slice(1).toLowerCase()}
            </Badge>
          </div>
        </div>

        {/* ── Score stats ── */}
        {scores.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              <p className="text-white/30 text-[11px] uppercase tracking-widest mb-2">Average</p>
              <p className="text-2xl font-bold text-white">{avg}</p>
            </div>
            <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              <p className="text-white/30 text-[11px] uppercase tracking-widest mb-2">Best</p>
              <p className="text-2xl font-bold text-emerald-400">{best}</p>
            </div>
            <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              <p className="text-white/30 text-[11px] uppercase tracking-widest mb-2">Trend</p>
              <div className="flex items-center gap-1.5">
                {trend === "up"   && <><TrendingUp   className="w-5 h-5 text-emerald-400" /><span className="text-emerald-400 font-bold text-sm">Up</span></>}
                {trend === "down" && <><TrendingDown className="w-5 h-5 text-red-400"     /><span className="text-red-400 font-bold text-sm">Down</span></>}
                {trend === "flat" && <><Minus        className="w-5 h-5 text-white/40"    /><span className="text-white/40 font-bold text-sm">Steady</span></>}
                {trend === null   && <span className="text-white/25 text-sm">—</span>}
              </div>
            </div>
          </div>
        )}

        {/* ── Score list ── */}
        <div>
          {scores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-white/[0.07]">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
                <Plus className="w-5 h-5 text-white/30" />
              </div>
              <p className="text-white/50 font-medium">No scores yet</p>
              <p className="text-white/25 text-sm mt-1">Add your first Stableford score to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white/30 text-xs tracking-widest uppercase">
                  Scores
                </p>
                <Badge className="bg-white/[0.05] text-white/40 border-white/10 text-[10px]">
                  {scores.length}/5 slots
                </Badge>
              </div>
              {scores.map((score, i) => (
                <div
                  key={score.id}
                  className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-white/30 text-[11px] font-mono">
                        {i + 1}
                      </span>
                      <div className="flex items-center gap-1.5 text-white/35 text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(score.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      {i === 0 && (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-[10px] px-1.5 py-0">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <span className="text-2xl font-bold text-white tabular-nums">{score.value}</span>
                  </div>
                  <ScoreBar value={score.value} />
                </div>
              ))}
              {scores.length === 5 && (
                <p className="text-white/20 text-xs text-center pt-1">
                  Max 5 scores — adding a new one removes the oldest.
                </p>
              )}
            </div>
          )}
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* ── Monthly draw ── */}
        <div className="p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>Monthly draw</SectionLabel>
            {draw?.status && (
              <Badge className={draw.status === "PUBLISHED"
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-[10px]"
                : "bg-amber-500/15 text-amber-400 border-amber-500/25 text-[10px]"
              }>
                {draw.status.charAt(0) + draw.status.slice(1).toLowerCase()}
              </Badge>
            )}
          </div>

          {!draw ? (
            <p className="text-white/30 text-sm">No draw scheduled yet for this month.</p>
          ) : (
            <>
              <div className="flex gap-2 mb-4 flex-wrap">
                {drawNumbers.map((n, i) => (
                  <span
                    key={i}
                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-all ${
                      userScoreValues.includes(n)
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                        : "bg-white/[0.06] text-white/50"
                    }`}
                  >
                    {n}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-white/40 text-sm">
                  <span className="text-white font-semibold">{matches.length}</span> match{matches.length !== 1 ? "es" : ""}
                </p>
                {matches.length >= 5 && <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25">🏆 Jackpot eligible</Badge>}
                {matches.length === 4 && <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25">4-match winner</Badge>}
                {matches.length === 3 && <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25">3-match winner</Badge>}
              </div>
            </>
          )}

          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/30">
            <span>Draws entered: <span className="text-white/60">{profile.drawsEntered}</span></span>
            <span>Next draw: <span className="text-white/60">End of month</span></span>
          </div>
        </div>

        {/* ── Winnings ── */}
        <div className="p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>Winnings</SectionLabel>
            <div className="flex items-center gap-1.5">
              <CircleDollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold text-sm">£{totalWon.toLocaleString()}</span>
              <span className="text-white/25 text-xs">total</span>
            </div>
          </div>

          {winnings.length === 0 ? (
            <p className="text-white/30 text-sm">No winnings yet — keep entering draws.</p>
          ) : (
            <div className="space-y-2">
              {winnings.map((w) => (
                <div key={w.id} className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
                  <div>
                    <p className="text-white/70 text-sm">{w.matchTier}-Number Match</p>
                    <p className="text-white/30 text-xs mt-0.5">
                      {new Date(w.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">£{w.amount.toLocaleString()}</span>
                    <Badge className={w.status === "PAID"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-[10px]"
                      : "bg-amber-500/15 text-amber-400 border-amber-500/25 text-[10px]"
                    }>
                      {w.status.charAt(0) + w.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                </div>
              ))}
              {pendingWinnings.length > 0 && (
                <p className="text-amber-400/60 text-xs pt-1">
                  {pendingWinnings.length} pending payout{pendingWinnings.length > 1 ? "s" : ""} — verification in progress.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Charity ── */}
        <div className="p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>Charity</SectionLabel>
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold">{charityPct}%</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white/50 text-[11px] tracking-widest uppercase">Selected organisation</Label>
              <Select
                value={profile?.selectedCharityId ?? ""}
                onValueChange={handleCharitySelect}
              >
                <SelectTrigger className="h-11 bg-white/[0.05] border-white/10 text-white rounded-xl focus:ring-emerald-500/40">
                  <SelectValue placeholder="Select a charity…" />
                </SelectTrigger>
                <SelectContent className="bg-[#111f1b] border-white/[0.08] text-white">
                  {charities.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="focus:bg-white/[0.06] focus:text-white">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white/50 text-[11px] tracking-widest uppercase">Contribution</Label>
                <span className="text-white/30 text-xs">Min 10%</span>
              </div>
              <input
                type="range" min="10" max="100"
                value={charityPct}
                onChange={(e) => setCharityPct(Number(e.target.value))}
                onMouseUp={handleSliderRelease}
                onTouchEnd={handleSliderRelease}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-white/25 text-xs">
                {charityPct}% of your subscription is routed to your chosen charity each month.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};