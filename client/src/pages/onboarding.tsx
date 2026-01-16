
import React, { useState, useEffect } from "react";
import MobileContainer from "@/components/layout/mobile-container";
import { saveProfile } from "@/lib/storage";
import { useLocation } from "wouter";
import { User } from "lucide-react";
import { motion } from "framer-motion";

export default function Onboarding() {
  const [_, setLocation] = useLocation();
  const [name, setName] = useState("");

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    saveProfile({ name, currency: "₹" });
    setLocation("/");
  };

  useEffect(() => {
    // Check if user is already authenticated (e.g., via Google OAuth)
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/user", { credentials: "include" });
        const data = await response.json();
        
        if (data?.user) {
          // User is authenticated, sync their profile from server
          try {
            const syncResponse = await fetch("/api/auth/sync-profile", { 
              method: "POST",
              credentials: "include" 
            });
            const syncData = await syncResponse.json();
            if (syncData?.profile) {
              saveProfile(syncData.profile);
              setLocation("/");
            }
          } catch (err) {
            // Fallback: use displayName from user object
            const displayName = data.user.displayName || data.user.username || "User";
            saveProfile({ name: displayName, currency: "₹" });
            setLocation("/");
          }
        }
      } catch (err) {
        // Not authenticated, user will fill out the form
      }
    };
    
    checkAuth();
  }, [setLocation]);

  return (
    <MobileContainer withPadding={false} className="bg-primary flex flex-col justify-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-primary-foreground space-y-8"
      >
        <div className="space-y-2 flex items-center gap-4">
          <div className="w-28 h-28 bg-white/0 rounded-2xl flex items-center justify-center mb-0">
            <img src="/exBuddy_logo.png" alt="Expense Buddy" className="w-20 h-20 object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-heading">Expense Buddy</h1>
            <p className="text-primary-foreground/80 text-sm">Master your finances with simplicity and style.</p>
          </div>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-foreground/70 ml-1">What should we call you?</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground/50" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
                required
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => (window.location.href = "/auth/google")}
            className="w-full mt-2 bg-white/90 text-primary font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
          <button
            type="submit"
            className="mt-4 w-full inline-block text-center text-2xl font-extrabold bg-gradient-to-r from-primary/90 to-secondary/90 text-white px-6 py-3 rounded-full shadow-xl active:scale-[0.98] transition-all"
          >
            Get Started
          </button>
        </form>
      </motion.div>
    </MobileContainer>
  );
}
