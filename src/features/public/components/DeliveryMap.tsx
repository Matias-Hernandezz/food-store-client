import { useEffect, useRef, useState } from "react";
import { getLeaflet, type LeafletMap, type LeafletMarker } from "./leafletGlobal";

export type MapPoint = { lat: number; lng: number; label?: string };

type Props = {
    destino: MapPoint | null;
    rider: MapPoint | null;
    height?: number;
};

export function DeliveryMap({ destino, rider, height = 280 }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const destMarkerRef = useRef<LeafletMarker | null>(null);
    const riderMarkerRef = useRef<LeafletMarker | null>(null);
    const [mapError, setMapError] = useState<string | null>(null);

    useEffect(() => {
        const L = getLeaflet();
        if (!L || !containerRef.current || mapRef.current) {
            if (!L) setMapError("No se pudo cargar el mapa (Leaflet)");
            return;
        }
        setMapError(null);
        const center: [number, number] =
            destino ? [destino.lat, destino.lng] : rider ? [rider.lat, rider.lng] : [-34.6037, -58.3816];

        const map = L.map(containerRef.current, { zoomControl: true }).setView(center, 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap",
        }).addTo(map);
        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
            destMarkerRef.current = null;
            riderMarkerRef.current = null;
        };
    }, [destino?.lat, destino?.lng, rider?.lat, rider?.lng]);

    useEffect(() => {
        const L = getLeaflet();
        const map = mapRef.current;
        if (!L || !map) return;

        const destIcon = L.divIcon({
            className: "",
            html: '<div style="background:#C87A2E;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
        });
        const riderIcon = L.divIcon({
            className: "",
            html: '<div style="background:#2563eb;width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
        });

        if (destino) {
            if (!destMarkerRef.current) {
                destMarkerRef.current = L.marker([destino.lat, destino.lng], { icon: destIcon }).addTo(map);
                destMarkerRef.current.bindTooltip("Destino", { permanent: false });
            } else {
                destMarkerRef.current.setLatLng([destino.lat, destino.lng]);
            }
        }

        if (rider) {
            if (!riderMarkerRef.current) {
                riderMarkerRef.current = L.marker([rider.lat, rider.lng], { icon: riderIcon }).addTo(map);
                riderMarkerRef.current.bindTooltip("Repartidor", { permanent: false });
            } else {
                riderMarkerRef.current.setLatLng([rider.lat, rider.lng]);
            }
        }

        const points: [number, number][] = [];
        if (destino) points.push([destino.lat, destino.lng]);
        if (rider) points.push([rider.lat, rider.lng]);
        if (points.length >= 2) {
            map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
        } else if (points.length === 1) {
            map.setView(points[0], 15);
        }
    }, [destino, rider]);

    if (mapError) {
        return (
            <p className="text-xs text-[#9a8070] rounded-xl border border-[#3D2B1F]/10 p-4" style={{ height }}>
                {mapError}
            </p>
        );
    }

    return (
        <div
            ref={containerRef}
            className="rounded-xl overflow-hidden border border-[#3D2B1F]/10"
            style={{ height, width: "100%" }}
        />
    );
}
