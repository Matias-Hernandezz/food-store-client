// features/auth/types/index.ts
// Tipos específicos del feature auth. UsuarioRead y UsuarioCreate son compartidos
// (usados por múltiples features) → re-exportados desde shared/types/.

export interface LoginInput {
    email: string;
    password: string;
}

export type { UsuarioCreate, UsuarioRead } from "../../../shared/types";
