
import React from "react";
import * as Icons from "lucide-react";
import { Transaction } from "@/lib/mock-data";
import { getProfile, deleteTransaction } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useLocation } from "wouter";
import { Trash2, Edit2, AlertCircle } from "lucide-react";

interface TransactionCardProps {
  transaction: Transaction;
  index: number;
  swipedId: string | null;
  onSwipe: (id: string | null) => void;
}

export default function TransactionCard({ transaction, index, swipedId, onSwipe }: TransactionCardProps) {
  const [_, setLocation] = useLocation();
  const [showConfirm, setShowConfirm] = React.useState(false);
  const IconComponent = (Icons as any)[transaction.icon] || Icons.Tag;
  const profile = getProfile();
  const currency = profile?.currency || "₹";

  const x = useMotionValue(0);
  
  // Opacity controls: reveal text quickly at 15% swipe
  const deleteOpacity = useTransform(x, [-100, -20], [1, 0]);
  const editOpacity = useTransform(x, [20, 100], [0, 1]);
  
  // Auto-reset when another item is swiped
  React.useEffect(() => {
    if (swipedId !== transaction.id && x.get() !== 0 && !showConfirm) {
      x.stop();
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  }, [swipedId, transaction.id, showConfirm]);

  const handleDragStart = () => {
    onSwipe(transaction.id);
  };

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 220; 
    if (info.offset.x < -threshold) {
      setShowConfirm(true);
      animate(x, -threshold, { type: "spring", stiffness: 300, damping: 30 });
    } else if (info.offset.x > threshold) {
      setLocation(`/add/${transaction.id}`);
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
      // Don't clear onSwipe(null) immediately to allow the animation to finish
      setTimeout(() => onSwipe(null), 200);
    }
  };

  const confirmDelete = () => {
    deleteTransaction(transaction.id);
    window.location.reload();
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    x.set(0);
    onSwipe(null);
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

      {/* Confirmation Overlay */}
      {showConfirm && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-rose-500/90 backdrop-blur-sm px-6 animate-in fade-in zoom-in duration-200">
          <div className="flex flex-col items-center gap-2 text-white text-center">
            <AlertCircle className="w-6 h-6 mb-1" />
            <p className="font-bold text-sm">Delete this transaction?</p>
            <div className="flex gap-4 mt-2">
              <button 
                onClick={cancelDelete}
                className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded-full bg-white text-rose-500 hover:bg-zinc-100 text-xs font-bold transition-colors shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <motion.div
        drag="x"
        dragConstraints={{ left: -360, right: 360 }}
        dragElastic={0.03}
        style={{ x }}
        onDragStart={handleDragStart}
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
