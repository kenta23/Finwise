import {
    IconCar,
    IconChartLine,
    IconHeart,
    IconHome,
    IconPigMoney,
    IconPlane,
    IconTarget,
    IconWallet,
} from "@tabler/icons-react";
import z from "zod";

export type SavingsItem = {
    id: string;
    name: string;
    type: string;
    bankName: string;
    accountNumber?: string;
    amountToSave: number;
    frequency: string;
    currentAmount: number;
    goalAmount: number;
    notes?: string;
    updatedAt: Date;
    createdAt: Date;
};

export const savingsSchema = z.object({
    name: z.string().min(1, "Savings name is required"),
    type: z.enum(["emergency", "vacation", "house", "car", "retirement", "wedding", "education", "other"]),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    amountToSave: z.number().positive("Amount to save must be greater than 0"),
    frequency: z.enum(["weekly", "monthly", "daily", "bi-weekly"]),
    currentAmount: z.number().positive("Current amount must be greater than 0"),
    goalAmount: z.number().positive("Goal amount must be greater than 0"),
    notes: z.string().optional(),
});

// Schema for editing - all fields are optional
export const editSavingsSchema = savingsSchema.partial();

export const savingsIcons: Record<
    string,
    React.ComponentType<{ size?: number; color?: string; className?: string }>
> = {
    emergency: IconPigMoney,
    vacation: IconPlane,
    house: IconHome,
    car: IconCar,
    retirement: IconChartLine,
    wedding: IconHeart,
    education: IconTarget,
    other: IconWallet,
};

export const savingsColors: Record<string, { color: string; backgroundColor: string }> = {
    emergency: {
        color: "#e44e68",
        backgroundColor: "#fde4ec",
    },
    vacation: {
        color: "#1a64db",
        backgroundColor: "#e7effb",
    },
    house: {
        color: "#f59e42",
        backgroundColor: "#fff5e6",
    },
    car: {
        color: "#60b27e",
        backgroundColor: "#e7f7ee",
    },
    retirement: {
        color: "#9b59b6",
        backgroundColor: "#f4ecf7",
    },
    wedding: {
        color: "#e44e68",
        backgroundColor: "#fde4ec",
    },
    education: {
        color: "#1a64db",
        backgroundColor: "#e7effb",
    },
    other: {
        color: "#60b27e",
        backgroundColor: "#e7f7ee",
    },
};

export const savingsTypeLabels: Record<string, string> = {
    emergency: "Emergency Fund",
    vacation: "Vacation",
    house: "House Down Payment",
    car: "Car Purchase",
    retirement: "Retirement",
    wedding: "Wedding",
    education: "Education",
    other: "Other",
};
