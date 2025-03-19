import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";

// Leaflet fix: Přizpůsobení velikosti mapy
const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
};

// Funkce pro načtení senzorů
const fetchSensors = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_APP_API_URL}/sensors`,
      {
        headers: { Accept: "application/json" },
      }
    );
    if (!response.ok) {
      throw new Error("Chyba při načítání senzorů");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching sensors:", error);
    return [];
  }
};

const MapComponent = () => {
  const [sensors, setSensors] = useState([]);

  useEffect(() => {
    const loadSensors = async () => {
      const data = await fetchSensors();
      setSensors(data);
    };
    loadSensors();
  }, []);

  return (
    <div className="w-full h-[calc(100%-64px)]">
      <MapContainer
        center={[50.674161, 14.034648]}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
      >
        <ResizeMap />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Přidání zoom ovladače doleva dolů */}
        <ZoomControl position="bottomleft" />

        {sensors.map((sensor) => (
          <Marker
            key={sensor.id}
            position={[sensor.latitude, sensor.longitude]}
          >
            <Popup>
              <h3 className="text-lg font-semibold">{sensor.name}</h3>
              <p className="text-sm">{sensor.description}</p>
              <p className="text-xs text-gray-600">Typ: {sensor.type}</p>
              <a href={`/sensor/${sensor.id}`}>Naměřená data →</a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
