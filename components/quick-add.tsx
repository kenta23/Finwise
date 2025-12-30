"use client";
import { IconChevronDown, IconLoader2, IconPlus, IconTrash } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { quickAdd, submitNewIncome } from "@/app/actions/query";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categories, incomeSources } from "@/data";
import { useIncomeStore } from "@/lib/store";
import { type expenseType, Frequency, type incomeSourcesType } from "@/types";

export function QuickAddDialog({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}) {
	const { income: incomeFromStore } = useIncomeStore();

	const [income, setIncome] = useState<incomeSourcesType[]>([
		{
			amount: 0,
			source: "",
			income_name: "",
			frequency: Frequency.PER_MONTH,
		},
	]);
	const [expense, setExpense] = useState<expenseType>({
		amount: 0,
		category: "",
		description: "",
		fundIncome: "",
	});
	const queryClient = useQueryClient();

	const {
		data,
		mutateAsync: quickAddMutation,
		isPending,
		isError,
	} = useMutation({
		mutationFn: async (data: { income: incomeSourcesType[]; expense: expenseType }) =>
			quickAdd(data),
		onSettled: () => {
			setIsOpen(false);
		},
	});

	console.log("income", income, "expense", expense);

	async function handleExpenseSubmit(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		console.log("added expenses:", expense);

		if (expense.amount > 0 && expense.category && expense.description) {
			const res = await quickAddMutation({ income: [], expense });

			if (!res?.error) {
				toast.success("Expense added successfully", {
					description: res?.message,
				});
			} else {
				toast.error("Failed to add expense", {
					description: res?.error,
				});
				console.log("error", res?.error);
			}

			queryClient.invalidateQueries({ queryKey: ["expenses"] });
			queryClient.invalidateQueries({ queryKey: ["expenses-categories"] });
			queryClient.invalidateQueries({ queryKey: ["summary"] });
		}
	}

	async function handleIncomeSubmit(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();

		console.log("income", income);

		if (income.length > 0) {
			const res = await quickAddMutation({ income, expense });
			console.log("INCOME TO SUBMIT", income);

			if (!res?.error) {
				toast.success("Income added successfully", {
					description: res?.message,
				});
			} else {
				toast.error("Failed to add income", {
					description: res?.error,
				});
			}

			queryClient.invalidateQueries({ queryKey: ["income"] });
			queryClient.invalidateQueries({ queryKey: ["summary"] });
			queryClient.invalidateQueries({ queryKey: ["income-charts-data"] });
		}
	}

	// Render additional income forms (items 1-2, skipping the first one)
	const renderAdditionalIncomeForms = () => {
		return income.slice(1, 3).map((_item: incomeSourcesType, index: number) => {
			const actualIndex = index + 1; // Adjust index since we're slicing from position 1
			const amountToChange = income[actualIndex].amount;
			const sourceToChange = income[actualIndex].source;
			const frequencyToChange = income[actualIndex].frequency;

			return (
				<div key={`income-form-${actualIndex}`} className="grid grid-cols-12 gap-2 w-full">
					<div className="col-span-12 flex flex-col gap-3">
						<Label htmlFor={`income-name-${actualIndex}`}>Name</Label>
						<Input
							id={`income-name-${actualIndex}`}
							name={`income-name-${actualIndex}`}
							value={income[actualIndex].income_name}
							autoComplete="off"
							onChange={(e) => {
								const updated: incomeSourcesType[] = [...income];
								updated[actualIndex].income_name = e.target.value;
								setIncome(updated);
							}}
						/>
					</div>

					<div className="flex flex-col gap-3 col-span-6">
						<Label htmlFor={`income-amount-${actualIndex}`}>Amount</Label>
						<div className="relative">
							<span className="text-muted-foreground text-sm absolute left-2 top-1/2 -translate-y-1/2">
								₱
							</span>{" "}
							<Input
								type="number"
								min={0}
								name={`income-amount-${actualIndex}`}
								id={`income-amount-${actualIndex}`}
								autoComplete="off"
								onChange={(e) => {
									if (e.target.value.startsWith("0")) {
										e.target.value = e.target.value.slice(1);
									}
									const updated: incomeSourcesType[] = [...income];
									updated[actualIndex].amount = Number(e.target.value);
									setIncome(updated);
								}}
								value={amountToChange.toString()}
								className="pl-6"
							/>
						</div>
					</div>

					<div className="flex flex-col gap-3 col-span-3">
						<Label data-lpignore="true">Source</Label>

						<Select
							value={sourceToChange}
							onValueChange={(value) => {
								const updated: incomeSourcesType[] = [...income];
								updated[actualIndex].source = value;
								setIncome(updated);
							}}
						>
							<SelectTrigger
								id={`income-source-${actualIndex}`}
								className="w-full cursor-pointer"
								data-lpignore="true"
							>
								<SelectValue defaultValue={sourceToChange} placeholder="Select a source" />
							</SelectTrigger>

							<SelectContent className="cursor-pointer">
								<SelectGroup>
									<SelectLabel>Sources</SelectLabel>
									{incomeSources.map((source) => (
										<SelectItem className="cursor-pointer" value={source.name}>
											{source.name}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>

					<div className="flex flex-col self-end gap-3 col-span-3">
						<Label className="sr-only" data-lpignore="true">
							Frequency
						</Label>

						<Select
							value={frequencyToChange}
							onValueChange={(value) => {
								const updated: incomeSourcesType[] = [...income];

								updated[actualIndex].frequency = value as Frequency;
								setIncome(updated);
							}}
						>
							<SelectTrigger
								id={`income-frequency-${actualIndex}`}
								className="w-full cursor-pointer"
								data-lpignore="true"
							>
								<SelectValue defaultValue={frequencyToChange} placeholder="Select a type" />
							</SelectTrigger>

							<SelectContent>
								<SelectItem className="cursor-pointer" value="per-day">
									Per Day
								</SelectItem>
								<SelectItem className="cursor-pointer" value="per-month">
									Per Month
								</SelectItem>
								<SelectItem className="cursor-pointer" value="per-week">
									Per Week
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			);
		});
	};

	return (
		<Tabs defaultValue="income" className="flex w-full flex-col gap-6">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger className="cursor-pointer" value="income">
					Income
				</TabsTrigger>
				<TabsTrigger className="cursor-pointer" value="expense">
					Expense
				</TabsTrigger>
			</TabsList>

			<TabsContent value="income">
				<Card>
					<CardHeader>
						<CardTitle>Income</CardTitle>
						<CardDescription>
							Add a new income to your budget. Click save when you&apos;re done.
						</CardDescription>
					</CardHeader>

					{/**INCOME FORM */}
					<CardContent className="grid gap-6 max-h-[55vh] overflow-y-auto">
						{/** Scrollable income forms container */}
						<div className="flex flex-col gap-4 items-start w-full pr-2">
							{/**DEFAULT AMOUNT INPUT */}
							<div className="grid grid-cols-12 gap-3 w-full">
								<div className="col-span-12 flex flex-col gap-3">
									<Label htmlFor="income-name">Name</Label>
									<Input
										id="income-name"
										name="income-name"
										autoComplete="off"
										onChange={(e) => {
											const updated: incomeSourcesType[] = [...income];
											updated[0].income_name = e.target.value;
											setIncome(updated);
										}}
										value={income[0].income_name}
									></Input>
								</div>
								<div className="flex flex-col gap-3 col-span-6">
									<Label htmlFor="income-amount-0">Amount</Label>
									<div className="relative">
										<span className="text-muted-foreground text-sm absolute left-2 top-1/2 -translate-y-1/2">
											₱
										</span>{" "}
										<Input
											type="number"
											min={0}
											name="income-amount-0"
											id="income-amount-0"
											autoComplete="off"
											onChange={(e) => {
												//REMOVE 0 FROM THE START OF THE STRING
												if (e.target.value.startsWith("0")) {
													e.target.value = e.target.value.slice(1);
												}
												const updated: incomeSourcesType[] = [...income];
												updated[0].amount = Number(e.target.value);
												setIncome(updated);
											}}
											value={income[0].amount.toString()}
											className="pl-6"
										/>
									</div>
								</div>

								<div className="flex flex-col gap-3 col-span-3">
									<Label data-lpignore="true">Source</Label>

									<Select
										value={income[0].source}
										onValueChange={(value) => {
											const updated: incomeSourcesType[] = [...income];
											updated[0].source = value;
											setIncome(updated);
										}}
									>
										<SelectTrigger
											id="income-source-0"
											className="w-full cursor-pointer"

											aria-label="Select a source"
										>
											<SelectValue defaultValue={income[0].source} placeholder="Select a source" />
										</SelectTrigger>

										<SelectContent className="cursor-pointer">
											<SelectGroup>
												<SelectLabel className="sr-only">Sources</SelectLabel>
												{incomeSources.map((source) => (
													<SelectItem className="cursor-pointer" value={source.name}>
														{source.name}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
								</div>

								<div className="flex items-end self-end flex-col gap-3 col-span-3">
									<Label className="sr-only" data-lpignore="true">
										Frequency
									</Label>
									<Select
										value={income[0].frequency}
										onValueChange={(value) => {
											const updated: incomeSourcesType[] = [...income];
											updated[0].frequency = value as Frequency;
											setIncome(updated);
										}}
									>
										<SelectTrigger
											id="income-frequency-0"
											className="w-full cursor-pointer"
											data-lpignore="true"
										>
											<SelectValue defaultValue={income[0].frequency} placeholder="Select a type" />
										</SelectTrigger>

										<SelectContent>
											<SelectItem className="cursor-pointer" value="per-day">
												Per Day
											</SelectItem>
											<SelectItem className="cursor-pointer" value="per-month">
												Per Month
											</SelectItem>
											<SelectItem className="cursor-pointer" value="per-week">
												Per Week
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							{/**ANOTHER INCOME SOURCE */}
							{income.length > 1 && renderAdditionalIncomeForms()}
						</div>

						{/** ADD/REMOVE INCOME BUTTONS - Always visible */}
						<div className="flex gap-2 justify-between items-center w-full">
							<Button
								//set new income source by concatenating the current income array with a new income object
								onClick={() =>
									setIncome((prev) =>
										prev.length < 3
											? [
												...prev,
												{
													amount: 0,
													source: "salary",
													income_name: "",
													frequency: Frequency.PER_MONTH,
												} as (typeof prev)[number],
											]
											: prev
									)
								}
								color="#f23b2e"
								type="button"
								variant="ghost"
								className="w-fit cursor-pointer"
							>
								<IconPlus color="#00c951" />
								<span className="text-green-500">Add Income</span>
							</Button>

							{/**REMOVE INCOME BUTTON */}
							{income.length > 1 && (
								<Button
									onClick={() => setIncome((prev) => prev.slice(0, -1))}
									type="button"
									variant="ghost"
									className="w-fit cursor-pointer"
								>
									<IconTrash color="#f23b2e" />
									<span className="text-red-500">Remove Income</span>
								</Button>
							)}
						</div>

						{/**Display TOTAL */}
						<Card>
							<CardHeader>
								<CardTitle>Total</CardTitle>
								<CardDescription>Total amount of income added.</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-2xl font-bold">
									₱ {income.reduce((acc, curr) => acc + curr.amount, 0)}
								</p>
							</CardContent>
						</Card>
					</CardContent>
					<CardFooter>
						<Button
							type="button"
							disabled={isPending}
							onClick={(e) => handleIncomeSubmit(e)}
							className="w-full cursor-pointer"
						>
							{isPending ? <IconLoader2 className="animate-spin" /> : "Save changes"}
						</Button>
					</CardFooter>
				</Card>
			</TabsContent>

			{/** EXPENSE TAB */}
			<TabsContent value="expense">
				<Card>
					<CardHeader>
						<CardTitle>Expense</CardTitle>
						<CardDescription>
							Add a new expense to your budget. Click save when you&apos;re done.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-6">
						<div className="flex flex-col gap-3">
							<Label data-lpignore="true">Category</Label>
							<Select
								value={expense.category}
								onValueChange={(value) => setExpense({ ...expense, category: value })}
							>
								<SelectTrigger id="expense-category" className="w-full" data-lpignore="true">
									<SelectValue placeholder="Select a category" />
								</SelectTrigger>
								<SelectContent className="w-full">
									<SelectGroup>
										<SelectLabel>Categories</SelectLabel>
										{categories
											.filter((cat) => cat.name)
											.map((category) => (
												<SelectItem className="cursor-pointer" value={category.name}>
													{category.name}
												</SelectItem>
											))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>

						<div className="flex flex-col gap-3">
							<Label htmlFor="fund-income">Funds to use</Label>
							<Select
								value={expense.fundIncome}
								onValueChange={(value) => setExpense({ ...expense, fundIncome: value })}
							>
								<SelectTrigger id="fund-income" className="w-full" data-lpignore="true">
									<SelectValue placeholder="Select a fund" />
								</SelectTrigger>
								<SelectContent className="w-full">
									<SelectGroup>
										<SelectLabel>Funds</SelectLabel>
										{incomeFromStore.map((source) => (
											<SelectItem className="cursor-pointer" value={source.id.toString()}>
												{source.income_name}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>

						<div className="flex flex-col gap-3">
							<Label htmlFor="expense-description">Description</Label>
							<Input
								id="expense-description"
								name="expense-description"
								autoComplete="off"
								onChange={(e) => setExpense({ ...expense, description: e.target.value })}
								value={expense.description}
								placeholder="e.g., Lunch at restaurant, Gas for car"
								className="pl-6"
							/>
						</div>

						<div className="flex flex-col gap-3">
							<Label htmlFor="expense-amount">Amount</Label>
							<div className="relative">
								<span className="text-muted-foreground text-sm absolute left-2 top-1/2 -translate-y-1/2">
									₱
								</span>{" "}
								<Input
									id="expense-amount"
									name="expense-amount"
									type="number"
									min={0}
									autoComplete="off"
									onChange={(e) => setExpense({ ...expense, amount: Number(e.target.value) })}
									value={expense.amount || ""}
									className="pl-6"
								/>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							type="button"
							onClick={(e) => handleExpenseSubmit(e)}
							disabled={isPending}
							className="w-full cursor-pointer"
						>
							{isPending ? <IconLoader2 className="animate-spin" /> : "Save changes"}
						</Button>
					</CardFooter>
				</Card>
			</TabsContent>
		</Tabs>
	);
}
