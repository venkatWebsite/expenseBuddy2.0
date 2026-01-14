
import React, { useState } from "react";
import MobileContainer from "@/components/layout/mobile-container";
import { saveProfile } from "@/lib/storage";
import { useLocation } from "wouter";
import { User, CreditCard, ArrowRight } from "lucide-react";
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

  return (
    <MobileContainer withPadding={false} className="bg-primary flex flex-col justify-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-primary-foreground space-y-8"
      >
        <div className="space-y-2">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <CreditCard className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold font-heading">ExpenseTracker</h1>
          <p className="text-primary-foreground/80 text-lg">Master your finances with simplicity and style.</p>
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
            type="submit"
            className="w-full bg-white text-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </MobileContainer>
  );
}
