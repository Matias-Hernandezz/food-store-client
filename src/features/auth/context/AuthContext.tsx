// AuthContext — single-subscription wrapper around Zustand authStore
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "../../../store/authStore";

export function useAuth() {
    return useAuthStore(
        useShallow((s) => ({
            user: s.user,
            isAuthenticated: s.isAuthenticated,
            isLoading: s.isLoading,
            accessToken: s.accessToken,
            login: s.login,
            logout: s.logout,
            fetchUser: s.fetchUser,
            refreshToken: s.refreshToken,
        }))
    );
}
