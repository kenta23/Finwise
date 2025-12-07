"use client";

import { TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Pie, PieChart } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { getIncome } from "@/app/actions/income";

export const description = "A simple pie chart";

// Color mapping for income sources
const sourceColorMap: Record<string, string> = {
	salary: "#3b82f6",
	freelance: "#a855f7",
	investment: "#10b981",
	business: "#f97316",
	other: "#6366f1",
};

const chartConfig = {
	income: {
		label: "Income",
	},
	salary: {
		label: "Salary",
		color: "#12b53e",
	},
	freelance: {
		label: "Freelance",
		color: "#242526",
	},
	investments: {
		label: "Investments",
		color: "#242526",
	},
	business: {
		label: "Business",
		color: "#242526",
	},
	otherSources: {
		label: "Other Sources",
		color: "var chart-5)",
	},
} satisfies ChartConfig;



type incomeType = {
	source: string;
	id: string;
	amount: number;
	frequency: string;
	income_name: string;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
}[]


export function IncomeChart() {
	// const [incomeData, setIncomeData] = useState<
	// 	{ source: string; amount: number; frequency: string }[]
	// >([]);

	const { data: incomeData, isLoading, isError } = useQuery({
		queryKey: ["income-charts-data"],
		queryFn: async () => await getIncome(),
	})


	console.log("incomeData", incomeData);

	const mergedData = incomeData?.data?.reduce(
		(acc, curr) => {
			const existingSource = acc?.find((source: { source: string }) => source.source === curr.source);

			if (existingSource) {
				existingSource.amount += curr.amount;
			} else {
				acc.push(curr);
			}
			return acc;
		},
		[] as incomeType
	) || [];

	console.log("mergedData", mergedData);

	const chartData = mergedData?.map((item: { source: string; amount: number }) => ({
		source: item.source, // Capitalize first letter
		amount: item.amount,
		fill: sourceColorMap[item.source] || "#6b7280", // Default gray if not found
	}));

	console.log("chartData", chartData);
	console.log("incomeData", incomeData);

	return (
		<Card className="flex flex-col">
			<CardHeader className="items-center pb-0">
				<CardTitle>Sources of your Income</CardTitle>
				<CardDescription>Showing your income for each source you have added</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				{chartData && chartData?.length > 0 ? (
					<ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
						<PieChart>
							<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
							<Pie data={chartData} dataKey="amount" nameKey="source" />
						</PieChart>
					</ChartContainer>
				) : (
					<div className="flex items-center justify-center h-[250px] text-muted-foreground">
						No income data available. Add income sources to see the chart.
					</div>
				)}
			</CardContent>
			<CardFooter className="flex-col gap-2 text-sm">
				<div className="flex items-center gap-2 leading-none font-medium">
					Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
				</div>
				<div className="text-muted-foreground leading-none">
					Showing total visitors for the last 6 months
				</div>
			</CardFooter>
		</Card>
	);
}
