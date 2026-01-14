
import React, { useState, useEffect } from "react";
import MobileContainer from "@/components/layout/mobile-container";
import BottomNav from "@/components/ui/bottom-nav";
import { CATEGORIES } from "@/lib/mock-data";
import { saveTransaction, getCustomCategories, saveCategory, getProfile } from "@/lib/storage";
import { useLocation } from "wouter";
import { ArrowLeft, Calendar, FileText, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddExpense() {
  const [_, setLocation] = useLocation();
  const [amount, setAmount] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  
  const profile = getProfile();
  const currency = profile?.currency || "₹";

  useEffect(() => {
    const cats = getCustomCategories();
    setCategories(cats);
    setSelectedCategory(cats[0].id);
  }, []);

  const handleAddCustom = () => {
    if (!newCatName) return;
    const newCat = {
      id: Math.random().toString(36).substring(2, 9),
      name: newCatName,
      icon: "Tag",
      color: "bg-zinc-100 text-zinc-600"
    };
    saveCategory(newCat);
    setCategories([...categories, newCat]);
    setSelectedCategory(newCat.id);
    setNewCatName("");
    setShowCustomInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const categoryObj = categories.find(c => c.id === selectedCategory) || categories[0];

    saveTransaction({
      id: Math.random().toString(36).substring(2, 9),
      amount: Math.round(parseFloat(amount) * 100) / 100,
      category: categoryObj.name,
      note: note || categoryObj.name,
      date: new Date().toISOString(),
      type,
      icon: categoryObj.icon,
      color: categoryObj.color
    });

    setLocation("/");
  };

  return (
    <>
      <MobileContainer className="bg-secondary/20">
        <header className="flex items-center justify-between mb-8 pt-4">
          <button 
            onClick={() => setLocation("/")}
            className="w-11 h-11 rounded-2xl bg-background border border-border flex items-center justify-center hover:bg-accent transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold font-heading">New Entry</h2>
          <div className="w-11" />
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 pb-24">
          {/* Amount Hero Section */}
          <div className="bg-background rounded-[32px] p-8 shadow-sm border border-border/50 flex flex-col items-center">
             {/* Type Toggle */}
            <div className="flex bg-secondary/50 p-1.5 rounded-2xl border border-border/50 w-full mb-8">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={cn(
                  "flex-1 py-3 text-sm font-bold rounded-xl transition-all",
                  type === "expense" ? "bg-zinc-950 text-white shadow-xl" : "text-muted-foreground"
                )}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={cn(
                  "flex-1 py-3 text-sm font-bold rounded-xl transition-all",
                  type === "income" ? "bg-emerald-500 text-white shadow-xl" : "text-muted-foreground"
                )}
              >
                Income
              </button>
            </div>

            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Amount</p>
            <div className="flex items-baseline text-foreground">
              <span className="text-3xl font-bold text-primary mr-2">{currency}</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-6xl font-bold bg-transparent border-none outline-none w-[240px] text-center placeholder:text-muted-foreground/20 font-heading"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="bg-background rounded-[32px] p-7 shadow-sm border border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Category</h3>
              <button 
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="text-primary p-1 hover:bg-primary/5 rounded-full transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {categories.map((cat) => {
                const Icon = (Icons as any)[cat.icon] || Icons.Tag;
                const isSelected = selectedCategory === cat.id;

                return (
                  <motion.div
                    key={cat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 relative",
                      isSelected 
                        ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
                        : "border-transparent bg-secondary/40 hover:bg-secondary/60"
                    )}
                  >
                    <div className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-sm",
                      isSelected ? "bg-primary text-primary-foreground scale-110" : "bg-background text-muted-foreground"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold text-center leading-tight uppercase tracking-wide",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}>
                      {cat.name}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Custom Category Popup */}
          <AnimatePresence>
            {showCustomInput && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/40 backdrop-blur-sm"
              >
                <div className="bg-background w-full max-w-xs rounded-3xl p-6 shadow-2xl border border-border">
                  <h4 className="text-lg font-bold mb-4">Custom Category</h4>
                  <input 
                    type="text" 
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Enter category name"
                    className="w-full bg-secondary p-3 rounded-xl border border-border mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowCustomInput(false)}
                      className="flex-1 py-3 text-sm font-bold text-muted-foreground bg-secondary rounded-xl"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={handleAddCustom}
                      className="flex-1 py-3 text-sm font-bold text-white bg-primary rounded-xl flex items-center justify-center gap-2"
                    >
                      Add <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Details Form */}
          <div className="bg-background rounded-[32px] p-7 shadow-sm border border-border/50 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl border border-transparent focus-within:border-primary/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary/60 shadow-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Transaction Date</p>
                <p className="text-sm font-bold">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl border border-transparent focus-within:border-primary/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary/60 shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Notes (Optional)</p>
                <input 
                  type="text" 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What was this for?" 
                  className="w-full bg-transparent border-none outline-none text-sm font-bold placeholder:font-normal placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-zinc-950 text-white font-bold py-5 rounded-[24px] shadow-2xl shadow-black/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
          >
            Confirm Entry
          </button>
        </form>
      </MobileContainer>
    </>
  );
}
