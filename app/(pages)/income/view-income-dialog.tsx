import { IconCash } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { getCategories } from "@/app/actions/expenses";
import { frequencyLabels, incomeColors, incomeIcons } from "@/data";
import type { incomeItem } from "@/types";

export function ViewIncomeDialog({ viewingItem }: { viewingItem: incomeItem }) {
    console.log("viewingItem", viewingItem);
    const [expensesPercentage, setExpensesPercentage] = useState<{
        travel: number;
        food: number;
        entertainment: number;
        other: number;
        bills: number;
        savings: number;
    }>({
        travel: 0,
        food: 0,
        entertainment: 0,
        other: 0,
        bills: 0,
        savings: 0,
    });
    const { data: categoriesData } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => await getCategories(),
        enabled: !!viewingItem.expenses,
    });


    const computedExpensesPercentage = useCallback(() => {
        if (!viewingItem.expenses || !categoriesData?.data) return;

        // First, sum all amounts by category
        const categoryTotals = viewingItem.expenses.reduce((acc, expense) => {
            const category = categoriesData.data?.find(cat => cat.id === expense.expenseCategoryId);
            const categoryName = (category?.name || "Other").toLowerCase();

            // Sum amounts for each category
            acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
            return acc;
        }, {} as Record<string, number>);

        // Then calculate percentages from the totals
        const totalPercentages = Object.entries(categoryTotals).reduce((acc, [category, totalAmount]) => {
            const percentage = (totalAmount / viewingItem.amount) * 100;
            acc[category] = Number(percentage.toFixed(2));
            return acc;
        }, {} as Record<string, number>);

        console.log("totalPercentages", totalPercentages);

        // Update state with computed percentages
        setExpensesPercentage({
            travel: totalPercentages.travel || 0,
            food: totalPercentages.food || 0,
            entertainment: totalPercentages.entertainment || 0,
            other: totalPercentages.other || 0,
            bills: totalPercentages.bills || 0,
            savings: totalPercentages.savings || 0,
        });
    }, [viewingItem.expenses, viewingItem.amount, categoriesData?.data]);

    useEffect(() => {
        computedExpensesPercentage();
    }, [computedExpensesPercentage]);

    return (
        <div className="space-y-6 py-4 grid grid-cols-12 items-center">
            <div className="flex flex-col items-start gap-4 col-span-6">
                <div className="flex flex-row items-center gap-4">
                    <div
                        style={{
                            backgroundColor:
                                incomeColors[
                                    viewingItem.incomeSource?.name.toLowerCase() as keyof typeof incomeColors
                                ]?.backgroundColor || "#e7effb",
                        }}
                        className="rounded-xl p-3 size-16 flex items-center justify-center"
                    >
                        {(() => {
                            const Icon =
                                incomeIcons[
                                viewingItem.incomeSource?.name.toLowerCase() as keyof typeof incomeIcons
                                ] || IconCash;
                            return (
                                <Icon
                                    size={32}
                                    color={
                                        incomeColors[
                                            viewingItem.incomeSource?.name.toLowerCase() as keyof typeof incomeColors
                                        ]?.color || "#1a64db"
                                    }
                                />
                            );
                        })()}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{viewingItem.income_name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                            {viewingItem.incomeSource
                                ? viewingItem.incomeSource?.name?.charAt(0).toUpperCase() +
                                viewingItem.incomeSource?.name?.slice(1)
                                : "N/A"}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-2xl font-bold text-green-600">
                            ₱{viewingItem.amount.toLocaleString()}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Frequency</p>
                        <p className="text-lg font-semibold">
                            {
                                frequencyLabels.find((label) => label.value === viewingItem.frequency.toString())
                                    ?.label
                            }
                        </p>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date Added</p>
                    <p className="text-sm font-medium">
                        {new Date(viewingItem.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-start gap-4 col-span-6">
                <div className="pt-4 border-t w-full">
                    <p className="text-sm text-muted-foreground mb-2">Projections</p>

                    <div className="space-y-2 w-full">
                        {viewingItem.frequency !== "per-week" && (
                            <div className="flex flex-row justify-between w-full">
                                <span className="text-sm">Per Week</span>
                                <span className="font-semibold">
                                    ₱
                                    {(viewingItem.frequency === "per-month"
                                        ? viewingItem.amount / 4
                                        : viewingItem.amount / 52
                                    ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}
                        {viewingItem.frequency !== "per-month" && (
                            <div className="flex justify-between w-full">
                                <span className="text-sm">Per Month</span>
                                <span className="font-semibold">
                                    ₱
                                    {(viewingItem.frequency === "per-week"
                                        ? viewingItem.amount * 4
                                        : viewingItem.amount / 12
                                    ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}
                        {viewingItem.frequency !== "per-year" && (
                            <div className="flex justify-between w-full">
                                <span className="text-sm">Per Year</span>
                                <span className="font-semibold">
                                    ₱
                                    {(viewingItem.frequency === "per-week"
                                        ? viewingItem.amount * 52
                                        : viewingItem.amount * 12
                                    ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t col-span-6 w-full">
                    <p className="text-sm text-muted-foreground mb-2">Expenses</p>

                    <div className="space-y-2 w-full">
                        <div className="flex justify-between w-full">
                            <span className="text-sm">Travel</span>
                            <span className="font-semibold">{expensesPercentage.travel}%</span>
                        </div>
                        <div className="flex justify-between w-full">
                            <span className="text-sm">Food</span>
                            <span className="font-semibold">{expensesPercentage.food}%</span>
                        </div>

                        <div className="flex justify-between w-full">
                            <span className="text-sm">Entertainment</span>
                            <span className="font-semibold">{expensesPercentage.entertainment}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Other</span>
                            <span className="font-semibold">{expensesPercentage.other}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Bills</span>
                            <span className="font-semibold">{expensesPercentage.bills}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Savings</span>
                            <span className="font-semibold">{expensesPercentage.savings}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
