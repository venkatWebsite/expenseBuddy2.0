import { Transaction, CATEGORIES } from "./mock-data";

const STORAGE_KEY = "expense_tracker_transactions";
const PROFILE_KEY = "expense_tracker_profile";
const CATEGORIES_KEY = "expense_tracker_categories";

export interface UserProfile {
  name: string;
  currency: string;
}

export function getProfile(): UserProfile | null {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getCustomCategories() {
  const data = localStorage.getItem(CATEGORIES_KEY);
  return data ? JSON.parse(data) : CATEGORIES;
}

export function saveCategory(category: any) {
  const categories = getCustomCategories();
  categories.push(category);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function getTransactions(): Transaction[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTransaction(transaction: Transaction) {
  const transactions = getTransactions();
  transactions.unshift(transaction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function deleteTransaction(id: string) {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function updateTransaction(id: string, updated: Partial<Transaction>) {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updated };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }
}
