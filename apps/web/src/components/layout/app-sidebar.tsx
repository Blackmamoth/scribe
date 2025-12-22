import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
	Loader2,
	LogOut,
	Moon,
	MoreHorizontal,
	Plus,
	Settings,
	Sun,
	Trash2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/sidebar";
import { useBrand } from "@/hooks/brand";
import { useScribeChat } from "@/hooks/chat";
import { authClient } from "@/lib/auth-client";

export function AppSidebar() {
	const { brands } = useBrand();
	const { theme, setTheme } = useTheme();

	const {
		chats,
		isFetchingChats,
		isFetchingMoreChats,
		hasMore,
		fetchMoreChats,
		deleteChat,
		isDeleting,
	} = useScribeChat();

	const { data } = authClient.useSession();

	const navigate = useNavigate();
	const { location } = useRouterState();

	const [deleteId, setDeleteId] = useState<string | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const handleDelete = async () => {
		if (!deleteId) return;

		try {
			await deleteChat(deleteId);

			// Navigate to home if deleting currently active chat
			if (location.pathname === `/chat/${deleteId}`) {
				navigate({ to: "/" });
			}

			setDeleteId(null);
		} catch (_error) {
			// Error handled by mutation
		}
	};

	const handleScroll = useCallback(() => {
		if (!scrollContainerRef.current || !hasMore || isFetchingMoreChats) return;

		const { scrollTop, scrollHeight, clientHeight } =
			scrollContainerRef.current;
		const threshold = 100; // Load more when 100px from bottom

		if (scrollTop + clientHeight >= scrollHeight - threshold) {
			fetchMoreChats();
		}
	}, [hasMore, isFetchingMoreChats, fetchMoreChats]);

	useEffect(() => {
		const scrollContainer = scrollContainerRef.current;
		if (!scrollContainer) return;

		scrollContainer.addEventListener("scroll", handleScroll);
		return () => scrollContainer.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

	return (
		<Sidebar collapsible="offcanvas">
			<SidebarHeader className="flex-row items-center justify-between p-4">
				<span className="font-bold text-lg">Scribe</span>
			</SidebarHeader>
			<SidebarContent className="flex flex-col px-2">
				{/* New Chat Button - Fixed at top */}
				<SidebarMenu className="mb-2 flex-shrink-0">
					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={() => navigate({ to: "/" })}
							className="group-data-[collapsible=offcanvas]:!p-2 group-data-[collapsible=offcanvas]:!size-8 h-9 w-full justify-start border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground shadow-sm transition-all hover:bg-sidebar-accent/80 group-data-[collapsible=offcanvas]:rounded-md"
							tooltip="New Chat"
						>
							<Plus className="size-4 flex-shrink-0" />
							<span className="whitespace-nowrap font-medium group-data-[collapsible=offcanvas]:hidden">
								New Chat
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>

				{/* Chats Section - Scrollable */}
				<div className="min-h-0 flex-1">
					<SidebarGroup className="flex h-full flex-col group-data-[collapsible=offcanvas]:hidden">
						<SidebarGroupLabel className="flex-shrink-0 px-2 font-medium text-muted-foreground text-xs">
							Recent Chats
						</SidebarGroupLabel>
						<SidebarGroupContent className="min-h-0 flex-1">
							<div
								className="chats-scroll-container h-full overflow-auto"
								ref={scrollContainerRef}
							>
								<SidebarMenu>
									{isFetchingChats && !chats.length ? (
										// Initial loading skeleton
										Array.from({ length: 5 }).map((_, index) => (
											<SidebarMenuItem
												key={`chat-skeleton-loading-${Date.now()}-${index}`}
											>
												<div className="flex h-9 items-center gap-2 px-2">
													<div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
												</div>
											</SidebarMenuItem>
										))
									) : chats.length === 0 && !isFetchingChats ? (
										// Empty state
										<SidebarMenuItem>
											<div className="px-2 py-1.5 text-muted-foreground text-xs">
												No chats yet
											</div>
										</SidebarMenuItem>
									) : (
										<>
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
															<span className="truncate group-data-[collapsible=offcanvas]:hidden">
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

											{/* Loading indicator for more chats */}
											{isFetchingMoreChats && (
												<SidebarMenuItem>
													<div className="flex items-center justify-center py-2">
														<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
													</div>
												</SidebarMenuItem>
											)}

											{/* Load more button fallback */}
											{!isFetchingMoreChats && hasMore && chats.length > 0 && (
												<SidebarMenuItem>
													<Button
														variant="ghost"
														size="sm"
														onClick={fetchMoreChats}
														className="h-8 w-full justify-start text-muted-foreground hover:text-foreground"
													>
														Load more chats
													</Button>
												</SidebarMenuItem>
											)}
										</>
									)}
								</SidebarMenu>
							</div>
						</SidebarGroupContent>
					</SidebarGroup>
				</div>

				{/* Brands Section - Fixed at bottom */}
				<SidebarGroup className="flex-shrink-0 group-data-[collapsible=offcanvas]:hidden">
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
											<span className="group-data-[collapsible=offcanvas]:hidden">
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
								<DropdownMenuItem
									onClick={() => setTheme(theme === "light" ? "dark" : "light")}
								>
									{theme === "light" ? (
										<Moon className="mr-2 h-4 w-4" />
									) : (
										<Sun className="mr-2 h-4 w-4" />
									)}
									{theme === "light" ? "Dark Mode" : "Light Mode"}
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
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								"Delete"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Sidebar>
	);
}
