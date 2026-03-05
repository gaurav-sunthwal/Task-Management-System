"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@/types";
import { getUser, isAuthenticated } from "@/lib/auth";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    setUser: () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

const publicPaths = ["/login", "/signup", "/"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = () => {
            if (isAuthenticated()) {
                const savedUser = getUser();
                setUser(savedUser);
            } else if (!publicPaths.includes(pathname)) {
                router.push("/login");
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [pathname, router]);

    return (
        <AuthContext.Provider value={{ user, isLoading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}
