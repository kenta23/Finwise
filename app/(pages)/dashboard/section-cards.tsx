"use client";

import { IconTrendingUp } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getSummary } from "@/app/actions/income";
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
	const [totalExpenses, setTotalExpenses] = useState<number>(0);
	const [remainingBalance, setRemainingBalance] = useState<number>(0);
	const { data, isLoading, isError, isFetching, isSuccess } = useQuery({
		queryKey: ["summary"],
		queryFn: async () => await getSummary(),
	});

	console.log("incomeQuery", data?.data, isLoading, isError);


	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (data?.data && !data.error) {
			// getUserInfo returns a single user object, not an array
			const userInfo = data.data;

			// Calculate values directly from data to avoid stale state issues
			const calculatedIncome = userInfo.incomes?.reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0) || 0;
			const calculatedExpenses = userInfo.expenses?.reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0) || 0;
			const calculatedSavings = userInfo.savings?.reduce((acc: number, curr: { currentAmount: number }) => acc + curr.currentAmount, 0) || 0;
			const calculatedBalance = calculatedIncome - calculatedExpenses - calculatedSavings;

			// Set all state values at once
			setTotalIncome(calculatedIncome);
			setTotalExpenses(calculatedExpenses);
			setTotalSavings(calculatedSavings);
			setRemainingBalance(calculatedBalance);
		}

		console.log('fetching');

	}, [data, isSuccess]);

	console.log("remainingBalance", remainingBalance);


	const remainingBalanceFn = () => {
		if (remainingBalance > 0) {
			return (<>
				<div className="line-clamp-1 flex gap-2 font-medium">
					<p className="text-green-500">Good financial position</p>
				</div>
				<div className="text-muted-foreground">You have a positive remaining balance</div>
			</>)
		}
		if (remainingBalance <= 0) {
			return (<>
				<div className="line-clamp-1 flex gap-2 font-medium">
					<p className="text-red-500">Negative remaining balance</p>
				</div>
				<div className="text-muted-foreground">Be careful, you are in a bad financial position</div>
			</>)
		}
		return null;
	}

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
						₱{totalExpenses.toLocaleString()}
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
						₱{remainingBalance.toLocaleString()}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							+4.5%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					{remainingBalanceFn()}
				</CardFooter>
			</Card>
		</div>
	);
}
