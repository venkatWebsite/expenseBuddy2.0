
import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Plus, PieChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/stats", icon: PieChart, label: "Stats" },
    { href: "/add", icon: Plus, label: "Add", isFab: true },
    { href: "/profile", icon: Settings, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-around w-full max-w-md px-6 py-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg rounded-2xl">
        {navItems.map((item) => {
          const isActive = location === item.href;
          
          if (item.isFab) {
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={cn(
                    "flex items-center justify-center w-12 h-12 -mt-8 rounded-full shadow-xl transition-transform active:scale-95 cursor-pointer",
                    "bg-primary text-primary-foreground shadow-primary/30"
                  )}
                  data-testid="nav-fab-add"
                >
                  <Plus className="w-6 h-6" />
                </div>
              </Link>
            );
          }

          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={cn(
                  "flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                data-testid={`nav-item-${item.label.toLowerCase()}`}
              >
                <item.icon 
                  className={cn(
                    "w-6 h-6 transition-all duration-200",
                    isActive && "fill-current"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
