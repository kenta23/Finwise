"use server";

import { revalidatePath } from "next/cache";
import z from "zod";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getAuthenticatedUser, UNAUTHORIZED_RESPONSE } from "@/lib/server";
import type { expenseType, incomeSourcesType } from "@/types";

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
    fundIncome: z.string().min(1, "Fund income is required"),
});

type incomeData = z.infer<typeof incomeSchema>;

export async function submitNewIncome(formData: incomeData) {
    const user = await getAuthenticatedUser();

    if (!user) {
        return UNAUTHORIZED_RESPONSE;
    }

    console.log("formData", formData);

    try {
        const parsedData = incomeSchema.safeParse(formData);

        // console.log("parsedData", parsedData);
        console.log("formData", formData);

        console.log("parsedData", parsedData);

        if (!parsedData.success) {
            console.log("parsedData.error", parsedData.error);
            console.log("formData", formData);
            return {
                message: "Failed to submit new income",
                error: parsedData.error?.message,
            };
        } else {
            const matchedIncomeSource = await prisma.incomeSources.findFirst({
                where: {
                    name: {
                        equals: parsedData.data.source as string,
                    },
                },
            });

            if (!matchedIncomeSource) {
                return {
                    message: "Income source not found",
                    error: "Income source not found",
                };
            }

            const newIncomeData = await prisma.income.create({
                data: {
                    amount: parsedData.data.amount,
                    incomeSourceId: matchedIncomeSource.id,
                    frequency: parsedData.data.frequency,
                    income_name: parsedData.data.income_name,
                    userId: user.id,
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

export async function quickAdd(data: { income: incomeSourcesType[]; expense: expenseType }) {
    const user = await getAuthenticatedUser();

    if (!user) {
        return UNAUTHORIZED_RESPONSE;
    }
    console.log("DATA FROM SERVER", data);

    // Handle income
    if (data.income && data.income.length > 0) {
        const incomeDataArray = data.income.map((income) => incomeSchema.safeParse(income));

        if (!incomeDataArray.every((result) => result.success)) {
            const errors = incomeDataArray
                .map((result) => result.error)
                .filter((error) => error !== null);
            const errorMessages = errors.map((error) =>
                error?.issues.map((e: { message: string }) => e.message).join(", ")
            );

            return {
                error: errorMessages.join(", "),
                message: "Failed to add income(s)",
                data: incomeDataArray.map((result) => result.data).filter((data) => data !== null),
            };
        }

        try {
            const userId = user.id;

            //look for the matched income source
            const matchedIncomeSource = await prisma.incomeSources.findFirst({
                where: {
                    name: {
                        in: incomeDataArray.map((result) => result.data?.source),
                    },
                },
            });

            if (!matchedIncomeSource) {
                return {
                    error: "Income source not found",
                    message: "Income source not found",
                    data: null,
                };
            }

            const newIncome = await prisma.income.createMany({
                data: incomeDataArray
                    .map((result) => result.data)
                    .filter((data) => data !== null)
                    .map((data) => ({
                        amount: data.amount,
                        income_name: data.income_name,
                        frequency: data.frequency,
                        userId,
                        incomeSourceId: matchedIncomeSource.id,
                    })),
            });
            console.log("new income", newIncome);

            // if (newIncome.count) {
            //     await getSummaryFromRedis();
            // }

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

    //****  HANDLE EXPENSE ***** //
    if (
        data.expense &&
        data.expense.amount > 0 &&
        data.expense.category &&
        data.expense.description &&
        data.expense.fundIncome !== ""
    ) {
        const expenseData = expensesSchema.safeParse({
            amount: data.expense.amount,
            category: data.expense.category,
            description: data.expense.description,
            fundIncome: data.expense.fundIncome,
        });

        if (!expenseData.success) {
            return {
                error: expenseData.error.issues.map((e: { message: string }) => e.message).join(", "),
                message: "Failed to add expense",
                data: null,
            };
        }

        try {
            const matchedExpenseCategory = await prisma.expenseCategories.findFirst({
                where: {
                    name: {
                        equals: expenseData.data.category as string,
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

            const matchedIncome = await prisma.income.findFirst({
                where: {
                    id: {
                        equals: expenseData.data.fundIncome,
                    },
                },
            });

            if (!matchedIncome) {
                return {
                    error: "Income not found",
                    message: "Income not found",
                    data: null,
                };
            }

            const newExpense = await prisma.expenses.create({
                data: {
                    amount: expenseData.data.amount,
                    expenseCategoryId: matchedExpenseCategory.id,
                    description: expenseData.data.description,
                    userId: user.id,
                    incomeId: matchedIncome.id,
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

export async function getSummaryFromRedis() {
    const user = await getAuthenticatedUser();
    if (!user) {
        return UNAUTHORIZED_RESPONSE;
    }
    const cacheKey = `summary_${user.id}`;

    // Try to get data from Redis
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
        console.log("Returning from Cache 🚀");
        console.log("cachedData", cachedData);
        // Upstash SDK automatically parses JSON
        return cachedData;
    }

    // 2. If not in Redis, fetch from Prisma (Database)
    console.log("Cache Miss. Fetching from DB 🐢");

    const [incomeSum, expenseSum, savingsSum] = await Promise.all([
        prisma.income.aggregate({ where: { userId: user.id }, _sum: { amount: true } }),
        prisma.expenses.aggregate({ where: { userId: user.id }, _sum: { amount: true } }),
        prisma.savings.aggregate({ where: { userId: user.id }, _sum: { currentAmount: true } }),
    ]);

    const income = incomeSum._sum.amount || 0;
    const expenses = expenseSum._sum.amount || 0;
    const savings = savingsSum._sum.currentAmount || 0;

    const summary = {
        income,
        expenses,
        savings,
        balance: income - expenses - savings,
    };

    //  Save to Redis so next time is fast
    // set a TTL (Time To Live) of 24 hours (86400 seconds)
    await redis.set(cacheKey, JSON.stringify(summary), { ex: 86400 });

    return summary;
}