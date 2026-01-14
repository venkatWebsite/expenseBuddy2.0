
import React from "react";
import * as Icons from "lucide-react";
import { Transaction } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface TransactionCardProps {
  transaction: Transaction;
  index: number;
}

export default function TransactionCard({ transaction, index }: TransactionCardProps) {
  // Dynamically get the icon component
  const IconComponent = (Icons as any)[transaction.icon] || Icons.HelpCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group flex items-center gap-4 p-4 mb-3 bg-card rounded-2xl border border-border/40 shadow-sm active:scale-[0.99] transition-all hover:bg-accent/50 cursor-pointer"
      data-testid={`transaction-card-${transaction.id}`}
    >
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
        transaction.color
      )}>
        <IconComponent className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{transaction.category}</h3>
        <p className="text-sm text-muted-foreground truncate">{transaction.note}</p>
      </div>

      <div className="text-right shrink-0">
        <p className={cn(
          "font-bold font-heading",
          transaction.type === 'income' ? "text-emerald-600" : "text-foreground"
        )}>
          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(transaction.date), "MMM d")}
        </p>
      </div>
    </motion.div>
  );
}
