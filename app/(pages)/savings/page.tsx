import type { Metadata } from "next";
import { SavingsManager } from "./savings-manager";

export const metadata: Metadata = {
    title: "Finwise - Savings",
    description: "Track your savings and manage your finances.",
    applicationName: "Finwise",
    keywords: [
        "Finwise",
        "Budget",
        "Finance",
        "Income",
        "Expenses",
        "Savings",
        "Tracker",
        "Financial",
        "Management",
    ],
    authors: [{ name: "Rm Ramos", url: "https://portfolio-rmramos.vercel.app/" }],
    creator: "Rm Ramos",
    publisher: "Rm Ramos",
    openGraph: {
        title: "Finwise - Savings",
        description: "Track your expenses and manage your finances.",
        url: "https://finwise-budget-tracker.vercel.app/savings",
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
            <h1 className="text-3xl font-bold text-foreground">Plan your savings</h1>
            <SavingsManager />
        </div>
    );
}
