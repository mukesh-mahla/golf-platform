"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import z from "zod"
import { useRouter } from "next/navigation";

const SignUpformSchema = z.object({
  userName:z.string(),
  email:z.string().email("invalid email"),
  password:z.string().min(8,"password should be 8 charcter long")
})

type signUpvalue = z.infer<typeof SignUpformSchema>

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState<signUpvalue>({ userName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const[zodError,setZodError] = useState<any>({})

  const result = useMutation({
    mutationFn: async (payload:signUpvalue) => {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`,payload,{withCredentials:true})
      return res.data
    }
  ,onSuccess:()=>{
    router.push("/signin")
  }})
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });

  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = SignUpformSchema.safeParse(form);

  if (!validation.success) {
    setZodError(validation.error.flatten().fieldErrors);
    return;
  }
  setZodError({});
      result.mutate(form)
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1812] px-4">
      <div className="w-full max-w-sm space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create account</h1>
          <p className="text-white/40 text-sm mt-1">
            Already have an account?{" "}
            <Link href="/signin" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="userName" className="text-white/50 text-xs tracking-widest uppercase">
              Username
            </Label>
            <Input
              id="userName" name="userName" type="text" placeholder="john_doe"
              value={form.userName} onChange={handleChange} required
              className="h-11 bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/50 rounded-xl"
            />
            {zodError.userName && <p className="text-red-400">{zodError.userName[0]}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-white/50 text-xs tracking-widest uppercase">
              Email
            </Label>
            <Input
              id="email" name="email" type="email" placeholder="john@example.com"
              value={form.email} onChange={handleChange} required
              className="h-11 bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/50 rounded-xl"
            />
            {zodError.email && <p className="text-red-400">{zodError.email[0]}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-white/50 text-xs tracking-widest uppercase">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password" name="password"
                type={showPassword ? "text" : "password"}
                placeholder="min. 8 characters"
                value={form.password} onChange={handleChange}
                required autoComplete="new-password"
                className="h-11 pr-11 bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/50 rounded-xl"
              />
              {zodError.password && <p className="text-red-400">{zodError.password[0]}</p>}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {result.isError && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {result.error.message}
            </p>
          )}

          <Button
            type="submit" disabled={result.isPending}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all group mt-2"
          >
            {result.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-white/20 text-xs">
          By signing up you agree to our{" "}
          <a href="#" className="underline underline-offset-2 hover:text-white/40 transition-colors">Terms</a>
          {" "}&{" "}
          <a href="#" className="underline underline-offset-2 hover:text-white/40 transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}