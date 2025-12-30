"use client";

import type { Metadata } from "next";
import { IncomeManager } from "@/app/(pages)/income/income-manager";

export const metadata: Metadata = {
    title: "Finwise - Income",
    description: "Track your income and manage your finances.",
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
        title: "Finwise - Income",
        description: "Track your income and manage your finances.",
        url: "https://finwise-budget-tracker.vercel.app/income",
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
            <h1 className="text-3xl font-bold text-foreground">Track Your Income</h1>
            <IncomeManager />
        </div>
    );
}
