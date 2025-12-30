import type { Metadata } from "next";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
    title: "Finwise - Dashboard",
    description: "Dashboard of your budget and income and expenses.",
    applicationName: "Finwise",
    keywords: [
        "Finwise",
        "Budget",
        "Finance",
        "Income",
        "Expenses",
        "Savings",
        "Tracker",
        "Financial",
        "Management",
    ],
    authors: [{ name: "Rm Ramos", url: "https://portfolio-rmramos.vercel.app/" }],
    creator: "Rm Ramos",
    publisher: "Rm Ramos",
    openGraph: {
        title: "Finwise - Dashboard",
        description:
            "Finwise is a budget management tool that helps you track your income and expenses.",
        url: "https://finwise-budget-tracker.vercel.app/",
        images: ["/images/logo.png"],
        countryName: "Philippines",
        emails: ["rustymiguelramos@gmail.com"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
    icons: {
        icon: "/images/logo.png",
    },
    manifest: "/manifest.json",
    themeColor: "#4F46E5",
    appleWebApp: {
        title: "Finwise",
    },
};

export default function Layout({ children }: { children: Readonly<React.ReactNode> }) {
    return (
        <main>
            <main>
                <SidebarProvider
                    style={
                        {
                            "--sidebar-width": "calc(var(--spacing) * 72)",
                            "--header-height": "calc(var(--spacing) * 12)",
                        } as React.CSSProperties
                    }
                >
                    <AppSidebar variant="inset" />

                    <SidebarInset>
                        <SiteHeader />
                        <div className="flex flex-1 flex-col">
                            <div className="@container/main flex flex-1 flex-col gap-2 px-4 lg:px-6">
                                {children}
                            </div>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </main>
        </main>
    );
}
