import { api } from './axios';
import type {
    AuthUserUserLoginDTORequestBody,
    CreateUserUserCreateDTORequestBody,
    UserDTO,
} from 'shared/api/generated/model';

export async function loginRequest(data: AuthUserUserLoginDTORequestBody) {
    const response = await api.post<UserDTO>('/auth/login', data);
    return response.data;
}

export async function registerRequest(
    data: CreateUserUserCreateDTORequestBody,
) {
    const response = await api.post<UserDTO>('/users/create', data);
    return response.data;
}

export async function meRequest() {
    const response = await api.get<UserDTO>('/auth/me');
    return response.data;
}

export async function logoutRequest() {
    await api.post('/auth/logout');
}
