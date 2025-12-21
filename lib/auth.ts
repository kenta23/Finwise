//server

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import prisma from "./prisma";
import { sendOTPEmail, sendVerificationEmail } from "./sendEmail";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	trustedOrigins: process.env.NODE_ENV === "production" ? [process.env.NEXT_PUBLIC_BETTER_AUTH_URL!] : ["http://localhost:3000"],
	baseURL: process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_BETTER_AUTH_URL : "http://localhost:3000",
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	secret: process.env.BETTER_AUTH_SECRET!,
	plugins: [
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				try {
					await sendOTPEmail(email, otp, type);
					console.log(`OTP sent to ${email} for ${type}`);
				} catch (error) {
					console.error(`Failed to send OTP to ${email}:`, error);
					throw new Error("Failed to send verification OTP");
				}
			},
		}),
		nextCookies(),
	],
	emailVerification: {
		// Send verification email with a link
		sendVerificationEmail: async ({ user, url }) => {
			try {
				const res = await sendVerificationEmail(user.email, url);
				console.log("res sendVerificationEmail", res);
				console.log(`Verification email sent to ${user.email}`);
			} catch (error) {
				console.error(`Failed to send verification email to ${user.email}:`, error);
				throw new Error("Failed to send verification email");
			}
		},
		sendOnSignIn: true,
		// Automatically send verification email when user signs up
		sendOnSignUp: true,
		// Automatically sign in the user after they verify their email
		autoSignInAfterVerification: true,
		// Verification token expires in 1 hour (3600 seconds)
		expiresIn: 3600,
		// Callback after successful email verification
		async afterEmailVerification(user) {
			console.log(`✅ Email verified successfully for user: ${user.email}`);
			// You can add custom logic here, such as:
			// - Grant access to premium features
			// - Send a welcome email
			// - Log analytics event
			// - Update user status in your database
		},
	},
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		requireEmailVerification: true,
	},
	socialProviders: {
		google: {
			prompt: "select_account consent",
			accessType: "offline",
			enabled: true,
			clientId: process.env.GOOGLE_CLIENT_ID! as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET! as string,
		},
	},
});
