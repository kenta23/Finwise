"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, UNAUTHORIZED_RESPONSE } from "@/lib/server";
import type { expenseItem, expenseWithRelations } from "@/types";

const expenseSchema = z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    category: z.string().min(1, "Please select a category"),
    description: z.string().min(1, "Description is required"),
    notes: z.string().default(""),
    fundIncomeId: z.string().min(1, "Please select a income"),
});


export async function getExpenses() {
    const user = await getAuthenticatedUser();

    if (!user) {
        return UNAUTHORIZED_RESPONSE;
    }

    try {
        const expenses = await prisma.expenses.findMany({
            where: {
                userId: user.id,
            },
            include: {
                income: true,
                expenseCategory: true,
            },
        });

        if (expenses && expenses.length > 0) {
            return {
                error: null,
                message: "Expenses fetched successfully",
                data: expenses,
            };
        } else {
            return {
                error: "No expenses found",
                message: "No expenses found",
                data: [],
            };
        }
    } catch (error) {
        console.error("Error getting expenses", error);
        return {
            error: "Failed to get expenses",
            message: "Failed to get expenses",
            data: null,
        };
    }
}

export async function getCategories() {
    const user = await getAuthenticatedUser();

    if (!user) {
        return UNAUTHORIZED_RESPONSE;
    }

    try {
        const incomeSources = await prisma.income.findMany({
            where: {
                userId: user.id,
            },
        });

        const categories = await prisma.expenseCategories.findMany({
            include: {
                expenses: {
                    where: {
                        userId: user.id,
                    },
                },
            },
        });


        if (categories && categories.length > 0) {
            return {
                error: null,
                message: "Expenses fetched successfully",
                data: categories,
            };
        }

        return {
            error: null,
            message: "No expenses found",
            data: [],
        };
    } catch (error) {
        console.error("Error getting expenses", error);
        return {
            error: "Failed to get expenses",
            message: "Failed to get expenses",
            data: null,
        };
    }
}

export async function addExpense(
    expense: Omit<expenseItem, "id" | "createdAt" | "updatedAt" | "userId">
) {
    const user = await getAuthenticatedUser();

    if (!user) {
        return UNAUTHORIZED_RESPONSE;
    }

    try {
        const parsedData = expenseSchema.safeParse(expense);

        if (!parsedData.success) {
            return {
                error: parsedData.error.message,
                message: "Failed to add expense",
                data: null,
            };
        }

        const matchedExpenseCategory = await prisma.expenseCategories.findFirst({
            where: {
                name: {
                    equals: parsedData.data.category,
                },
            },
        });

        if (!matchedExpenseCategory) {
            return {
                error: "Expense category not found",
                message: "Expense category not found",
                data: null,
            };
        }

        const newExpense = await prisma.expenses.create({
            data: {
                amount: parsedData.data.amount,
                expenseCategoryId: matchedExpenseCategory.id,
                description: parsedData.data.description,
                userId: user.id,
                incomeId: parsedData.data.fundIncomeId as string,
                notes: parsedData.data.notes || "",
            },
        });

        return {
            message: "Expense added successfully",
            error: null,
            data: newExpense,
        };
    } catch (error) {
        console.error("Error adding expense", error);
        return {
            error: "Failed to add expense",
            message: "Failed to add expense",
            data: null,
        };
    }
}



export async function deleteExpense(id: string) {
    const user = await getAuthenticatedUser();

    if (!user) {
        return UNAUTHORIZED_RESPONSE;
    }

    if (!id) {
        return {
            error: "Expense ID is required",
            message: "Expense ID is required",
            data: null,
        }
    }

    try {
        const deletedExpense = await prisma.expenses.delete({
            where: {
                id,
                userId: user.id,
            },
        });

        return {
            error: null,
            message: "Expense deleted successfully",
            data: deletedExpense,
        };
    }

    catch (err) {
        console.error("Error deleting expense", err);
        return {
            error: "Failed to delete expense",
            message: "Failed to delete expense",
            data: null,
        };
    }
}


export async function editExpense(expense: Partial<expenseWithRelations>)
    : Promise<{ error: string | null; message: string; data: any }> {
    const user = await getAuthenticatedUser();

    if (!user) {
        return UNAUTHORIZED_RESPONSE;
    }

    if (!expense.id) {
        return {
            error: "Expense ID is required",
            message: "Expense ID is required",
            data: null,
        };
    }

    try {
        const parsedData = expenseSchema.safeParse(expense);
        if (!parsedData.success) {
            return {
                error: parsedData.error.message,
                message: "Invalid data",
                data: null,
            };
        }

        // Find the expense category by name
        const matchedExpenseCategory = await prisma.expenseCategories.findFirst({
            where: {
                name: {
                    equals: parsedData.data.category,
                },
            },
        });

        if (!matchedExpenseCategory) {
            return {
                error: "Expense category not found",
                message: "Expense category not found",
                data: null,
            };
        }

        const updatedExpense = await prisma.expenses.update({
            where: {
                id: expense.id,
                userId: user.id,
            },
            data: {
                amount: parsedData.data.amount,
                expenseCategoryId: matchedExpenseCategory.id,
                description: parsedData.data.description,
                incomeId: parsedData.data.fundIncomeId,
                notes: parsedData.data.notes || "",
            },
        });

        return {
            error: null,
            message: "Expense updated successfully",
            data: updatedExpense,
        };

    } catch (error) {
        console.error("Error editing expense", error);
        // Properly extract error message
        const errorMessage = error instanceof Error
            ? error.message
            : typeof error === 'string'
                ? error
                : "Failed to edit expense";

        return {
            error: errorMessage,
            message: "Failed to edit expense",
            data: null,
        };
    }
} 
