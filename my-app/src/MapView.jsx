import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icons under Vite
const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapView({ units, selectedId, onSelect }) {
  const [center, setCenter] = useState([42.3601, -71.0589]); // fallback (Boston)
  const [hasLocation, setHasLocation] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenter([pos.coords.latitude, pos.coords.longitude]);
          setHasLocation(true);
        },
        () => {
          setHasLocation(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  return (
    <div className="w-100 h-100">
      <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Your current location */}
        {hasLocation && (
          <Marker position={center} icon={icon}>
            <Popup><strong>You are here</strong></Popup>
          </Marker>
        )}

        {/* Units */}
        {units.map(u => (
          <Marker
            key={u.id}
            position={[u.lat, u.lng]}
            icon={icon}
            eventHandlers={{ click: () => onSelect(u.id) }}
          >
            <Popup>
              <strong>{u.name}</strong><br />
              Status: {u.status || 'OK'}<br />
              HR: {u.hr} bpm | O₂: {u.o2pct}% | CO₂: {u.co2ppm} ppm
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
