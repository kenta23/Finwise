"use client";

// Comprehensive expense management component
import {
    IconEdit,
    IconEye,
    IconPlus,
    IconTrash,
    IconTrendingDown,
    IconWallet,
    IconCalendar,
    IconReceipt,
    IconFilter,
    IconSearch,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { categoryTypes, type categoryType } from "../../data";

type ExpenseItem = {
    id: string;
    amount: number;
    categoryId: number;
    categoryName: string;
    description: string;
    date: string;
    notes?: string;
};

const expenseSchema = z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    categoryId: z.number().min(1, "Please select a category"),
    description: z.string().min(1, "Description is required"),
    notes: z.string().optional(),
});

export function ExpenseManager() {
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [userCategories, setUserCategories] = useState<{ categoryId: number; categoryName: string }[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
    const [viewingExpense, setViewingExpense] = useState<ExpenseItem | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");

    const [formData, setFormData] = useState({
        amount: "",
        categoryId: "",
        description: "",
        notes: "",
    });
    const [errors, setErrors] = useState<z.ZodError | null>(null);

    // Load data from localStorage
    useEffect(() => {
        // Load user categories
        const storedCategories = localStorage.getItem("selectedCategory");
        if (storedCategories) {
            try {
                const parsed = JSON.parse(storedCategories) as { categoryId: number; categoryName: string }[];
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

    const saveExpenses = (newExpenses: ExpenseItem[]) => {
        localStorage.setItem("expenses", JSON.stringify(newExpenses));
        setExpenses(newExpenses);
    };

    const resetForm = () => {
        setFormData({
            amount: "",
            categoryId: "",
            description: "",
            notes: "",
        });
        setErrors(null);
    };

    const handleAddExpense = () => {
        try {
            const selectedCategory = userCategories.find(cat => cat.categoryId.toString() === formData.categoryId);
            if (!selectedCategory) {
                toast.error("Please select a valid category");
                return;
            }

            const parsed = expenseSchema.parse({
                ...formData,
                amount: Number(formData.amount),
                categoryId: Number(formData.categoryId),
            });

            const newExpense: ExpenseItem = {
                id: Date.now().toString(),
                ...parsed,
                categoryName: selectedCategory.categoryName,
                date: new Date().toISOString(),
            };

            const updatedExpenses = [...expenses, newExpense];
            saveExpenses(updatedExpenses);

            toast.success("Expense added successfully", {
                description: `${parsed.description} has been added to your expenses.`,
            });

            resetForm();
            setIsAddDialogOpen(false);
        } catch (error) {
            setErrors(error as z.ZodError);
        }
    };

    const handleEditExpense = () => {
        if (!editingExpense) return;

        try {
            const selectedCategory = userCategories.find(cat => cat.categoryId.toString() === formData.categoryId);
            if (!selectedCategory) {
                toast.error("Please select a valid category");
                return;
            }

            const parsed = expenseSchema.parse({
                ...formData,
                amount: Number(formData.amount),
                categoryId: Number(formData.categoryId),
            });

            const updatedExpenses = expenses.map((expense) =>
                expense.id === editingExpense.id 
                    ? { ...expense, ...parsed, categoryName: selectedCategory.categoryName, date: new Date().toISOString() } 
                    : expense
            );

            saveExpenses(updatedExpenses);

            toast.success("Expense updated successfully", {
                description: `${parsed.description} has been updated.`,
            });

            resetForm();
            setIsEditDialogOpen(false);
            setEditingExpense(null);
        } catch (error) {
            setErrors(error as z.ZodError);
        }
    };

    const handleDeleteExpense = (id: string) => {
        const expense = expenses.find((e) => e.id === id);
        const updatedExpenses = expenses.filter((expense) => expense.id !== id);
        saveExpenses(updatedExpenses);

        toast.success("Expense deleted", {
            description: `${expense?.description} has been removed from your expenses.`,
        });
    };

    const openEditDialog = (expense: ExpenseItem) => {
        setEditingExpense(expense);
        setFormData({
            amount: expense.amount.toString(),
            categoryId: expense.categoryId.toString(),
            description: expense.description,
            notes: expense.notes || "",
        });
        setIsEditDialogOpen(true);
        setErrors(null);
    };

    const openViewDialog = (expense: ExpenseItem) => {
        setViewingExpense(expense);
        setIsViewDialogOpen(true);
    };

    // Calculate statistics
    const calculateStats = () => {
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const categoryTotals = expenses.reduce((acc, expense) => {
            if (!acc[expense.categoryId]) {
                acc[expense.categoryId] = 0;
            }
            acc[expense.categoryId] += expense.amount;
            return acc;
        }, {} as Record<number, number>);

        const topCategory = Object.entries(categoryTotals).reduce(
            (max, [categoryId, total]) => {
                const category = userCategories.find(cat => cat.categoryId === Number(categoryId));
                return total > max.total ? { categoryId: Number(categoryId), categoryName: category?.categoryName || "Unknown", total } : max;
            },
            { categoryId: 0, categoryName: "", total: 0 }
        );

        return { totalExpenses, categoryTotals, topCategory };
    };

    const { totalExpenses, categoryTotals, topCategory } = calculateStats();

    // Filter expenses
    const filteredExpenses = expenses.filter((expense) => {
        const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            expense.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "all" || expense.categoryId.toString() === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const getErrorMessage = (field: string) => {
        if (!errors) return null;
        const error = errors.issues.find((issue) => issue.path[0] === field);
        return error?.message;
    };

    const getCategoryIcon = (categoryId: number) => {
        const categoryType = categoryTypes.find(type => type.id === categoryId);
        return categoryType || categoryTypes[5]; // Default to "Other" (index 5)
    };

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
                            <div className="text-2xl font-bold text-red-600">₱{totalExpenses.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">All time spending</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                            <IconReceipt className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{expenses.length}</div>
                            <p className="text-xs text-muted-foreground">Expense entries</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                            <IconTrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">{topCategory.categoryName || "None"}</div>
                            <p className="text-xs text-muted-foreground">
                                {topCategory.total > 0 ? `₱${topCategory.total.toLocaleString()}` : "No expenses yet"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Categories Used</CardTitle>
                            <IconFilter className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Object.keys(categoryTotals).length}</div>
                            <p className="text-xs text-muted-foreground">Out of {userCategories.length} available</p>
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
                                {userCategories.map((category, index) => (
                                    <SelectItem key={index} value={category.categoryId.toString()}>
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
                                        value={formData.categoryId}
                                        onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                                    >
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {userCategories.map((category) => (
                                                <SelectItem 
                                                    key={category.categoryId} 
                                                    value={category.categoryId.toString()}
                                                    className="cursor-pointer"
                                                >
                                                    {category.categoryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {getErrorMessage("categoryId") && (
                                        <p className="text-sm text-red-500">{getErrorMessage("categoryId")}</p>
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
                                <Button className="cursor-pointer" onClick={handleAddExpense}>
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
                        {filteredExpenses.length === 0 ? (
                            <div className="col-span-12 flex flex-col items-center justify-center py-12 text-center">
                                <IconReceipt size={64} className="text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    {expenses.length === 0 ? "No expenses yet" : "No expenses match your filters"}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {expenses.length === 0 
                                        ? "Start by adding your first expense to track your spending."
                                        : "Try adjusting your search or filter criteria."
                                    }
                                </p>
                                {expenses.length === 0 && (
                                    <Button onClick={() => setIsAddDialogOpen(true)} className="cursor-pointer">
                                        <IconPlus size={20} />
                                        <span>Add Your First Expense</span>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            filteredExpenses.map((expense) => {
                                const categoryIcon = getCategoryIcon(expense.categoryId);
                                
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
                                                    {expense.categoryName}
                                                </p>
                                                <p className="text-lg font-bold text-red-600 mt-1">
                                                    ₱{expense.amount.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(expense.date).toLocaleDateString()}
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
                                                onClick={() => openEditDialog(expense)}
                                            >
                                                <IconEdit size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
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

            {/* Edit Dialog */}
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
                                value={formData.categoryId}
                                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                            >
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {userCategories.map((category, index) => (
                                        <SelectItem 
                                            key={index} 
                                            value={category.categoryId.toString()}
                                            className="cursor-pointer"
                                        >
                                            {category.categoryName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {getErrorMessage("categoryId") && (
                                <p className="text-sm text-red-500">{getErrorMessage("categoryId")}</p>
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
                        <Button className="cursor-pointer" onClick={handleEditExpense}>
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
                        <DialogDescription>
                            View the details of your expense.
                        </DialogDescription>
                    </DialogHeader>

                    {viewingExpense && (
                        <div className="space-y-6 py-4">
                            <div className="flex items-center gap-4">
                                <div
                                    style={{
                                        backgroundColor: getCategoryIcon(viewingExpense.categoryId).backgroundColor
                                    }}
                                    className="rounded-xl p-3 size-16 flex items-center justify-center"
                                >
                                    {(() => {
                                        const Icon = getCategoryIcon(viewingExpense.categoryId).icon;
                                        return <Icon size={32} color={getCategoryIcon(viewingExpense.categoryId).color} />;
                                    })()}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold">{viewingExpense.description}</h3>
                                    <Badge variant="secondary" className="mt-1">
                                        {viewingExpense.categoryName}
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
                                    <p className="text-lg font-semibold flex items-center gap-2">
                                        <IconCalendar size={16} />
                                        {new Date(viewingExpense.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>

                            {viewingExpense.notes && (
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Notes</p>
                                    <p className="text-sm bg-muted p-3 rounded-lg">
                                        {viewingExpense.notes}
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-2">Category Spending</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">This Category Total</span>
                                        <span className="font-semibold">
                                            ₱{(categoryTotals[viewingExpense.categoryId] || 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">% of Total Expenses</span>
                                        <span className="font-semibold">
                                            {totalExpenses > 0 
                                                ? ((categoryTotals[viewingExpense.categoryId] || 0) / totalExpenses * 100).toFixed(1)
                                                : 0
                                            }%
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
