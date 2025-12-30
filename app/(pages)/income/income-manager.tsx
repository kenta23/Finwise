"use client";

import {
    IconCash,
    IconChartLine,
    IconEdit,
    IconEye,
    IconLoader2,
    IconPigMoney,
    IconPlus,
    IconReceipt,
    IconTrash,
    IconTrendingUp,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Form from "next/form";
import { startTransition, useEffect, useOptimistic, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { deleteIncome, editIncome, getIncome } from "@/app/actions/income";
import { submitNewIncome } from "@/app/actions/query";
import { frequencyLabels, incomeColors, incomeIcons, incomeSources } from "@/data";
import { useSession } from "@/lib/auth-client";
import { Frequency, type incomeItem, type incomeItems } from "@/types";
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
import EditIncomeDialog from "./edit-income-dialog";
import { ViewIncomeDialog } from "./view-income-dialog";

const incomeSchema = z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    source: z.string().min(1, "Please select an income source"),
    frequency: z.string().min(1, "Please select a frequency"),
    income_name: z.string().min(1, "Income name is required"),
});

export function IncomeManager() {
    const { data: session } = useSession();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<incomeItem | null>(null);
    const [viewingItem, setViewingItem] = useState<incomeItem | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        amount: 0,
        source: "",
        frequency: Frequency.PER_MONTH,
        income_name: "",
    });
    const [errors, setErrors] = useState<z.ZodError | null>(null);
    const {
        data: incomeData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["income"],
        queryFn: async () => await getIncome(),
    });

    const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
    const { mutate: deleteIncomeMutation, isPending: isDeletePending } = useMutation({
        mutationFn: async (id: string) => await deleteIncome(id),
        onSuccess: (data) => {
            toast.success(data.message, {
                description: "Income has been removed from your income list.",
            });
            queryClient.invalidateQueries({ queryKey: ["income"] });
            setDeletingItemId(null);
        },
        onError: (error) => {
            toast.error(error.message, {
                description: "Failed to delete income",
            });
            setDeletingItemId(null);
        },
        onSettled: () => {
            setDeletingItemId(null);
        },
    });
    //optimistic update
    // Define action types for optimistic updates

    type OptimisticAction =
        | { type: "delete"; id: string }
        | { type: "add"; item: incomeItem }
        | { type: "edit"; item: incomeItem };

    const [optimisticIncomeData, optimisticUpdate] = useOptimistic(
        incomeData?.data?.map((item) => ({
            ...item,
            frequency: item.frequency as Frequency,
        })) || [],
        (state: incomeItem[], action: OptimisticAction): incomeItems => {
            if (action.type === "delete") {
                return state.filter((item) => item.id !== action.id);
            }
            if (action.type === "add") {
                return [...state, action.item].sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            }
            if (action.type === "edit") {
                return state.map((item) =>
                    item.id === action.item.id ? { ...item, ...action.item } : item
                );
            }
            return state;
        }
    );

    //mutation
    const { mutate: editIncomeMutation, isPending: isEditPending } = useMutation({
        mutationKey: ["editIncome"],
        onSuccess: (data) => {
            toast.success(data.message, {
                description: "Income has been updated successfully",
            });
            queryClient.invalidateQueries({ queryKey: ["income"] });
        },
        onError: (error) => {
            toast.error(error.message, {
                description: "Failed to edit income",
            });
        },
        mutationFn: async ({ formData, id }: { formData: Partial<incomeItem>; id: string }) =>
            await editIncome(formData as { amount: number; source: string; frequency: Frequency; income_name: string }, id),
    });

    const {
        mutate: submitNewIncomeMutation,
        isPending,
        isSuccess,
    } = useMutation({
        mutationKey: ["submitNewIncome"],
        mutationFn: async (
            formdata: {
                amount: number;
                source: string;
                frequency: Frequency;
                income_name: string;
            }
        ) =>
            await submitNewIncome({
                amount: formdata.amount,
                source: formdata.source,
                frequency: formdata.frequency,
                income_name: formdata.income_name,
            }),
        onSuccess: (data) => {
            toast.success(data.message, {
                description: `${formData.income_name} has been added to your income list.`,
            });

            setIsAddDialogOpen(false);
            resetForm();
            queryClient.invalidateQueries({ queryKey: ["income"] });
        },
        onError: (error) => {
            toast.error(error.message, {
                description: `${formData.income_name} has not been added to your income list.`,
            });
        },
    });

    const resetForm = () => {
        setFormData({
            amount: 0,
            source: "",
            frequency: Frequency.PER_MONTH,
            income_name: "",
        });
        setErrors(null);
    };

    const handleAddIncome = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const parsedData = incomeSchema.safeParse(formData);


        console.log("parsedData", parsedData);

        if (!parsedData.success) {
            setErrors(parsedData.error);
            return;
        }

        setIsAddDialogOpen(false);
        resetForm();
        startTransition(() => {
            optimisticUpdate({
                type: "add",
                item: {
                    ...parsedData.data,
                    id: crypto.randomUUID(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: session?.user?.id as string,
                    incomeSource: {
                        name: parsedData.data.source as string,
                        id: crypto.randomUUID(),
                    },
                    frequency: parsedData.data.frequency as Frequency,
                },
            });
            // Pass correct types to submitNewIncomeMutation
            submitNewIncomeMutation({
                ...parsedData.data,
                frequency: parsedData.data.frequency as Frequency,
            });
        });
    };

    const handleEditIncome = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!editingItem || !editingItem.id) return;

        try {
            setIsEditDialogOpen(false);

            startTransition(() => {
                optimisticUpdate({
                    type: "edit",
                    item: {
                        ...editingItem,
                        ...formData,
                        id: editingItem.id as string,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        userId: session?.user?.id as string,
                    },
                });
                editIncomeMutation({ formData, id: editingItem.id as string });
                setEditingItem(null);
                resetForm();
            });
        } catch (error) {
            setErrors(error as z.ZodError);
        }
    };

    const handleDeleteIncome = (id: string) => {
        // Optimistically update UI immediately (wrapped in startTransition for React 19+)
        startTransition(() => {
            optimisticUpdate({ type: "delete", id });
        });
        // Then perform the actual mutation
        deleteIncomeMutation(id);
    };

    const openEditDialog = (item: incomeItem) => {
        setEditingItem(item);
        setFormData({
            amount: item.amount,
            source: item.incomeSource?.name || "",
            frequency: item.frequency,
            income_name: item.income_name,
        });
        setIsEditDialogOpen(true);
        setErrors(null);
    };

    const openViewDialog = (item: incomeItem) => {
        setViewingItem(item);
        setIsViewDialogOpen(true);
    };

    const calculateTotals = () => {
        const totals = optimisticIncomeData?.reduce(
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
            total: totals.perWeek + totals.perMonth + totals.perYear,
        };
    };

    const { perWeek, perMonth, perYear, total } = calculateTotals();

    const getErrorMessage = (field: string) => {
        if (!errors) return null;
        const error = errors.issues.find((issue) => issue.path[0] === field);
        return error?.message;
    };

    const handleSubmitNewIncome = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        console.log("formData", formData);

        submitNewIncomeMutation(formData);
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
                            <div className="text-2xl font-bold">{optimisticIncomeData?.length}</div>
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
                                    <Label htmlFor="income_name">Income Name</Label>
                                    <Input
                                        id="income_name"
                                        name="income_name"
                                        disabled={isPending}
                                        placeholder="e.g., Main Job Salary, Freelance Project"
                                        value={formData.income_name}
                                        onChange={(e) => setFormData({ ...formData, income_name: e.target.value })}
                                    />
                                    {getErrorMessage("income_name") && (
                                        <p className="text-sm text-red-500">{getErrorMessage("income_name")}</p>
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
                                            name="amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="pl-6"
                                            value={formData.amount === 0 ? "" : formData.amount}
                                            disabled={isPending}
                                            onChange={(e) => {
                                                const numValue = e.target.value === "" ? 0 : Number(e.target.value);
                                                setFormData({ ...formData, amount: numValue });
                                            }}
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
                                            disabled={isPending}
                                            name="source"
                                            value={formData.source || undefined}
                                            onValueChange={(value) => setFormData({ ...formData, source: value })}
                                        >
                                            <SelectTrigger className="cursor-pointer w-full">
                                                <SelectValue placeholder="Select income source" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {incomeSources.map((income) => (
                                                    <SelectItem
                                                        key={income.id}
                                                        className="cursor-pointer"
                                                        value={income.name}
                                                    >
                                                        {income.name.charAt(0).toUpperCase() + income.name.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {getErrorMessage("source") && (
                                            <p className="text-sm text-red-500">{getErrorMessage("source")}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2 col-span-6">
                                        <Label htmlFor="frequency">Frequency</Label>
                                        <Select
                                            disabled={isPending}
                                            name="frequency"
                                            value={formData.frequency || undefined}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, frequency: value as Frequency })
                                            }
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
                                    disabled={isPending}
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAddDialogOpen(false)}
                                    className="cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={isPending}
                                    type="button"
                                    onClick={handleAddIncome}
                                    className="cursor-pointer"
                                >
                                    {isPending ? (
                                        <IconLoader2 className="animate-spin" size={18} />
                                    ) : (
                                        <IconPlus size={18} />
                                    )}{" "}
                                    <span>Add Income</span>
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Income Items Grid */}
                <div className="grid grid-cols-12 gap-4">
                    {optimisticIncomeData && optimisticIncomeData.length === 0 ? (
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
                        optimisticIncomeData?.map((item, index: number) => {
                            const Icon =
                                incomeIcons[item.incomeSource?.name.toLowerCase() as keyof typeof incomeIcons] ||
                                IconCash;
                            const colors = incomeColors[
                                item.incomeSource?.name.toLowerCase() as keyof typeof incomeColors
                            ] || {
                                color: "#1a64db",
                                backgroundColor: "#e7effb",
                            };

                            return (
                                <div
                                    key={item.id}
                                    className={`group ${item.id === editingItem?.id ? "opacity-50" : ""} flex col-span-12 hover:bg-muted/50 transition-all duration-300 hover:shadow-md md:col-span-6 lg:col-span-4 items-center justify-between gap-4 bg-background border border-border p-2 lg:p-4 rounded-lg`}
                                >
                                    <div className="flex flex-row items-center gap-4 w-full">
                                        <div
                                            style={{ backgroundColor: colors.backgroundColor }}
                                            className="rounded-xl relative p-2 size-12 flex items-center justify-center shrink-0"
                                        >
                                            <Icon size={24} color={colors.color} />
                                        </div>

                                        <div className="flex flex-col flex-1 min-w-0">
                                            <p className="text-md font-semibold truncate">{item.income_name}</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {item.incomeSource &&
                                                    item.incomeSource?.name.charAt(0).toUpperCase() +
                                                    item.incomeSource?.name.slice(1)}{" "}
                                                · {frequencyLabels.find((label) => label.value === item.frequency.toString())?.label}
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
                                            onClick={() =>
                                                openViewDialog({
                                                    ...item,
                                                    createdAt: item.createdAt as Date,
                                                    frequency: item.frequency as Frequency,
                                                })
                                            }
                                        >
                                            <IconEye size={18} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="cursor-pointer hover:bg-blue-100 hover:text-blue-600"
                                            onClick={() =>
                                                openEditDialog({
                                                    ...item,
                                                    createdAt: item.createdAt as Date,
                                                    frequency: item.frequency as Frequency,
                                                })
                                            }
                                        >
                                            <IconEdit size={18} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="cursor-pointer hover:bg-red-100 hover:text-red-600"
                                            onClick={() => {
                                                setDeletingItemId(item.id);
                                                handleDeleteIncome(item.id);
                                            }}
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
            <Dialog
                open={isEditDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsEditDialogOpen(false);
                        setEditingItem(null);
                        resetForm();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Income</DialogTitle>
                        <DialogDescription>Update the details of your income source below.</DialogDescription>
                    </DialogHeader>

                    <EditIncomeDialog
                        getErrorMessage={getErrorMessage}
                        formData={formData}
                        setFormData={setFormData}
                    />

                    <DialogFooter>
                        <Button
                            variant="outline"
                            type="button"
                            className="cursor-pointer"
                            disabled={isEditPending}
                            onClick={() => {
                                setIsEditDialogOpen(false);
                                setEditingItem(null);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="cursor-pointer"
                            type="button"
                            onClick={handleEditIncome}
                            disabled={isEditPending}
                        >
                            {isEditPending ? (
                                <IconLoader2 className="animate-spin" size={18} />
                            ) : (
                                <IconEdit size={18} />
                            )}
                            <span>Update Income</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="min-w-2/5">
                    <DialogHeader>
                        <DialogTitle>Income Details</DialogTitle>
                        <DialogDescription>View the details of your income source.</DialogDescription>
                    </DialogHeader>

                    {viewingItem && <ViewIncomeDialog viewingItem={viewingItem} />}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            type="button"
                            className="cursor-pointer"
                            onClick={() => {
                                setIsViewDialogOpen(false);
                                setViewingItem(null);
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            className="cursor-pointer"
                            type="button"
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
