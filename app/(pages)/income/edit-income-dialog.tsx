import { toast } from "sonner";
import { frequencyLabels, incomeSources } from "@/data";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";

export default function EditIncomeDialog({
    getErrorMessage,
    formData,
    setFormData,
}: {
    getErrorMessage: (field: string) => string | null | undefined;
    formData: any;
    setFormData: (data: any) => void;
}) {
    console.log("formData", formData);
    return (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="edit-name">Income Name</Label>
                <Input
                    id="edit-name"
                    placeholder="e.g., Main Job Salary, Freelance Project"
                    value={formData.income_name}
                    onChange={(e) => setFormData({ ...formData, income_name: e.target.value })}
                />
                {getErrorMessage("income_name") && (
                    <p className="text-sm text-red-500">{getErrorMessage("income_name")}</p>
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
                        value={formData.amount === 0 ? "" : formData.amount}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Convert empty string to 0, otherwise parse the number
                            const numValue = value === "" ? 0 : Number(value);
                            setFormData({ ...formData, amount: numValue });
                        }}
                    />
                </div>
                {getErrorMessage("amount") && (
                    <p className="text-sm text-red-500">{getErrorMessage("amount")}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2 ">
                    <Label htmlFor="edit-source">Income Source</Label>
                    <Select
                        value={formData.source}
                        onValueChange={(value) =>
                            setFormData({ ...formData, source: value })
                        }
                    >
                        <SelectTrigger className="cursor-pointer w-full">
                            <SelectValue
                                defaultValue={formData.source}
                                placeholder="Select income source"
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {incomeSources.map((income) => (
                                <SelectItem key={income.id} className="cursor-pointer" value={income.name}>
                                    {income.name.charAt(0).toUpperCase() + income.name.slice(1)}
                                </SelectItem>
                            ))}
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
                        <SelectTrigger className="cursor-pointer w-full">
                            <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                            {frequencyLabels.map((label) => (
                                <SelectItem key={label.value} className="cursor-pointer" value={label.value}>
                                    {label.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {getErrorMessage("frequency") && (
                        <p className="text-sm text-red-500">{getErrorMessage("frequency")}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
