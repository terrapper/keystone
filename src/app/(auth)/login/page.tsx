"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { motion } from "framer-motion";

function FloatingParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 3 + Math.random() * 5,
    delay: Math.random() * 8,
    duration: 10 + Math.random() * 10,
    opacity: 0.15 + Math.random() * 0.2,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            bottom: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `radial-gradient(circle, rgba(232, 152, 94, ${p.opacity}) 0%, transparent 70%)`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

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
    <div
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #2D3047 0%, #3A3D5C 25%, #4A3D4A 50%, #5A4438 75%, #E8985E 100%)",
      }}
    >
      <FloatingParticles />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-sm text-center relative z-10"
      >
        {/* Keystone icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          className="mb-10"
        >
          <div
            className="w-20 h-20 mx-auto mb-5 flex items-center justify-center rounded-[20px]"
            style={{
              background: "linear-gradient(135deg, #E8985E 0%, #D4764E 100%)",
              boxShadow:
                "0 8px 32px rgba(232, 152, 94, 0.35), 0 0 64px rgba(232, 152, 94, 0.15)",
            }}
          >
            <span className="text-white font-display text-3xl font-bold">
              K
            </span>
          </div>
          <h1 className="font-display text-4xl text-white font-bold tracking-tight">
            keystone
          </h1>
          <p className="text-white/50 mt-3 text-base leading-relaxed">
            Build better habits, one stone at a time.
          </p>
        </motion.div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-glass p-6"
            style={{
              background: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <h2 className="font-display text-xl text-white mb-2">
              Check your email
            </h2>
            <p className="text-white/60 text-sm">
              We sent a magic link to{" "}
              <strong className="text-white">{email}</strong>. Click it to sign
              in.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-5 py-4 rounded-keystone text-white font-body text-base
                         placeholder:text-white/30 focus:outline-none transition-all duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1.5px solid rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(10px)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor =
                  "rgba(232, 152, 94, 0.5)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(232, 152, 94, 0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor =
                  "rgba(255, 255, 255, 0.12)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-keystone font-display font-semibold text-white text-base
                         transition-all duration-300 disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, #E8985E 0%, #D4764E 100%)",
                boxShadow:
                  "0 4px 20px rgba(232, 152, 94, 0.3), 0 0 40px rgba(232, 152, 94, 0.1)",
              }}
            >
              {loading ? "Sending..." : "Sign in with email"}
            </button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}
