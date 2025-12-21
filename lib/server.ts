import { headers } from "next/headers";
import { auth } from "./auth"; // path to your Better Auth server instance

/**
 * Get the current session on the server side.
 * This function must be called within a request context (e.g., Server Component, Route Handler, Server Action).
 */
export async function getSession() {
	const session = await auth.api.getSession({
		headers: await headers(), // you need to pass the headers object.
	});
	return session;
}

/**
 * Get the authenticated user from the session.
 * Returns the user if authenticated, null otherwise.
 * Use this for operations that can gracefully handle unauthenticated users.
 */
export async function getAuthenticatedUser() {
	const session = await getSession();
	return session?.user || null;
}

/**
 * Require authentication for server actions.
 * Throws an error if the user is not authenticated.
 * Use this for operations that MUST have an authenticated user.
 * 
 * @returns The authenticated user
 * @throws Error if user is not authenticated
 */
export async function requireAuth() {
	const session = await getSession();

	if (!session?.user) {
		throw new Error("Unauthorized: Authentication required");
	}

	return session.user;
}

/**
 * Standardized unauthorized response for server actions.
 * Use this when you want to return an error response instead of throwing.
 */
export const UNAUTHORIZED_RESPONSE = {
	error: "Unauthorized",
	message: "You must be logged in to perform this action",
	data: null,
} as const;