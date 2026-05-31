import { apiFetch } from "../../../shared/api/client";
import type { LoginInput, UsuarioCreate, UsuarioRead } from "../../../shared/types";

const BASE = "/api/v1/auth";

export const authApi = {
    register: (data: UsuarioCreate) =>
        apiFetch<UsuarioRead>(`${BASE}/register`, {
            method: "POST",
            body: JSON.stringify(data),
        }),

    login: (data: LoginInput) =>
        apiFetch<UsuarioRead>(`${BASE}/login`, {
            method: "POST",
            body: JSON.stringify(data),
        }),

    logout: () =>
        apiFetch<void>(`${BASE}/logout`, { method: "POST" }),

    me: () =>
        apiFetch<UsuarioRead>(`${BASE}/me`),
};