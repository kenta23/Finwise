"use client";

import { type Icon, IconCirclePlusFilled, IconMail } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { QuickAddDialog } from "./quick-add";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: Icon;
	}[];
}) {
	const pathname = usePathname();
	const router = useRouter();
	const [isOpen, setIsOpen] = useState<boolean>(false);

	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					<SidebarMenuItem className="flex items-center gap-2">
						<Dialog open={isOpen} onOpenChange={setIsOpen}>
							<DialogTrigger asChild>
								<SidebarMenuButton
									tooltip="Quick Create"
									className="bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
								>
									<IconCirclePlusFilled />
									<span>Quick Create</span>
								</SidebarMenuButton>
							</DialogTrigger>

							<DialogContent className="max-w-sm">
								<DialogHeader>
									<DialogTitle>Quick Create</DialogTitle>
									<DialogDescription>Add a new income or expense to your budget.</DialogDescription>
								</DialogHeader>
								<QuickAddDialog isOpen={isOpen} setIsOpen={setIsOpen} />
							</DialogContent>
						</Dialog>

						<Button
							size="icon"
							className="size-8 group-data-[collapsible=icon]:opacity-0"
							variant="outline"
						>
							<IconMail />
							<span className="sr-only">Inbox</span>
						</Button>
					</SidebarMenuItem>
				</SidebarMenu>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem
							className={`${item.url === pathname ? "border-l-2 border-violet-500 text-primary" : ""}`}
							key={item.title}
						>
							<SidebarMenuButton
								onClick={() => router.push(item.url)}
								className="cursor-pointer active:bg-sidebar-accent active:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
								tooltip={item.title}
							>
								{item.icon && <item.icon />}
								<span>{item.title}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
