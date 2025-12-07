import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
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
				<Header />
				<div className="flex items-center border-b p-4 md:hidden">
					<SidebarTrigger />
					<span className="ml-2 font-semibold">Scribe</span>
				</div>
				<div className="relative flex-1 overflow-auto">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
