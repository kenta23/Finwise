import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const incomeSchema = z.object({
	amount: z.number().positive("Amount must be greater than 0"),
	source: z.string().min(1, "Please select an income source"),
	frequency: z.string().min(1, "Please select a frequency"),
	name: z.string().min(1, "Income name is required"),
});

const expenseSchema = z.object({
	amount: z.number().positive("Amount must be greater than 0"),
	category: z.enum(["food", "travel", "entertainment", "other"]),
	description: z.string().min(1, "Description is required"),
});

type incomeData = z.infer<typeof incomeSchema>;
type expenseData = z.infer<typeof expenseSchema>;

export async function POST(request: Request) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const { income, expense } = await request.json();

	console.log("income", income);

	if (income) {
		const incomeData = incomeSchema.safeParse({
			amount: income[0].amount,
			source: income[0].source,
			frequency: income[0].frequency,
			name: income[0].name,
		});

		if (!incomeData.success) {
			console.log("incomeData error", incomeData.error);
			return NextResponse.json({ error: incomeData.error.message }, { status: 400 });
		}
		try {
			const newIncome = await prisma.income.create({
				data: {
					amount: incomeData.data.amount,
					source: incomeData.data.source,
					frequency: incomeData.data.frequency,
					income_name: incomeData.data.name,
					userId: session.user.id,
				},
			});
			console.log("new income", newIncome);

			return NextResponse.json(
				{ message: "Income added successfully", income: newIncome },
				{ status: 200 }
			);
		} catch (error) {
			console.error("Error adding income", error);
			return NextResponse.json({ error: "Failed to add income" }, { status: 500 });
		}
	}

	if (expense) {
		const expenseData = expenseSchema.safeParse(expense);

		if (!expenseData.success) {
			return NextResponse.json({ error: expenseData.error.message }, { status: 400 });
		}

		const newExpense = await prisma.expenses.create({
			data: {
				amount: expenseData.data.amount,
				category: expenseData.data.category,
				description: expenseData.data.description,
				userId: session.user.id,
			},
		});
		revalidatePath("/", "layout");
		return NextResponse.json(
			{ message: "Expense added successfully", expense: newExpense },
			{ status: 200 }
		);
	}

	return NextResponse.json({ message: "No data received" }, { status: 400 });
}

export async function GET(request: Request) {}
