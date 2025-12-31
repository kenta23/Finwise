"use client";

import {
	IconCreditCard,
	IconDotsVertical,
	IconLogout,
	IconNotification,
	IconRefresh,
	IconUserCircle,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { resetAllData } from "@/app/actions/query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "./ui/button";

export function NavUser() {
	const { isMobile } = useSidebar();
	const router = useRouter();
	const { data: session } = useSession();
	const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
	const queryClient = useQueryClient();
	const { mutateAsync: resetAllDataMutation, isPending: isResetAllDataPending } = useMutation({
		mutationFn: async (): Promise<{ message: string; error: string | null }> => {
			return await resetAllData();
		},
		onSuccess: (data: { message: string; error: string | null }) => {
			if (data.error) {
				toast.error(data.error, {
					description: data.message,
				});
			} else {
				toast.success("Successful!", { description: data.message });
				// Invalidate all queries to refetch fresh data after reset
				queryClient.invalidateQueries();
			}
		},
		onError: () => {
			toast.error("Failed to reset all data", { description: "Please try again later." });
		},
	});

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent cursor-pointer data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg grayscale">
								<AvatarImage src={session?.user.image || ""} alt={session?.user.name} />
								<AvatarFallback className="rounded-lg">
									{session?.user.name?.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{session?.user.name}</span>
								<span className="text-muted-foreground truncate text-xs">
									{session?.user.email}
								</span>
							</div>
							<IconDotsVertical className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={session?.user.image || ""} alt={session?.user.name} />
									<AvatarFallback className="rounded-lg">CN</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{session?.user.name}</span>
									<span className="text-muted-foreground truncate text-xs">
										{session?.user.email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						{/* <DropdownMenuGroup>
							<DropdownMenuItem>
								<IconUserCircle />
								Account
							</DropdownMenuItem>
							<DropdownMenuItem>
								<IconCreditCard />
								Billing
							</DropdownMenuItem>
							<DropdownMenuItem>
								<IconNotification />
								Notifications
							</DropdownMenuItem>
						</DropdownMenuGroup> */}
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="cursor-pointer"
							onClick={async () => {
								await signOut();
								router.push("/login");
							}}
						>
							<IconLogout />
							Log out
						</DropdownMenuItem>

						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="cursor-pointer"
							onSelect={(e) => {
								e.preventDefault();
								setIsResetDialogOpen(true);
							}}
						>
							<IconRefresh />
							Reset All Data
						</DropdownMenuItem>
						<Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Reset All Data</DialogTitle>
									<DialogDescription>
										Are you sure you want to reset all data?
										<span className="text-sm font-medium text-muted-foreground">
											&nbsp;THIS CAN'T BE UNDONE.
										</span>
									</DialogDescription>
								</DialogHeader>
								<DialogFooter>
									<Button
										variant="outline"
										className="cursor-pointer"
										onClick={() => setIsResetDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button
										className="cursor-pointer"
										variant="destructive"
										onClick={async () => {
											await resetAllDataMutation();
											setIsResetDialogOpen(false);
										}}
										disabled={isResetAllDataPending}
									>
										{isResetAllDataPending ? "Resetting..." : "Reset All Data"}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
