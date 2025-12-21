"use client";

import {
    IconChartLine,
    IconEdit,
    IconEye,
    IconPigMoney,
    IconPlus,
    IconTarget,
    IconTrash,
    IconTrendingUp,
    IconWallet,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
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
import { Progress } from "../../../components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { savingsSchema, SavingsItem, savingsIcons, savingsColors, savingsTypeLabels } from './data';
import { useQuery } from "@tanstack/react-query";
import { getSavings } from "@/app/actions/savings";

export function SavingsManager() {
    const [savingsItems, setSavingsItems] = useState<SavingsItem[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SavingsItem | null>(null);
    const [viewingItem, setViewingItem] = useState<SavingsItem | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const { data: savingsData, isLoading, isError } = useQuery({
        queryKey: ["savings"],
        queryFn: async () => await getSavings()
    })

    console.log("savingsData", savingsData);

    const [formData, setFormData] = useState({
        name: "",
        type: "emergency",
        bankName: "",
        accountNumber: "",
        currentAmount: "",
        goalAmount: "",
        notes: "",
    });
    const [errors, setErrors] = useState<z.ZodError | null>(null);

    // useEffect(() => {
    //     const stored = localStorage.getItem("savings");
    //     if (stored) {
    //         try {
    //             const parsed = JSON.parse(stored) as SavingsItem[];
    //             setSavingsItems(parsed);
    //         } catch (error) {
    //             console.error("Error parsing savings items:", error);
    //         }
    //     }
    // }, []);

    const saveSavingsItems = (items: SavingsItem[]) => {
        localStorage.setItem("savings", JSON.stringify(items));
        setSavingsItems(items);
        window.dispatchEvent(new Event("savingsUpdated"));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            type: "emergency",
            bankName: "",
            accountNumber: "",
            currentAmount: "",
            goalAmount: "",
            notes: "",
        });
        setErrors(null);
    };

    const handleAddSavings = () => {
        try {
            const parsed = savingsSchema.parse({
                ...formData,
                currentAmount: Number(formData.currentAmount) || 0,
                goalAmount: Number(formData.goalAmount),
            });

            const newItem: SavingsItem = {
                id: Date.now().toString(),
                ...parsed,
                date: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
            };

            const updatedItems = [...savingsItems, newItem];
            saveSavingsItems(updatedItems);

            toast.success("Savings account added successfully", {
                description: `${parsed.name} has been added to your savings list.`,
            });

            resetForm();
            setIsAddDialogOpen(false);
        } catch (error) {
            setErrors(error as z.ZodError);
        }
    };

    const handleEditSavings = () => {
        if (!editingItem) return;

        try {
            const parsed = savingsSchema.parse({
                ...formData,
                currentAmount: Number(formData.currentAmount) || 0,
                goalAmount: Number(formData.goalAmount),
            });

            const updatedItems = savingsItems.map((item) =>
                item.id === editingItem.id
                    ? { ...item, ...parsed, lastUpdated: new Date().toISOString() }
                    : item
            );

            saveSavingsItems(updatedItems);

            toast.success("Savings account updated successfully", {
                description: `${parsed.name} has been updated.`,
            });

            resetForm();
            setIsEditDialogOpen(false);
            setEditingItem(null);
        } catch (error) {
            setErrors(error as z.ZodError);
        }
    };

    const handleDeleteSavings = (id: string) => {
        const item = savingsItems.find((i) => i.id === id);
        const updatedItems = savingsItems.filter((item) => item.id !== id);
        saveSavingsItems(updatedItems);

        toast.success("Savings account deleted", {
            description: `${item?.name} has been removed from your savings list.`,
        });
    };

    const openEditDialog = (item: SavingsItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            type: item.type,
            bankName: item.bankName,
            accountNumber: item.accountNumber || "",
            currentAmount: item.currentAmount.toString(),
            goalAmount: item.goalAmount.toString(),
            notes: item.notes || "",
        });
        setIsEditDialogOpen(true);
        setErrors(null);
    };

    const openViewDialog = (item: SavingsItem) => {
        setViewingItem(item);
        setIsViewDialogOpen(true);
    };

    const calculateTotals = () => {
        const totalCurrent = savingsData?.data?.reduce((acc: number, item: SavingsItem) => acc + item.currentAmount, 0);
        const totalGoal = savingsData?.data?.reduce((acc: number, item: SavingsItem) => acc + item.goalAmount, 0);
        const totalRemaining = totalGoal - totalCurrent;
        const overallProgress = totalGoal > 0 ? (totalCurrent / totalGoal) * 100 : 0;

        return {
            totalCurrent: totalCurrent || 0,
            totalGoal: totalGoal || 0,
            totalRemaining: totalRemaining || 0,
            overallProgress: overallProgress || 0,
        };
    };

    const { totalCurrent, totalGoal, totalRemaining, overallProgress } = calculateTotals();

    const getErrorMessage = (field: string) => {
        if (!errors) return null;
        const error = errors.issues.find((issue) => issue.path[0] === field);
        return error?.message;
    };

    const calculateProgress = (current: number, goal: number) => {
        if (goal === 0) return 0;
        return Math.min(100, (current / goal) * 100);
    };

    return (
        <div className="w-full h-auto py-3">
            <div className="flex flex-col gap-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                            <IconPigMoney className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{totalCurrent.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Current savings across all accounts</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Goal</CardTitle>
                            <IconTarget className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{totalGoal.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Combined savings goals</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{totalRemaining.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Amount needed to reach goals</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                            <IconChartLine className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overallProgress.toFixed(1)}%</div>
                            <Progress value={overallProgress} className="mt-2" />
                            <p className="text-xs text-muted-foreground mt-2">Progress towards all goals</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Add Savings Button */}
                <div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="cursor-pointer" variant="default">
                                <IconPlus />
                                <span>Add Savings Account</span>
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Savings Account</DialogTitle>
                                <DialogDescription>
                                    Add a new savings account or goal to track your savings progress. Fill in the
                                    details below.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Savings Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Emergency Fund, Vacation Savings"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    {getErrorMessage("name") && (
                                        <p className="text-sm text-red-500">{getErrorMessage("name")}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Savings Type</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                                        >
                                            <SelectTrigger className="cursor-pointer w-full">
                                                <SelectValue placeholder="Select savings type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem className="cursor-pointer" value="emergency">
                                                    Emergency Fund
                                                </SelectItem>
                                                <SelectItem className="cursor-pointer" value="vacation">
                                                    Vacation
                                                </SelectItem>
                                                <SelectItem className="cursor-pointer" value="house">
                                                    House Down Payment
                                                </SelectItem>
                                                <SelectItem className="cursor-pointer" value="car">
                                                    Car Purchase
                                                </SelectItem>
                                                <SelectItem className="cursor-pointer" value="retirement">
                                                    Retirement
                                                </SelectItem>
                                                <SelectItem className="cursor-pointer" value="wedding">
                                                    Wedding
                                                </SelectItem>
                                                <SelectItem className="cursor-pointer" value="education">
                                                    Education
                                                </SelectItem>
                                                <SelectItem className="cursor-pointer" value="other">
                                                    Other
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {getErrorMessage("type") && (
                                            <p className="text-sm text-red-500">{getErrorMessage("type")}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="bankName">Bank Name</Label>
                                        <Input
                                            id="bankName"
                                            placeholder="e.g., BPI, BDO, Metrobank"
                                            value={formData.bankName}
                                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                        />
                                        {getErrorMessage("bankName") && (
                                            <p className="text-sm text-red-500">{getErrorMessage("bankName")}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="accountNumber">Account Number (Optional)</Label>
                                    <Input
                                        id="accountNumber"
                                        placeholder="Enter account number"
                                        value={formData.accountNumber}
                                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="currentAmount">Current Amount</Label>
                                        <div className="relative">
                                            <span className="text-muted-foreground text-sm absolute left-2 top-1/2 -translate-y-1/2">
                                                ₱
                                            </span>
                                            <Input
                                                id="currentAmount"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="pl-6"
                                                value={formData.currentAmount}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, currentAmount: e.target.value })
                                                }
                                            />
                                        </div>
                                        {getErrorMessage("currentAmount") && (
                                            <p className="text-sm text-red-500">{getErrorMessage("currentAmount")}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="goalAmount">Goal Amount</Label>
                                        <div className="relative">
                                            <span className="text-muted-foreground text-sm absolute left-2 top-1/2 -translate-y-1/2">
                                                ₱
                                            </span>
                                            <Input
                                                id="goalAmount"
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="pl-6"
                                                value={formData.goalAmount}
                                                onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                                            />
                                        </div>
                                        {getErrorMessage("goalAmount") && (
                                            <p className="text-sm text-red-500">{getErrorMessage("goalAmount")}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Add any additional notes about this savings account..."
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
                                <Button className="cursor-pointer" onClick={handleAddSavings}>
                                    Add Savings
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Savings Items Grid */}
                <div className="grid grid-cols-12 gap-4">
                    {savingsData?.data?.length === 0 ? (
                        <div className="col-span-12 flex flex-col items-center justify-center py-12 text-center">
                            <IconPigMoney size={64} className="text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No savings accounts yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Start by adding your first savings account or goal to track your progress.
                            </p>
                            <Button onClick={() => setIsAddDialogOpen(true)} className="cursor-pointer">
                                <IconPlus size={20} />
                                <span>Add Your First Savings</span>
                            </Button>
                        </div>
                    ) : (
                        savingsData?.data?.map((item: SavingsItem) => {
                            const Icon = savingsIcons[item.type] || IconWallet;
                            const colors = savingsColors[item.type] || {
                                color: "#1a64db",
                                backgroundColor: "#e7effb",
                            };
                            const progress = calculateProgress(item.currentAmount, item.goalAmount);
                            const remaining = item.goalAmount - item.currentAmount;

                            return (
                                <div
                                    key={item.id}
                                    className="group flex col-span-12 hover:bg-muted/50 transition-all duration-300 hover:shadow-md md:col-span-6 lg:col-span-4 flex-col gap-4 bg-background border border-border p-4 rounded-lg"
                                >
                                    <div className="flex flex-row items-center justify-between">
                                        <div className="flex flex-row items-center gap-4">
                                            <div
                                                style={{ backgroundColor: colors.backgroundColor }}
                                                className="rounded-xl relative p-2 size-12 flex items-center justify-center shrink-0"
                                            >
                                                <Icon size={24} color={colors.color} />
                                            </div>

                                            <div className="flex flex-col flex-1 min-w-0">
                                                <p className="text-md font-semibold truncate">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {savingsTypeLabels[item.type] || item.type}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">{item.bankName}</p>
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
                                                onClick={() => handleDeleteSavings(item.id)}
                                            >
                                                <IconTrash size={18} />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Current</span>
                                            <span className="text-lg font-bold text-green-600">
                                                ₱{item.currentAmount.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Goal</span>
                                            <span className="text-sm font-semibold">
                                                ₱{item.goalAmount.toLocaleString()}
                                            </span>
                                        </div>
                                        <Progress value={progress} className="h-2" />
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground">{progress.toFixed(1)}% complete</span>
                                            <span className="text-muted-foreground">
                                                ₱{remaining.toLocaleString()} remaining
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Savings Account</DialogTitle>
                        <DialogDescription>Update the details of your savings account below.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Savings Name</Label>
                            <Input
                                id="edit-name"
                                placeholder="e.g., Emergency Fund, Vacation Savings"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            {getErrorMessage("name") && (
                                <p className="text-sm text-red-500">{getErrorMessage("name")}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-type">Savings Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger className="cursor-pointer">
                                        <SelectValue placeholder="Select savings type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem className="cursor-pointer" value="emergency">
                                            Emergency Fund
                                        </SelectItem>
                                        <SelectItem className="cursor-pointer" value="vacation">
                                            Vacation
                                        </SelectItem>
                                        <SelectItem className="cursor-pointer" value="house">
                                            House Down Payment
                                        </SelectItem>
                                        <SelectItem className="cursor-pointer" value="car">
                                            Car Purchase
                                        </SelectItem>
                                        <SelectItem className="cursor-pointer" value="retirement">
                                            Retirement
                                        </SelectItem>
                                        <SelectItem className="cursor-pointer" value="wedding">
                                            Wedding
                                        </SelectItem>
                                        <SelectItem className="cursor-pointer" value="education">
                                            Education
                                        </SelectItem>
                                        <SelectItem className="cursor-pointer" value="other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {getErrorMessage("type") && (
                                    <p className="text-sm text-red-500">{getErrorMessage("type")}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-bankName">Bank Name</Label>
                                <Input
                                    id="edit-bankName"
                                    placeholder="e.g., BPI, BDO, Metrobank"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                />
                                {getErrorMessage("bankName") && (
                                    <p className="text-sm text-red-500">{getErrorMessage("bankName")}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-accountNumber">Account Number (Optional)</Label>
                            <Input
                                id="edit-accountNumber"
                                placeholder="Enter account number"
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-currentAmount">Current Amount</Label>
                                <div className="relative">
                                    <span className="text-muted-foreground text-sm absolute left-2 top-1/2 -translate-y-1/2">
                                        ₱
                                    </span>
                                    <Input
                                        id="edit-currentAmount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="pl-6"
                                        value={formData.currentAmount}
                                        onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                                    />
                                </div>
                                {getErrorMessage("currentAmount") && (
                                    <p className="text-sm text-red-500">{getErrorMessage("currentAmount")}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-goalAmount">Goal Amount</Label>
                                <div className="relative">
                                    <span className="text-muted-foreground text-sm absolute left-2 top-1/2 -translate-y-1/2">
                                        ₱
                                    </span>
                                    <Input
                                        id="edit-goalAmount"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="pl-6"
                                        value={formData.goalAmount}
                                        onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                                    />
                                </div>
                                {getErrorMessage("goalAmount") && (
                                    <p className="text-sm text-red-500">{getErrorMessage("goalAmount")}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-notes">Notes (Optional)</Label>
                            <Textarea
                                id="edit-notes"
                                placeholder="Add any additional notes about this savings account..."
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
                                setEditingItem(null);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button className="cursor-pointer" onClick={handleEditSavings}>
                            Update Savings
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="min-w-2/5">
                    <DialogHeader>
                        <DialogTitle>Savings Account Details</DialogTitle>
                        <DialogDescription>View the details of your savings account.</DialogDescription>
                    </DialogHeader>

                    {viewingItem && (
                        <div className="space-y-6 py-4 grid grid-cols-12 items-start">
                            <div className="flex flex-col items-start gap-4 col-span-6">
                                <div className="flex flex-row items-center gap-4">
                                    <div
                                        style={{
                                            backgroundColor:
                                                savingsColors[viewingItem.type]?.backgroundColor || "#e7effb",
                                        }}
                                        className="rounded-xl p-3 size-16 flex items-center justify-center"
                                    >
                                        {(() => {
                                            const Icon = savingsIcons[viewingItem.type] || IconWallet;
                                            return (
                                                <Icon
                                                    size={32}
                                                    color={savingsColors[viewingItem.type]?.color || "#1a64db"}
                                                />
                                            );
                                        })()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{viewingItem.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {savingsTypeLabels[viewingItem.type] || viewingItem.type}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 w-full">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Bank Name</p>
                                        <p className="text-lg font-semibold">{viewingItem.bankName}</p>
                                    </div>
                                    {viewingItem.accountNumber && (
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Account Number</p>
                                            <p className="text-lg font-semibold">{viewingItem.accountNumber}</p>
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Current Amount</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            ₱{viewingItem.currentAmount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Goal Amount</p>
                                        <p className="text-2xl font-bold">₱{viewingItem.goalAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-2 w-full">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className="font-semibold">
                                                {calculateProgress(
                                                    viewingItem.currentAmount,
                                                    viewingItem.goalAmount
                                                ).toFixed(1)}
                                                %
                                            </span>
                                        </div>
                                        <Progress
                                            value={calculateProgress(viewingItem.currentAmount, viewingItem.goalAmount)}
                                            className="h-3"
                                        />
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Remaining</span>
                                            <span className="font-semibold">
                                                ₱{(viewingItem.goalAmount - viewingItem.currentAmount).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {viewingItem.notes && (
                                    <div className="space-y-1 w-full">
                                        <p className="text-sm text-muted-foreground">Notes</p>
                                        <p className="text-sm font-medium">{viewingItem.notes}</p>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Date Created</p>
                                    <p className="text-sm font-medium">
                                        {new Date(viewingItem.date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Last Updated</p>
                                    <p className="text-sm font-medium">
                                        {new Date(viewingItem.lastUpdated).toLocaleDateString("en-US", {
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
                                    <p className="text-sm text-muted-foreground mb-2">Savings Breakdown</p>

                                    <div className="space-y-2 w-full">
                                        <div className="flex flex-row justify-between w-full">
                                            <span className="text-sm">Current Savings</span>
                                            <span className="font-semibold">
                                                ₱{viewingItem.currentAmount.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between w-full">
                                            <span className="text-sm">Goal Amount</span>
                                            <span className="font-semibold">
                                                ₱{viewingItem.goalAmount.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between w-full">
                                            <span className="text-sm">Remaining</span>
                                            <span className="font-semibold text-red-600">
                                                ₱{(viewingItem.goalAmount - viewingItem.currentAmount).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between w-full pt-2 border-t">
                                            <span className="text-sm font-medium">Progress</span>
                                            <span className="font-semibold text-green-600">
                                                {calculateProgress(
                                                    viewingItem.currentAmount,
                                                    viewingItem.goalAmount
                                                ).toFixed(1)}
                                                %
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t col-span-6 w-full">
                                    <p className="text-sm text-muted-foreground mb-2">Account Information</p>

                                    <div className="space-y-2 w-full">
                                        <div className="flex justify-between w-full">
                                            <span className="text-sm">Bank</span>
                                            <span className="font-semibold">{viewingItem.bankName}</span>
                                        </div>
                                        {viewingItem.accountNumber && (
                                            <div className="flex justify-between w-full">
                                                <span className="text-sm">Account Number</span>
                                                <span className="font-semibold">{viewingItem.accountNumber}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between w-full">
                                            <span className="text-sm">Type</span>
                                            <span className="font-semibold capitalize">
                                                {savingsTypeLabels[viewingItem.type] || viewingItem.type}
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
