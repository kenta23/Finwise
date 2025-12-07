"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";
import type { expenseType, incomeSourcesType } from "@/data";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const incomeSchema = z.object({
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    source: z.string().min(1, "Please select an income source"),
    frequency: z.string().min(1, "Please select a frequency"),
    income_name: z.string().min(1, "Income name is required"),
});

const expensesSchema = z.object({
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    category: z.string().min(1, "Please select a category"),
    description: z.string().min(1, "Description is required"),
});

type incomeData = z.infer<typeof incomeSchema>;

export async function submitNewIncome(formData: incomeData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return {
            error: "Unauthorized",
            message: "Unauthorized",
        };
    }

    try {
        const parsedData = incomeSchema.safeParse(formData);

        // console.log("parsedData", parsedData);
        console.log("formData", formData);

        console.log("parsedData", parsedData);

        if (!parsedData.success) {
            console.log("parsedData.error", parsedData.error);
            return {
                message: "Failed to submit new income",
                error: parsedData.error?.message,
            };
        } else {
            const newIncomeData = await prisma.income.create({
                data: {
                    amount: parsedData.data.amount,
                    source: parsedData.data.source,
                    frequency: parsedData.data.frequency,
                    income_name: parsedData.data.income_name,
                    userId: session.user.id,
                },
            });

            console.log("NEW INCOME STORED IN DATABASE", newIncomeData);

            revalidatePath("/income");

            return {
                message: "New income added",
                error: null,
                data: newIncomeData,
            };
        }
    } catch (error) {
        console.error("Error submitting new income", error);
        return {
            message: "Failed to submit new income",
            error: "Failed to submit new income",
        };
    }
}

export async function quickAdd(data: { income: incomeSourcesType[]; expense: expenseType[] }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return {
            error: "Unauthorized",
            message: "Unauthorized",
        };
    }
    console.log("DATA FROM SERVER", data);

    // Handle income
    if (data.income && data.income.length > 0) {
        const incomeDataArray = data.income.map(income => incomeSchema.safeParse(income));

        if (!incomeDataArray.every(result => result.success)) {
            const errors = incomeDataArray.map(result => result.error).filter(error => error !== null);
            const errorMessages = errors.map(error => error?.issues.map((e: { message: string }) => e.message).join(", "));

            return {
                error: errorMessages.join(", "),
                message: "Failed to add income(s)",
                data: incomeDataArray.map(result => result.data).filter(data => data !== null),
            };
        }

        try {
            const userId = session.user.id;

            const newIncome = await prisma.income.createMany({
                data: incomeDataArray
                    .map(result => result.data)
                    .filter(data => data !== null)
                    .map(data => ({
                        ...data,
                        userId,
                    })),
            });
            console.log("new income", newIncome);

            revalidatePath("/", "layout");
            revalidatePath("/income");
            revalidatePath("/dashboard");

            return {
                message: `Income${incomeDataArray.length > 1 ? "s" : ""} added successfully`,
                error: null,
                data: newIncome,
            };
        } catch (error) {
            console.error("Error adding income", error);
            return {
                error: "Failed to add income",
                message: "Failed to add income",
                data: null,
            };
        }
    }

    // Handle expense
    if (data.expense && data.expense.length > 0) {
        const expenseData = expensesSchema.safeParse({
            amount: data.expense[0].amount,
            category: data.expense[0].category,
            description: data.expense[0].description,
        });

        if (!expenseData.success) {
            return {
                error: expenseData.error.issues.map((e: { message: string }) => e.message).join(", "),
                message: "Failed to add expense",
                data: null,
            };
        }

        try {
            const newExpense = await prisma.expenses.create({
                data: {
                    amount: expenseData.data.amount,
                    category: expenseData.data.category,
                    description: expenseData.data.description,
                    userId: session.user.id,
                },
            });

            console.log("new expense", newExpense);

            revalidatePath("/", "layout");
            revalidatePath("/dashboard");

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

    // If neither income nor expense was provided
    return {
        error: "No data provided",
        message: "Please provide income or expense data",
        data: null,
    };
}
