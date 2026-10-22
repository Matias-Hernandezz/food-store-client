/** Leaflet cargado desde CDN en index.html */
export type LeafletMap = {
    setView: (center: [number, number], zoom: number) => LeafletMap;
    fitBounds: (bounds: unknown, options?: { padding?: [number, number]; maxZoom?: number }) => void;
    remove: () => void;
};

export type LeafletMarker = {
    setLatLng: (latlng: [number, number]) => void;
    bindTooltip: (text: string, options?: { permanent?: boolean }) => void;
};

export type LeafletLayer = {
    addTo: (map: LeafletMap) => LeafletMarker;
};

export type LeafletStatic = {
    map: (el: HTMLElement, options?: { zoomControl?: boolean }) => LeafletMap;
    tileLayer: (url: string, options: { attribution: string }) => { addTo: (map: LeafletMap) => void };
    divIcon: (options: {
        className: string;
        html: string;
        iconSize: [number, number];
        iconAnchor: [number, number];
    }) => unknown;
    marker: (latlng: [number, number], options: { icon: unknown }) => LeafletLayer;
    latLngBounds: (points: [number, number][]) => unknown;
};

export function getLeaflet(): LeafletStatic | null {
    return (window as Window & { L?: LeafletStatic }).L ?? null;
}
