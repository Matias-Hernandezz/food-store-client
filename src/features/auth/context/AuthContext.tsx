// AuthContext — backward-compatible wrapper around Zustand authStore
// Migrated from React Context to Zustand. Components that import useAuth
// from this file will transparently use the Zustand store.
import { useAuthStore } from "../../../store/authStore";

export function useAuth() {
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isLoading = useAuthStore((s) => s.isLoading);
    const logout = useAuthStore((s) => s.logout);

    return { user, isAuthenticated, isLoading, logout };
}
