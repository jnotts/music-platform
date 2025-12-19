"use client";

import Link from "next/link";
import { useLogin } from "@/hooks/useLogin";

/**
 * Admin login page.
 */
export default function AdminLoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    isCheckingSession,
    handleLogin,
  } = useLogin();

  // Show loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0D0F] text-[#F5F3EE]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#2D7DFF] border-t-transparent" />
          <p className="mt-4 text-sm text-[#A8A29E]">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0D0F] text-[#F5F3EE]">
      <main className="w-full max-w-sm px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Admin Login</h1>
          <p className="mt-2 text-sm text-[#A8A29E]">
            Sign in to manage submissions
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-[#A8A29E]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[#F5F3EE] placeholder-[#A8A29E]/50 focus:border-[#2D7DFF] focus:ring-1 focus:ring-[#2D7DFF] focus:outline-none"
              placeholder="admin@yourlabel.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-[#A8A29E]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[#F5F3EE] placeholder-[#A8A29E]/50 focus:border-[#2D7DFF] focus:ring-1 focus:ring-[#2D7DFF] focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-xl bg-[#2D7DFF] px-4 py-3 font-medium text-white transition-colors hover:bg-[#2D7DFF]/90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-[#A8A29E] transition-colors hover:text-[#F5F3EE]"
          >
            ← Back to submissions
          </Link>
        </div>
      </main>
    </div>
  );
}
