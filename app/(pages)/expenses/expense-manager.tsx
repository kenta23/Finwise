"use client";


import {
    IconCalendar,
    IconEdit,
    IconEye,
    IconFilter,
    IconPlus,
    IconReceipt,
    IconSearch,
    IconTrash,
    IconTrendingDown,
    IconWallet,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startTransition, useEffect, useOptimistic, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { addExpense, deleteExpense, editExpense, getExpenses } from "@/app/actions/expenses";
import { useIncomeStore } from "@/lib/store";
import type { expenseItem, expenseWithRelations } from "@/types";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { categories } from "../../../data";

const expenseSchema = z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    category: z.string().min(1, "Please select a category"),
    description: z.string().min(1, "Description is required"),
    notes: z.string().default(""),
    fundIncomeId: z.string().min(1, "Please select a income"),
});


type OptimisticExpensesAction = {
    type: "add" | "edit" | "delete";
    item?: Omit<expenseWithRelations, "userId" | "income">;
    id?: string;
};

export function ExpenseManager() {
    const {
        data: expensesData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["expenses"],
        queryFn: async () => await getExpenses(),
    });

    const incomedata = useIncomeStore((state) => state.income);

    console.log("expensesData", expensesData);

    // Get categories from data.ts instead of localStorage
    const userCategories = categories.map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.name,
    }));
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<expenseWithRelations | null>(null);
    const [viewingExpense, setViewingExpense] = useState<expenseWithRelations | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const queryClient = useQueryClient();
    const [optimisticExpensesData, optimisticUpdate] = useOptimistic(expensesData?.data as expenseWithRelations[], (state: expenseWithRelations[], action: OptimisticExpensesAction): expenseWithRelations[] => {
        if (action.type === 'add') {
            return [...(state || []), action.item as expenseWithRelations];
        }
        if (action.type === 'edit') {
            return state?.map((item) => item?.id === action.id ? { ...item, ...action.item } as expenseWithRelations : item as expenseWithRelations) || null;
        }
        if (action.type === 'delete') {
            return state?.filter((item) => item?.id !== action.id) || null;
        }

        return state;
    })

    const { mutate: addExpenseMutation, isPending: isAddPending } = useMutation({
        mutationKey: ["addExpense"],
        mutationFn: async (expense: Omit<expenseItem, "id" | "createdAt" | "updatedAt" | "userId">) =>
            await addExpense(expense),
        onSuccess: (data) => {
            toast.success(data.message, {
                description: "Expense added successfully",
            });
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
        },
        onError: (error) => {
            toast.error(error.message, {
                description: "Failed to add expense",
            });
        },
    });
    const { mutate: deleteExpenseMutation, isPending: isDeletePending } = useMutation({
        mutationKey: ["deleteExpense"],
        mutationFn: async (id: string) => await deleteExpense(id),
        onSuccess: (data) => {
            toast.success("Successful!", {
                description: data.message,
            });
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });

        },
        onError: (error) => {
            toast.error(error.message, {
                description: "Failed to delete expense",
            });
        },
    })

    const { mutate: editExpenseMutation, isPending: isEditPending } = useMutation({
        mutationKey: ["editExpense"],
        mutationFn: async (expense: Partial<expenseWithRelations>) => await editExpense(expense),
        onSuccess: (data) => {
            if (!data.error) {
                toast.success(data.message, {
                    description: "Expense updated successfully",
                });
            } else {
                toast.error(data.message, {
                    description: data.error,
                });
            }
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
        },
        onError: (error) => {
            toast.error("Failed to update expense", {
                description: error.message,
            });
        },
    })

    const [formData, setFormData] = useState({
        amount: "",
        category: "",
        description: "",
        notes: "",
        fundIncomeId: "",
    });
    const [errors, setErrors] = useState<z.ZodError | null>(null);

    const resetForm = () => {
        setFormData({
            amount: "",
            category: "",
            description: "",
            notes: "",
            fundIncomeId: "",
        });
        setErrors(null);
    };

    const handleAddExpense = () => {
        console.log("formData", formData);
        try {
            const parsedExpenseItem = expenseSchema.safeParse({
                ...formData,
                amount: Number(formData.amount),
            });

            if (!parsedExpenseItem.success) {
                setErrors(parsedExpenseItem.error as z.ZodError);
                return;
            }


            startTransition(() => {
                optimisticUpdate({
                    type: "add",
                    item: {
                        ...parsedExpenseItem.data,
                        id: crypto.randomUUID(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        expenseCategoryId: crypto.randomUUID(),
                        incomeId: crypto.randomUUID(),
                        expenseCategory: {
                            name: parsedExpenseItem.data.category,
                            id: crypto.randomUUID(),
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        }
                    }
                })
                addExpenseMutation(parsedExpenseItem.data);
            })
            resetForm();
            setIsAddDialogOpen(false);
        } catch (error) {
            setErrors(error as z.ZodError);
        }
    };

    const handleEditExpense = () => {
        if (!editingExpense) return;


        console.log("editingExpense", editingExpense);


        try {
            const parsedExpensesItem = expenseSchema.parse({
                ...formData,
                amount: Number(formData.amount)
            });
            startTransition(() => {
                optimisticUpdate({
                    type: "edit", id: editingExpense.id, item: {
                        ...parsedExpensesItem,
                        id: editingExpense.id,
                        createdAt: editingExpense.createdAt,
                        updatedAt: new Date(),
                        expenseCategoryId: editingExpense.expenseCategoryId,
                        incomeId: editingExpense.incomeId,
                        expenseCategory: {
                            name: parsedExpensesItem.category,
                            id: editingExpense.expenseCategory?.id ?? crypto.randomUUID(),
                            createdAt: editingExpense.expenseCategory?.createdAt ?? new Date(),
                            updatedAt: new Date(),
                        }
                    }
                });
                editExpenseMutation({ ...parsedExpensesItem, id: editingExpense.id });
            });
            resetForm();
            setIsEditDialogOpen(false);
            setEditingExpense(null);
        } catch (error) {
            setErrors(error as z.ZodError);
        }
    };

    const handleDeleteExpense = (id: string) => {
        startTransition(() => {
            optimisticUpdate({ type: "delete", id });
            deleteExpenseMutation(id);
        });
    };

    const openEditDialog = (expense: expenseWithRelations) => {
        setEditingExpense(expense);
        setFormData({
            amount: expense.amount.toString(),
            category: expense.expenseCategory?.name || "",
            description: expense.description,
            notes: expense.notes || "",
            fundIncomeId: expense.income?.id || "",
        });
        setIsEditDialogOpen(true);
        setErrors(null);
    };

    const openViewDialog = (expense: any) => {
        console.log("expense", expense);
        setViewingExpense(expense);
        setIsViewDialogOpen(true);
    };

    // Calculate statistics
    const calculateStats = () => {
        const totalExpenses = optimisticExpensesData?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

        const categoryTotals = optimisticExpensesData?.reduce(
            (acc, curr) => {
                if (!acc[curr.expenseCategory?.name || ""]) {
                    acc[curr.expenseCategory?.name || ""] = 0;
                }
                acc[curr.expenseCategory?.name || ""] += curr.amount;
                return acc;
            },
            {} as Record<string, number>
        );

        console.log("categoryTotals", categoryTotals);

        const topCategory = Object.entries(categoryTotals || {}).reduce<{
            categoryName: string;
            total: number;
        }>(
            (acc, [categoryName, total]) => {
                const category = userCategories.find(
                    (cat) => cat.categoryName.toLowerCase() === categoryName.toLowerCase()
                );

                return total > acc.total
                    ? {
                        categoryName: category?.categoryName || "Unknown",
                        total: total,
                    }
                    : acc;
            },
            { categoryName: "", total: 0 }
        );

        return { totalExpenses, categoryTotals, topCategory };
    };

    const { totalExpenses, categoryTotals, topCategory } = calculateStats();

    console.log("categoryTotals", categoryTotals);
    console.log("topCategory", topCategory);
    console.log("totalExpenses", totalExpenses);

    // Filter expenses
    const filteredExpenses = optimisticExpensesData?.filter((expense) => {
        const matchesSearch =
            expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.expenseCategory?.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
            filterCategory === "all" ||
            expense.expenseCategory?.name.toLowerCase() === filterCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    const getErrorMessage = (field: string) => {
        if (!errors) return null;
        const error = errors.issues.find((issue) => issue.path[0] === field);
        return error?.message;
    };

    const getCategoryIcon = (categoryname: string) => {
        const categoryType = categories.find((type) => type.name === categoryname);

        return categoryType ?? categories[5]; // Default to "Other" (index 5)
    };


    const getCategoryIconComponent = (categoryname: string) => {
        const Icon = getCategoryIcon(categoryname).icon;
        return (
            <Icon size={32} color={getCategoryIcon(categoryname).color} />
        );
    }

    return (
        <div className="w-full h-auto py-3">
            <div className="flex flex-col gap-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                            <IconWallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                ₱{totalExpenses.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">All time spending</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                            <IconReceipt className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{optimisticExpensesData?.length}</div>
                            <p className="text-xs text-muted-foreground">Expense entries</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                            <IconTrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">
                                {/* {topCategory.categoryName.charAt(0).toUpperCase() +
                                    topCategory.categoryName.slice(1) || "None"} */}
                                {topCategory.categoryName || "None"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {topCategory.total > 0
                                    ? `₱${topCategory.total.toLocaleString()}`
                                    : "No expenses yet"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Categories Used</CardTitle>
                            <IconFilter className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Object.keys(categoryTotals || {}).length}</div>
                            <p className="text-xs text-muted-foreground">
                                Out of {userCategories.length} available
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="relative flex-1 max-w-sm">
                            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search expenses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {userCategories.map((category) => (
                                    <SelectItem key={category.categoryId} value={category.categoryName}>
                                        {category.categoryName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="cursor-pointer" variant="default">
                                <IconPlus />
                                <span>Add Expense</span>
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add New Expense</DialogTitle>
                                <DialogDescription>
                                    Record a new expense. Fill in the details below.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        placeholder="e.g., Lunch at restaurant, Gas for car"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                    {getErrorMessage("description") && (
                                        <p className="text-sm text-red-500">{getErrorMessage("description")}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <div className="relative">
                                        <span className="text-muted-foreground text-sm absolute left-2 top-1/2 -translate-y-1/2">
                                            ₱
                                        </span>
                                        <Input
                                            id="amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="pl-6"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        />
                                    </div>
                                    {getErrorMessage("amount") && (
                                        <p className="text-sm text-red-500">{getErrorMessage("amount")}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    >
                                        <SelectTrigger className="cursor-pointer w-full">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {userCategories.map((category) => (
                                                <SelectItem
                                                    key={category.categoryId}
                                                    value={category.categoryName}
                                                    className="cursor-pointer"
                                                >
                                                    {category.categoryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {getErrorMessage("category") && (
                                        <p className="text-sm text-red-500">{getErrorMessage("category")}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="fundIncomeId">Funds to Use</Label>
                                    <Select
                                        value={formData.fundIncomeId}
                                        onValueChange={(value) => setFormData({ ...formData, fundIncomeId: value })}
                                    >
                                        <SelectTrigger className="cursor-pointer w-full">
                                            <SelectValue placeholder="Select Fund from your Income" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {incomedata?.map((income) => (
                                                <SelectItem
                                                    key={income.id}
                                                    value={income.id.toString()}
                                                    className="cursor-pointer"
                                                >
                                                    {income.income_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {getErrorMessage("fundIncomeId") && (
                                        <p className="text-sm text-red-500">{getErrorMessage("fundIncomeId")}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Additional notes about this expense..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddDialogOpen(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={isAddPending}
                                    className="cursor-pointer"
                                    onClick={handleAddExpense}
                                >
                                    Add Expense
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* No Categories Message */}
                {userCategories.length === 0 && (
                    <Card className="p-8">
                        <div className="text-center">
                            <IconWallet size={64} className="mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No expense categories found</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                You need to create expense categories first before adding expenses.
                            </p>
                            <Button variant="outline" asChild>
                                <a href="/dashboard">Go to Dashboard to Create Categories</a>
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Expenses List */}
                {userCategories.length > 0 && (
                    <div className="grid grid-cols-12 gap-4">
                        {filteredExpenses?.length === 0 ? (
                            <div className="col-span-12 flex flex-col items-center justify-center py-12 text-center">
                                <IconReceipt size={64} className="text-muted-foreground mb-4" />
                                {optimisticExpensesData?.length === 0 && (
                                    <>
                                        <h3 className="text-lg font-semibold mb-2">No expenses yet</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Start by adding your first expense to track your spending.
                                        </p>


                                        <Button onClick={() => setIsAddDialogOpen(true)} className="cursor-pointer">
                                            <IconPlus size={20} />
                                            <span>Add Your First Expense</span>
                                        </Button>
                                    </>
                                )
                                }
                            </div>
                        ) : (
                            filteredExpenses?.map((expense) => {
                                const categoryIcon = getCategoryIcon(expense.expenseCategory?.name || "");

                                return (
                                    <div
                                        key={expense.id}
                                        className="group flex col-span-12 hover:bg-muted/50 transition-all duration-300 hover:shadow-md md:col-span-6 lg:col-span-4 items-center justify-between gap-4 bg-background border border-border p-2 lg:p-4 rounded-lg"
                                    >
                                        <div className="flex flex-row items-center gap-4 w-full">
                                            <div
                                                style={{ backgroundColor: categoryIcon.backgroundColor }}
                                                className="rounded-xl relative p-2 size-12 flex items-center justify-center shrink-0"
                                            >
                                                <categoryIcon.icon size={24} color={categoryIcon.color} />
                                            </div>

                                            <div className="flex flex-col flex-1 min-w-0">
                                                <p className="text-md font-semibold truncate">{expense.description}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {(expense.expenseCategory &&
                                                        expense.expenseCategory?.name?.charAt(0).toUpperCase() +
                                                        expense.expenseCategory?.name?.slice(1)) ||
                                                        "N/A"}
                                                </p>
                                                <p className="text-lg font-bold text-red-600 mt-1">
                                                    ₱{expense.amount.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(expense.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="cursor-pointer hover:bg-green-100 hover:text-green-600"
                                                onClick={() => openViewDialog(expense)}
                                            >
                                                <IconEye size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="cursor-pointer hover:bg-blue-100 hover:text-blue-600"
                                                onClick={() => openEditDialog(expense as any)}
                                            >
                                                <IconEdit size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled={isDeletePending}
                                                className="cursor-pointer hover:bg-red-100 hover:text-red-600"
                                                onClick={() => handleDeleteExpense(expense.id)}
                                            >
                                                <IconTrash size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* EDIT DIALOG*/}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Expense</DialogTitle>
                        <DialogDescription>Update the details of your expense below.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Input
                                id="edit-description"
                                placeholder="e.g., Lunch at restaurant, Gas for car"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            {getErrorMessage("description") && (
                                <p className="text-sm text-red-500">{getErrorMessage("description")}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-amount">Amount</Label>
                            <div className="relative">
                                <span className="text-muted-foreground text-sm absolute left-2 top-1/2 -translate-y-1/2">
                                    ₱
                                </span>
                                <Input
                                    id="edit-amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="pl-6"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                            {getErrorMessage("amount") && (
                                <p className="text-sm text-red-500">{getErrorMessage("amount")}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-category">Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger className="cursor-pointer w-full">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {userCategories.map((category) => (
                                        <SelectItem
                                            key={category.categoryId}
                                            value={category.categoryName}
                                            className="cursor-pointer"
                                        >
                                            {category.categoryName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {getErrorMessage("category") && (
                                <p className="text-sm text-red-500">{getErrorMessage("category")}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-fundIncomeId">Funds to Use</Label>
                            <Select
                                value={formData.fundIncomeId}
                                onValueChange={(value) => setFormData({ ...formData, fundIncomeId: value })}
                            >
                                <SelectTrigger className="cursor-pointer w-full">
                                    <SelectValue placeholder="Select Fund from your Income" />
                                </SelectTrigger>

                                <SelectContent>
                                    {incomedata?.map((income) => (
                                        <SelectItem
                                            key={income.id}
                                            value={income.id.toString()}
                                            className="cursor-pointer"
                                        >
                                            {income.income_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {getErrorMessage("fundIncomeId") && (
                                <p className="text-sm text-red-500">{getErrorMessage("fundIncomeId")}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-notes">Notes (Optional)</Label>
                            <Textarea
                                id="edit-notes"
                                placeholder="Additional notes about this expense..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false);
                                setEditingExpense(null);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button className="cursor-pointer" disabled={isEditPending} onClick={handleEditExpense}>
                            Update Expense
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Expense Details</DialogTitle>
                        <DialogDescription>View the details of your expense.</DialogDescription>
                    </DialogHeader>

                    {viewingExpense && (
                        <div className="space-y-6 py-4">
                            <div className="flex items-center gap-4">
                                <div
                                    style={{
                                        backgroundColor: getCategoryIcon(viewingExpense.expenseCategory?.name || "").backgroundColor,
                                    }}
                                    className="rounded-xl p-3 size-16 flex items-center justify-center"
                                >
                                    {getCategoryIconComponent(viewingExpense.expenseCategory?.name || "")}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold">{viewingExpense.description}</h3>
                                    <Badge variant="outline" className="mt-1">
                                        {viewingExpense.expenseCategory?.name || "N/A"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Amount</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        ₱{viewingExpense.amount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p className="text-md font-semibold flex items-center text-muted-foreground gap-2">
                                        <IconCalendar size={16} />
                                        {new Date(viewingExpense.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>

                            {viewingExpense?.notes && (
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Notes</p>
                                    <p className="text-sm bg-muted p-3 rounded-lg">{viewingExpense.notes}</p>
                                </div>
                            )}

                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-2">Category Spending</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">This Category Total</span>
                                        <span className="font-semibold">
                                            ₱{(categoryTotals?.[viewingExpense.expenseCategory?.name || ""] || 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">% of Total Expenses</span>
                                        <span className="font-semibold">
                                            {totalExpenses > 0
                                                ? (
                                                    ((categoryTotals?.[viewingExpense.expenseCategory?.name || ""] || 0) / totalExpenses) *
                                                    100
                                                ).toFixed(1)
                                                : 0}
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsViewDialogOpen(false);
                                setViewingExpense(null);
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            className="cursor-pointer"
                            onClick={() => {
                                if (viewingExpense) {
                                    setIsViewDialogOpen(false);
                                    openEditDialog(viewingExpense);
                                }
                            }}
                        >
                            <IconEdit size={18} className="mr-2" />
                            Edit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
