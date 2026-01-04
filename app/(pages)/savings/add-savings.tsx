import { IconLoader2, IconPlus } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startTransition, useEffect, useState } from "react";
import { toast } from "sonner";
import type z from "zod";
import { addSavings } from "@/app/actions/savings";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { frequencyOptions } from "@/data";
import { useIncomeStore } from "@/lib/store";
import type { SavingsItem } from "@/types";
import { savingsSchema } from "./data";
import type { OptimisticAction } from "./savings-manager";

interface AddSavingsProps {
	isAddDialogOpen: boolean;
	setIsAddDialogOpen: (isOpen: boolean) => void;
	resetForm: () => void;
	setFormData: (data: Omit<SavingsItem, "id" | "createdAt" | "updatedAt" | "userId">) => void;
	formData: Omit<SavingsItem, "id" | "createdAt" | "updatedAt" | "userId">;
	getErrorMessage: (field: string) => string | null | undefined;
	optimisticUpdate: (action: OptimisticAction) => void;
	setErrors: (errors: z.ZodError | null) => void;
}

export default function AddSavings({
	isAddDialogOpen,
	setErrors,
	optimisticUpdate,
	setIsAddDialogOpen,
	setFormData,
	formData,
	resetForm,
	getErrorMessage,
}: AddSavingsProps) {
	const incomedata = useIncomeStore((state) => state.income);
	const [incomeAmount, setIncomeAmount] = useState<number>(0);


	const [percentageOfIncome, setPercentageOfIncome] = useState<number>(0);
	const queryClient = useQueryClient();
	const { mutate: addSavingsMutation, isPending: isAddPending } = useMutation({
		mutationKey: ["addSavings"],
		mutationFn: async (
			savingsItem: Omit<SavingsItem, "id" | "createdAt" | "updatedAt" | "userId">
		) => await addSavings(savingsItem),
		onSuccess: (data) => {
			if (data.error) {
				toast.error(data.error, {
					description: data.message,
				});
			} else {
				toast.success("Successful!", {
					description: data.message,
				});
				queryClient.invalidateQueries({ queryKey: ["savings"] });
				queryClient.invalidateQueries({ queryKey: ["summary"] });
				queryClient.invalidateQueries({ queryKey: ["summary-redis"] });
			}
		},
		onError: (error) => {
			toast.error(error.message, {
				description: error.message,
			});
		},
	});

	const handleAddSavings = async () => {
		console.log("formData", formData);
		try {
			const parsedSavingsItem = savingsSchema.safeParse({
				...formData,
				currentAmount: Number(formData.currentAmount),
				goalAmount: Number(formData.goalAmount),
			});

			if (!parsedSavingsItem.success) {
				setErrors(parsedSavingsItem.error as z.ZodError);
				return;
			}

			setIsAddDialogOpen(false);
			resetForm();

			startTransition(() => {
				optimisticUpdate({
					type: "add",
					item: {
						...parsedSavingsItem.data,
						id: crypto.randomUUID(),
						bankName: parsedSavingsItem.data.bankName || "",
						accountNumber: parsedSavingsItem.data.accountNumber || "",
						notes: parsedSavingsItem.data.notes || "",
						createdAt: new Date(),
						updatedAt: new Date(),
					} as SavingsItem,
				});

				addSavingsMutation({
					...parsedSavingsItem.data,
					bankName: parsedSavingsItem.data.bankName || "",
					incomeId: parsedSavingsItem.data.incomeId || "",
				});
			});
		} catch (error) {
			console.error("Error adding savings", error);
		}
	};



	useEffect(() => {
		const income = incomedata.find((income) => income.id === formData.incomeId);
		if (income) {
			setIncomeAmount(Number(income.amount));
		} else {
			setIncomeAmount(0);
		}
		// Reset percentage when income source changes
		setPercentageOfIncome(0);
	}, [formData.incomeId, incomedata]);

	useEffect(() => {
		if (!isAddDialogOpen) {
			setPercentageOfIncome(0);
		}
	}, [isAddDialogOpen]);


	return (
		<div>
			<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
				<DialogTrigger asChild>
					<Button className="cursor-pointer" variant="default">
						<IconPlus />
						<span>Add Savings Account</span>
					</Button>
				</DialogTrigger>

				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Add New Savings Account</DialogTitle>
						<DialogDescription>
							Add a new savings account or goal to track your savings progress. Fill in the details
							below.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="savings-name">Savings Name</Label>
							<Input
								id="savings-name"
								placeholder="e.g., Emergency Fund, Vacation Savings"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							/>
							{getErrorMessage("name") && (
								<p className="text-sm text-red-500">{getErrorMessage("name")}</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="type">Savings Type</Label>
								<Select
									value={formData.type}
									onValueChange={(value) => setFormData({ ...formData, type: value })}
								>
									<SelectTrigger className="cursor-pointer w-full">
										<SelectValue placeholder="Select savings type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem className="cursor-pointer" value="emergency">
											Emergency Fund
										</SelectItem>
										<SelectItem className="cursor-pointer" value="vacation">
											Vacation
										</SelectItem>
										<SelectItem className="cursor-pointer" value="house">
											House Down Payment
										</SelectItem>
										<SelectItem className="cursor-pointer" value="car">
											Car Purchase
										</SelectItem>
										<SelectItem className="cursor-pointer" value="retirement">
											Retirement
										</SelectItem>
										<SelectItem className="cursor-pointer" value="wedding">
											Wedding
										</SelectItem>
										<SelectItem className="cursor-pointer" value="education">
											Education
										</SelectItem>
										<SelectItem className="cursor-pointer" value="other">
											Other
										</SelectItem>
									</SelectContent>
								</Select>
								{getErrorMessage("type") && (
									<p className="text-sm text-red-500">{getErrorMessage("type")}</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor="bankName">Bank Name</Label>
								<Input
									id="bankName"
									placeholder="e.g., BPI, BDO, Metrobank"
									value={formData.bankName}
									onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
								/>
								{getErrorMessage("bankName") && (
									<p className="text-sm text-red-500">{getErrorMessage("bankName")}</p>
								)}
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="accountNumber">Account Number (Optional)</Label>
							<Input
								id="accountNumber"
								placeholder="Enter account number"
								value={formData.accountNumber}
								onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
							/>
						</div>

						<div className="grid gap-2">
							<div className="grid gap-2">
								<Label htmlFor="incomeId">Fund to use</Label>
								<Select
									value={formData.incomeId}
									onValueChange={(value) => {
										setFormData({
											...formData,
											incomeId: value,
											amountToSave: 0,
										});
									}}
								>
									<SelectTrigger className="cursor-pointer w-full">
										<SelectValue placeholder="Select income" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Funds</SelectLabel>
											{incomedata.map((income) => (
												<SelectItem
													key={income.id}
													className="cursor-pointer"
													disabled={Number(formData.amountToSave) > Number(income.amount)}
													value={income.id.toString()}
												>
													{income.income_name}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
								{getErrorMessage("incomeId") && (
									<p className="text-sm text-red-500">{getErrorMessage("incomeId")}</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid  gap-2">
								<Label htmlFor="percentageOfIncome">% of Income to save (optional)</Label>
								<Input
									type="number"
									id="percentageOfIncome"
									placeholder="Enter percentage (e.g., 20%)"
									value={percentageOfIncome === 0 ? "" : percentageOfIncome}

									onChange={(e) => {
										const value = e.target.value.replace(/^0+/, "");
										const numValue = value === "" ? 0 : Number(value);

										if (numValue > 100) {
											toast.error("Percentage cannot be greater than 100");
											return;
										}
										setPercentageOfIncome(Number.isNaN(numValue) ? 0 : numValue);
										if (incomeAmount > 0 && numValue > 0) {
											setFormData({
												...formData,
												amountToSave: (incomeAmount * numValue) / 100,
											});
										} else {
											setFormData({
												...formData,
												amountToSave: 0,
											});
										}
									}}
								/>

							</div>
							<div className="grid gap-2">
								<Label htmlFor="amountToSave">Amount to Save</Label>
								<div className="relative">
									<span className="text-muted-foreground text-sm absolute left-2 top-1/2 -translate-y-1/2">
										₱
									</span>
									<Input
										id="amountToSave"
										type="number"
										min="0"
										step="1"
										placeholder="0"
										className="pl-6"
										value={formData.amountToSave === 0 ? "" : formData.amountToSave}

										onChange={(e) => {
											const value = e.target.value.replace(/^0+/, "");
											const numValue = value === "" ? 0 : Number(value);
											setFormData({
												...formData,
												amountToSave: Number.isNaN(numValue) ? 0 : numValue,
											});
											// Reset percentage when manually entering amount
											if (numValue > 0) {
												setPercentageOfIncome(0);
											}
											else {
												setPercentageOfIncome(0);
												setFormData({
													...formData,
													amountToSave: 0,
												});
											}
										}}
									/>
									{getErrorMessage("amountToSave") && (
										<p className="text-sm text-red-500">{getErrorMessage("amountToSave")}</p>
									)}
								</div>
							</div>
						</div>

						<div className="grid gap-4">
							<div className="grid gap-2">
								<Label htmlFor="frequency">Frequency</Label>
								<Select
									value={formData.frequency}
									onValueChange={(value) => setFormData({ ...formData, frequency: value })}
								>
									<SelectTrigger className="cursor-pointer w-full">
										<SelectValue placeholder="Select frequency" />
									</SelectTrigger>
									<SelectContent>
										{frequencyOptions.map((fr) => (
											<SelectItem key={fr.value} className="cursor-pointer" value={fr.value}>
												{fr.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{getErrorMessage("frequency") && (
									<p className="text-sm text-red-500">{getErrorMessage("frequency")}</p>
								)}
							</div>
						</div>


						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="currentAmount">Current Amount</Label>
								<div className="relative">
									<span className="text-muted-foreground text-sm absolute left-2 top-1/2 -translate-y-1/2">
										₱
									</span>
									<Input
										id="currentAmount"
										type="number"
										min="0"
										step="1"
										placeholder="0"
										className="pl-6"
										value={formData.currentAmount || ""}
										onChange={(e) => {
											// Remove leading zeros from the input
											const value = e.target.value.replace(/^0+/, "");
											// If value is empty after removing leading zeros, set to 0
											// Otherwise, convert to number
											const numValue = value === "" ? 0 : Number(value);
											setFormData({
												...formData,
												currentAmount: Number.isNaN(numValue) ? 0 : numValue,
											});
										}}
									/>
								</div>
								{getErrorMessage("currentAmount") && (
									<p className="text-sm text-red-500">{getErrorMessage("currentAmount")}</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor="goalAmount">Goal Amount</Label>
								<div className="relative">
									<span className="text-muted-foreground text-sm absolute left-2 top-1/2 -translate-y-1/2">
										₱
									</span>
									<Input
										id="goalAmount"
										type="number"
										min="1"
										step="1"
										placeholder="0"
										className="pl-6"
										value={formData.goalAmount || ""}
										onChange={(e) => {
											// Remove leading zeros from the input
											const value = e.target.value.replace(/^0+/, "");
											// If value is empty after removing leading zeros, set to 1
											// Otherwise, convert to number
											const numValue = value === "" ? 0 : Number(value);
											setFormData({
												...formData,
												goalAmount: Number.isNaN(numValue) ? 0 : numValue,
											});
										}}
									/>
								</div>
								{getErrorMessage("goalAmount") && (
									<p className="text-sm text-red-500">{getErrorMessage("goalAmount")}</p>
								)}
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="notes">Notes (Optional)</Label>
							<Textarea
								id="notes"
								placeholder="Add any additional notes about this savings account..."
								value={formData.notes}
								onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
								rows={3}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setIsAddDialogOpen(false);
								resetForm();
							}}
						>
							Cancel
						</Button>
						<Button className="cursor-pointer" onClick={handleAddSavings} disabled={isAddPending}>
							{isAddPending ? <IconLoader2 className="animate-spin" size={16} /> : "Add Savings"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
