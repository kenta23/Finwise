import type { Metadata } from "next";
import ExpenseCategory from "@/app/dashboard/expense-category";
import { IncomeChart } from "@/app/dashboard/income-chart";
import data from '@/data.json';
import { SectionCards } from "@/app/dashboard/section-cards";
import { DataTable } from "@/components/data-table";


export const metadata: Metadata = {
	title: "Budgety",
	description: "Budgety is a budget management tool that helps you track your income and expenses.",
	applicationName: "Budgety",
};

export default function Page() {
	return (
		<div className="min-w-full flex flex-col gap-4 py-4 md:gap-6 md:py-6">
			<SectionCards />


			<ExpenseCategory />



			<IncomeChart />

			<DataTable data={data} />
		</div>

	);
}
