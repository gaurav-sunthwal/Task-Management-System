"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, BarChart3, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { ThemeToggle } from "./theme-toggle";

const routes = [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard", color: "text-sky-500" },
    { label: "My Tasks", icon: CheckSquare, href: "/tasks", color: "text-violet-500" },
    { label: "Analytics", icon: BarChart3, href: "/analytics", color: "text-pink-700" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-card border-r border-border text-foreground transition-colors duration-300">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-10">
                    <div className="relative w-8 h-8 mr-4 transition-transform hover:scale-110">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                            <CheckSquare className="w-5 h-5 text-primary-foreground" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        TaskFlow
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200",
                                pathname === route.href ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3 transition-colors", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2 border-t border-border">
                <div className="flex items-center gap-x-2 px-1 py-4">
                    <Avatar className="h-10 w-10 border border-border shadow-sm">
                        <AvatarFallback className="bg-accent text-accent-foreground">
                            {user?.name?.charAt(0) || <User className="h-5 w-5" />}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <div className="flex items-center gap-x-1">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => logout()}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
