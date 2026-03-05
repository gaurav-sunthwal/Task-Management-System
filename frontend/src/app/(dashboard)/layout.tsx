"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/providers/auth-provider";
import { Loader2, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="h-full relative">
            {/* Desktop Sidebar */}
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-slate-900">
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="md:pl-72 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                {/* Mobile Header */}
                <header className="h-16 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-4 md:hidden sticky top-0 z-[50] transition-colors duration-300">
                    <div className="flex items-center gap-x-2">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 bg-slate-900 border-none w-72">
                                <Sidebar />
                            </SheetContent>
                        </Sheet>
                        <div className="text-xl font-bold tracking-tight dark:text-white">TaskFlow</div>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <ThemeToggle />
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
