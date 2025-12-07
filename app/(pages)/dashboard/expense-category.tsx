"use client";

import { IconEdit, IconEye, IconPlus, IconTrash } from "@tabler/icons-react";
import { Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { categories, type categoryType } from "../../../data";
import { useQuery } from "@tanstack/react-query";
import { getExpenses } from "@/app/actions/expenses";

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
	const { data: categoriesData, isLoading, isError } = useQuery({
		queryKey: ["expenses-categories"],
		queryFn: async () => getExpenses(),
	})


	// const getCategories = useCallback(() => {
	// 	const getItem = localStorage.getItem("selectedCategory");
	// 	if (getItem) {
	// 		const parsedItem = JSON.parse(getItem) as { categoryId: number; categoryName: string }[];
	// 		setFetchCategories(parsedItem);
	// 	}
	// 	return [];
	// }, []);

	// useEffect(() => {
	// 	getCategories();
	// }, [getCategories]);





	console.log("error issues", error);


	if (isLoading) {
		return (
			<div className="w-full h-auto py-3">
				<h3 className="text-lg mb-4 font-semibold text-muted-foreground">Expenses Categories</h3>
				<div className="text-sm text-muted-foreground">Loading expenses...</div>
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
						const filteredCategories = categoriesData?.data?.map((item: any) => {
							return {
								category: item.category,
								amount: item.amount,
							}
						}) || [];

						const category = categories.find((cat) => cat.name === item.name);

						if (!category) return null;

						const categoriesMatched = {
							icon: category.icon,
							backgroundColor: category.backgroundColor,
							color: category.color,
						};

						const categoryAmount = filteredCategories.find((cat: any) => cat.category === item.name.toLowerCase())?.amount || 0;
						const totalExpenses = filteredCategories.reduce((acc: number, curr: any) => acc + curr.amount, 0);

						const percentage = totalExpenses > 0 ? (categoryAmount / totalExpenses) * 100 : 0;
						return (
							//category name, % of total expenses, total expenses
							<div
								key={`${item.id}-${index}`}
								className="group flex col-span-12 cursor-pointer hover:bg-muted/50 transition-all duration-300 hover:shadow-md md:col-span-6 lg:col-span-4 items-center justify-between lg:gap-6 gap-4 bg-background border border-border p-4 rounded-lg"
							>
								<div className="flex flex-row items-center gap-4 w-full group-hover:opacity-70 transition-opacity duration-300">
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
										<p className="text-sm font-normal text-gray-500">{percentage.toFixed(1)}% of total expenses</p>
									</div>

									<div className="flex shrink-0 items-center gap-2">
										<h6 className="text-md font-semibold text-foreground">₱{categoryAmount.toLocaleString()}</h6>
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
