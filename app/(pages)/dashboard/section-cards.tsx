"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
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
		return { percentage: 100, isPositive: true, formatted: "+100%" };
	}

	const change = ((current - previous) / previous) * 100;

	// Limit percentage to ±100%
	const cappedChange = Math.max(-100, Math.min(100, change));
	const isPositive = cappedChange >= 0;
	const formatted = `${isPositive ? "+" : ""}${cappedChange.toFixed(1)}%`;

	return {
		percentage: cappedChange,
		isPositive,
		formatted,
	};
};

/**
 * Filters data by specific date (year, month, and day)
 * @param items - Array of items with createdAt field
 * @param year - Year to filter
 * @param month - Month to filter (1-12)
 * @param day - Day to filter (1-31)
 * @returns Filtered items
 */
const filterByDay = <T extends { createdAt: Date | string }>(
	items: T[],
	year: number,
	month: number,
	day: number
): T[] => {

	return items.filter((item) => {
		const date = new Date(item.createdAt);
		return (
			date.getFullYear() === year &&
			date.getMonth() === month - 1 && // getMonth() returns 0-11
			date.getDate() === day
		);
	});
};

/**
 * Calculates totals for current day vs previous day
 */
const calculateDailyTotals = (data: {
	incomes?: Array<{ amount: number; createdAt: Date | string }>;
	expenses?: Array<{ amount: number; createdAt: Date | string }>;
	savings?: Array<{ currentAmount: number; createdAt: Date | string }>;
}) => {
	const now = new Date();
	const currentDay = now.getDate();
	const currentMonth = now.getMonth() + 1; // 1-12
	const currentYear = now.getFullYear();

	// Calculate previous day (handles month and year boundaries)
	const previousDate = new Date(now);
	previousDate.setDate(previousDate.getDate() - 1);
	const previousDay = previousDate.getDate();
	const previousMonth = previousDate.getMonth() + 1; // 1-12
	const previousYear = previousDate.getFullYear();

	// Current day totals
	const currentIncome =
		filterByDay(data.incomes || [], currentYear, currentMonth, currentDay).reduce(
			(sum, item) => sum + item.amount,
			0
		);
	const currentExpenses =
		filterByDay(data.expenses || [], currentYear, currentMonth, currentDay).reduce(
			(sum, item) => sum + item.amount,
			0
		);
	const currentSavings =
		filterByDay(data.savings || [], currentYear, currentMonth, currentDay).reduce(
			(sum, item) => sum + item.currentAmount,
			0
		);
	const currentBalance = (currentIncome - currentExpenses - currentSavings);

	// Previous day totals
	const previousIncome =
		filterByDay(data.incomes || [], previousYear, previousMonth, previousDay).reduce(
			(sum, item) => sum + item.amount,
			0
		);
	const previousExpenses =
		filterByDay(data.expenses || [], previousYear, previousMonth, previousDay).reduce(
			(sum, item) => sum + item.amount,
			0
		);
	const previousSavings =
		filterByDay(data.savings || [], previousYear, previousMonth, previousDay).reduce(
			(sum, item) => sum + item.currentAmount,
			0
		);
	const previousBalance = (previousIncome - previousExpenses - previousSavings);

	console.log("previousIncome", previousIncome);
	console.log('currentIncome', currentIncome);

	return {
		income: calculatePercentageChange(currentIncome, previousIncome),
		expenses: calculatePercentageChange(currentExpenses, previousExpenses),
		savings: calculatePercentageChange(currentSavings, previousSavings),
		balance: calculatePercentageChange(currentBalance, previousBalance),
	};
};

