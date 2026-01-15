
import React, { useState, useEffect } from "react";
import MobileContainer from "@/components/layout/mobile-container";
import BottomNav from "@/components/ui/bottom-nav";
import { CATEGORIES } from "@/lib/mock-data";
import { saveTransaction, getCustomCategories, saveCategory, getProfile, getTransactions, updateTransaction, deleteTransaction } from "@/lib/storage";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Calendar, FileText, Plus, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function AddExpense() {
  const [match, params] = useRoute("/add/:id?");
  const editId = params?.id;
  const [_, setLocation] = useLocation();
  const [amount, setAmount] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [step, setStep] = useState<"date" | "amount">("date");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  
  const profile = getProfile();
  const currency = profile?.currency || "₹";

  useEffect(() => {
    const cats = getCustomCategories();
    setCategories(cats);
    
    // Check for type in query params if it exists
    const searchParams = new URLSearchParams(window.location.search);
    const typeParam = searchParams.get('type');
    if (typeParam === 'income' || typeParam === 'expense') {
      setType(typeParam as "income" | "expense");
    }
    
    if (editId) {
      const allTx = getTransactions();
      const tx = allTx.find(t => t.id === editId);
      if (tx) {
        setAmount(tx.amount.toString());
        setSelectedCategory(cats.find(c => c.name === tx.category)?.id || cats[0].id);
        setNote(tx.note);
        setDate(tx.date.split('T')[0]);
        setType(tx.type);
      }
    } else {
      setSelectedCategory(cats[0].id);
    }
  }, [editId]);

  const handleAddCustom = () => {
    if (!newCatName) return;
    
    // Auto-select icon based on keywords
    const lowerName = newCatName.toLowerCase();
    let detectedIcon = "Tag";
    if (lowerName.includes("food") || lowerName.includes("eat") || lowerName.includes("restaurant") || lowerName.includes("dinner") || lowerName.includes("lunch")) detectedIcon = "Utensils";
    else if (lowerName.includes("car") || lowerName.includes("travel") || lowerName.includes("fuel") || lowerName.includes("petrol") || lowerName.includes("bike") || lowerName.includes("taxi")) detectedIcon = "Car";
    else if (lowerName.includes("shop") || lowerName.includes("grocery") || lowerName.includes("buy") || lowerName.includes("clothe")) detectedIcon = "ShoppingBag";
    else if (lowerName.includes("bill") || lowerName.includes("pay") || lowerName.includes("rent") || lowerName.includes("electricity") || lowerName.includes("water") || lowerName.includes("gas") || lowerName.includes("wifi") || lowerName.includes("internet") || lowerName.includes("phone") || lowerName.includes("mobile")) detectedIcon = "Receipt";
    else if (lowerName.includes("health") || lowerName.includes("med") || lowerName.includes("doctor") || lowerName.includes("hospital") || lowerName.includes("pharmacy")) detectedIcon = "HeartPulse";
    else if (lowerName.includes("game") || lowerName.includes("play") || lowerName.includes("entertainment") || lowerName.includes("movie") || lowerName.includes("fun") || lowerName.includes("netflix") || lowerName.includes("prime")) detectedIcon = "Gamepad2";
    else if (lowerName.includes("home") || lowerName.includes("house") || lowerName.includes("flat") || lowerName.includes("room") || lowerName.includes("furniture") || lowerName.includes("decor")) detectedIcon = "Home";
    else if (lowerName.includes("study") || lowerName.includes("book") || lowerName.includes("education") || lowerName.includes("school") || lowerName.includes("college") || lowerName.includes("course") || lowerName.includes("tutor")) detectedIcon = "BookOpen";
    else if (lowerName.includes("salary") || lowerName.includes("paycheck") || lowerName.includes("income") || lowerName.includes("bonus") || lowerName.includes("freelance")) detectedIcon = "Wallet";
    else if (lowerName.includes("gym") || lowerName.includes("fit") || lowerName.includes("sport") || lowerName.includes("yoga") || lowerName.includes("workout")) detectedIcon = "Dumbbell";
    else if (lowerName.includes("gift") || lowerName.includes("present") || lowerName.includes("donation") || lowerName.includes("charity")) detectedIcon = "Gift";
    else if (lowerName.includes("coffee") || lowerName.includes("tea") || lowerName.includes("drink") || lowerName.includes("starbucks") || lowerName.includes("cafe")) detectedIcon = "Coffee";
    else if (lowerName.includes("party") || lowerName.includes("club") || lowerName.includes("event") || lowerName.includes("concert")) detectedIcon = "Music";
    else if (lowerName.includes("pet") || lowerName.includes("dog") || lowerName.includes("cat") || lowerName.includes("vet")) detectedIcon = "Dog";

    const newCat = {
      id: Math.random().toString(36).substring(2, 9),
      name: newCatName,
      icon: detectedIcon,
      color: "bg-zinc-100 text-zinc-600"
    };
    saveCategory(newCat);
    const updatedCats = getCustomCategories();
    setCategories(updatedCats);
    setSelectedCategory(newCat.id);
    setNewCatName("");
    setShowCustomInput(false);
  };

  const handleDelete = () => {
    if (editId) {
      deleteTransaction(editId);
      setLocation("/");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const categoryObj = categories.find(c => c.id === selectedCategory) || categories[0] || { name: "General", icon: "Tag", color: "bg-zinc-100 text-zinc-600" };

    const txData = {
      amount: Math.round(parseFloat(amount) * 100) / 100,
      category: categoryObj.name,
      note: note || categoryObj.name,
      type,
      icon: categoryObj.icon,
      color: categoryObj.color
    };

    if (editId) {
      updateTransaction(editId, { ...txData, date: new Date(date).toISOString() });
    } else {
      saveTransaction({
        id: Math.random().toString(36).substring(2, 9),
        ...txData,
        date: new Date(date).toISOString(),
      });
    }

    if (type === "income") {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
    }

    setLocation("/");
  };

  return (
    <>
      <MobileContainer className="bg-secondary/20">
        <header className="flex items-center justify-between mb-8 pt-4">
          <button 
            onClick={() => setLocation("/")}
            className="w-11 h-11 rounded-2xl bg-background border border-border flex items-center justify-center hover:bg-accent transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold font-heading">{editId ? "Edit Entry" : "New Entry"}</h2>
          {editId ? (
            <button 
              type="button"
              onClick={handleDelete}
              className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 hover:bg-rose-500/20 transition-all active:scale-95"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-11" />
          )}
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 pb-24">
          {/* Main Form Card */}
          <div className="bg-background rounded-[32px] p-7 shadow-sm border border-border/50 space-y-6">
            {/* Amount Section */}
            <div className="flex flex-col items-center py-4 border-b border-border/50">
              <div className="flex bg-secondary/50 p-1.5 rounded-2xl border border-border/50 w-full mb-6">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                    type === "expense" ? "bg-zinc-950 text-white shadow-lg" : "text-muted-foreground"
                  )}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                    type === "income" ? "bg-emerald-500 text-white shadow-lg" : "text-muted-foreground"
                  )}
                >
                  Income
                </button>
              </div>
              
              <div className="flex items-baseline text-foreground">
                <span className="text-2xl font-bold text-primary mr-2">{currency}</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-5xl font-bold bg-transparent border-none outline-none w-[180px] text-center placeholder:text-muted-foreground/20 font-heading appearance-none"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Native Date Section */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-secondary/30 border border-transparent focus:border-primary/20 rounded-2xl p-4 pl-11 text-sm font-bold outline-none transition-all appearance-none"
                  />
                </div>
              </div>

              {/* Grid Category Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                  <button 
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    className="text-primary p-1 hover:bg-primary/5 rounded-full transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const Icon = (Icons as any)[cat.icon] || Icons.Tag;
                    const isSelected = selectedCategory === cat.id;

                    return (
                      <motion.div
                        key={cat.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all duration-300",
                          isSelected 
                            ? "border-primary bg-primary/5 shadow-sm" 
                            : "border-transparent bg-secondary/20 hover:bg-secondary/40"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={cn(
                          "text-[9px] font-bold text-center leading-tight uppercase tracking-tight truncate w-full px-1",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )}>
                          {cat.name}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Notes</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                  <input 
                    type="text" 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional note..." 
                    className="w-full bg-secondary/30 border border-transparent focus:border-primary/20 rounded-2xl p-4 pl-11 text-sm font-bold outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showCustomInput && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-background rounded-[32px] p-6 shadow-sm border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="New category name..."
                    className="flex-1 bg-secondary/40 p-4 rounded-2xl border-none outline-none text-sm font-bold"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    className="w-12 h-12 bg-zinc-950 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            className={cn(
              "w-full text-white font-bold py-5 rounded-[24px] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg",
              type === "income" ? "bg-emerald-500" : "bg-zinc-950"
            )}
          >
            {editId ? "Update Entry" : "Confirm Entry"}
          </button>
        </form>
      </MobileContainer>
    </>
  );
}
