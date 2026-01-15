
import React, { useState, useEffect } from "react";
import MobileContainer from "@/components/layout/mobile-container";
import BottomNav from "@/components/ui/bottom-nav";
import { getProfile, saveProfile } from "@/lib/storage";
import { ArrowLeft, User, DollarSign, LogOut, Check, Bell } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Profile() {
  const [_, setLocation] = useLocation();
  const profile = getProfile();
  const [name, setName] = useState(profile?.name || "");
  const [currency, setCurrency] = useState(profile?.currency || "₹");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    saveProfile({ name, currency });
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  return (
    <>
      <MobileContainer>
        <header className="flex items-center justify-between mb-8 pt-4">
          <button 
            onClick={() => setLocation("/")}
            className="w-11 h-11 rounded-2xl bg-background border border-border flex items-center justify-center hover:bg-accent transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold font-heading">My Profile</h2>
          <div className="w-11" />
        </header>

        <div className="space-y-6">
          <div className="flex flex-col items-center py-8">
             <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-4 relative">
                <span className="font-bold text-primary text-3xl">{name.charAt(0).toUpperCase() || "U"}</span>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-background border border-border rounded-xl flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
             </div>
             <h3 className="text-xl font-bold font-heading">{name || "User"}</h3>
             <p className="text-sm text-muted-foreground">Personal Account</p>
          </div>

          <div className="bg-background rounded-[32px] p-7 shadow-sm border border-border/50 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Display Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-secondary/30 border border-transparent focus:border-primary/20 rounded-2xl p-4 pl-11 text-sm font-bold outline-none transition-all"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Currency Symbol</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-secondary/30 border border-transparent focus:border-primary/20 rounded-2xl p-4 pl-11 text-sm font-bold outline-none transition-all appearance-none"
                  >
                    <option value="₹">₹ (Indian Rupee)</option>
                    <option value="$">$ (US Dollar)</option>
                    <option value="€">€ (Euro)</option>
                    <option value="£">£ (Pound)</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-zinc-950 text-white font-bold py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Save Changes
            </button>
          </div>

          <div className="space-y-3">
             <button className="w-full p-4 rounded-2xl bg-secondary/20 flex items-center justify-between group hover:bg-secondary/40 transition-all">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary/60 shadow-sm group-hover:scale-110 transition-transform">
                      <Bell className="w-5 h-5" />
                   </div>
                   <span className="text-sm font-bold">Notifications</span>
                </div>
                <div className="w-10 h-6 bg-emerald-500 rounded-full relative">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
             </button>

             <button 
                onClick={() => {
                  localStorage.removeItem("expense_tracker_profile");
                  window.location.reload();
                }}
                className="w-full p-4 rounded-2xl bg-rose-500/5 flex items-center justify-between group hover:bg-rose-500/10 transition-all text-rose-500"
             >
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-rose-500/60 shadow-sm group-hover:scale-110 transition-transform">
                      <LogOut className="w-5 h-5" />
                   </div>
                   <span className="text-sm font-bold">Log Out</span>
                </div>
             </button>
          </div>
        </div>
      </MobileContainer>
      <BottomNav />
    </>
  );
}
