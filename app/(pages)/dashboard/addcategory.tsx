"use client";

import { IconEdit, IconEye, IconPlus, IconTrash } from "@tabler/icons-react";
import { Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../../../components/ui/button";
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
import { categories } from "../../../data";

const schema = z.object({
    categoryId: z
        .number({ error: "Please select a category" })
        .refine((value) => categories.some((item) => item.id === value), {
            message: "Please select a category",
        }),
    categoryName: z.string().min(1, {
        message: "Category name is required",
    }),
});

export default function AddCategory() {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [categoryName, setCategoryName] = useState<string>("");
    const [error, setError] = useState<z.ZodError | null>(null);
    const [fetchCategories, setFetchCategories] = useState<
        { categoryId: number; categoryName: string }[]
    >([]);

    // Dialog states
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [viewingCategory, setViewingCategory] = useState<{
        categoryId: number;
        categoryName: string;
    } | null>(null);
    const [editingCategory, setEditingCategory] = useState<{
        categoryId: number;
        categoryName: string;
        index: number;
    } | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<{
        categoryId: number;
        categoryName: string;
        index: number;
    } | null>(null);

    // Edit form states
    const [editSelectedCategory, setEditSelectedCategory] = useState<number | null>(null);
    const [editCategoryName, setEditCategoryName] = useState<string>("");
    const [editError, setEditError] = useState<z.ZodError | null>(null);

    const getCategories = useCallback(() => {
        const getItem = localStorage.getItem("selectedCategory");
        if (getItem) {
            const parsedItem = JSON.parse(getItem) as { categoryId: number; categoryName: string }[];
            setFetchCategories(parsedItem);
        }
        return [];
    }, []);

    useEffect(() => {
        getCategories();
    }, [getCategories]);

    function handleSubmitCategory() {
        console.log("selectedCategory", selectedCategory);

        const category = categories.find(
            (item) => item.id === selectedCategory
        );

        try {
            const parsedData = schema.parse({
                categoryId: category?.id,
                categoryName: categoryName,
            });

            console.log("parsedData", parsedData);

            if (parsedData.categoryId && parsedData.categoryName) {
                const getItem = localStorage.getItem("selectedCategory");

                if (getItem) {
                    const parsedItem = JSON.parse(getItem);

                    const updateItem = [...parsedItem, parsedData];

                    localStorage.setItem("selectedCategory", JSON.stringify(updateItem));

                    toast.success("Category added successfully", {
                        description: "Category added successfully",
                        action: {
                            label: "Close",
                            onClick: () => {
                                toast.dismiss();
                            },
                        },
                    });

                    setSelectedCategory(null);
                    setCategoryName("");
                    setError(null);

                    getCategories();
                } else {
                    localStorage.setItem("selectedCategory", JSON.stringify([parsedData]));

                    toast.success("Category added successfully", {
                        description: "Category added successfully",
                        action: {
                            label: "Close",
                            onClick: () => {
                                toast.dismiss();
                            },
                        },
                    });

                    setSelectedCategory(null);
                    setCategoryName("");
                    setError(null);

                    //fetch new categories
                    getCategories();
                }
            }
        } catch (error) {
            console.log("error", error);
            setError(error as z.ZodError);
        }
    }

    function openViewDialog(category: { categoryId: number; categoryName: string }) {
        setViewingCategory(category);
        setIsViewDialogOpen(true);
    }

    function openEditDialog(category: { categoryId: number; categoryName: string }, index: number) {
        setEditingCategory({ ...category, index });
        setEditSelectedCategory(category.categoryId);
        setEditCategoryName(category.categoryName);
        setEditError(null);
        setIsEditDialogOpen(true);
    }

    function openDeleteDialog(category: { categoryId: number; categoryName: string }, index: number) {
        setDeletingCategory({ ...category, index });
        setIsDeleteDialogOpen(true);
    }

    function handleEditCategory() {
        const category = categories.find(
            (item) => item.id === editSelectedCategory
        );

        try {
            const parsedData = schema.parse({
                categoryId: category?.id,
                categoryName: editCategoryName,
            });

            if (parsedData.categoryId && parsedData.categoryName && editingCategory) {
                const getItem = localStorage.getItem("selectedCategory");
                if (getItem) {
                    const parsedItem = JSON.parse(getItem) as { categoryId: number; categoryName: string }[];
                    const updatedItem = [...parsedItem];
                    updatedItem[editingCategory.index] = parsedData;

                    localStorage.setItem("selectedCategory", JSON.stringify(updatedItem));

                    toast.success("Category updated successfully", {
                        description: "Category has been updated",
                        action: {
                            label: "Close",
                            onClick: () => {
                                toast.dismiss();
                            },
                        },
                    });

                    setIsEditDialogOpen(false);
                    setEditingCategory(null);
                    setEditSelectedCategory(null);
                    setEditCategoryName("");
                    setEditError(null);
                    getCategories();
                }
            }
        } catch (error) {
            console.log("error", error);
            setEditError(error as z.ZodError);
        }
    }

    function handleDeleteCategory() {
        if (deletingCategory) {
            const getItem = localStorage.getItem("selectedCategory");
            if (getItem) {
                const parsedItem = JSON.parse(getItem) as { categoryId: number; categoryName: string }[];
                const updatedItem = parsedItem.filter((_, index) => index !== deletingCategory.index);

                localStorage.setItem("selectedCategory", JSON.stringify(updatedItem));

                toast.success("Category deleted successfully", {
                    description: "Category has been removed",
                    action: {
                        label: "Close",
                        onClick: () => {
                            toast.dismiss();
                        },
                    },
                });

                setIsDeleteDialogOpen(false);
                setDeletingCategory(null);
                getCategories();
            }
        }
    }

    console.log("error issues", error);

    return (
        <div className="w-full h-auto py-3">
            <h3 className="text-lg mb-4 font-semibold text-muted-foreground">Expenses Categories</h3>
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="cursor-pointer" variant={"default"}>
                                <IconPlus />
                                <span>Add Category</span>
                            </Button>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Category</DialogTitle>
                                <DialogDescription>
                                    Add a new category to your budget. Click save when you&apos;re done.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-12 gap-7">
                                <div className="col-span-12 flex flex-col gap-4">
                                    <h3 className="text-md font-semibold">Choose a category type</h3>

                                    {error?.issues[0]?.message && !selectedCategory && (
                                        <p className="text-sm text-red-500">{error.issues[0].message}</p>
                                    )}
                                    {error?.issues[1]?.message && (
                                        <p className="text-sm text-red-500">{error?.issues[1]?.message}</p>
                                    )}

                                    {/**ICON CARD*/}
                                    <div className="grid grid-cols-12 items-center justify-center gap-4">
                                        {categories.map((item) => (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (selectedCategory === item.id) {
                                                        setSelectedCategory(null);
                                                    } else {
                                                        setSelectedCategory(item.id);
                                                        console.log("item selected", selectedCategory);
                                                    }
                                                }}
                                                key={item.id}
                                                className="col-span-3 justify-center items-center flex flex-col gap-1 cursor-pointer"
                                            >
                                                <div
                                                    style={{ backgroundColor: item.backgroundColor }}
                                                    className="rounded-xl relative p-2 size-12 flex items-center justify-center cursor-pointer"
                                                >
                                                    {<item.icon size={24} color={item.color} className="cursor-pointer" />}

                                                    {selectedCategory === item.id && (
                                                        <div className="absolute bottom-0 right-0 bg-green-200 rounded-full p-1">
                                                            <Check size={18} className="text-green-600" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-center font-normal">{item.name}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-span-12 flex flex-col gap-4">
                                    <Label htmlFor="category-name">Category Name</Label>
                                    <Input
                                        value={categoryName ?? ""}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        type="text"
                                        placeholder="Category Name"
                                        id="category-name"
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button className="cursor-pointer" onClick={handleSubmitCategory} type="button">
                                    Add Category
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/**Fetch Categories here... */}
                <div className="col-span-12 gap-4 grid grid-cols-12 w-full">
                    {categories.map((item, index) => {
                        const category = categories.find((cat) => cat.id === item.id);
                        if (!category) return null;

                        const categoriesMatched = {
                            icon: category.icon,
                            backgroundColor: category.backgroundColor,
                            color: category.color,
                        };

                        return (
                            //category name, % of total expenses, total expenses
                            <div
                                key={`${item.id}-${index}`}
                                className="group flex col-span-12 cursor-pointer hover:bg-muted/50 transition-all duration-300 hover:shadow-md md:col-span-6 lg:col-span-4 items-center justify-between lg:gap-6 gap-4 bg-background border border-border p-4 rounded-lg"
                            >
                                <div className="flex flex-row items-center gap-4 w-full group-hover:opacity-70 transition-opacity duration-300">
                                    {/** ICON HERE */}
                                    <div
                                        style={{ backgroundColor: categoriesMatched.backgroundColor }}
                                        className="rounded-xl relative p-2 size-12 flex items-center justify-center cursor-pointer"
                                    >
                                        {
                                            <categoriesMatched.icon
                                                size={24}
                                                color={categoriesMatched.color}
                                                className="cursor-pointer"
                                            />
                                        }
                                    </div>

                                    <div className="flex flex-col">
                                        <p className="text-md font-medium">{item.name}</p>
                                        <p className="text-sm font-normal text-gray-500">0% of expenses</p>
                                        <h6 className="text-mdd font-semibold text-foreground">₱0</h6>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* View Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Category Details</DialogTitle>
                        <DialogDescription>View details about this expense category</DialogDescription>
                    </DialogHeader>

                    {viewingCategory && (
                        <div className="space-y-6 py-4">
                            <div className="flex items-center gap-4">
                                {(() => {
                                    const category = categories.find(
                                        (cat) => cat.id === viewingCategory.categoryId
                                    );
                                    if (!category) return null;
                                    const Icon = category.icon;
                                    return (
                                        <div
                                            style={{ backgroundColor: category.backgroundColor }}
                                            className="rounded-xl p-3 size-16 flex items-center justify-center"
                                        >
                                            <Icon size={32} color={category.color} />
                                        </div>
                                    );
                                })()}
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold">{viewingCategory.categoryName}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {categories.find((cat) => cat.id === viewingCategory.categoryId)?.name ||
                                            "Unknown"}{" "}
                                        Category
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                                    <p className="text-2xl font-bold">₱0</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">% of Total</p>
                                    <p className="text-2xl font-bold">0%</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsViewDialogOpen(false);
                                setViewingCategory(null);
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            className="cursor-pointer"
                            onClick={() => {
                                if (viewingCategory) {
                                    const index = fetchCategories.findIndex(
                                        (cat) =>
                                            cat.categoryId === viewingCategory.categoryId &&
                                            cat.categoryName === viewingCategory.categoryName
                                    );
                                    if (index !== -1) {
                                        setIsViewDialogOpen(false);
                                        openEditDialog(viewingCategory, index);
                                    }
                                }
                            }}
                        >
                            <IconEdit size={18} className="mr-2" />
                            Edit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update your category details. Click save when you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-12 gap-7">
                        <div className="col-span-12 flex flex-col gap-4">
                            <h3 className="text-md font-semibold">Choose a category type</h3>

                            {editError?.issues[0]?.message && !editSelectedCategory && (
                                <p className="text-sm text-red-500">{editError.issues[0].message}</p>
                            )}
                            {editError?.issues[1]?.message && (
                                <p className="text-sm text-red-500">{editError?.issues[1]?.message}</p>
                            )}

                            {/**ICON CARD*/}
                            <div className="grid grid-cols-12 items-center justify-center gap-4">
                                {categories.map((item) => (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditSelectedCategory(item.id);
                                        }}
                                        key={item.id}
                                        className="col-span-3 justify-center items-center flex flex-col gap-1 cursor-pointer"
                                    >
                                        <div
                                            style={{ backgroundColor: item.backgroundColor }}
                                            className="rounded-xl relative p-2 size-12 flex items-center justify-center cursor-pointer"
                                        >
                                            {<item.icon size={24} color={item.color} className="cursor-pointer" />}

                                            {editSelectedCategory === item.id && (
                                                <div className="absolute bottom-0 right-0 bg-green-200 rounded-full p-1">
                                                    <Check size={18} className="text-green-600" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-center font-normal">{item.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-12 flex flex-col gap-4">
                            <Label htmlFor="edit-category-name">Category Name</Label>
                            <Input
                                value={editCategoryName ?? ""}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                                type="text"
                                placeholder="Category Name"
                                id="edit-category-name"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false);
                                setEditingCategory(null);
                                setEditSelectedCategory(null);
                                setEditCategoryName("");
                                setEditError(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button className="cursor-pointer" onClick={handleEditCategory} type="button">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this category? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {deletingCategory && (
                        <div className="py-4">
                            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                                {(() => {
                                    const category = categories.find(
                                        (cat) => cat.id === deletingCategory.categoryId
                                    );
                                    if (!category) return null;
                                    const Icon = category.icon;
                                    return (
                                        <div
                                            style={{ backgroundColor: category.backgroundColor }}
                                            className="rounded-xl p-2 size-12 flex items-center justify-center"
                                        >
                                            <Icon size={24} color={category.color} />
                                        </div>
                                    );
                                })()}
                                <div className="flex-1">
                                    <p className="font-semibold">{deletingCategory.categoryName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {categories.find((cat) => cat.id === deletingCategory.categoryId)?.name ||
                                            "Unknown"}{" "}
                                        Category
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setDeletingCategory(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" className="cursor-pointer" onClick={handleDeleteCategory}>
                            <IconTrash size={18} className="mr-2" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
