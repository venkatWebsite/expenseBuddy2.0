
import React from "react";
import MobileContainer from "@/components/layout/mobile-container";
import BottomNav from "@/components/ui/bottom-nav";
import ExpenseChart from "@/components/expense-chart";
import { CATEGORIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { ChevronRight } from "lucide-react";

export default function Stats() {
  return (
    <>
      <MobileContainer>
        <header className="mb-6 pt-2">
          <h2 className="text-2xl font-bold font-heading">Analytics</h2>
        </header>

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
           
           <ExpenseChart />
        </div>

        {/* Spending List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <h3 className="font-bold font-heading">Top Spending</h3>
             <button className="text-muted-foreground hover:text-foreground">
               <Icons.Filter className="w-4 h-4" />
             </button>
          </div>

          <div className="space-y-3">
            {CATEGORIES.slice(0, 4).map((cat, i) => {
               const Icon = (Icons as any)[cat.icon];
               // Fake data generation
               const percent = [45, 25, 20, 10][i];
               const amount = [450, 250, 200, 100][i];

               return (
                 <div key={cat.id} className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/40">
                   <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", cat.color)}>
                     <Icon className="w-5 h-5" />
                   </div>
                   
                   <div className="flex-1">
                     <div className="flex justify-between items-center mb-1">
                       <span className="font-medium text-sm">{cat.name}</span>
                       <span className="font-bold text-sm">-${amount}</span>
                     </div>
                     <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-primary rounded-full" 
                         style={{ width: `${percent}%`, opacity: 1 - (i * 0.15) }} 
                       />
                     </div>
                   </div>

                   <ChevronRight className="w-4 h-4 text-muted-foreground/50 ml-2" />
                 </div>
               );
            })}
          </div>
        </div>
      </MobileContainer>
      
      <BottomNav />
    </>
  );
}
