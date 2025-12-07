import { Toaster } from "@/components/ui/sonner";
import "./global.css";
import type { Metadata } from "next";
import type React from "react";
import Providers from "./providers";


export const metadata: Metadata = {
	title: "Budgety",
	description: "Budgety is a budget management tool that helps you track your income and expenses.",
	applicationName: "Budgety",
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
