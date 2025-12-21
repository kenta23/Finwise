import { create } from "zustand";
import type { incomeItem } from "@/types";

export const useIncomeStore = create<{ income: incomeItem[]; setIncome: (income: incomeItem[]) => void }>((set) => ({
    income: [],
    setIncome: (income: incomeItem[]) => set(state => ({ ...state, income })),
}));
