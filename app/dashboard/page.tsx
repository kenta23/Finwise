import type { Metadata } from "next";
import ExpenseCategory from "@/app/dashboard/expense-category";
import { IncomeChart } from "@/app/dashboard/income-chart";
import { SectionCards } from "@/app/dashboard/section-cards";
import { DataTable } from "@/components/data-table";
import data from "@/data.json";

export const metadata: Metadata = {
	title: "Budgety - Dashboard",
	description: "Dashboard of your budget and income and expenses.",
	applicationName: "Budgety",
};

export default function Page() {
	return (
		<div className="min-w-full flex flex-col gap-4 py-4 md:gap-6 md:py-6">
			<SectionCards />
			<ExpenseCategory />
			<IncomeChart />
		</div>
	);
}
