
import React, { useState, useEffect } from "react";
import MobileContainer from "@/components/layout/mobile-container";
import BottomNav from "@/components/ui/bottom-nav";
import TransactionCard from "@/components/transaction-card";
import { getTransactions, getProfile, getCustomCategories } from "@/lib/storage";
import { CATEGORIES, Transaction } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { ChevronRight, Filter, PieChart as PieIcon, TrendingUp, BarChart3, Download, FileText } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const incomeTransactions = monthTransactions.filter(t => t.type === 'income');
  const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
  const income = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalBalance = income - totalExpense;

  // Get unique months for selector
  const availableMonths = Array.from(new Set(transactions.map(t => format(new Date(t.date), "yyyy-MM"))));
  if (!availableMonths.includes(format(new Date(), "yyyy-MM"))) {
    availableMonths.push(format(new Date(), "yyyy-MM"));
  }
  availableMonths.sort().reverse();

  // Pie Chart Data
  const customCats = getCustomCategories();
  const CATEGORY_COLORS = [
    "#F97316", "#3B82F6", "#EC4899", "#EAB308", "#A855F7", "#22C55E", 
    "#06B6D4", "#EF4444", "#8B5CF6", "#F43F5E", "#10B981", "#6366F1"
  ];

  const categoryTotals = customCats.map((cat: any, index: number) => {
    const amount = expenses
      .filter((t: any) => t.category === cat.name)
      .reduce((acc: number, t: any) => acc + t.amount, 0);
    return {
      name: cat.name,
      value: amount,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      icon: cat.icon
    };
  }).filter((categoryItem: any) => categoryItem.value > 0).sort((a: any, b: any) => b.value > a.value ? -1 : 1);

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

  const handleExportCSV = () => {
    if (monthTransactions.length === 0) {
      return;
    }

    const headers = ["Date", "Type", "Category", "Amount", "Note"];
    const rows = monthTransactions.map(t => [
      format(new Date(t.date), "yyyy-MM-dd"),
      t.type,
      t.category,
      t.amount,
      t.note || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses_${selectedMonth}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (monthTransactions.length === 0) return;

    const doc = new jsPDF();
    const monthName = format(new Date(selectedMonth + "-01"), "MMMM yyyy");
    const safeCurrency = currency === "₹" ? "Rs." : currency;

    // Header with Profile Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(24, 24, 27);
    doc.text("EXPENSE REPORT", 14, 22);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Prepared for: ${profile?.name || "User"}`, 14, 28);
    doc.text(`Period: ${monthName}`, 14, 33);
    doc.text(`Generated on: ${format(new Date(), "PPP p")}`, 14, 38);

    // Summary Box
    doc.setDrawColor(240);
    doc.setFillColor(250);
    doc.roundedRect(14, 45, 182, 35, 3, 3, 'FD');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(24, 24, 27);
    doc.text("Financial Summary", 20, 52);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Total Income:`, 20, 60);
    doc.text(`${safeCurrency} ${income.toLocaleString()}`, 190, 60, { align: 'right' });
    
    doc.text(`Total Expenses:`, 20, 66);
    doc.text(`${safeCurrency} ${totalExpense.toLocaleString()}`, 190, 66, { align: 'right' });
    
    doc.setFont("helvetica", "bold");
    doc.text(`Net Balance:`, 20, 74);
    doc.text(`${safeCurrency} ${totalBalance.toLocaleString()}`, 190, 74, { align: 'right' });

    let currentY = 90;
    
    // Pictorial Breakdown
    if (totalExpense > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Expense Breakdown by Category", 14, currentY);
      currentY += 10;
      
      categoryTotals.forEach((cat: any) => {
        const barMaxWidth = 140;
        const barWidth = (cat.value / totalExpense) * barMaxWidth;
        const hex = cat.color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        doc.setFillColor(r, g, b);
        doc.rect(14, currentY, barWidth, 6, 'F');
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`${cat.name}: ${safeCurrency} ${cat.value.toLocaleString()} (${Math.round((cat.value/totalExpense)*100)}%)`, 14 + barWidth + 3, currentY + 4.5);
        currentY += 10;
        
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
      });
      currentY += 5;
    }

    // Table
    const tableData = monthTransactions.map(t => [
      format(new Date(t.date), "dd MMM yyyy"),
      t.category,
      t.note || "-",
      t.type.toUpperCase(),
      `${safeCurrency} ${t.amount.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Date", "Category", "Note", "Type", "Amount"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [24, 24, 27], fontStyle: 'bold' },
      styles: { font: 'helvetica', fontSize: 9 },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${data.pageNumber}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        doc.text("Personal Expense Tracker", 14, doc.internal.pageSize.height - 10);
      }
    });

    const fileName = `Expense_Report_${profile?.name || "User"}_${monthName.replace(" ", "_")}.pdf`;
    doc.save(fileName);
  };

  return (
    <>
      <MobileContainer>
        <header className="flex items-center justify-between mb-6 pt-4">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold font-heading">Analytics</h2>
            <div className="flex gap-3 mt-1">
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider hover:opacity-80 transition-opacity"
              >
                <Download className="w-3 h-3" />
                CSV
              </button>
              <button 
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider hover:opacity-80 transition-opacity"
              >
                <FileText className="w-3 h-3" />
                PDF
              </button>
            </div>
          </div>
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
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string) => [`${currency}${value.toFixed(2)}`, name]}
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
                      formatter={(value: number) => [`${currency}${value.toFixed(2)}`, 'Spent']}
                    />
                    <Bar 
                      dataKey="amount" 
                      radius={[6, 6, 0, 0]} 
                      barSize={12}
                    >
                      {barData.map((entry: any, index: number) => {
                        // Find the primary category for this day for coloring
                        const dayExpenses = expenses.filter(t => isSameDay(new Date(t.date), new Date(selectedMonth + "-" + (entry.day.padStart(2, '0')))));
                        const mainCatName = dayExpenses.length > 0 ? dayExpenses[0].category : null;
                        const catColor = categoryTotals.find((c: any) => c.name === mainCatName)?.color || "#CBD5E1";
                        return <Cell key={`cell-${index}`} fill={catColor} />;
                      })}
                    </Bar>
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
                     <div 
                       className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                       style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                     >
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
                           className="h-full rounded-full" 
                           style={{ backgroundColor: cat.color }}
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
