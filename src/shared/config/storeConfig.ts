/** Config de tienda (landings / API pública). */

export const USE_PUBLIC_API = import.meta.env.VITE_USE_PUBLIC_API !== "false";

/** Slug del local — header X-Tenant-Slug cuando TENANT_MODE=multi en el backend. */
export const TENANT_SLUG = (import.meta.env.VITE_TENANT_SLUG || "").trim();
