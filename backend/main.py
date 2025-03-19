from fastapi import FastAPI, HTTPException, Path, Security, Depends
from typing import Optional
from db import get_connection
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os
from fastapi.security import APIKeyHeader


app = FastAPI(title="Mstanice API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
AUTH_API_KEY = os.getenv("AUTH_API_KEY")


def check_api_key(header: str = Security(APIKeyHeader(name="apikey"))):
    if header == AUTH_API_KEY:
        return header
    else:
        raise HTTPException(status_code=401)


class SensorReading(BaseModel):
    sensor_id: int = Field(..., description="ID senzoru")
    temperature: float | None = Field(None, description="Teplota v °C")
    pressure: float | None = Field(None, description="Tlak v hPa")
    humidity: float | None = Field(None, description="Vlhkost v %")
    wind_speed: float | None = Field(None, description="Rychlost větru v m/s")
    air_quality: float | None = Field(None, description="Kvalita vzduchu")


class SensorCreate(BaseModel):
    name: str = Field(..., description="Název senzoru", max_length=100)
    type: str = Field(..., description="Typ senzoru ('venek' nebo 'vnitrek')")
    latitude: float | None = Field(None, description="Zeměpisná šířka")
    longitude: float | None = Field(None, description="Zeměpisná délka")
    description: str | None = Field(None, description="Popis senzoru")


@app.get("/sensors")
def get_sensors():
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM sensors")
            sensors = cursor.fetchall()
        return sensors
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/sensor")
def create_sensor(sensor: SensorCreate, api_key: str = Depends(check_api_key)):
    """Vytvoří nový senzor v databázi"""
    try:
        if sensor.type not in ["vnejsek", "vnitrek"]:
            raise HTTPException(
                status_code=400, detail="Neplatný typ senzoru. Musí být 'vnejsek' nebo 'vnitrek'.")

        with get_connection() as conn, conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO sensors (name, type, latitude, longitude, description)
                VALUES (%s, %s, %s, %s, %s)
            """, (sensor.name, sensor.type, sensor.latitude, sensor.longitude, sensor.description))
            conn.commit()

        return {"message": "Senzor byl úspěšně vytvořen."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/sensor/{sensor_id}")
def delete_sensor(sensor_id: int, api_key: str = Depends(check_api_key)):
    """Smaže senzor podle ID"""
    try:
        with get_connection() as conn, conn.cursor() as cursor:
            cursor.execute("DELETE FROM sensors WHERE id = %s", (sensor_id,))
            conn.commit()
        return {"message": "Senzor byl úspěšně smazán."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/isAdmin")
def isAdmin(api_key: str = Depends(check_api_key)):
    return {"isAdmin": True}


@app.post("/sensor/data")
def save_sensor_data(
    sensor_id: int,
    temperature: Optional[float] = None,
    pressure: Optional[float] = None,
    humidity: Optional[float] = None,
    wind: Optional[float] = None,
    gas: Optional[float] = None,
    api_key: str = Depends(check_api_key)
):
    """ Ukládá nové měření do databáze, ale nejdříve ověřuje existenci senzoru """
    try:
        with get_connection() as conn, conn.cursor() as cursor:
            cursor.execute("SELECT id FROM sensors WHERE id = %s",
                           (sensor_id,))
            sensor_exists = cursor.fetchone()
            if not sensor_exists:
                raise HTTPException(
                    status_code=400, detail=f"Senzor s ID {sensor_id} neexistuje.")

            cursor.execute("""
                INSERT INTO sensor_readings (sensor_id, measured_at, temperature, pressure, humidity, wind_speed, air_quality)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                sensor_id,
                datetime.now(),
                temperature,
                pressure,
                humidity,
                wind,
                gas
            ))
            conn.commit()
        return {"message": "Měření bylo uloženo."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/sensor/{sensor_id}")
def get_sensor(sensor_id: int = Path(..., description="ID senzoru")):
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM sensors WHERE id = %s", (sensor_id,))
            sensor = cursor.fetchone()
        if not sensor:
            raise HTTPException(status_code=404, detail="Senzor neexistuje.")
        return sensor
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/sensor/data/{sensor_id}")
def get_sensor_data(sensor_id: int = Path(..., description="ID senzoru")):
    try:
        one_week_ago = (datetime.now() - timedelta(days=7)
                        ).strftime('%Y-%m-%d %H:%M:%S')
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM sensor_readings
                WHERE sensor_id = %s AND measured_at >= %s
                ORDER BY measured_at DESC
            """, (sensor_id, one_week_ago))
            data = cursor.fetchall()
        if not data:
            raise HTTPException(
                status_code=404, detail="Žádná data za poslední týden.")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
