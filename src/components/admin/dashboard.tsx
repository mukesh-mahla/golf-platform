"use client";

import { useState } from "react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Users,
  Shuffle,
  Eye,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

// ── types ──────────────────────────────────────────────────────────────────

type User = {
  id: string;
  userName: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  scores: { id: string; value: number; date: string }[];
};

type Draw = {
  id: string;
  number: number[];
  status: "SIMULATION" | "PUBLISHED";
  createdAt: string;
};

// ── sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Draw["status"] }) {
  if (status === "PUBLISHED") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 gap-1.5">
        <CheckCircle2 className="w-3 h-3" /> Published
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 gap-1.5">
      <Clock className="w-3 h-3" /> Simulation
    </Badge>
  );
}

function DrawNumbers({ numbers }: { numbers: number[] }) {
  return (
    <div className="flex items-center gap-2">
      {numbers.map((n, i) => (
        <span
          key={i}
          className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white text-sm font-bold tabular-nums"
        >
          {n}
        </span>
      ))}
    </div>
  );
}

// ── users tab ──────────────────────────────────────────────────────────────

function UsersTab() {
  const { data: users } = useSuspenseQuery<User[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/users`, { withCredentials: true });
      return res.data;
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/30 text-xs tracking-widest uppercase">
          {users.length} total user{users.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.07] hover:bg-transparent">
              <TableHead className="text-white/30 text-xs uppercase tracking-widest font-normal">User</TableHead>
              <TableHead className="text-white/30 text-xs uppercase tracking-widest font-normal">Role</TableHead>
              <TableHead className="text-white/30 text-xs uppercase tracking-widest font-normal">Scores</TableHead>
              <TableHead className="text-white/30 text-xs uppercase tracking-widest font-normal">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="border-white/[0.05] hover:bg-white/[0.02] transition-colors"
              >
                <TableCell>
                  <div>
                    <p className="text-white font-medium text-sm">{user.userName}</p>
                    <p className="text-white/35 text-xs mt-0.5">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {user.role === "ADMIN" ? (
                    <Badge className="bg-violet-500/15 text-violet-400 border-violet-500/25 text-xs">Admin</Badge>
                  ) : (
                    <Badge className="bg-white/[0.05] text-white/40 border-white/10 text-xs">User</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white text-sm font-medium">{user.scores?.length ?? 0}</span>
                    <span className="text-white/30 text-xs">/ 5</span>
                  </div>
                </TableCell>
                <TableCell className="text-white/40 text-sm">
                  {new Date(user.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── draw tab ───────────────────────────────────────────────────────────────

function DrawTab() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: draws } = useSuspenseQuery<Draw[]>({
    queryKey: ["admin", "draws"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/draw`, { withCredentials: true });
      return res.data;
    },
  });

  // run simulation
  const simulate = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/draw`, { publish: false }, { withCredentials: true });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "draws"] }),
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || "Failed to run simulation");
    },
  });

  // publish draw directly
  const publishNew = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/draw`, { publish: true }, { withCredentials: true });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "draws"] }),
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || "Failed to publish draw");
    },
  });

  // publish an existing simulation
  const publishExisting = useMutation({
    mutationFn: async (drawId: string) => {
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/draw`, { drawId }, { withCredentials: true });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "draws"] }),
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || "Failed to publish");
    },
  });

  const latestDraw = draws[0] ?? null;
  const hasSimulation = latestDraw?.status === "SIMULATION";
  const isLoading = simulate.isPending || publishNew.isPending || publishExisting.isPending;

  return (
    <div>
      {/* action bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {/* simulate */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={() => { setError(null); simulate.mutate(); }}
              disabled={isLoading}
              className="border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.07] hover:text-white rounded-xl"
            >
              <Eye className="w-4 h-4 mr-2" />
              Run simulation
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-[#1a2e25] border-white/10 text-white/70 text-xs">
            Generate numbers without publishing — preview only
          </TooltipContent>
        </Tooltip>

        {/* publish existing simulation */}
        {hasSimulation && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
              >
                <Send className="w-4 h-4 mr-2" />
                Publish simulation
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#111f1b] border-white/[0.08] text-white rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Publish this draw?</AlertDialogTitle>
                <AlertDialogDescription className="text-white/50">
                  This will make the draw results visible to all subscribers. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/[0.05] border-white/10 text-white/60 hover:bg-white/10 rounded-xl">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => publishExisting.mutate(latestDraw.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                >
                  Yes, publish
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* publish new directly */}
        {!hasSimulation && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Run &amp; publish draw
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#111f1b] border-white/[0.08] text-white rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Publish a new draw?</AlertDialogTitle>
                <AlertDialogDescription className="text-white/50">
                  This will generate and immediately publish this month's draw results. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/[0.05] border-white/10 text-white/60 hover:bg-white/10 rounded-xl">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => publishNew.mutate()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                >
                  Yes, publish
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* draws list */}
      {draws.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Shuffle className="w-8 h-8 text-white/15 mb-3" />
          <p className="text-white/40 font-medium">No draws yet</p>
          <p className="text-white/20 text-sm mt-1">Run a simulation or publish a draw to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {draws.map((draw, i) => (
            <div
              key={draw.id}
              className="p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <StatusBadge status={draw.status} />
                <span className="text-white/30 text-xs">
                  {new Date(draw.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
                {i === 0 && (
                  <Badge className="bg-white/[0.05] text-white/30 border-white/10 text-[10px]">Latest</Badge>
                )}
              </div>
              <DrawNumbers numbers={draw.number} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── root component ─────────────────────────────────────────────────────────

export const AdminDashboard = () => {
  return (
    <div
      className="min-h-screen bg-[#0d1812] text-white px-5 py-8 md:px-10 lg:px-16"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* header */}
        <div className="mb-10">
          <p className="text-white/30 text-xs tracking-widest uppercase mb-1">Admin</p>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Control panel
          </h1>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-1 mb-8 h-auto">
            <TabsTrigger
              value="users"
              className="rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-white/40 px-5 py-2 text-sm transition-all"
            >
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="draw"
              className="rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-white/40 px-5 py-2 text-sm transition-all"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Draw
            </TabsTrigger>
          </TabsList>

          <Separator className="bg-white/[0.06] mb-8" />

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="draw">
            <DrawTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};