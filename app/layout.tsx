import { Toaster } from "@/components/ui/sonner";
import "./global.css";
import type { Metadata } from "next";
import type React from "react";
import Providers from "./providers";


export const metadata: Metadata = {
	title: "Finwise",
	description: "Finwise is a budget management tool that helps you track your income and expenses.",
	applicationName: "Finwise",
	keywords: ["Finwise", "Budget", "Finance", "Income", "Expenses", "Savings", "Tracker", "Financial", "Management"],
	authors: [{ name: "Rm Ramos", url: "https://portfolio-rmramos.vercel.app/" }],
	creator: "Rm Ramos",
	publisher: "Rm Ramos",
	openGraph: {
		title: "Finwise",
		description: "Finwise is a budget management tool that helps you track your income and expenses.",
		url: "https://finwise-budget-tracker.vercel.app/",
		images: ["/images/logo.png"],
		countryName: "Philippines",
		emails: ["rustymiguelramos@gmail.com"],
		siteName: "Finwise",
		locale: "en_PH",
		type: "website",
	},
};


export default function RootLayout({ children }: { children: Readonly<React.ReactNode> }) {
	return (
		<html lang="en">

			<body>
				<Providers>
					{children}
					<Toaster richColors />
				</Providers>
			</body>
		</html>
	);
}
