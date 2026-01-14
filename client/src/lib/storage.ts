import { Transaction } from "./mock-data";

const STORAGE_KEY = "expense_tracker_transactions";

export function getTransactions(): Transaction[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTransaction(transaction: Transaction) {
  const transactions = getTransactions();
  transactions.unshift(transaction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function clearTransactions() {
  localStorage.removeItem(STORAGE_KEY);
}
