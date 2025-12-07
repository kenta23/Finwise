import { IconInnerShadowTop } from "@tabler/icons-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/login/login-form";
import { auth } from "@/lib/auth";
import { Metadata } from "next";


const metadata: Metadata = {
	title: "Login - Budgety",
	description: "Login to your Budgety account",
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
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<a href="/dashboard" className="flex items-center gap-2 font-medium">
						<div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
							<IconInnerShadowTop className="size-4" />
						</div>
						Budgety
					</a>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<LoginForm />
					</div>
				</div>
			</div>
			<div className="bg-muted relative hidden lg:block">
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="text-center space-y-4 p-8">
						<IconInnerShadowTop className="size-16 mx-auto text-muted-foreground/50" />
						<p className="text-muted-foreground text-sm">Welcome to Budgety</p>
					</div>
				</div>
			</div>
		</div>
	);
}
