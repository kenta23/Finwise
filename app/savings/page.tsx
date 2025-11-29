import { SavingsManager } from "./savings-manager";

export default function Page() {
    return ( 
        <div className="min-w-full flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <h1 className="text-3xl font-bold text-foreground">Plan your savings</h1>
            <SavingsManager />
        </div>
    )
} 