"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (!error) {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white-warm flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-amber-warm rounded-keystone mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-display text-2xl font-bold">K</span>
          </div>
          <h1 className="font-display text-3xl text-slate-deep font-bold">keystone</h1>
          <p className="text-sand-stone mt-2">Build better habits, one stone at a time.</p>
        </div>

        {sent ? (
          <div className="card-keystone p-6">
            <h2 className="font-display text-xl text-slate-deep mb-2">Check your email</h2>
            <p className="text-sand-stone">
              We sent a magic link to <strong className="text-slate-deep">{email}</strong>.
              Click it to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-keystone border border-sand-stone/50 bg-white
                         text-slate-deep placeholder:text-sand-stone/60 focus:outline-none
                         focus:ring-2 focus:ring-amber-warm/50 font-body"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? "Sending..." : "Sign in with email"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
