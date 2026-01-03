"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, UNAUTHORIZED_RESPONSE } from "@/lib/server";
import { editSavingsSchema, type SavingsItem, savingsSchema } from "../(pages)/savings/data";

export async function getSavings(): Promise<{ error: string | null; message: string; data: any }> {
    const user = await getAuthenticatedUser();

    if (!user) {
        return UNAUTHORIZED_RESPONSE;
    }

    try {
        const savings = await prisma.savings.findMany({
            where: {
                userId: user.id,
            },
        });

        if (savings && savings.length > 0) {
            return {
                error: null,
                message: "Savings fetched successfully",
                data: savings,
            };
        }

        return {
            error: "No savings found",
            message: "No savings found",
            data: [],
        };
    } catch (error) {
        console.error("Error getting savings", error);
        return {
            error: error as string,
            message: "Failed to get savings",
            data: null,
        };
    }
}

export async function addSavings(
    savingsItem: Omit<SavingsItem, "id" | "createdAt" | "updatedAt" | "userId">
): Promise<{ error: string | null; message: string; data: any }> {
    const user = await getAuthenticatedUser();

    if (!user) {
        return UNAUTHORIZED_RESPONSE;
    }

    const parsedData = savingsSchema.safeParse({
        ...savingsItem,
        currentAmount: Number(savingsItem.currentAmount),
        goalAmount: Number(savingsItem.goalAmount),
    });

    if (!parsedData.success) {
        return {
            error: parsedData.error.message,
            message: "Failed to add savings",
            data: null,
        };
    }

    try {
        const data = await prisma.savings.create({
            data: {
                name: parsedData.data.name,
                type: parsedData.data.type,
                bankName: parsedData.data.bankName || "",
                amountToSave: Number(parsedData.data.amountToSave),
                frequency: parsedData.data.frequency as "weekly" | "monthly" | "daily" | "bi-weekly",
                accountNumber: parsedData.data.accountNumber,
                currentAmount: Number(parsedData.data.currentAmount),
                goalAmount: Number(parsedData.data.goalAmount),
                notes: parsedData.data.notes,
                userId: user.id,
            },
        });

        if (data) {
            revalidatePath("/savings");

            return {
                data,
                message: "Savings added successfully",
                error: null,
            };
        }

        return {
            error: "Failed to add savings",
            message: "Failed to add savings",
            data: null,
        };
    } catch (error) {
        console.error("Error adding savings", error);
        return {
            error: "Failed to add savings",
            message: "Failed to add savings",
            data: null,
        };
    }
}

export async function editSavings(
    item: Partial<SavingsItem>
): Promise<{ error: string | null; message: string; data: any }> {
    const user = await getAuthenticatedUser();

    if (!user) {
        return UNAUTHORIZED_RESPONSE;
    }

    if (!item.id) {
        return {
            error: "Savings item ID is required",
            message: "Savings item ID is required",
            data: null,
        };
    }

    // Use editSavingsSchema which makes all fields optional
    const parsedData = editSavingsSchema.safeParse(item);

    if (!parsedData.success) {
        return {
            error: parsedData.error.message,
            message: "Failed to edit savings",
            data: null,
        };
    }

    try {
        const data = await prisma.savings.update({
            where: {
                id: item.id,
            },
            data: parsedData.data,
        });

        if (data) {
            revalidatePath("/savings");

            return {
                data,
                message: "Savings updated successfully",
                error: null,
            };
        }

        return {
            error: "Failed to update savings",
            message: "Failed to update savings",
            data: null,
        };
    } catch (error) {
        console.error("Error updating savings", error);
        return {
            error: "Failed to update savings",
            message: "Failed to update savings",
            data: null,
        };
    }
}


export async function deleteSavings(id: string): Promise<{ error: string | null; message: string; data: any }> {
    const user = await getAuthenticatedUser();

    if (!user) {
        return UNAUTHORIZED_RESPONSE;
    }

    if (!id) {
        return {
            error: "Savings ID is required",
            message: "Savings ID is required",
            data: null,
        };
    }

    try {
        const data = await prisma.savings.delete({
            where: {
                id,
            },
        });

        if (data) {
            revalidatePath("/savings");

            return {
                data,
                message: "Savings deleted successfully",
                error: null,
            };
        }

        return {
            error: "Failed to delete savings",
            message: "Failed to delete savings",
            data: null,
        };
    }

    catch (error) {
        console.error("Error deleting savings", error);
        return {
            error: "Failed to delete savings",
            message: "Failed to delete savings",
            data: null,
        };
    }
}
