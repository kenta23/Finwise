import type { Metadata } from "next";
import ExpenseCategory from "@/app/(pages)/dashboard/expense-category";
import { IncomeChart } from "@/app/(pages)/dashboard/income-chart";
import { SectionCards } from "@/app/(pages)/dashboard/section-cards";
import { DataTable } from "@/components/data-table";


export const metadata: Metadata = {
	title: "Finwise - Dashboard",
	description: "Finwise is a budget management tool that helps you track your income and expenses.",
	applicationName: "Finwise",
	keywords: ["Finwise", "Budget", "Finance", "Income", "Expenses", "Savings", "Tracker", "Financial", "Management"],
	authors: [{ name: "Rm Ramos", url: "https://portfolio-rmramos.vercel.app/" }],
	creator: "Rm Ramos",
	publisher: "Rm Ramos",
	openGraph: {
		title: "Finwise - Dashboard",
		description: "Finwise is a budget management tool that helps you track your income and expenses.",
		url: "https://finwise-budget-tracker.vercel.app/dashboard",
		images: ["/images/logo.png"],
		countryName: "Philippines",
		emails: ["rustymiguelramos@gmail.com"],
		siteName: "Finwise",
		locale: "en_PH",
		type: "website",
	},
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
