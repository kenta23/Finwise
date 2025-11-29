import { Metadata } from "next";
import { ExpenseManager } from "@/app/expenses/expense-manager";
import { ExpenseCategoryBreakdown } from "@/app/expenses/expense-category-breakdown";

export const metadata: Metadata = {
    title: "Budgety - Expenses List",
    description: "Expenses of your budget",
    applicationName: "Budgety",
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