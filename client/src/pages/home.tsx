
import React, { useState, useEffect } from "react";
import MobileContainer from "@/components/layout/mobile-container";
import BottomNav from "@/components/ui/bottom-nav";
import TransactionCard from "@/components/transaction-card";
import { getTransactions, getProfile } from "@/lib/storage";
import { Transaction } from "@/lib/mock-data";
import { Bell, TrendingUp, TrendingDown, PlusCircle, UserCircle, Settings, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const profile = getProfile();
  const currency = profile?.currency || "₹";

  useEffect(() => {
    const tx = getTransactions();
    // Sort transactions by date (newest first)
    const sortedTx = [...tx].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(sortedTx);
  }, []);

  const monthTransactions = transactions.filter(t => format(new Date(t.date), "yyyy-MM") === selectedMonth);

  const income = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const expense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const availableMonths = Array.from(new Set(transactions.map(t => format(new Date(t.date), "yyyy-MM"))));
  if (!availableMonths.includes(format(new Date(), "yyyy-MM"))) {
    availableMonths.push(format(new Date(), "yyyy-MM"));
  }
  const sortedMonths = [...availableMonths].sort().reverse();

  const totalBalance = income - expense;

  return (
    <>
      <MobileContainer>
        {/* Overbudget Alert */}
        <AnimatePresence>
          {expense > income && income > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0, mb: 0 }}
              animate={{ opacity: 1, height: 'auto', mb: 16 }}
              exit={{ opacity: 0, height: 0, mb: 0 }}
              className="px-4"
            >
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-500">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs font-bold leading-tight">
                  Warning: Your expenses ({currency}{expense.toLocaleString()}) have exceeded your income ({currency}{income.toLocaleString()}) for this month.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="flex items-center justify-between mb-8 pt-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 rotate-3">
                <span className="font-bold text-primary text-lg -rotate-3">{profile?.name?.charAt(0).toUpperCase() || "U"}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Good Morning,</p>
              <h2 className="text-base font-bold font-heading">{profile?.name || "User"}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-secondary/50 border border-border/50 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
            >
              {sortedMonths.map(m => (
                <option key={m} value={m}>{format(new Date(m + "-01"), "MMM yyyy")}</option>
              ))}
            </select>
            <button className="w-11 h-11 rounded-2xl bg-secondary/50 border border-border/50 flex items-center justify-center text-foreground hover:bg-secondary transition-all">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Balance Card - Elevated Design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-zinc-950 rounded-[32px] p-7 text-white shadow-2xl shadow-black/20 mb-10"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <p className="text-zinc-400 text-sm font-medium tracking-wide">TOTAL BALANCE</p>
              <Link href="/profile">
                <UserCircle className="w-5 h-5 text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors" />
              </Link>
            </div>
            <h1 className="text-4xl font-bold font-heading mb-8 tracking-tight">
              {currency}{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h1>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium">INCOME</p>
                </div>
                <p className="text-sm font-bold text-emerald-400">{currency}{income.toLocaleString()}</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                    <TrendingDown className="w-3 h-3" />
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium">EXPENSES</p>
                </div>
                <p className="text-sm font-bold text-rose-400">{currency}{expense.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-heading">Recent History</h3>
          <button className="text-sm font-bold text-primary hover:opacity-80 transition-opacity">View All</button>
        </div>

        {/* Transaction List with AnimatePresence */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {monthTransactions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                  <PlusCircle className="w-10 h-10 text-muted-foreground/40 stroke-[1]" />
                </div>
                <p className="text-muted-foreground font-medium">No transactions this month.<br /><span className="text-sm opacity-60">Add some spends to get started.</span></p>
                <Link href="/add">
                  <button className="mt-6 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
                    Add Transaction
                  </button>
                </Link>
              </motion.div>
            ) : (
              monthTransactions.map((t, i) => (
                <TransactionCard key={t.id} transaction={t} index={i} />
              ))
            )}
          </AnimatePresence>
        </div>
      </MobileContainer>
      
      <BottomNav />
    </>
  );
}
