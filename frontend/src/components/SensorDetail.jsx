import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SensorChart from "./SensorChart";

const SensorDetail = () => {
  const { id } = useParams(); // Získání sensorId z URL
  const sensorId = parseInt(id, 10); // Převod na číslo

  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sensorId || isNaN(sensorId)) {
      setError("Neplatné ID senzoru.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}/sensor/data/${sensorId}`
        );

        if (!response.ok) {
          // Pokusíme se získat detail chyby z JSON odpovědi
          let errorMessage = `Chyba serveru: ${response.status}`;

          try {
            const errorData = await response.json();
            if (errorData.detail) {
              errorMessage = errorData.detail;
            }
          } catch (jsonError) {
            console.error(
              "Nepodařilo se načíst detail chyby z API:",
              jsonError
            );
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Neplatný formát dat ze serveru.");
        }

        setSensorData(
          data.sort((a, b) => new Date(a.measured_at) - new Date(b.measured_at))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sensorId]);

  if (loading) return <div className="p-6 text-gray-500">Načítání dat...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!sensorData || sensorData.length === 0)
    return <div className="p-6 text-gray-500">Žádná data k dispozici.</div>;

  return (
    <div className="p-6 overflow-x-hidden">
      <h2 className="text-3xl text-sky-600 font-bold">
        Detail senzoru #{sensorId}
      </h2>
      <SensorChart
        data={sensorData}
        dataKey="temperature"
        label="Teplota (°C)"
      />
      <SensorChart data={sensorData} dataKey="pressure" label="Tlak (hPa)" />
      <SensorChart data={sensorData} dataKey="humidity" label="Vlhkost (%)" />
      <SensorChart
        data={sensorData}
        dataKey="air_quality"
        label="Kvalita vzduchu (AQI)"
      />
      <SensorChart
        data={sensorData}
        dataKey="wind_speed"
        label="Rychlost větru (m/s)"
      />
    </div>
  );
};

export default SensorDetail;
