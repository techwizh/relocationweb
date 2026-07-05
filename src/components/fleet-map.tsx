"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type FleetDriverMarker = {
  id: string;
  fullName: string;
  isAvailable: boolean;
  onActiveJob: boolean;
  vehicleLabel: string | null;
  lat: number;
  lng: number;
};

type FleetMapProps = {
  drivers: FleetDriverMarker[];
};

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const activeJobIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function FleetMap({ drivers }: FleetMapProps) {
  const center =
    drivers.length > 0
      ? ([drivers[0].lat, drivers[0].lng] as [number, number])
      : ([-4.0435, 39.6682] as [number, number]);

  return (
    <div className="h-[28rem] overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer center={center} zoom={11} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {drivers.map((driver) => (
          <Marker
            key={driver.id}
            position={[driver.lat, driver.lng]}
            icon={driver.onActiveJob ? activeJobIcon : defaultIcon}
          >
            <Popup>
              <strong>{driver.fullName}</strong>
              <br />
              {driver.vehicleLabel ?? "No vehicle"}
              <br />
              {driver.onActiveJob
                ? "On active job"
                : driver.isAvailable
                  ? "Available"
                  : "Offline"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
