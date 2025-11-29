"use client";

import {
    IconBriefcase,
    IconCash,
    IconChartLine,
    IconEdit,
    IconEye,
    IconPigMoney,
    IconPlus,
    IconReceipt,
    IconTrash,
    IconTrendingUp,
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

type IncomeItem = {
    id: string;
    amount: number;
    source: string;
    frequency: string;
    name: string;
    date: string;
};

const incomeSchema = z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    source: z.string().min(1, "Please select an income source"),
    frequency: z.string().min(1, "Please select a frequency"),
    name: z.string().min(1, "Income name is required"),
});

const incomeIcons: Record<
    string,
    React.ComponentType<{ size?: number; color?: string; className?: string }>
> = {
    salary: IconBriefcase,
    freelance: IconCash,
    business: IconReceipt,
    investment: IconChartLine,
    other: IconPigMoney,
};

const incomeColors: Record<string, { color: string; backgroundColor: string }> = {
    salary: {
        color: "#1a64db",
        backgroundColor: "#e7effb",
    },
    freelance: {
        color: "#f59e42",
        backgroundColor: "#fff5e6",
    },
    business: {
        color: "#e44e68",
        backgroundColor: "#fde4ec",
    },
    investment: {
        color: "#60b27e",
        backgroundColor: "#e7f7ee",
    },
    other: {
        color: "#9b59b6",
        backgroundColor: "#f4ecf7",
    },
};

const frequencyLabels: Record<string, string> = {
    "per-day": "Daily",
    "per-week": "Weekly",
    "per-month": "Monthly",
    "per-year": "Yearly",
};

