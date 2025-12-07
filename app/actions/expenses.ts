"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getExpenses(): Promise<{ error: string | null; message: string; data: any }> {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        return {
            error: "Unauthorized",
            message: "Unauthorized",
            data: null,
        }
    }

    try {
        const expenses = await prisma.expenses.findMany({
            where: {
                userId: session.user.id,
            }
        });


        if (expenses && expenses.length > 0) {
            return {
                error: null,
                message: "Expenses fetched successfully",
                data: expenses,
            }
        }

        return {
            error: null,
            message: "No expenses found",
            data: [],
        }

    }

    catch (error) {
        console.error("Error getting expenses", error);
        return {
            error: "Failed to get expenses",
            message: "Failed to get expenses",
            data: null,
        }
    }

} 