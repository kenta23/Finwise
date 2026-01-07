import type { categories } from "@/data";


export enum Frequency {
    PER_WEEK = "per-week",
    PER_MONTH = "per-month",
    PER_YEAR = "per-year",
}

export type incomeSourcesType = {
    income_name: string;
    frequency: Frequency;
    source: string;
    amount: number;
};
export type expenseType = {
    amount: number;
    category: string;
    description: string;
    fundIncome: string;
};

export type expenseItem = {
    id: string;
    expenseCategoryId?: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    amount: number;
    description: string;
    notes: string;
    fundIncome?: string | null;
};

export type incomeType = {
    id: string;
    name: string;
}[];

export type SavingsItem = {
    id: string;
    name: string;
    type: string;
    bankName: string;
    accountNumber?: string;
    incomeId: string;
    amountToSave: number;
    frequency: string;
    currentAmount: number;
    goalAmount: number;
    notes?: string;
    updatedAt: Date;
    createdAt: Date;
};

export type incomeItem = {
    expenses?: expenseItem[];
    savings?: SavingsItem[];
    incomeSource?: {
        id: string;
        name: string;
    } | null;
    amount: number;
    id: string;
    frequency: Frequency;
    income_name: string;
    createdAt: Date;
    updatedAt: Date | null;
    userId: string | null;
};

export type incomeItems = incomeItem[];
export type categoryType = (typeof categories)[number];


export type categoryItem = {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
};

export type categoryBreakdownType = {
    categoryId: number;
    categoryName: string;
    totalAmount: number;
    transactionCount: number;
    averageAmount: number;
    percentage: number;
    lastExpenseDate: string;
    categoryType: categoryType;
};

export type expenseCategoryRelation = {
    id: string;
    name: string;
    createdAt: Date | string;
    updatedAt: Date | string;
};

export type expenseIncomeRelation = {
    id: string;
    amount: number;
    income_name: string;
    frequency: string;
    incomeSourceId: string;
    userId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
};

export type expenseWithRelations = {
    id: string;
    description: string;
    notes: string | null;
    amount: number;
    incomeId: string;
    expenseCategoryId: string;
    userId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    income: expenseIncomeRelation;
    expenseCategory: expenseCategoryRelation;
};


