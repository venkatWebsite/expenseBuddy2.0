
import React, { useState } from "react";
import MobileContainer from "@/components/layout/mobile-container";
import BottomNav from "@/components/ui/bottom-nav";
import { CATEGORIES } from "@/lib/mock-data";
import { saveTransaction } from "@/lib/storage";
import { useLocation } from "wouter";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";

export default function AddExpense() {
  const [_, setLocation] = useLocation();
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [note, setNote] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const categoryObj = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

    saveTransaction({
      id: Math.random().toString(36).substring(2, 9),
      amount: parseFloat(amount),
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
      <MobileContainer className="bg-secondary/30">
        <header className="flex items-center gap-4 mb-8 pt-2">
          <button 
            onClick={() => setLocation("/")}
            className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold font-heading">Add Transaction</h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Toggle */}
          <div className="flex bg-background p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                type === "expense" ? "bg-rose-500 text-white shadow-sm" : "text-muted-foreground"
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                type === "income" ? "bg-emerald-500 text-white shadow-sm" : "text-muted-foreground"
              )}
            >
              Income
            </button>
          </div>

          {/* Amount Input */}
          <div className="flex flex-col items-center justify-center py-4">
            <p className="text-sm text-muted-foreground mb-2">Enter Amount</p>
            <div className="flex items-baseline text-foreground">
              <span className="text-3xl font-bold mr-1">$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-5xl font-bold bg-transparent border-none outline-none w-[200px] text-center placeholder:text-muted-foreground/30 font-heading"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Categories */}
          <div className="bg-background rounded-[24px] p-6 shadow-sm border border-border/50">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Category</h3>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = (Icons as any)[cat.icon];
                const isSelected = selectedCategory === cat.id;

                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200",
                      isSelected 
                        ? "border-primary bg-primary/5 shadow-md scale-105" 
                        : "border-transparent bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium text-center leading-tight",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}>
                      {cat.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details */}
          <div className="bg-background rounded-[24px] p-6 shadow-sm border border-border/50 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..." 
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:font-normal"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
          >
            Save Transaction
          </button>
        </form>
      </MobileContainer>
      <div className="h-6" />
    </>
  );
}
