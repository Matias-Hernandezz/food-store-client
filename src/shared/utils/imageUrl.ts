// src/shared/utils/imageUrl.ts

/**
 * Construye una URL de imagen con transformaciones Cloudinary.
 * Acepta string, string[] (toma el primer elemento), null o undefined.
 * Si la URL ya es de Cloudinary, aplica f_auto, q_auto, w_600, c_fill.
 */
export const imageUrl = (path: string | string[] | null | undefined): string | null => {
  const url = Array.isArray(path) ? path[0] : path;
  if (!url) return null;

  // Si ya es una URL de Cloudinary, aplicar transformaciones on-the-fly
  if (url.includes("res.cloudinary.com")) {
    return url.replace(
      /\/upload\//,
      "/upload/c_fill,w_800,h_600,g_auto,q_auto,f_auto/"
    );
  }

  // Si es otra URL absoluta, devolverla sin modificar
  if (url.startsWith("http")) return url;

  // URL relativa local
  const clean = url.replace(/^public[/\\]/, "");
  return `/${clean}`;
};

/**
 * Aplica transformaciones Cloudinary con dimensiones configurables.
 * c_fill: recorta rellenando al tamanio exacto
 * g_auto: enfoca automaticamente lo mas importante de la imagen
 * q_auto: calidad automatica | f_auto: formato automatico (webp si soporta)
 */
export function getImageUrl(url: string, width = 400, height = 300): string {
  if (!url || !url.includes("cloudinary.com")) return url;

  return url.replace(
    "/upload/",
    `/upload/c_fill,w_${width},h_${height},g_auto,q_auto,f_auto/`
  );
}
