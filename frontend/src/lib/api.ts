import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://task-management-system-qia4.onrender.com";

/**
 * API service layer abstraction.
 * Handles JWT tokens, automatic token refresh, and request/response interceptors.
 */
const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor — attach access token to every request
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get("access_token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = Cookies.get("refresh_token");
                if (!refreshToken) {
                    // No refresh token, redirect to login
                    window.location.href = "/login";
                    return Promise.reject(error);
                }

                const response = await axios.post(
                    `${API_BASE_URL}/api/v1/auth/refresh`,
                    { refresh_token: refreshToken }
                );

                const { access_token, refresh_token } = response.data;

                // Store new tokens
                Cookies.set("access_token", access_token, { expires: 1 });
                Cookies.set("refresh_token", refresh_token, { expires: 7 });

                // Retry the original request
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                }
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect
                Cookies.remove("access_token");
                Cookies.remove("refresh_token");
                Cookies.remove("user");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
