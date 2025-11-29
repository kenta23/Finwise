"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
	const [totalIncome, setTotalIncome] = useState<number>(0);
	const [totalSavings, setTotalSavings] = useState<number>(0);
	// const expenses = localStorage.getItem("expenses");

	const updateIncome = () => {
		const income = localStorage.getItem("income");
		const total = income
			? JSON.parse(income).reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0)
			: 0;
		setTotalIncome(total);
	};

	const updateSavings = () => {
		const savings = localStorage.getItem("savings");
		const total = savings
			? JSON.parse(savings).reduce((acc: number, curr: { currentAmount: number }) => acc + curr.currentAmount, 0)
			: 0;
		setTotalSavings(total);
	};

	useEffect(() => {
		updateIncome();
		updateSavings();

		// Listen for income updates
		const handleIncomeUpdate = () => {
			updateIncome();
		};

		// Listen for savings updates
		const handleSavingsUpdate = () => {
			updateSavings();
		};

		window.addEventListener("incomeUpdated", handleIncomeUpdate);
		window.addEventListener("savingsUpdated", handleSavingsUpdate);

		return () => {
			window.removeEventListener("incomeUpdated", handleIncomeUpdate);
			window.removeEventListener("savingsUpdated", handleSavingsUpdate);
		};
	}, []);

	console.log("totalIncome", totalIncome);

	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Total Income</CardDescription>
					<CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-3xl">
						₱{totalIncome.toLocaleString()}
					</CardTitle>

					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							+12.5%
						</Badge>
					</CardAction>
				</CardHeader>

				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Income <IconTrendingUp className="size-4" />
					</div>
					<div className="text-muted-foreground">Total income added</div>
				</CardFooter>
			</Card>

			{/** EXPENSES VS INCOME THIS MONTH */}
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Expenses</CardDescription>
					<CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-3xl">
						$1,250.00
					</CardTitle>

					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							{/** INCOME / EXPENSES RATIO */}
							+12.5%
						</Badge>
					</CardAction>
				</CardHeader>

				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Expenses vs Income this month <IconTrendingUp className="size-4" />
					</div>

					<div className="text-muted-foreground">Total expenses added</div>
				</CardFooter>
			</Card>

			{/**Savings */}
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Savings</CardDescription>
					<CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-3xl">
						₱{totalSavings.toLocaleString()}
					</CardTitle>

					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							{/** SAVINGS RATIO */}
							{totalSavings > 0 ? "+" : ""}
						</Badge>
					</CardAction>
				</CardHeader>

				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Savings <IconTrendingUp className="size-4" />
					</div>

					<div className="text-muted-foreground">Total savings across all accounts</div>
				</CardFooter>
			</Card>


			{/** YOUR REMAINING BALANCE */}
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Your Remaining Balance</CardDescription>
					<CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-3xl">
						₱{totalIncome.toLocaleString()}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							+4.5%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						<p>You spent half of your income</p>
					</div>
					<div className="text-muted-foreground">Meets growth projections</div>
				</CardFooter>
			</Card>
		</div>
	);
}
