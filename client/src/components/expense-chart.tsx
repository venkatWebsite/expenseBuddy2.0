
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DATA = [
  { name: "Food", value: 400, color: "hsl(var(--chart-1))" },
  { name: "Transport", value: 300, color: "hsl(var(--chart-2))" },
  { name: "Shopping", value: 300, color: "hsl(var(--chart-3))" },
  { name: "Bills", value: 200, color: "hsl(var(--chart-4))" },
];

export default function ExpenseChart() {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="pb-0 px-0">
        <CardTitle className="text-lg font-heading">Monthly Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="h-[200px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DATA}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-muted-foreground uppercase font-medium">Total</span>
            <span className="text-2xl font-bold font-heading">$1,200</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
