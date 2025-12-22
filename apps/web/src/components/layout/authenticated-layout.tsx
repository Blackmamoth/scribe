import { AppSidebar } from "@/components/layout/app-sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

interface Props {
	children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: Props) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="flex h-screen w-full flex-col overflow-hidden">
				<div className="flex items-center p-4">
					<SidebarTrigger />
				</div>
				<div className="relative flex-1 overflow-auto">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
