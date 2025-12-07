import { IconCash } from "@tabler/icons-react";
import { frequencyLabels, incomeColors, incomeIcons } from "@/data";

export function ViewIncomeDialog({
    viewingItem,
}: {
    viewingItem: {
        id?: string;
        amount: number;
        source: string;
        frequency: string;
        income_name: string;
        date?: string;
    };
}) {
    return (
        <div className="space-y-6 py-4 grid grid-cols-12 items-center">
            <div className="flex flex-col items-start gap-4 col-span-6">
                <div className="flex flex-row items-center gap-4">
                    <div
                        style={{
                            backgroundColor: incomeColors[viewingItem.source]?.backgroundColor || "#e7effb",
                        }}
                        className="rounded-xl p-3 size-16 flex items-center justify-center"
                    >
                        {(() => {
                            const Icon = incomeIcons[viewingItem.source] || IconCash;
                            return (
                                <Icon size={32} color={incomeColors[viewingItem.source]?.color || "#1a64db"} />
                            );
                        })()}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{viewingItem.income_name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{viewingItem.source}</p>
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
                        <p className="text-lg font-semibold">{frequencyLabels[viewingItem.frequency]}</p>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date Added</p>
                    <p className="text-sm font-medium">
                        {new Date(viewingItem?.date || "").toLocaleDateString("en-US", {
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
                    <p className="text-sm text-muted-foreground mb-2">Projections</p>

                    <div className="space-y-2 w-full">
                        {viewingItem.frequency !== "per-week" && (
                            <div className="flex flex-row justify-between w-full">
                                <span className="text-sm">Per Week</span>
                                <span className="font-semibold">
                                    ₱
                                    {(viewingItem.frequency === "per-month"
                                        ? viewingItem.amount / 4
                                        : viewingItem.amount / 52
                                    ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}
                        {viewingItem.frequency !== "per-month" && (
                            <div className="flex justify-between w-full">
                                <span className="text-sm">Per Month</span>
                                <span className="font-semibold">
                                    ₱
                                    {(viewingItem.frequency === "per-week"
                                        ? viewingItem.amount * 4
                                        : viewingItem.amount / 12
                                    ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}
                        {viewingItem.frequency !== "per-year" && (
                            <div className="flex justify-between w-full">
                                <span className="text-sm">Per Year</span>
                                <span className="font-semibold">
                                    ₱
                                    {(viewingItem.frequency === "per-week"
                                        ? viewingItem.amount * 52
                                        : viewingItem.amount * 12
                                    ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
                            <span className="font-semibold">10%</span>
                        </div>
                        <div className="flex justify-between w-full">
                            <span className="text-sm">Food</span>
                            <span className="font-semibold">10%</span>
                        </div>

                        <div className="flex justify-between w-full">
                            <span className="text-sm">Entertainment</span>
                            <span className="font-semibold">10%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Other</span>
                            <span className="font-semibold">10%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
