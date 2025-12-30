"use client";

import { IconEdit, IconEye, IconPlus, IconTrash } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { getCategories, getExpenses } from "@/app/actions/expenses";
import { Skeleton } from "@/components/ui/skeleton";
import type { categoryType } from "@/types";
import { categories } from "../../../data";

const schema = z.object({
	categoryId: z
		.number({ error: "Please select a category" })
		.refine((value) => categories.some((item) => item.id === value), {
			message: "Please select a category",
		}),
	categoryName: z.string().min(1, {
		message: "Category name is required",
	}),
});

export default function ExpenseCategory() {
	const [error, setError] = useState<z.ZodError | null>(null);

	const {
		data: categoriesData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["expenses-categories"],
		queryFn: async () => getCategories(),
	});

	console.log("error issues", error);

	console.log("categoriesData", categoriesData);

	if (isLoading) {
		return (
			<div className="w-full h-auto py-3">
				<h3 className="text-lg mb-4 font-semibold text-muted-foreground">Expenses Categories</h3>



				<div className="col-span-12 gap-4 grid grid-cols-12 w-full">
					{Array.from({ length: 6 }).map((_, index) => (
						<div key={index} className="col-span-12 flex w-full md:col-span-6 lg:col-span-4 items-center justify-between lg:gap-6 gap-4 p-4 rounded-lg">
							<Skeleton className="flex bg-gray-200 flex-row items-center gap-4 w-full h-16" />
						</div>
					))}
				</div>

			</div>
		);
	}

	if (isError || categoriesData?.error) {
		return (
			<div className="w-full h-auto py-3">
				<h3 className="text-lg mb-4 font-semibold text-muted-foreground">Expenses Categories</h3>
				<div className="text-sm text-destructive">
					{categoriesData?.error || "Failed to load expenses"}
				</div>
			</div>
		);
	}

	return (
		<div className="w-full h-auto py-3">
			<h3 className="text-lg mb-4 font-semibold text-muted-foreground">Expenses Categories</h3>
			<div className="grid grid-cols-12 gap-2">
				{/**Fetch Categories here... */}
				<div className="col-span-12 gap-4 grid grid-cols-12 w-full">
					{categories.map((item: categoryType, index: number) => {
						// Safely map categories data with default empty array
						// const filteredCategories =
						// 	categoriesData?.data?.map((item: any) => {
						// 		return {
						// 			category: item.category,
						// 			amount: item.amount,
						// 		};
						// 	}) || [];

						const categories = categoriesData?.data?.find(
							(cat: { name: string }) => cat.name === item.name
						);

						if (!categories) return null;

						const categoriesMatched = {
							icon: item.icon,
							backgroundColor: item.backgroundColor,
							color: item.color,
						};

						const categoryAmount =
							categories?.expenses.reduce(
								(acc: number, curr: { amount: number }) => acc + curr.amount,
								0
							) || 0;

						const getCategoryTotal = (category: { expenses: { amount: number }[] }) =>
							category.expenses.reduce((sum, expense) => sum + expense.amount, 0);

						const totalExpenses =
							categoriesData?.data?.reduce(
								(sum, category) => sum + getCategoryTotal(category),
								0
							) ?? 0;

						console.log("totalExpenses", totalExpenses);
						const percentage = totalExpenses > 0 ? (categoryAmount / totalExpenses) * 100 : 0;

						return (
							//category name, % of total expenses, total expenses
							<div
								key={`${item.id}-${index}`}
								className="group flex col-span-12 md:col-span-6 lg:col-span-4 items-center justify-between lg:gap-6 gap-4 bg-background border border-border p-4 rounded-lg"
							>
								<div className="flex flex-row items-center gap-4 w-full">
									{/** ICON HERE */}
									<div
										style={{ backgroundColor: categoriesMatched.backgroundColor }}
										className="rounded-xl relative p-2 size-12 flex items-center justify-center cursor-pointer"
									>
										{
											<categoriesMatched.icon
												size={24}
												color={categoriesMatched.color}
												className="cursor-pointer"
											/>
										}
									</div>

									<div className="flex flex-col flex-1">
										<p className="text-md font-medium">{item.name}</p>
										<p className="text-sm font-normal text-gray-500">
											{percentage.toFixed(1)}% of total expenses
										</p>
									</div>

									<div className="flex shrink-0 items-center gap-2">
										<h6 className="text-md font-semibold text-foreground">
											₱{categoryAmount.toLocaleString()}
										</h6>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
