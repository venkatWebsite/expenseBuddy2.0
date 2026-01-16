import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useLocation } from "wouter";

import MobileContainer from "@/components/layout/mobile-container";
import { saveProfile } from "@/lib/storage";

export default function Onboarding() {
  const [name, setName] = useState("");
  const [, setLocation] = useLocation();

  // Handle manual start
  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    saveProfile({ name, currency: "₹" });
    setLocation("/");
  };

  // Auto-login if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/user", {
          credentials: "include",
        });
        const data = await res.json();

        if (data?.user) {
          try {
            const sync = await fetch("/api/auth/sync-profile", {
              method: "POST",
              credentials: "include",
            });
            const syncData = await sync.json();

            if (syncData?.profile) {
              saveProfile(syncData.profile);
              setLocation("/");
              return;
            }
          } catch {
            const displayName =
              data.user.displayName || data.user.username || "User";
            saveProfile({ name: displayName, currency: "₹" });
            setLocation("/");
          }
        }
      } catch {
        // not authenticated → stay on onboarding
      }
    };

    checkAuth();
  }, [setLocation]);

  return (
    <MobileContainer
      withPadding={false}
      className="relative bg-primary overflow-hidden"
    >
      {/* ================= BACKGROUND LOGO ================= */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/exBuddy_logo.png"
          alt="Expense Buddy Background"
          className="
            w-[85%]
            max-w-[460px]
            opacity-25
            brightness-125
            contrast-125
            -translate-y-12
          "
        />
      </div>

      {/* ================= GRADIENT OVERLAY ================= */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-primary/40 via-primary/70 to-primary" />

      {/* ================= FOREGROUND CONTENT ================= */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 min-h-screen flex flex-col justify-center px-8 text-white space-y-10"
      >
        {/* ---------- TITLE ---------- */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight">
            Expense <span className="text-white/90">Buddy</span>
          </h1>

          <p className="text-white/80 text-base max-w-xs mx-auto">
            Master your finances with simplicity and style.
          </p>
        </div>

        {/* ---------- FORM ---------- */}
        <form onSubmit={handleStart} className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70 ml-1">
              What should we call you?
            </label>

            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="
                  w-full
                  bg-white/10
                  border border-white/20
                  rounded-xl
                  py-4 pl-12 pr-4
                  text-white
                  placeholder:text-white/30
                  focus:outline-none
                  focus:ring-2
                  focus:ring-white/40
                "
                required
              />
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={() => (window.location.href = "/auth/google")}
            className="
              w-full
              bg-white/95
              text-primary
              font-semibold
              py-4
              rounded-xl
              flex
              items-center
              justify-center
              gap-2
              shadow-md
              active:scale-[0.98]
              transition
            "
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>
        </form>
      </motion.div>
    </MobileContainer>
  );
}
