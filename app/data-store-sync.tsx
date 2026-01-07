"use client";

import { usePrefetchQuery, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useCategoriesStore, useIncomeStore } from "@/lib/store";
import type { categoryItem, incomeItem } from "@/types";
import { getCategories, getExpenses } from "./actions/expenses";
import { getIncome } from "./actions/income";

/**
 * Component that syncs TanStack Query income data to Zustand store
 * Must be rendered inside QueryClientProvider
 */
export function DataStoreSync() {
    const setIncome = useIncomeStore((state) => state.setIncome);
    const incomeFromStore = useIncomeStore((state) => state.income);
    const categoriesFromStore = useCategoriesStore((state) => state.categories);
    const setCategories = useCategoriesStore((state) => state.setCategories);

    // Fetch income data using TanStack Query
    const { data: incomeData } = useQuery({
        queryKey: ["income"],
        queryFn: async () => await getIncome(),
        // Use stale data from Zustand as placeholder data if available
        // placeholderData is more lenient with types than initialData
        placeholderData:
            incomeFromStore.length > 0
                ? ({ data: incomeFromStore, error: null, message: "Income loaded from store" } as Awaited<
                    ReturnType<typeof getIncome>
                >)
                : undefined,
        // Refetch on mount to ensure fresh data
        refetchOnMount: true,
    });

    //prefetch categories data
    usePrefetchQuery({
        queryKey: ['expenses-categories'],
        queryFn: async () => await getCategories(),
    })

    // const { data: categoriesData } = useQuery({
    //     queryKey: ["expenses-categories"],
    //     queryFn: async () => await getCategories(),
    //     placeholderData:
    //         categoriesFromStore.length > 0
    //             ? ({
    //                 data: categoriesFromStore,
    //                 error: null,
    //                 message: "Categories loaded from store",
    //             } as Awaited<ReturnType<typeof getCategories>>)
    //             : undefined,
    // });

    // Sync TanStack Query data to Zustand whenever it changes
    useEffect(() => {
        if (incomeData?.data) {
            setIncome(incomeData.data as incomeItem[]);
        }

        // if (categoriesData?.data) {
        //     setCategories(categoriesData.data as categoryItem[]);
        // }
    }, [incomeData, setIncome]);

    // This component doesn't render anything
    return null;
}
