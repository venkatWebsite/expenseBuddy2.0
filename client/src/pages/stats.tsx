
import React, { useState, useEffect } from "react";
import MobileContainer from "@/components/layout/mobile-container";
import BottomNav from "@/components/ui/bottom-nav";
import TransactionCard from "@/components/transaction-card";
import { getTransactions } from "@/lib/storage";
import { CATEGORIES, Transaction } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { ChevronRight, Filter, PieChart as PieIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function Stats() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);

  const categoryTotals = CATEGORIES.map(cat => {
    const amount = expenses
      .filter(t => t.category === cat.name)
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      name: cat.name,
      value: amount,
      color: cat.color.split(' ')[1].replace('text-', ''), // simplified color extraction
      icon: cat.icon,
      originalColor: cat.color
    };
  }).filter(c => c.value > 0).sort((a, b) => b.value - a.value);

  return (
    <>
      <MobileContainer>
        <header className="mb-6 pt-2">
          <h2 className="text-2xl font-bold font-heading">Analytics</h2>
        </header>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <PieIcon className="w-16 h-16 mb-4 text-muted-foreground stroke-[1]" />
            <p className="text-sm">No data to analyze yet.<br />Add transactions to see your stats.</p>
          </div>
        ) : (
          <>
            {/* Chart Section */}
            <div className="mb-8">
               {/* Date Toggle */}
               <div className="flex bg-secondary p-1 rounded-xl mb-6">
                  {['Week', 'Month', 'Year'].map((period, i) => (
                    <button 
                      key={period} 
                      className={cn(
                        "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                        i === 1 ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {period}
                    </button>
                  ))}
               </div>
               
               <div className="h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
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
                      {categoryTotals.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`var(--color-${entry.color})`} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-muted-foreground uppercase font-medium">Total Spent</span>
                  <span className="text-2xl font-bold font-heading">${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Spending List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <h3 className="font-bold font-heading">Spending by Category</h3>
                 <button className="text-muted-foreground hover:text-foreground">
                   <Filter className="w-4 h-4" />
                 </button>
              </div>

              <div className="space-y-3">
                {categoryTotals.map((cat, i) => {
                   const Icon = (Icons as any)[cat.icon];
                   const percent = (cat.value / totalExpense) * 100;

                   return (
                     <div key={cat.name} className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/40">
                       <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", cat.originalColor)}>
                         <Icon className="w-5 h-5" />
                       </div>
                       
                       <div className="flex-1">
                         <div className="flex justify-between items-center mb-1">
                           <span className="font-medium text-sm">{cat.name}</span>
                           <span className="font-bold text-sm">-${cat.value.toFixed(2)}</span>
                         </div>
                         <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-primary rounded-full" 
                             style={{ width: `${percent}%`, opacity: 1 - (i * 0.1) }} 
                           />
                         </div>
                       </div>

                       <ChevronRight className="w-4 h-4 text-muted-foreground/50 ml-2" />
                     </div>
                   );
                })}
              </div>
            </div>
          </>
        )}
      </MobileContainer>
      
      <BottomNav />
    </>
  );
}
