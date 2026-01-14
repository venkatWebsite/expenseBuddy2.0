
import React from "react";
import { cn } from "@/lib/utils";

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  withPadding?: boolean;
}

export default function MobileContainer({ 
  children, 
  className,
  withPadding = true 
}: MobileContainerProps) {
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className={cn(
        "w-full max-w-md bg-background min-h-screen relative pb-24",
        withPadding && "px-4 pt-4",
        className
      )}>
        {children}
      </div>
    </div>
  );
}
