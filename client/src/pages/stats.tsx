
import React, { useState, useEffect } from "react";
import MobileContainer from "@/components/layout/mobile-container";
import BottomNav from "@/components/ui/bottom-nav";
import TransactionCard from "@/components/transaction-card";
import { getTransactions, getProfile, getCustomCategories } from "@/lib/storage";
import { CATEGORIES, Transaction } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { ChevronRight, Filter, PieChart as PieIcon, TrendingUp, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { motion } from "framer-motion";

export default function Stats() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [view, setView] = useState<"pie" | "bar">("pie");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const profile = getProfile();
  const currency = profile?.currency || "₹";

  const monthTransactions = transactions.filter(t => format(new Date(t.date), "yyyy-MM") === selectedMonth);
  const expenses = monthTransactions.filter(t => t.type === 'expense');
  const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);

  // Get unique months for selector
  const availableMonths = Array.from(new Set(transactions.map(t => format(new Date(t.date), "yyyy-MM"))));
  if (!availableMonths.includes(format(new Date(), "yyyy-MM"))) {
    availableMonths.push(format(new Date(), "yyyy-MM"));
  }
  availableMonths.sort().reverse();

  // Pie Chart Data
  const customCats = getCustomCategories();
  const categoryTotals = customCats.map((cat: any) => {
    const amount = expenses
      .filter((t: any) => t.category === cat.name)
      .reduce((acc: number, t: any) => acc + t.amount, 0);
    return {
      name: cat.name,
      value: amount,
      color: cat.color?.split(' ')[1]?.replace('text-', '') || 'zinc-400',
      originalColor: cat.color,
      icon: cat.icon
    };
  }).filter((c: any) => c.value > 0).sort((a: any, b: any) => b.value - a.value);

  // Bar Chart Data (Daily for selected month)
  const monthStart = startOfMonth(new Date(selectedMonth + "-01"));
  const monthEnd = endOfMonth(new Date(selectedMonth + "-01"));
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd
  });

  const barData = daysInMonth.map(day => {
    const amount = expenses
      .filter(t => isSameDay(new Date(t.date), day))
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      day: format(day, "d"),
      amount
    };
  });

  return (
    <>
      <MobileContainer>
        <header className="flex items-center justify-between mb-6 pt-4">
          <h2 className="text-2xl font-bold font-heading">Analytics</h2>
          <div className="flex items-center gap-3">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-secondary/50 border border-border/50 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>{format(new Date(m + "-01"), "MMM yyyy")}</option>
              ))}
            </select>
            <div className="flex bg-secondary/50 p-1 rounded-xl border border-border/50">
              <button 
                onClick={() => setView("pie")}
                className={cn("p-2 rounded-lg transition-all", view === "pie" ? "bg-background shadow-sm text-primary" : "text-muted-foreground")}
              >
                <PieIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView("bar")}
                className={cn("p-2 rounded-lg transition-all", view === "bar" ? "bg-background shadow-sm text-primary" : "text-muted-foreground")}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <TrendingUp className="w-16 h-16 mb-4 text-muted-foreground stroke-[1]" />
            <p className="text-sm font-medium">No analytics available yet.<br />Add some data to see the magic.</p>
          </div>
        ) : (
          <>
            <div className="bg-background rounded-[32px] p-6 shadow-sm border border-border/50 mb-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Monthly Spending</p>
                  <h3 className="text-2xl font-bold font-heading">{currency}{totalExpense.toLocaleString()}</h3>
                </div>
                <div className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-lg text-[10px] font-bold">
                  THIS MONTH
                </div>
              </div>

              <div className="h-[240px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  {view === "pie" ? (
                    <PieChart>
                      <Pie
                        data={categoryTotals}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryTotals.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={`var(--color-${entry.color})`} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${currency}${value.toFixed(2)}`, 'Spent']}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  ) : (
                    <BarChart data={barData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))'}} 
                      />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{fill: 'hsl(var(--secondary))', opacity: 0.4}}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        formatter={(value: number) => [`${currency}${value.toFixed(2)}`, 'Daily Total']}
                      />
                      <Bar 
                        dataKey="amount" 
                        fill="hsl(var(--primary))" 
                        radius={[6, 6, 0, 0]} 
                        barSize={8}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4 pb-20">
              <h3 className="text-lg font-bold font-heading px-2">Breakdown</h3>
              {categoryTotals.map((cat: any, i: number) => {
                 const Icon = (Icons as any)[cat.icon] || Icons.Tag;
                 const percent = (cat.value / totalExpense) * 100;

                 return (
                   <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={cat.name} 
                    className="flex items-center gap-4 p-5 bg-card rounded-[24px] border border-border/40 shadow-sm"
                   >
                     <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", cat.originalColor)}>
                       <Icon className="w-5 h-5" />
                     </div>
                     
                     <div className="flex-1">
                       <div className="flex justify-between items-center mb-1.5">
                         <span className="font-bold text-sm">{cat.name}</span>
                         <span className="font-bold text-sm">{currency}{cat.value.toLocaleString()}</span>
                       </div>
                       <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${percent}%` }}
                           className="h-full bg-primary rounded-full" 
                         />
                       </div>
                     </div>
                   </motion.div>
                 );
              })}
            </div>
          </>
        )}
      </MobileContainer>
      <BottomNav />
    </>
  );
}
