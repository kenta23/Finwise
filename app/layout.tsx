import { Toaster } from "@/components/ui/sonner";
import "./global.css";
import type { Metadata } from "next";
import type React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
	title: "Budgety",
	description: "Budgety is a budget management tool that helps you track your income and expenses.",
	applicationName: "Budgety",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				{/* Layout UI */}
				{/* Place children where you want to render a page or nested layout */}
				<SidebarProvider
					style={
						{
							"--sidebar-width": "calc(var(--spacing) * 72)",
							"--header-height": "calc(var(--spacing) * 12)",
						} as React.CSSProperties
					}
				>
					<AppSidebar variant="inset" />
					<SidebarInset>
						<SiteHeader />
						<div className="flex flex-1 flex-col">
							<div className="@container/main flex flex-1 flex-col gap-2 px-4 lg:px-6">
								{children}
							</div>
						</div>
					</SidebarInset>
				</SidebarProvider>

				<Toaster />
			</body>
		</html>
	);
}
