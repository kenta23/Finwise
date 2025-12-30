"use server";

import { revalidatePath } from "next/cache";
import z from "zod";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getAuthenticatedUser, UNAUTHORIZED_RESPONSE } from "@/lib/server";
import type { Frequency, incomeItem, incomeItems } from "@/types";

const incomeFormSchema = z.object({
	amount: z.number().positive("Amount must be greater than 0"),
	source: z.string().min(1, "Please select an income source"),
	frequency: z.string().min(1, "Please select a frequency"),
	income_name: z.string().min(1, "Income name is required"),
});

export async function getIncome() {
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
			include: {
				incomeSource: true,
			},
		});

		return {
			data: income,
			error: null,
			message: "Income fetched successfully",
		};
	} catch (error) {
		console.error("Error getting income", error);
		return {
			data: null,
		};
	}
}

export async function getSummary(): Promise<{ error: string | null; message: string; data: any }> {
	const user = await getAuthenticatedUser();

	if (!user) {
		return UNAUTHORIZED_RESPONSE;
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

		if (userInfo) {
			const reducedIncome = userInfo.incomes.reduce((acc, curr) => acc + curr.amount, 0);
			const reducedExpenses = userInfo.expenses.reduce((acc, curr) => acc + curr.amount, 0);
			const reducedSavings = userInfo.savings.reduce((acc, curr) => acc + curr.currentAmount, 0);
			const reducedBalance = reducedIncome - reducedExpenses - reducedSavings;

			console.log('Reduced Value', reducedIncome)
			return {
				error: null,
				message: "Income fetched successfully",
				data: [userInfo, { income: reducedIncome, expenses: reducedExpenses, savings: reducedSavings, balance: reducedBalance }],
			};
		}

		return UNAUTHORIZED_RESPONSE;
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
		return UNAUTHORIZED_RESPONSE;
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
	formData: {
		amount: number;
		source: string;
		frequency: Frequency;
		income_name: string;
	},
	id: string
): Promise<{ error: string | null; message: string; data: any }> {
	const user = await getAuthenticatedUser();

	if (!user) {
		return UNAUTHORIZED_RESPONSE;
	}

	try {
		console.log("formData", formData);
		const parsedData = incomeFormSchema.nullable().safeParse(formData);
		console.log("parsedData", parsedData);

		if (!parsedData.success) {
			return { error: parsedData.error.message, message: "Invalid data", data: null };
		}

		// Find the IncomeSources record by name to get its ID
		const matchedIncomeSource = await prisma.incomeSources.findFirst({
			where: {
				name: {
					equals: parsedData.data?.source as string,
				},
			},
		});

		if (!matchedIncomeSource) {
			return { error: "Income source not found", message: "Income source not found", data: null };
		}

		const updatedIncome = await prisma.income.update({
			where: {
				id,
				userId: user.id, // Ensure user owns this income
			},
			data: {
				amount: formData.amount,
				income_name: formData.income_name,
				frequency: formData.frequency,
				incomeSourceId: matchedIncomeSource.id,
			},
			include: {
				incomeSource: true,
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
