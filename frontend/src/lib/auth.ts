import api from "./api";
import Cookies from "js-cookie";
import type {
    LoginCredentials,
    RegisterCredentials,
    TokenResponse,
    User,
} from "@/types";

/**
 * Authentication service functions.
 */

export async function login(credentials: LoginCredentials): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>("/auth/login", credentials);
    const data = response.data;

    // Store tokens and user in cookies
    Cookies.set("access_token", data.access_token, { expires: 1 }); // 1 day
    Cookies.set("refresh_token", data.refresh_token, { expires: 7 }); // 7 days
    Cookies.set("user", JSON.stringify(data.user), { expires: 7 });

    return data;
}

export async function register(credentials: RegisterCredentials): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>("/auth/register", credentials);
    const data = response.data;

    Cookies.set("access_token", data.access_token, { expires: 1 });
    Cookies.set("refresh_token", data.refresh_token, { expires: 7 });
    Cookies.set("user", JSON.stringify(data.user), { expires: 7 });

    return data;
}

export function logout(): void {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user");
    window.location.href = "/login";
}

export function getUser(): User | null {
    const userStr = Cookies.get("user");
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

export function isAuthenticated(): boolean {
    return !!Cookies.get("access_token");
}

export async function getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/auth/me");
    return response.data;
}
