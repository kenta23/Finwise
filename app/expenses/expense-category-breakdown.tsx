"use client";

import { IconCalendar, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { type categoryType, categoryTypes } from "../../data";

type ExpenseItem = {
    id: string;
    amount: number;
    categoryId: number;
    categoryName: string;
    description: string;
    date: string;
    notes?: string;
};

type CategoryBreakdown = {
    categoryId: number;
    categoryName: string;
    totalAmount: number;
    transactionCount: number;
    averageAmount: number;
    percentage: number;
    lastExpenseDate: string;
    categoryType: categoryType;
};

export function ExpenseCategoryBreakdown() {
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [userCategories, setUserCategories] = useState<
        { categoryId: number; categoryName: string }[]
    >([]);
    const [categoryBreakdowns, setCategoryBreakdowns] = useState<CategoryBreakdown[]>([]);
    const [totalExpenses, setTotalExpenses] = useState(0);

    useEffect(() => {
        // Load user categories
        const storedCategories = localStorage.getItem("selectedCategory");
        if (storedCategories) {
            try {
                const parsed = JSON.parse(storedCategories) as {
                    categoryId: number;
                    categoryName: string;
                }[];
                setUserCategories(parsed);
            } catch (error) {
                console.error("Error parsing categories:", error);
            }
        }

        // Load expenses
        const storedExpenses = localStorage.getItem("expenses");
        if (storedExpenses) {
            try {
                const parsed = JSON.parse(storedExpenses) as ExpenseItem[];
                setExpenses(parsed);
            } catch (error) {
                console.error("Error parsing expenses:", error);
            }
        }
    }, []);

    useEffect(() => {
        if (expenses.length > 0 && userCategories.length > 0) {
            const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
            setTotalExpenses(total);

            const breakdowns: CategoryBreakdown[] = userCategories.map((userCategory) => {
                const categoryExpenses = expenses.filter(
                    (expense) => expense.categoryId === userCategory.categoryId
                );
                const categoryTotal = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
                const categoryType =
                    categoryTypes.find((type) => type.id === userCategory.categoryId) || categoryTypes[5];

                // Find the most recent expense for this category
                const sortedExpenses = categoryExpenses.sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                const lastExpenseDate = sortedExpenses.length > 0 ? sortedExpenses[0].date : "";

                return {
                    categoryId: userCategory.categoryId,
                    categoryName: userCategory.categoryName,
                    totalAmount: categoryTotal,
                    transactionCount: categoryExpenses.length,
                    averageAmount: categoryExpenses.length > 0 ? categoryTotal / categoryExpenses.length : 0,
                    percentage: total > 0 ? (categoryTotal / total) * 100 : 0,
                    lastExpenseDate,
                    categoryType,
                };
            });

            // Sort by total amount (highest first)
            breakdowns.sort((a, b) => b.totalAmount - a.totalAmount);
            setCategoryBreakdowns(breakdowns);
        }
    }, [expenses, userCategories]);

    if (userCategories.length === 0) {
        return (
            <Card className="p-8">
                <div className="text-center">
                    <IconTrendingDown size={64} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No categories to analyze</h3>
                    <p className="text-sm text-muted-foreground">
                        Create expense categories first to see detailed breakdowns.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Category Breakdown</h2>
                <Badge variant="outline" className="text-sm">
                    {categoryBreakdowns.filter((cat) => cat.totalAmount > 0).length} of{" "}
                    {userCategories.length} categories used
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryBreakdowns.map((breakdown) => {
                    const Icon = breakdown.categoryType.icon;
                    const hasExpenses = breakdown.totalAmount > 0;

                    return (
                        <Card
                            key={breakdown.categoryId}
                            className={`transition-all duration-300 ${hasExpenses ? "hover:shadow-md" : "opacity-60"}`}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            style={{ backgroundColor: breakdown.categoryType.backgroundColor }}
                                            className="rounded-xl p-2 size-12 flex items-center justify-center"
                                        >
                                            <Icon size={24} color={breakdown.categoryType.color} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{breakdown.categoryName}</CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {breakdown.transactionCount} transaction
                                                {breakdown.transactionCount !== 1 ? "s" : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-red-600">
                                            ₱{breakdown.totalAmount.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {breakdown.percentage.toFixed(1)}% of total
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {hasExpenses && (
                                    <>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Spending Progress</span>
                                                <span>{breakdown.percentage.toFixed(1)}%</span>
                                            </div>
                                            <Progress
                                                value={breakdown.percentage}
                                                className="h-2"
                                                style={{
                                                    backgroundColor: breakdown.categoryType.backgroundColor,
                                                }}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Average per transaction</p>
                                                <p className="font-semibold">
                                                    ₱
                                                    {breakdown.averageAmount.toLocaleString(undefined, {
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Last expense</p>
                                                <p className="font-semibold flex items-center gap-1">
                                                    <IconCalendar size={14} />
                                                    {breakdown.lastExpenseDate
                                                        ? new Date(breakdown.lastExpenseDate).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                        })
                                                        : "Never"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Trend</span>
                                                <div className="flex items-center gap-1">
                                                    {breakdown.percentage > 20 ? (
                                                        <>
                                                            <IconTrendingUp size={16} className="text-red-500" />
                                                            <span className="text-red-500 font-medium">High spending</span>
                                                        </>
                                                    ) : breakdown.percentage > 10 ? (
                                                        <>
                                                            <IconTrendingUp size={16} className="text-yellow-500" />
                                                            <span className="text-yellow-500 font-medium">Moderate</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IconTrendingDown size={16} className="text-green-500" />
                                                            <span className="text-green-500 font-medium">Low spending</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {!hasExpenses && (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-muted-foreground">
                                            No expenses in this category yet
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {totalExpenses > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Spending Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-red-600">₱{totalExpenses.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Total Spent</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{expenses.length}</p>
                            <p className="text-sm text-muted-foreground">Total Transactions</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                ₱
                                {(totalExpenses / expenses.length).toLocaleString(undefined, {
                                    maximumFractionDigits: 2,
                                })}
                            </p>
                            <p className="text-sm text-muted-foreground">Average per Transaction</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {categoryBreakdowns.filter((cat) => cat.totalAmount > 0).length}
                            </p>
                            <p className="text-sm text-muted-foreground">Active Categories</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
