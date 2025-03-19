import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SensorsList = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}/sensors`
        );
        if (!response.ok) {
          throw new Error("Chyba při načítání dat ze serveru");
        }
        const data = await response.json();
        setSensors(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();
  }, []);

  if (loading)
    return <div className="p-6 text-gray-600">Načítám senzory...</div>;
  if (error) return <div className="p-6 text-red-600">Chyba: {error}</div>;

  return (
    <div className="p-6 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Seznam senzorů</h2>
      {sensors.length === 0 ? (
        <div className="text-gray-500">Žádné senzory nebyly nalezeny.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sensors.map((sensor) => (
            <div
              key={sensor.id}
              className="bg-white shadow-md rounded-lg p-5 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/sensor/${sensor.id}`)}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {sensor.name}
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                <strong>Typ:</strong> {sensor.type}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                <strong>Poloha:</strong> {sensor.latitude}, {sensor.longitude}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                <strong>Popis:</strong> {sensor.description}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                <strong>Vytvořen:</strong>{" "}
                {new Date(sensor.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SensorsList;
