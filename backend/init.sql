CREATE TABLE sensors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    type ENUM('venek', 'vnitrek') NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sensor_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id INT NOT NULL,
    measured_at DATETIME NOT NULL,
    
    temperature DECIMAL(5,2),
    pressure DECIMAL(6,2),
    humidity DECIMAL(5,2),
    wind_speed DECIMAL(5,2),
    air_quality DECIMAL(5,2),
    
    FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE
);

CREATE INDEX idx_sensor_readings_sensor_time 
ON sensor_readings (sensor_id, measured_at);

CREATE INDEX idx_sensor_readings_sensor_id 
ON sensor_readings (sensor_id);

CREATE INDEX idx_sensor_readings_measured_at 
ON sensor_readings (measured_at);
