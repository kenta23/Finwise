import {
	IconBriefcase,
	IconBus,
	IconCash,
	IconCashBanknoteFilled,
	IconChartLine,
	IconMovie,
	IconPigMoney,
	IconPizzaFilled,
	IconPlus,
	IconReceipt,
} from "@tabler/icons-react";
import { Frequency, type incomeType } from "./types";


export const categories = [
	{
		id: 1,
		name: "Food",
		icon: IconPizzaFilled,
		color: "#1a64db", // blue (unchanged)
		backgroundColor: "#e7effb", // lighter blue
	},
	{
		id: 2,
		name: "Transportation",
		icon: IconBus,
		color: "#f59e42", // orange
		backgroundColor: "#fff5e6", // lighter orange
	},
	{
		id: 3,
		name: "Entertainment",
		icon: IconMovie,
		color: "#e44e68", // rose red / magenta
		backgroundColor: "#fde4ec", // lighter magenta/pink
	},
	{
		id: 4,
		name: "Bills",
		icon: IconReceipt,
		color: "#60b27e",
		backgroundColor: "#e7f7ee",
	},
	{
		id: 5,
		name: "Savings",
		icon: IconCashBanknoteFilled,
		color: "#ffd600", // gold/yellow
		backgroundColor: "#fffbe7", // lighter yellow
	},
	{
		id: 6,
		name: "Other",
		icon: IconPlus,
		color: "#60b27e", // green
		backgroundColor: "#e7f7ee", // lighter green
	},
];



export const incomeSources: incomeType = [
	{
		id: "1",
		name: "Salary",
	}, {
		id: "2",
		name: "Freelance",
	}, {
		id: "3",
		name: "Business",
	},
	{
		id: "4",
		name: "Investment",
	},
	{
		id: "5",
		name: "Other",
	}
];


export const incomeIcons: Record<
	string,
	React.ComponentType<{ size?: number; color?: string; className?: string }>
> = {
	salary: IconBriefcase,
	freelance: IconCash,
	business: IconReceipt,
	investment: IconChartLine,
	other: IconPigMoney,
};

export const incomeColors: Record<string, { color: string; backgroundColor: string }> = {
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

export const frequencyLabels: { value: string; label: string }[] = [
	{ value: Frequency.PER_WEEK, label: "Per Week" },
	{ value: Frequency.PER_MONTH, label: "Per Month" },
	{ value: Frequency.PER_YEAR, label: "Per Year" },
];
