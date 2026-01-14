
import React from "react";
import * as Icons from "lucide-react";
import { Transaction } from "@/lib/mock-data";
import { getProfile } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface TransactionCardProps {
  transaction: Transaction;
  index: number;
}

export default function TransactionCard({ transaction, index }: TransactionCardProps) {
  const IconComponent = (Icons as any)[transaction.icon] || Icons.Tag;
  const profile = getProfile();
  const currency = profile?.currency || "₹";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="group flex items-center gap-4 p-5 bg-background rounded-3xl border border-border/50 shadow-sm active:scale-[0.98] transition-all hover:bg-secondary/20 cursor-pointer"
      data-testid={`transaction-card-${transaction.id}`}
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
        transaction.color
      )}>
        <IconComponent className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm text-foreground truncate mb-0.5">{transaction.category}</h3>
        <p className="text-xs text-muted-foreground font-medium truncate opacity-60">{transaction.note}</p>
      </div>

      <div className="text-right shrink-0">
        <p className={cn(
          "font-bold font-heading text-base",
          transaction.type === 'income' ? "text-emerald-500" : "text-foreground"
        )}>
          {transaction.type === 'income' ? '+' : '-'}{currency}{transaction.amount.toLocaleString()}
        </p>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
          {format(new Date(transaction.date), "MMM d")}
        </p>
      </div>
    </motion.div>
  );
}
