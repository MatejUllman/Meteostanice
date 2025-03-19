import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import Cookies from "js-cookie";

export default function AdminPanel() {
  const [apiKey, setApiKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sensors, setSensors] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSensor, setNewSensor] = useState({
    name: "",
    type: "vnitrek",
    latitude: "",
    longitude: "",
    description: "",
  });
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    const savedApiKey = Cookies.get("apiKey");
    if (savedApiKey) {
      verifyApiKey(savedApiKey);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSensors();
    }
  }, [isAuthenticated]);

  const [loginError, setLoginError] = useState("");

  const verifyApiKey = async (key) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/isAdmin`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            apikey: key,
          },
        }
      );

      const data = await response.json();
      if (data.isAdmin) {
        setIsAuthenticated(true);
        setApiKey(key);
        Cookies.set("apiKey", key, { expires: 7 });
        setLoginError(""); // Vyčištění chyby při úspěšném přihlášení
      } else {
        setLoginError("Neplatný API klíč");
      }
    } catch (error) {
      setLoginError("Chyba při ověřování API klíče");
    }
  };

  const fetchSensors = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/sensors`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );
      const data = await response.json();
      setSensors(data);
    } catch (error) {
      alert("Error fetching sensors");
    }
  };

  const handleDeleteSensor = async (sensorId) => {
    if (!window.confirm("Opravdu chcete tento senzor smazat?")) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/sensor/${sensorId}`,
        {
          method: "DELETE",
          headers: {
            accept: "application/json",
            apikey: apiKey,
          },
        }
      );

      if (response.ok) {
        setSensors(sensors.filter((sensor) => sensor.id !== sensorId));
      } else {
        alert("Chyba při mazání senzoru");
      }
    } catch (error) {
      alert("Chyba při mazání senzoru");
    }
  };

  const handleLogin = () => {
    verifyApiKey(apiKey);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setApiKey("");
    Cookies.remove("apiKey");
  };

  const handleAddSensor = async () => {
    const lat = parseFloat(newSensor.latitude);
    const lon = parseFloat(newSensor.longitude);

    // Kontrola jména
    if (!newSensor.name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);

    // Kontrola lat a lon
    if (isNaN(lat) || isNaN(lon)) {
      alert("Latitude a Longitude musí být číslo!");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/sensor`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            apikey: apiKey,
          },
          body: JSON.stringify({ ...newSensor, latitude: lat, longitude: lon }),
        }
      );

      if (response.ok) {
        fetchSensors();
        setNewSensor({
          name: "",
          type: "vnitrek",
          latitude: "",
          longitude: "",
          description: "",
        });
        setShowAddForm(false);
      } else {
        alert("Chyba při vytváření senzoru");
      }
    } catch (error) {
      alert("Chyba při vytváření senzoru");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {!isAuthenticated ? (
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-10 w-full md:w-2/3 lg:w-1/2 xl:w-1/3">
          <Typography
            variant="h5"
            component="h2"
            className="text-center font-semibold mb-4"
          >
            Administrace
          </Typography>
          <TextField
            label="API Key"
            variant="outlined"
            fullWidth
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            margin="normal"
          />
          {loginError && (
            <Typography
              color="error"
              variant="body2"
              className="text-center pb-2"
            >
              {loginError}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            fullWidth
            className="mt-4"
          >
            Přihlásit se
          </Button>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-lg rounded-lg p-6 md:p-10 w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mb-6">
            <Button
              variant="contained"
              color="error"
              onClick={() => handleLogout()}
            >
              Odhlásit
            </Button>
            <Typography
              variant="h5"
              component="h2"
              className="text-center font-semibold mb-4"
            >
              Seznam Senzorů
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? "Zrušit" : "Přidat senzor"}
            </Button>

            {showAddForm && (
              <div className="my-4 p-4 bg-gray-100 rounded-lg">
                <TextField
                  label="Jméno senzoru"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  value={newSensor.name}
                  onChange={(e) =>
                    setNewSensor({ ...newSensor, name: e.target.value })
                  }
                  error={nameError}
                  helperText={nameError ? "Jméno je povinné" : ""}
                />

                <FormControl component="fieldset" className="mt-4">
                  <FormLabel component="legend">Typ senzoru</FormLabel>
                  <RadioGroup
                    row
                    value={newSensor.type}
                    onChange={(e) =>
                      setNewSensor({ ...newSensor, type: e.target.value })
                    }
                  >
                    <FormControlLabel
                      value="vnitrek"
                      control={<Radio />}
                      label="Vnitřní"
                    />
                    <FormControlLabel
                      value="vnejsek"
                      control={<Radio />}
                      label="Vnější"
                    />
                  </RadioGroup>
                </FormControl>

                <TextField
                  label="Popis"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  value={newSensor.description}
                  onChange={(e) =>
                    setNewSensor({ ...newSensor, description: e.target.value })
                  }
                />
                <TextField
                  label="Latitude"
                  type="number"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  value={newSensor.latitude}
                  onChange={(e) =>
                    setNewSensor({ ...newSensor, latitude: e.target.value })
                  }
                />
                <TextField
                  label="Longitude"
                  type="number"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  value={newSensor.longitude}
                  onChange={(e) =>
                    setNewSensor({ ...newSensor, longitude: e.target.value })
                  }
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddSensor}
                  fullWidth
                  className="mt-4"
                >
                  Uložit senzor
                </Button>
              </div>
            )}

            <TableContainer component={Paper} className="overflow-x-auto my-2">
              <Table size="small">
                <TableHead>
                  <TableRow className="bg-gray-200">
                    <TableCell className="font-semibold">Id</TableCell>
                    <TableCell className="font-semibold">Jméno</TableCell>
                    <TableCell className="font-semibold">Popis</TableCell>
                    <TableCell className="font-semibold">Lat</TableCell>
                    <TableCell className="font-semibold">Long</TableCell>
                    <TableCell className="font-semibold">Smazat</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sensors.map((sensor) => (
                    <TableRow key={sensor.id} className="hover:bg-gray-100">
                      <TableCell>{sensor.id}</TableCell>
                      <TableCell>{sensor.name}</TableCell>
                      <TableCell>{sensor.description}</TableCell>
                      <TableCell>{sensor.latitude}</TableCell>
                      <TableCell>{sensor.longitude}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleDeleteSensor(sensor.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </>
      )}
    </div>
  );
}
