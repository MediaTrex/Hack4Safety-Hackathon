import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";

import "leaflet/dist/leaflet.css";

function LiveMapComponent() {
  return (
    <MapContainer
      center={[27.7172, 85.324]}
      zoom={8}
      style={{
        height: "650px",
        width: "100%",
        borderRadius: "12px",
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Incident */}
      <Marker position={[27.7172, 85.324]}>
        <Popup>Flood Incident</Popup>
      </Marker>

      {/* SOS */}
      <Marker position={[27.55, 84.5]}>
        <Popup>SOS Alert</Popup>
      </Marker>

      {/* Rescue Team */}
      <Marker position={[28.2, 84.1]}>
        <Popup>Rescue Team Alpha</Popup>
      </Marker>

      {/* Risk Area */}
      <Circle center={[27.7172, 85.324]} radius={15000} />
    </MapContainer>
  );
}

export default LiveMapComponent;
