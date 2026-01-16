
import React from "react";
import * as Icons from "lucide-react";
import { Transaction } from "@/lib/mock-data";
import { getProfile, deleteTransaction } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useLocation } from "wouter";
import { Trash2, Edit2 } from "lucide-react";

interface TransactionCardProps {
  transaction: Transaction;
  index: number;
}

export default function TransactionCard({ transaction, index }: TransactionCardProps) {
  const [_, setLocation] = useLocation();
  const IconComponent = (Icons as any)[transaction.icon] || Icons.Tag;
  const profile = getProfile();
  const currency = profile?.currency || "₹";

  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-100, -50], [1, 0]);
  const editOpacity = useTransform(x, [50, 100], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    // "Full swipe" threshold - requires swiping across most of the screen
    const threshold = 320; 
    if (info.offset.x < -threshold) {
      deleteTransaction(transaction.id);
      window.location.reload(); 
    } else if (info.offset.x > threshold) {
      setLocation(`/add/${transaction.id}`);
    }
  };

  return (
    <div className="relative mb-4 overflow-hidden rounded-3xl">
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-6 bg-secondary/20 pointer-events-none">
        <motion.div style={{ opacity: editOpacity }} className="flex items-center gap-2 text-emerald-500 font-bold">
          <Edit2 className="w-5 h-5" />
          <span>Edit</span>
        </motion.div>
        <motion.div style={{ opacity: deleteOpacity }} className="flex items-center gap-2 text-rose-500 font-bold">
          <span>Delete</span>
          <Trash2 className="w-5 h-5" />
        </motion.div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -360, right: 360 }}
        dragElastic={0.03}
        style={{ x }}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ delay: index * 0.05, duration: 0.2 }}
        className="relative z-10 group flex items-center gap-4 p-5 bg-background rounded-3xl border border-border/50 shadow-sm active:scale-[0.98] transition-all hover:bg-secondary/10 cursor-pointer touch-pan-y"
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
    </div>
  );
}
