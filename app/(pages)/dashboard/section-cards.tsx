"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getSummary } from "@/app/actions/income";
import { getSummaryFromRedis } from "@/app/actions/query";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Calculates percentage change between two values
 * @param current - Current period value
 * @param previous - Previous period value
 * @returns Object with percentage, isPositive, and formatted string
 */
const calculatePercentageChange = (
	current: number,
	previous: number
): { percentage: number; isPositive: boolean; formatted: string } => {
	console.log("current percentage change", current);
	console.log("previous percentage change", previous);
	// Handle edge cases
	if (previous === 0) {
		if (current === 0) {
			return { percentage: 0, isPositive: true, formatted: "0%" };
		}
	}

	const change = ((current - previous) / previous) * 100;
	const isPositive = change >= 0;
	const formatted = `${isPositive ? "+" : ""}${change.toFixed(1)}%`;

	return {
		percentage: change,
		isPositive,
		formatted,
	};
};



export function SectionCards() {
	const [totalIncome, setTotalIncome] = useState<{
		percentage: number;
		isPositive: boolean;
		formatted: string;
	}>({ percentage: 0, isPositive: true, formatted: "0%" });
	const [totalSavings, setTotalSavings] = useState<{
		percentage: number;
		isPositive: boolean;
		formatted: string;
	}>({ percentage: 0, isPositive: true, formatted: "0%" });
	const [totalExpenses, setTotalExpenses] = useState<{
		percentage: number;
		isPositive: boolean;
		formatted: string;
	}>({ percentage: 0, isPositive: true, formatted: "0%" });
	const [remainingBalance, setRemainingBalance] = useState<{
		percentage: number;
		isPositive: boolean;
		formatted: string;
	}>({ percentage: 0, isPositive: true, formatted: "0%" });
	const { data, isLoading, isError, isSuccess } = useQuery({
		queryKey: ["summary"],
		queryFn: async () => await getSummary(),
	});

	const {
		data: cachedData,
		isLoading: isLoadingCached,
		isError: isErrorCached,
		isSuccess: isSuccessCached,
	} = useQuery({
		queryKey: ["summary-redis"],
		queryFn: async () => await getSummaryFromRedis() as { income: number; expenses: number; savings: number; balance: number },
	});



	// biome-ignore lint/correctness/useExhaustiveDependencies: data and isSuccess are the only dependencies needed
	useEffect(() => {
		if (data?.data && !data.error) {
			// getUserInfo returns a single user object, not an array
			const userInfo = data.data[0];
			const summary = data.data[1];



			if (cachedData) {
				const incomePercentage = calculatePercentageChange(summary.income, cachedData?.income || 0);
				const expensesPercentage = calculatePercentageChange(summary.expenses, cachedData?.expenses || 0);
				const savingsPercentage = calculatePercentageChange(summary.savings, cachedData?.savings || 0);
				const balancePercentage = calculatePercentageChange(summary.balance, cachedData?.balance || 0);


				// Set all state values at once
				setTotalIncome(incomePercentage);
				setTotalExpenses(expensesPercentage);
				setTotalSavings(savingsPercentage);
				setRemainingBalance(balancePercentage);
			}
			else {
				const incomePercentage = calculatePercentageChange(summary.income, 0);
				const expensesPercentage = calculatePercentageChange(summary.expenses, 0);
				const savingsPercentage = calculatePercentageChange(summary.savings, 0);
				const balancePercentage = calculatePercentageChange(summary.balance, 0);

				setTotalIncome(incomePercentage);
				setTotalExpenses(expensesPercentage);
				setTotalSavings(savingsPercentage);
				setRemainingBalance(balancePercentage);
			}
		}

		console.log("fetching");
	}, [data, cachedData]);

	console.log("remainingBalance", remainingBalance);


	const remainingBalanceFn = () => {
		if (data?.data[1].balance > 0) {
			return (
				<>
					<div className="line-clamp-1 flex gap-2 font-medium">
						<p className="text-green-500">Good financial position</p>
					</div>
					<div className="text-muted-foreground">You have a positive remaining balance</div>
				</>
			);
		}
		if (data?.data[1].balance <= 0) {
			return (
				<>
					<div className="line-clamp-1 flex gap-2 font-medium">
						<p className="text-red-500">Negative remaining balance</p>
					</div>
					<div className="text-muted-foreground">
						Be careful, you are in a bad financial position
					</div>
				</>
			);
		}
		return null;
	};



	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Total Income</CardDescription>
					<CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-3xl">
						{isLoading ? (
							<Skeleton className="w-full h-10 bg-gray-200" />
						) : (
							`₱${data?.data[1].income.toLocaleString()}`
						)}
					</CardTitle>

					<CardAction>
						<Badge variant="outline" className={totalIncome.isPositive ? "" : "border-red-500"}>
							{totalIncome.isPositive ? (
								<IconTrendingUp className="text-green-500" />
							) : (
								<IconTrendingDown className="text-red-500" />
							)}
							{totalIncome.formatted}
						</Badge>
					</CardAction>
				</CardHeader>

				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Income{" "}
						{totalIncome.isPositive ? (
							<IconTrendingUp className="size-4 text-green-500" />
						) : (
							<IconTrendingDown className="size-4 text-red-500" />
						)}
					</div>
					<div className="text-muted-foreground">
						Total current income vs {" "}
						{isLoading ? <Skeleton className="w-full h-4 bg-gray-200" /> : "previous"}
					</div>
				</CardFooter>
			</Card>

			{/** EXPENSES VS INCOME THIS MONTH */}

			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Expenses</CardDescription>
					<CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-3xl">
						{isLoading ? (
							<Skeleton className="w-full h-10 bg-gray-200" />
						) : (
							`₱${data?.data[1].expenses.toLocaleString()}`
						)}
					</CardTitle>

					<CardAction>
						<Badge variant="outline" className={totalExpenses.isPositive ? "border-red-500" : ""}>
							{totalExpenses.isPositive ? (
								<IconTrendingUp className="text-red-500" />
							) : (
								<IconTrendingDown className="text-green-500" />
							)}
							{totalExpenses.formatted}
						</Badge>
					</CardAction>
				</CardHeader>

				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Expenses vs Income this month{" "}
						{totalExpenses.isPositive ? (
							<IconTrendingUp className="size-4 text-red-500" />
						) : (
							<IconTrendingDown className="size-4 text-green-500" />
						)}
					</div>

					<div className="text-muted-foreground">Total expenses added</div>
				</CardFooter>
			</Card>

			{/**Savings */}
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Savings</CardDescription>
					<CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-3xl">
						{isLoading ? (
							<Skeleton className="w-full h-10 bg-gray-200" />
						) : (
							`₱${data?.data[1].savings.toLocaleString()}`
						)}
					</CardTitle>

					<CardAction>
						<Badge variant="outline" className={totalSavings.isPositive ? "" : "border-red-500"}>
							{totalSavings.isPositive ? (
								<IconTrendingUp className="text-green-500" />
							) : (
								<IconTrendingDown className="text-red-500" />
							)}
							{totalSavings.formatted}
						</Badge>
					</CardAction>
				</CardHeader>

				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Savings{" "}
						{totalSavings.isPositive ? (
							<IconTrendingUp className="size-4 text-green-500" />
						) : (
							<IconTrendingDown className="size-4 text-red-500" />
						)}
					</div>

					<div className="text-muted-foreground">Total savings across all accounts</div>
				</CardFooter>
			</Card>

			{/** YOUR REMAINING BALANCE */}
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Your Remaining Balance</CardDescription>
					<CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-3xl">
						{isLoading ? (
							<Skeleton className="w-full h-10 bg-gray-200" />
						) : (
							`₱${data?.data[1].balance.toLocaleString()}`
						)}
					</CardTitle>
					<CardAction>
						<Badge
							variant="outline"
							className={remainingBalance.isPositive ? "" : "border-red-500"}
						>
							{remainingBalance.isPositive ? (
								<IconTrendingUp className="text-green-500" />
							) : (
								<IconTrendingDown className="text-red-500" />
							)}
							{remainingBalance.formatted}
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					{isLoading ? <Skeleton className="w-full h-4 bg-gray-200" /> : remainingBalanceFn()}
				</CardFooter>
			</Card>
		</div>
	);
}
