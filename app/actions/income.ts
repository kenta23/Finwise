"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";
import type { incomeItem, incomeItems } from "@/data";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Helper function to get and validate user session
 * Returns the session user or null if unauthorized
 */
async function getAuthenticatedUser() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	return session?.user || null;
}

const incomeFormSchema = z.object({
	amount: z.number().positive("Amount must be greater than 0"),
	source: z.string().min(1, "Please select an income source"),
	frequency: z.string().min(1, "Please select a frequency"),
	income_name: z.string().min(1, "Income name is required"),
});

export async function getIncome(): Promise<{ data: incomeItem[] | null }> {
	const user = await getAuthenticatedUser();

	if (!user) {
		return { data: null };
	}

	try {
		const income = await prisma.income.findMany({
			where: {
				userId: user.id,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return {
			data: income as incomeItems,
		};
	} catch (error) {
		console.error("Error getting income", error);
		return {
			data: null,
		};
	}
}

export async function getUserInfo(): Promise<{ error: string | null; message: string; data: any }> {
	const user = await getAuthenticatedUser();

	if (!user) {
		return {
			error: "Unauthorized",
			message: "Unauthorized",
			data: null,
		};
	}
	try {
		const userInfo = await prisma.user.findUnique({
			where: {
				id: user.id,
			},
			include: {
				incomes: true,
				expenses: true,
				savings: true,
			},
		});

		console.log("userInfo", userInfo);

		return {
			error: null,
			message: "Income fetched successfully",
			data: userInfo,
		};
	} catch (error) {
		console.log("Error getting income", error);
		return {
			error: "Failed to get income",
			message: "Failed to get income",
			data: null,
		};
	}
}

export async function deleteIncome(
	id: string
): Promise<{ error: string | null; message: string; data: any }> {
	const user = await getAuthenticatedUser();

	if (!user) {
		return { error: "Unauthorized", message: "Unauthorized", data: null };
	}

	try {
		const deletedIncome = await prisma.income.delete({
			where: {
				id,
				userId: user.id,
			},
		});

		console.log("deletedIncome", deletedIncome);

		return { error: null, message: "Income deleted successfully", data: deletedIncome };
	} catch (error) {
		console.error("Error deleting income", error);

		return { error: "Failed to delete income", message: "Failed to delete income", data: null };
	}
}

//EDIT INCOME
export async function editIncome(
	formData: Partial<incomeItem>,
	id: string
): Promise<{ error: string | null; message: string; data: any }> {
	const user = await getAuthenticatedUser();

	if (!user) {
		return { error: "Unauthorized", message: "Unauthorized", data: null };
	}

	if (!id) {
		return { error: "Income ID is required", message: "Income ID is required", data: null };
	}

	try {
		console.log("formData", formData);
		const parsedData = incomeFormSchema.nullable().safeParse(formData);
		console.log("parsedData", parsedData);

		if (!parsedData.success) {
			return { error: parsedData.error.message, message: "Invalid data", data: null };
		}

		const updatedIncome = await prisma.income.update({
			where: {
				id,
				userId: user.id, // Ensure user owns this income
			},
			data: {
				...parsedData.data,
			},
		});

		console.log("updatedIncome", updatedIncome);

		revalidatePath("/income");

		return { error: null, message: "Income updated successfully", data: updatedIncome };

	} catch (error) {
		console.error("Error updating income", error);
		return { error: "Failed to update income", message: "Failed to update income", data: null };
	}
}
