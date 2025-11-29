import {
	Icon,
	IconBus,
	IconCashBanknoteFilled,
	IconMovie,
	IconPizzaFilled,
	IconPlus,
	IconProps,
	IconReceipt,
} from "@tabler/icons-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export const categoryTypes = [
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
export type categoryType = (typeof categoryTypes)[number];
