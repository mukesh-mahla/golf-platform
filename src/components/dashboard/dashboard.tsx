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
import { Plus, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";

type Score = {
  id: string;
  value: number;
  date: string;
  userId: string;
};

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

export const Dashboard = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ value: "", date: "" });
  const [formError, setFormError] = useState<string | null>(null);

  const { data: scores } = useSuspenseQuery<Score[]>({
    queryKey: ["score"],
    queryFn: async () => {
      const res = await axios.get(`/api/score`, { withCredentials: true });
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: { value: number; date: string }) => {
      const res = await axios.post("/api/score", payload, { withCredentials: true });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["score"] });
      setForm({ value: "", date: "" });
      setOpen(false);
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        setFormError(err.response?.data?.message || "Failed to add score");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const val = Number(form.value);
    if (!form.value || !form.date) return setFormError("Both fields are required");
    if (val < 1 || val > 45) return setFormError("Score must be between 1 and 45");
    mutation.mutate({ value: val, date: form.date });
  };

  const trend = getTrend(scores);
  const avg = getAverage(scores);
  const best = scores.length ? Math.max(...scores.map((s) => s.value)) : null;

  return (
    <div
      className="min-h-screen bg-[#0d1812] text-white px-5 py-8 md:px-10 lg:px-16"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-white/30 text-xs tracking-widest uppercase mb-1">Dashboard</p>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Your scores
            </h1>
          </div>

          {/* Add score */}
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
                    type="number" min={1} max={45}
                    placeholder="e.g. 36"
                    value={form.value}
                    onChange={(e) => { setForm({ ...form, value: e.target.value }); setFormError(null); }}
                    className="h-11 bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/50 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-[11px] tracking-widest uppercase">Date played</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => { setForm({ ...form, date: e.target.value }); setFormError(null); }}
                    max={new Date().toISOString().split("T")[0]}
                    className="h-11 bg-white/[0.05] border-white/10 text-white [color-scheme:dark] focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/50 rounded-xl"
                  />
                </div>
                {formError && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold"
                >
                  {mutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving…
                    </span>
                  ) : "Save score"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* ── Stats row ── */}
        {scores.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {/* Average */}
              <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                <p className="text-white/30 text-[11px] uppercase tracking-widest mb-2">Average</p>
                <p className="text-2xl font-bold text-white">{avg}</p>
              </div>

              {/* Best */}
              <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                <p className="text-white/30 text-[11px] uppercase tracking-widest mb-2">Best</p>
                <p className="text-2xl font-bold text-emerald-400">{best}</p>
              </div>

              {/* Trend */}
              <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                <p className="text-white/30 text-[11px] uppercase tracking-widest mb-2">Trend</p>
                <div className="flex items-center gap-1.5">
                  {trend === "up" && <><TrendingUp className="w-5 h-5 text-emerald-400" /><span className="text-emerald-400 font-bold text-sm">Improving</span></>}
                  {trend === "down" && <><TrendingDown className="w-5 h-5 text-red-400" /><span className="text-red-400 font-bold text-sm">Declining</span></>}
                  {trend === "flat" && <><Minus className="w-5 h-5 text-white/40" /><span className="text-white/40 font-bold text-sm">Steady</span></>}
                  {trend === null && <span className="text-white/25 text-sm">—</span>}
                </div>
              </div>
            </div>

            <Separator className="bg-white/[0.06] mb-8" />
          </>
        )}

        {/* ── Score list ── */}
        {scores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
              <Plus className="w-5 h-5 text-white/30" />
            </div>
            <p className="text-white/50 font-medium">No scores yet</p>
            <p className="text-white/25 text-sm mt-1">Add your first Stableford score to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/30 text-xs tracking-widest uppercase">
                Last {scores.length} score{scores.length > 1 ? "s" : ""}
              </p>
              <Badge className="bg-white/[0.05] text-white/40 border-white/10 text-[10px]">
                {scores.length}/5 slots used
              </Badge>
            </div>

            {scores.map((score, i) => (
              <div
                key={score.id}
                className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] transition-all duration-200 hover:bg-white/[0.04]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* rank badge */}
                    <span className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-white/30 text-[11px] font-mono">
                      {i + 1}
                    </span>
                    <div className="flex items-center gap-1.5 text-white/35 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(score.date).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
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
              <p className="text-white/20 text-xs text-center pt-2">
                Max 5 scores stored — adding a new one removes the oldest.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};