export function IncomeManager() {
    const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<IncomeItem | null>(null);
    const [viewingItem, setViewingItem] = useState<IncomeItem | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);


    const [formData, setFormData] = useState({
        amount: "",
        source: "salary",
        frequency: "per-month",
        name: "",
    });
    const [errors, setErrors] = useState<z.ZodError | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("income");
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as IncomeItem[];
                setIncomeItems(parsed);
            } catch (error) {
                console.error("Error parsing income items:", error);
            }
        }
    }, []);

    const saveIncomeItems = (items: IncomeItem[]) => {
        localStorage.setItem("income", JSON.stringify(items));
        setIncomeItems(items);
        window.dispatchEvent(new Event("incomeUpdated"));
    };

    const resetForm = () => {
        setFormData({
            amount: "",
            source: "salary",
            frequency: "per-month",
            name: "",
        });
        setErrors(null);
    };

    const handleAddIncome = () => {
        try {
            const parsed = incomeSchema.parse({
                ...formData,
                amount: Number(formData.amount),
            });

            const newItem: IncomeItem = {
                id: Date.now().toString(),
                ...parsed,
                date: new Date().toISOString(),
            };

            const updatedItems = [...incomeItems, newItem];
            saveIncomeItems(updatedItems);

            toast.success("Income added successfully", {
                description: `${parsed.name} has been added to your income list.`,
            });

            resetForm();
            setIsAddDialogOpen(false);
        } catch (error) {
            setErrors(error as z.ZodError);
        }
    };

    const handleEditIncome = () => {
        if (!editingItem) return;

        try {
            const parsed = incomeSchema.parse({
                ...formData,
                amount: Number(formData.amount),
            });

            const updatedItems = incomeItems.map((item) =>
                item.id === editingItem.id ? { ...item, ...parsed, date: new Date().toISOString() } : item
            );

            saveIncomeItems(updatedItems);

            toast.success("Income updated successfully", {
                description: `${parsed.name} has been updated.`,
            });

            resetForm();
            setIsEditDialogOpen(false);
            setEditingItem(null);
        } catch (error) {
            setErrors(error as z.ZodError);
        }
    };

    const handleDeleteIncome = (id: string) => {
        const item = incomeItems.find((i) => i.id === id);
        const updatedItems = incomeItems.filter((item) => item.id !== id);
        saveIncomeItems(updatedItems);

        toast.success("Income deleted", {
            description: `${item?.name} has been removed from your income list.`,
        });
    };

    const openEditDialog = (item: IncomeItem) => {
        setEditingItem(item);
        setFormData({
            amount: item.amount.toString(),
            source: item.source,
            frequency: item.frequency,
            name: item.name,
        });
        setIsEditDialogOpen(true);
        setErrors(null);
    };

    const openViewDialog = (item: IncomeItem) => {
        setViewingItem(item);
        setIsViewDialogOpen(true);
    };

    const calculateTotals = () => {
        const totals = incomeItems.reduce(
            (acc, item) => {
                if (!acc[item.frequency]) {
                    acc[item.frequency] = 0;
                }
                acc[item.frequency] += item.amount;
                return acc;
            },
            {} as Record<string, number>
        );

        return {
            perWeek: totals["per-week"] || 0,
            perMonth: totals["per-month"] || 0,
            perYear: totals["per-year"] || 0,
        };
    };

    const { perWeek, perMonth, perYear } = calculateTotals();

    const getErrorMessage = (field: string) => {
        if (!errors) return null;
        const error = errors.issues.find((issue) => issue.path[0] === field);
        return error?.message;
    };

    return (
        <div className="w-full h-auto py-3">
            <div className="flex flex-col gap-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Income Sources</CardTitle>
                            <IconCash className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{incomeItems.length}</div>
                            <p className="text-xs text-muted-foreground">Active income streams</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Weekly Income</CardTitle>
                            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{perWeek.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Total per week</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                            <IconChartLine className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{perMonth.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Total per month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Yearly Income</CardTitle>
                            <IconChartLine className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{perYear.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Total per year</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Add Income Button */}
                <div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="cursor-pointer" variant="default">
                                <IconPlus />
                                <span>Add Income</span>
                            </Button>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Income</DialogTitle>
                                <DialogDescription>
                                    Add a new income source to track your earnings. Fill in the details below.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Income Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Main Job Salary, Freelance Project"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    {getErrorMessage("name") && (
                                        <p className="text-sm text-red-500">{getErrorMessage("name")}</p>
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

                                <div className="grid grid-cols-12 gap-4">
                                    <div className="grid gap-2 col-span-6">
                                        <Label htmlFor="source">Income Source</Label>
                                        <Select
                                            value={formData.source}
                                            onValueChange={(value) => setFormData({ ...formData, source: value })}
                                        >
                                            <SelectTrigger className="cursor-pointer w-full">
                                                <SelectValue placeholder="Select income source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem className="cursor-pointer" value="salary">
                                                    Salary
                                                </SelectItem>
                                                <SelectItem className="cursor-pointer" value="freelance">
                                                    Freelance
                                                </SelectItem>
                                                <SelectItem className="cursor-pointer" value="business">
                                                    Business
                                                </SelectItem>
                                                <SelectItem className="cursor-pointer" value="investment">
                                                    Investment
                                                </SelectItem>
                                                <SelectItem className="cursor-pointer" value="other">
                                                    Other
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {getErrorMessage("source") && (
                                            <p className="text-sm text-red-500">{getErrorMessage("source")}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2 col-span-6">
                                        <Label htmlFor="frequency">Frequency</Label>
                                        <Select
                                            value={formData.frequency}
                                            onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                                        >
                                            <SelectTrigger className="cursor-pointer w-full">
                                                <SelectValue placeholder="Select frequency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem className="cursor-pointer" value="per-week">
                                                    Per Week
                                                </SelectItem>
                                                <SelectItem className="cursor-pointer" value="per-month">
                                                    Per Month
                                                </SelectItem>
                                                <SelectItem className="cursor-pointer" value="per-year">
                                                    Per Year
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {getErrorMessage("frequency") && (
                                            <p className="text-sm text-red-500">{getErrorMessage("frequency")}</p>
                                        )}
                                    </div>
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
                                <Button className="cursor-pointer" onClick={handleAddIncome}>
                                    Add Income
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Income Items Grid */}
                <div className="grid grid-cols-12 gap-4">
                    {incomeItems.length === 0 ? (
                        <div className="col-span-12 flex flex-col items-center justify-center py-12 text-center">
                            <IconCash size={64} className="text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No income sources yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Start by adding your first income source to track your earnings.
                            </p>
                            <Button onClick={() => setIsAddDialogOpen(true)} className="cursor-pointer">
                                <IconPlus size={20} />
                                <span>Add Your First Income</span>
                            </Button>
                        </div>
                    ) : (
                        incomeItems.map((item, index) => {
                            const Icon = incomeIcons[item.source] || IconCash;
                            const colors = incomeColors[item.source] || {
                                color: "#1a64db",
                                backgroundColor: "#e7effb",
                            };

                            return (
                                <div
                                    key={index}
                                    className="group flex col-span-12 hover:bg-muted/50 transition-all duration-300 hover:shadow-md md:col-span-6 lg:col-span-4 items-center justify-between gap-4 bg-background border border-border p-2 lg:p-4 rounded-lg"
                                >
                                    <div className="flex flex-row items-center gap-4 w-full">
                                        <div
                                            style={{ backgroundColor: colors.backgroundColor }}
                                            className="rounded-xl relative p-2 size-12 flex items-center justify-center shrink-0"
                                        >
                                            <Icon size={24} color={colors.color} />
                                        </div>

                                        <div className="flex flex-col flex-1 min-w-0">
                                            <p className="text-md font-semibold truncate">{item.name}</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {item.source} · {frequencyLabels[item.frequency]}
                                            </p>
                                            <p className="text-lg font-bold text-green-600 mt-1">
                                                ₱{item.amount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="cursor-pointer hover:bg-green-100 hover:text-green-600"
                                            onClick={() => openViewDialog(item)}
                                        >
                                            <IconEye size={18} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="cursor-pointer hover:bg-blue-100 hover:text-blue-600"
                                            onClick={() => openEditDialog(item)}
                                        >
                                            <IconEdit size={18} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="cursor-pointer hover:bg-red-100 hover:text-red-600"
                                            onClick={() => handleDeleteIncome(item.id)}
                                        >
                                            <IconTrash size={18} />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Income</DialogTitle>
                        <DialogDescription>Update the details of your income source below.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Income Name</Label>
                            <Input
                                id="edit-name"
                                placeholder="e.g., Main Job Salary, Freelance Project"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            {getErrorMessage("name") && (
                                <p className="text-sm text-red-500">{getErrorMessage("name")}</p>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-source">Income Source</Label>
                                <Select
                                    value={formData.source}
                                    onValueChange={(value) => setFormData({ ...formData, source: value })}
                                >
                                    <SelectTrigger className="cursor-pointer">
                                        <SelectValue placeholder="Select income source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem className="cursor-pointer" value="salary">
                                            Salary
                                        </SelectItem>
                                        <SelectItem className="cursor-pointer" value="freelance">
                                            Freelance
                                        </SelectItem>
                                        <SelectItem className="cursor-pointer" value="business">
                                            Business
                                        </SelectItem>
                                        <SelectItem className="cursor-pointer" value="investment">
                                            Investment
                                        </SelectItem>
                                        <SelectItem className="cursor-pointer" value="other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {getErrorMessage("source") && (
                                    <p className="text-sm text-red-500">{getErrorMessage("source")}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-frequency">Frequency</Label>
                                <Select
                                    value={formData.frequency}
                                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                                >
                                    <SelectTrigger className="cursor-pointer">
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem className="cursor-pointer" value="per-week">
                                            Per Week
                                        </SelectItem>
                                        <SelectItem className="cursor-pointer" value="per-month">
                                            Per Month
                                        </SelectItem>
                                        <SelectItem className="cursor-pointer" value="per-year">
                                            Per Year
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {getErrorMessage("frequency") && (
                                    <p className="text-sm text-red-500">{getErrorMessage("frequency")}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false);
                                setEditingItem(null);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button className="cursor-pointer" onClick={handleEditIncome}>
                            Update Income
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="min-w-2/5">
                    <DialogHeader>
                        <DialogTitle>Income Details</DialogTitle>
                        <DialogDescription>
                            View the details of your income source.
                        </DialogDescription>
                    </DialogHeader>

                    {viewingItem && (
                        <div className="space-y-6 py-4 grid grid-cols-12 items-center">
                            <div className="flex flex-col items-start gap-4 col-span-6">
                                <div className="flex flex-row items-center gap-4">
                                    <div
                                        style={{
                                            backgroundColor: incomeColors[viewingItem.source]?.backgroundColor || "#e7effb"
                                        }}
                                        className="rounded-xl p-3 size-16 flex items-center justify-center"
                                    >
                                        {(() => {
                                            const Icon = incomeIcons[viewingItem.source] || IconCash;
                                            return <Icon size={32} color={incomeColors[viewingItem.source]?.color || "#1a64db"} />;
                                        })()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{viewingItem.name}</h3>
                                        <p className="text-sm text-muted-foreground capitalize">
                                            {viewingItem.source}
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
                                            {frequencyLabels[viewingItem.frequency]}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Date Added</p>
                                    <p className="text-sm font-medium">
                                        {new Date(viewingItem.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
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
                                                    ₱{(viewingItem.frequency === "per-month" ? viewingItem.amount / 4 : viewingItem.amount / 52).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        )}
                                        {viewingItem.frequency !== "per-month" && (
                                            <div className="flex justify-between w-full">
                                                <span className="text-sm">Per Month</span>
                                                <span className="font-semibold">
                                                    ₱{(viewingItem.frequency === "per-week" ? viewingItem.amount * 4 : viewingItem.amount / 12).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        )}
                                        {viewingItem.frequency !== "per-year" && (
                                            <div className="flex justify-between w-full">
                                                <span className="text-sm">Per Year</span>
                                                <span className="font-semibold">
                                                    ₱{(viewingItem.frequency === "per-week" ? viewingItem.amount * 52 : viewingItem.amount * 12).toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
                                            <span className="font-semibold">
                                                10%
                                            </span>
                                        </div>
                                        <div className="flex justify-between w-full">
                                            <span className="text-sm">Food</span>
                                            <span className="font-semibold">
                                                10%
                                            </span>
                                        </div>

                                        <div className="flex justify-between w-full">
                                            <span className="text-sm">Entertainment</span>
                                            <span className="font-semibold">
                                                10%
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Other</span>
                                            <span className="font-semibold">
                                                10%
                                            </span>
                                        </div>
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
                                setViewingItem(null);
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            className="cursor-pointer"
                            onClick={() => {
                                if (viewingItem) {
                                    setIsViewDialogOpen(false);
                                    openEditDialog(viewingItem);
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
