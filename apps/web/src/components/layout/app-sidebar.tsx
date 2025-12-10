import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, MoreHorizontal, Plus, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { useBrand } from "@/hooks/brand";
import { useScribeChat } from "@/hooks/chat";
import { authClient } from "@/lib/auth-client";

export function AppSidebar() {
	const { brands } = useBrand();

	const { chats } = useScribeChat();

	const { data } = authClient.useSession();

	const navigate = useNavigate();
	const { location } = useRouterState();

	const [deleteId, setDeleteId] = useState<string | null>(null);

	const handleDelete = () => {
		if (deleteId) {
			console.log("Deleting chat:", deleteId);
			// Mock delete logic
			setDeleteId(null);
		}
	};

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="flex-row items-center justify-between p-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
				<div className="group-data-[collapsible=icon]:hidden">
					<span className="font-bold text-lg">Scribe</span>
				</div>
				<SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0" />
			</SidebarHeader>
			<SidebarContent className="px-2">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={() => navigate({ to: "/" })}
							className="group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:!size-8 w-full justify-center bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:text-primary-foreground group-data-[collapsible=icon]:rounded-md"
							tooltip="New Chat"
						>
							<Plus className="size-4" />
							<span className="whitespace-nowrap font-semibold group-data-[collapsible=icon]:hidden">
								New Chat
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				<SidebarGroup className="group-data-[collapsible=icon]:hidden">
					<SidebarGroupLabel className="px-2 font-medium text-muted-foreground text-xs">
						Recent Chats
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{chats?.map((chat) => (
								<SidebarMenuItem key={chat.id}>
									<SidebarMenuButton
										asChild
										className="h-9"
										tooltip={chat.title}
										isActive={location.pathname === `/chat/${chat.id}`}
									>
										<Link
											to={"/chat/$id"}
											params={{ id: chat.id }}
											className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
										>
											<span className="truncate group-data-[collapsible=icon]:hidden">
												{chat.title}
											</span>
										</Link>
									</SidebarMenuButton>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<SidebarMenuAction showOnHover>
												<MoreHorizontal className="h-4 w-4" />
												<span className="sr-only">More</span>
											</SidebarMenuAction>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											className="w-48 rounded-lg"
											side="bottom"
											align="end"
										>
											<DropdownMenuItem
												onClick={() => setDeleteId(chat.id)}
												className="text-red-500 focus:bg-red-50 focus:text-red-500"
											>
												<Trash2 className="mr-2 h-4 w-4" />
												<span>Delete Chat</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup className="group-data-[collapsible=icon]:hidden">
					<SidebarGroupLabel className="flex items-center justify-between px-2 font-medium text-muted-foreground text-xs">
						Brands
						<Link
							to="/brands"
							className="transition-colors hover:text-foreground"
						>
							<Settings className="h-3 w-3" />
							<span className="sr-only">Manage Brands</span>
						</Link>
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{brands?.map((brand) => (
								<SidebarMenuItem key={brand.id}>
									<SidebarMenuButton asChild className="h-9">
										<Link
											to="/brands"
											search={{ brandId: brand.id }}
											className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
										>
											{brand.logoUrl ? (
												<img
													src={brand.logoUrl}
													alt={brand.name}
													width={800}
													height={600}
													className="h-4 w-4 rounded-full object-cover"
												/>
											) : (
												<div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted font-bold text-[8px]">
													{brand.name.substring(0, 2).toUpperCase()}
												</div>
											)}
											<span className="group-data-[collapsible=icon]:hidden">
												{brand.name}
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
							{!brands ||
								(brands.length === 0 && (
									<SidebarMenuItem>
										<div className="px-2 py-1.5 text-muted-foreground text-xs">
											No brands yet
										</div>
									</SidebarMenuItem>
								))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage src={data?.user?.image || ""} alt="User" />
										<AvatarFallback className="rounded-lg">
											{data?.user?.name
												?.split(" ")
												?.map((c) => c[0].toUpperCase())}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">
											{data?.user.name}
										</span>
										<span className="truncate text-xs">{data?.user.email}</span>
									</div>
									<MoreHorizontal className="ml-auto size-4" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
								side="bottom"
								align="end"
								sideOffset={4}
							>
								<DropdownMenuLabel className="p-0 font-normal">
									<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
										<Avatar className="h-8 w-8 rounded-lg">
											<AvatarImage src={data?.user?.image || ""} alt="User" />
											<AvatarFallback className="rounded-lg">
												{" "}
												{data?.user?.name
													?.split(" ")
													?.map((c) => c[0].toUpperCase())}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">
												{data?.user?.name}
											</span>
											<span className="truncate text-xs">
												{data?.user?.email}
											</span>
										</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<Settings className="mr-2 h-4 w-4" />
									Settings
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={async () => {
										await authClient.signOut();
										window.location.reload();
									}}
								>
									<LogOut className="mr-2 h-4 w-4" />
									Log out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
			<AlertDialog
				open={!!deleteId}
				onOpenChange={(open) => !open && setDeleteId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Chat</AlertDialogTitle>
						<AlertDialogDescription>
							This chat and all of its data will be deleted from our database.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Sidebar>
	);
}
