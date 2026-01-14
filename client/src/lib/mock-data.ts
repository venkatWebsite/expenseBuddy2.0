
import { format, subDays } from "date-fns";

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string; // ISO string
  type: "expense" | "income";
  icon: string;
  color: string;
}

export const CATEGORIES = [
  { id: "food", name: "Food & Dining", icon: "Utensils", color: "bg-orange-100 text-orange-600" },
  { id: "transport", name: "Transportation", icon: "Car", color: "bg-blue-100 text-blue-600" },
  { id: "shopping", name: "Shopping", icon: "ShoppingBag", color: "bg-pink-100 text-pink-600" },
  { id: "bills", name: "Bills & Utilities", icon: "Zap", color: "bg-yellow-100 text-yellow-600" },
  { id: "entertainment", name: "Entertainment", icon: "Film", color: "bg-purple-100 text-purple-600" },
  { id: "health", name: "Health & Fitness", icon: "HeartPulse", color: "bg-green-100 text-green-600" },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    amount: 45.00,
    category: "Food & Dining",
    note: "Grocery Run",
    date: new Date().toISOString(),
    type: "expense",
    icon: "Utensils",
    color: "bg-orange-100 text-orange-600"
  },
  {
    id: "2",
    amount: 12.50,
    category: "Transportation",
    note: "Uber Ride",
    date: subDays(new Date(), 1).toISOString(),
    type: "expense",
    icon: "Car",
    color: "bg-blue-100 text-blue-600"
  },
  {
    id: "3",
    amount: 120.00,
    category: "Shopping",
    note: "New Sneakers",
    date: subDays(new Date(), 2).toISOString(),
    type: "expense",
    icon: "ShoppingBag",
    color: "bg-pink-100 text-pink-600"
  },
  {
    id: "4",
    amount: 3200.00,
    category: "Salary",
    note: "Monthly Salary",
    date: subDays(new Date(), 5).toISOString(),
    type: "income",
    icon: "Wallet",
    color: "bg-emerald-100 text-emerald-600"
  },
  {
    id: "5",
    amount: 65.00,
    category: "Bills & Utilities",
    note: "Internet Bill",
    date: subDays(new Date(), 3).toISOString(),
    type: "expense",
    icon: "Zap",
    color: "bg-yellow-100 text-yellow-600"
  },
];
