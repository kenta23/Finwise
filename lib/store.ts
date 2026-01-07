import { create } from "zustand";
import type { categoryItem, categoryType, incomeItem } from "@/types";

export const useIncomeStore = create<{ income: incomeItem[]; setIncome: (income: incomeItem[]) => void }>((set) => ({
    income: [],
    setIncome: (income: incomeItem[]) => set(state => ({ ...state, income })),
}));


export const useCategoriesStore = create<{ categories: categoryItem[]; setCategories: (categories: categoryItem[]) => void }>((set) => ({
    categories: [],
    setCategories: (categories: categoryItem[]) => set(state => ({ ...state, categories })),
}));
