'use server';

import prisma from "@/lib/prisma";
import { getAuthenticatedUser, UNAUTHORIZED_RESPONSE } from "@/lib/server";


export async function getSavings(): Promise<{ error: string | null; message: string; data: any }> {
    const user = await getAuthenticatedUser();

    if (!user) {
        return UNAUTHORIZED_RESPONSE;
    }

    try {
        const savings = await prisma.savings.findMany({
            where: {
                userId: user.id,
            },
        });


        if (savings && savings.length > 0) {
            return {
                error: null,
                message: "Savings fetched successfully",
                data: savings,
            };
        }

        return {
            error: "No savings found",
            message: "No savings found",
            data: [],
        };
    } catch (error) {
        console.error("Error getting savings", error);
        return {
            error: error as string,
            message: "Failed to get savings",
            data: null,
        };
    }

}