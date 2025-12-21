"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useIncomeStore } from "@/lib/store";
import type { incomeItem } from "@/types";
import { getIncome } from "./actions/income";

/**
 * Component that syncs TanStack Query income data to Zustand store
 * Must be rendered inside QueryClientProvider
 */
export function IncomeSync() {
    const setIncome = useIncomeStore((state) => state.setIncome);
    const incomeFromStore = useIncomeStore((state) => state.income);

    // Fetch income data using TanStack Query
    const { data: incomeData } = useQuery({
        queryKey: ["income"],
        queryFn: async () => await getIncome(),
        // Use stale data from Zustand as placeholder data if available
        // placeholderData is more lenient with types than initialData
        placeholderData:
            incomeFromStore.length > 0
                ? ({ data: incomeFromStore, error: null, message: "Income loaded from store" } as Awaited<ReturnType<typeof getIncome>>)
                : undefined,
        // Refetch on mount to ensure fresh data
        refetchOnMount: true,
    });

    // Sync TanStack Query data to Zustand whenever it changes
    useEffect(() => {
        if (incomeData?.data) {
            setIncome(incomeData.data as incomeItem[]);
        }
    }, [incomeData, setIncome]);

    // This component doesn't render anything
    return null;
}
