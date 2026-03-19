/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import axios, {
    AxiosError,
    type InternalAxiosRequestConfig,
    type AxiosRequestConfig,
} from 'axios';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

export const api = axios.create({
    baseURL,
    withCredentials: true,
});

const refreshClient = axios.create({
    baseURL,
    withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

function subscribeTokenRefresh(callback: () => void) {
    refreshSubscribers.push(callback);
}

function onRefreshed() {
    refreshSubscribers.forEach((callback) => callback());
    refreshSubscribers = [];
}

function shouldSkipRefresh(config?: AxiosRequestConfig) {
    const url = config?.url ?? '';

    return (
        url.includes('/auth/login') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/logout') ||
        url.includes('/users/create')
    );
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as
            | RetryableRequestConfig
            | undefined;
        const status = error.response?.status;

        if (
            !originalRequest ||
            status !== 401 ||
            shouldSkipRefresh(originalRequest)
        ) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh(() => {
                    api(originalRequest).then(resolve).catch(reject);
                });
            });
        }

        isRefreshing = true;

        try {
            await refreshClient.post('/auth/refresh');
            onRefreshed();
            return api(originalRequest);
        } catch (refreshError) {
            refreshSubscribers = [];
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);
