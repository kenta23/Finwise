import type { Metadata } from "next";
import { ExpenseCategoryBreakdown } from "@/app/(pages)/expenses/expense-category-breakdown";
import { ExpenseManager } from "@/app/(pages)/expenses/expense-manager";

export const metadata: Metadata = {
    title: "Finwise - Expenses",
    description: "Track your expenses and manage your finances.",
    applicationName: "Finwise",
    keywords: ["Finwise", "Budget", "Finance", "Income", "Expenses", "Savings", "Tracker", "Financial", "Management"],
    authors: [{ name: "Rm Ramos", url: "https://portfolio-rmramos.vercel.app/" }],
    creator: "Rm Ramos",
    publisher: "Rm Ramos",
    openGraph: {
        title: "Finwise - Expenses",
        description: "Track your expenses and manage your finances.",
        url: "https://finwise-budget-tracker.vercel.app/expenses",
        images: ["/images/logo.png"],
        countryName: "Philippines",
        emails: ["rustymiguelramos@gmail.com"],
        siteName: "Finwise",
        locale: "en_PH",
        type: "website",
    },
};
export default function Page() {
    // Expenses page with full functionality
    return (
        <div className="min-w-full flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <h1 className="text-3xl font-bold text-foreground">Expenses List</h1>
            <ExpenseManager />
            <ExpenseCategoryBreakdown />
        </div>
    );
}
