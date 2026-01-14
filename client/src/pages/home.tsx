
import React from "react";
import MobileContainer from "@/components/layout/mobile-container";
import BottomNav from "@/components/ui/bottom-nav";
import TransactionCard from "@/components/transaction-card";
import { MOCK_TRANSACTIONS } from "@/lib/mock-data";
import { Bell, Search, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const totalBalance = 2450.50;
  const income = 3200.00;
  const expense = 749.50;

  return (
    <>
      <MobileContainer>
        {/* Header */}
        <header className="flex items-center justify-between mb-6 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="font-bold text-primary">JD</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Welcome back,</p>
              <h2 className="text-sm font-bold font-heading">John Doe</h2>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </header>

        {/* Balance Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden bg-primary rounded-[24px] p-6 text-primary-foreground shadow-lg shadow-primary/25 mb-8"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -translate-x-5 translate-y-5 blur-xl" />

          <div className="relative z-10">
            <p className="text-primary-foreground/80 text-sm font-medium mb-1">Total Balance</p>
            <h1 className="text-4xl font-bold font-heading mb-6">${totalBalance.toLocaleString()}</h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md">
                <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-300">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-primary-foreground/70">Income</p>
                  <p className="text-sm font-semibold">${income.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md">
                <div className="w-6 h-6 rounded-full bg-rose-400/20 flex items-center justify-center text-rose-300">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-primary-foreground/70">Expense</p>
                  <p className="text-sm font-semibold">${expense.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-heading">Transactions</h3>
          <button className="text-sm text-primary font-medium hover:text-primary/80">See all</button>
        </div>

        <div className="space-y-2">
          {MOCK_TRANSACTIONS.map((t, i) => (
            <TransactionCard key={t.id} transaction={t} index={i} />
          ))}
        </div>
      </MobileContainer>
      
      <BottomNav />
    </>
  );
}