export function SectionCards() {
	const [totalIncome, setTotalIncome] = useState<number>(0);
	const [totalSavings, setTotalSavings] = useState<number>(0);
	const [totalExpenses, setTotalExpenses] = useState<number>(0);
	const [remainingBalance, setRemainingBalance] = useState<number>(0);
	const { data, isLoading, isError, isSuccess } = useQuery({
		queryKey: ["summary"],
		queryFn: async () => await getSummary(),
	});

	console.log("incomeQuery", data?.data, isLoading, isError);

	// biome-ignore lint/correctness/useExhaustiveDependencies: data and isSuccess are the only dependencies needed
	useEffect(() => {
		if (data?.data && !data.error) {
			// getUserInfo returns a single user object, not an array
			const userInfo = data.data;

			// Calculate values directly from data to avoid stale state issues
			const calculatedIncome =
				userInfo.incomes?.reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0) ||
				0;
			const calculatedExpenses =
				userInfo.expenses?.reduce(
					(acc: number, curr: { amount: number }) => acc + curr.amount,
					0
				) || 0;
			const calculatedSavings =
				userInfo.savings?.reduce(
					(acc: number, curr: { currentAmount: number }) => acc + curr.currentAmount,
					0
				) || 0;
			const calculatedBalance = calculatedIncome - calculatedExpenses - calculatedSavings;

			// Set all state values at once
			setTotalIncome(calculatedIncome);
			setTotalExpenses(calculatedExpenses);
			setTotalSavings(calculatedSavings);
			setRemainingBalance(calculatedBalance);
		}

		console.log("fetching");
	}, [data, isSuccess]);

	console.log("remainingBalance", remainingBalance);

	const percentageChanges = useMemo(() => {
		if (!data?.data) {
			return {
				income: { percentage: 0, isPositive: true, formatted: "0%" },
				expenses: { percentage: 0, isPositive: true, formatted: "0%" },
				savings: { percentage: 0, isPositive: true, formatted: "0%" },
				balance: { percentage: 0, isPositive: true, formatted: "0%" },
			};
		}
		return calculateDailyTotals(data.data);
	}, [data]);

	const remainingBalanceFn = () => {
		if (remainingBalance > 0) {
			return (
				<>
					<div className="line-clamp-1 flex gap-2 font-medium">
						<p className="text-green-500">Good financial position</p>
					</div>
					<div className="text-muted-foreground">You have a positive remaining balance</div>
				</>
			);
		}
		if (remainingBalance <= 0) {
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
						{isLoading ? <Skeleton className="w-full h-10 bg-gray-200" /> : `₱${totalIncome.toLocaleString()}`}
					</CardTitle>

					<CardAction>
						<Badge variant="outline" className={percentageChanges.income.isPositive ? "" : "border-red-500"}>
							{percentageChanges.income.isPositive ? (
								<IconTrendingUp className="text-green-500" />
							) : (
								<IconTrendingDown className="text-red-500" />
							)}
							{percentageChanges.income.formatted}
						</Badge>
					</CardAction>
				</CardHeader>

				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Income {percentageChanges.income.isPositive ? <IconTrendingUp className="size-4 text-green-500" /> : <IconTrendingDown className="size-4 text-red-500" />}
					</div>
					<div className="text-muted-foreground">Total income added vs {isLoading ? <Skeleton className="w-full h-4 bg-gray-200" /> : "previous month"}</div>
				</CardFooter>
			</Card>

			{/** EXPENSES VS INCOME THIS MONTH */}

			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Expenses</CardDescription>
					<CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-3xl">
						{isLoading ? <Skeleton className="w-full h-10 bg-gray-200" /> : `₱${totalExpenses.toLocaleString()}`}
					</CardTitle>

					<CardAction>
						<Badge variant="outline" className={percentageChanges.expenses.isPositive ? "border-red-500" : ""}>
							{percentageChanges.expenses.isPositive ? (
								<IconTrendingUp className="text-red-500" />
							) : (
								<IconTrendingDown className="text-green-500" />
							)}
							{percentageChanges.expenses.formatted}
						</Badge>
					</CardAction>
				</CardHeader>

				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Expenses vs Income this month {percentageChanges.expenses.isPositive ? <IconTrendingUp className="size-4 text-red-500" /> : <IconTrendingDown className="size-4 text-green-500" />}
					</div>

					<div className="text-muted-foreground">Total expenses added</div>
				</CardFooter>
			</Card>

			{/**Savings */}
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Savings</CardDescription>
					<CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-3xl">
						{isLoading ? <Skeleton className="w-full h-10 bg-gray-200" /> : `₱${totalSavings.toLocaleString()}`}
					</CardTitle>

					<CardAction>
						<Badge variant="outline" className={percentageChanges.savings.isPositive ? "" : "border-red-500"}>
							{percentageChanges.savings.isPositive ? (
								<IconTrendingUp className="text-green-500" />
							) : (
								<IconTrendingDown className="text-red-500" />
							)}
							{percentageChanges.savings.formatted}
						</Badge>
					</CardAction>
				</CardHeader>

				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Savings {percentageChanges.savings.isPositive ? <IconTrendingUp className="size-4 text-green-500" /> : <IconTrendingDown className="size-4 text-red-500" />}
					</div>

					<div className="text-muted-foreground">Total savings across all accounts</div>
				</CardFooter>
			</Card>

			{/** YOUR REMAINING BALANCE */}
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Your Remaining Balance</CardDescription>
					<CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-3xl">
						{isLoading ? <Skeleton className="w-full h-10 bg-gray-200" /> : `₱${remainingBalance.toLocaleString()}`}
					</CardTitle>
					<CardAction>
						<Badge variant="outline" className={percentageChanges.balance.isPositive ? "" : "border-red-500"}>
							{percentageChanges.balance.isPositive ? (
								<IconTrendingUp className="text-green-500" />
							) : (
								<IconTrendingDown className="text-red-500" />
							)}
							{percentageChanges.balance.formatted}
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
