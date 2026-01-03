"use client";

import { IconBrandGoogle } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
	return (
		<form className={cn("flex flex-col gap-6", className)} {...props}>
			<FieldGroup>
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="text-2xl font-bold">Login to your account</h1>
					<p className="text-muted-foreground text-sm text-balance">
						Sign in to your account to continue
					</p>
				</div>
				{/* <Field>
					<FieldLabel htmlFor="email">Email</FieldLabel>
					<Input id="email" type="email" placeholder="m@example.com" required />
				</Field>
				<Field>
					<div className="flex items-center">
						<FieldLabel htmlFor="password">Password</FieldLabel>
						<a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
							Forgot your password?
						</a>
					</div>
					<Input id="password" type="password" required />
				</Field>
				<Field>
					<Button type="submit">Login</Button>
				</Field>
				<FieldSeparator>Or continue with</FieldSeparator> */}
				<Field>
					<Button
						variant="outline"
						onClick={() => signIn.social({ provider: "google" })}
						type="button"
						className="cursor-pointer border-2 border-violet-400"
					>
						<IconBrandGoogle className="size-4 text-violet-400" />
						<span className="text-violet-400">Login with Google</span>
					</Button>
					{/* <FieldDescription className="text-center">
						Don&apos;t have an account?{" "}
						<Link href="/signup" className="underline underline-offset-4">
							Sign up
						</Link>
					</FieldDescription> */}
				</Field>
			</FieldGroup>
		</form>
	);
}
