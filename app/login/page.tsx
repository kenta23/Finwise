import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/login/login-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
	title: "Finwise - Login",
	description: "Login to your Finwise account.",
	applicationName: "Finwise",
	keywords: ["Finwise", "Budget", "Finance", "Income", "Expenses", "Savings", "Tracker", "Financial", "Management"],
	authors: [{ name: "Rm Ramos", url: "https://portfolio-rmramos.vercel.app/" }],
	creator: "Rm Ramos",
	publisher: "Rm Ramos",
	openGraph: {
		title: "Finwise - Dashboard",
		description: "Finwise is a budget management tool that helps you track your income and expenses.",
		url: "https://finwise-budget-tracker.vercel.app/login",
		images: ["/images/logo.png"],
		countryName: "Philippines",
		emails: ["rustymiguelramos@gmail.com"],
		siteName: "Finwise",
		locale: "en_PH",
		type: "website",
	},
};

export default async function LoginPage() {
	// If user already has a session, redirect away from login
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect("/dashboard");
	}

	return (
		<div className="grid min-h-dvh">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex flex-col gap-4 flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<div className="mx-auto h-32 flex items-center justify-center">
							<Image src="/images/logo.png" className="size-auto" alt="Finwise" width={150} height={900} />
						</div>
						<LoginForm />
					</div>
				</div>
			</div>

		</div>
	);
}
