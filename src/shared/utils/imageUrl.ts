// src/shared/utils/imageUrl.ts

export const imageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  // Limpiar prefijo "public/" o "public\" que viene del backend
  const clean = path.replace(/^public[/\\]/, "");
  return `/${clean}`;
};