import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    loginRequest,
    logoutRequest,
    meRequest,
    registerRequest,
} from 'shared/api/auth';
import type {
    AuthUserUserLoginDTORequestBody,
    CreateUserUserCreateDTORequestBody,
} from 'shared/api/generated/model';

export const AUTH_ME_QUERY_KEY = ['auth', 'me'] as const;

export function useMe(enabled = true) {
    return useQuery({
        queryKey: AUTH_ME_QUERY_KEY,
        queryFn: meRequest,
        enabled,
        retry: false,
    });
}

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AuthUserUserLoginDTORequestBody) => loginRequest(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
            await queryClient.fetchQuery({
                queryKey: AUTH_ME_QUERY_KEY,
                queryFn: meRequest,
            });
        },
    });
}

export function useRegister() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateUserUserCreateDTORequestBody) =>
            registerRequest(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
            await queryClient.fetchQuery({
                queryKey: AUTH_ME_QUERY_KEY,
                queryFn: meRequest,
            });
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logoutRequest,
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY });
        },
    });
}