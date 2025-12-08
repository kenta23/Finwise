import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, useSession, signOut, sendVerificationEmail, verifyEmail, emailOtp } = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	baseURL: process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_BETTER_AUTH_URL : "http://localhost:3000",
	plugins: [emailOTPClient()],
});
