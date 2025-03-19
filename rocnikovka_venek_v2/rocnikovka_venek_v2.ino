#include <Wire.h>
// BME280
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiProv.h>

Adafruit_BME280 bme;

// anemometer
const int anemometerPin = 0;     // analog pin 0 (A0)
const float minVoltage = 0.054;  // Voltage corresponding to 0 m/s
const float maxVoltage = 5;      // Voltage corresponding to 32.4 m/s (max speed)
const float maxWindSpeed = 59.4; // Maximum wind speed in m/s
const float windSpeed_kmh = 0;
// Conversion factors
const char *pop = "abcd1234";          // Proof of possession - otherwise called a PIN - string provided by the device, entered by the user in the phone app
const char *service_name = "PROV_123"; // Name of your device (the Es
const float mps_to_kmh = 3.6; // 1 m/s = 3.6 km/h

const String apiUrl = "https://api.mstanice.cz/sensor/data";

// Wi-Fi připojenípressif apps expects by default device name starting with "Prov_")
const char *service_key = NULL;        // Password used for SofAP method (NULL = no password needed)
bool reset_provisioned = true;         // When true the library will automatically delete previously provisioned data.

int sensor_id = 2;

// WARNING: SysProvEvent is called from a separate FreeRTOS task (thread)!
void SysProvEvent(arduino_event_t *sys_event)
{
  switch (sys_event->event_id)
  {
  case ARDUINO_EVENT_WIFI_STA_GOT_IP:
    Serial.print("\nConnected IP address : ");
    Serial.println(IPAddress(sys_event->event_info.got_ip.ip_info.ip.addr));
    break;
  case ARDUINO_EVENT_WIFI_STA_DISCONNECTED:
    Serial.println("\nDisconnected. Connecting to the AP again... ");
    break;
  case ARDUINO_EVENT_PROV_START:
    Serial.println("\nProvisioning started\nGive Credentials of your access point using smartphone app");
    break;
  case ARDUINO_EVENT_PROV_CRED_RECV:
  {
    Serial.println("\nReceived Wi-Fi credentials");
    Serial.print("\tSSID : ");
    Serial.println((const char *)sys_event->event_info.prov_cred_recv.ssid);
    Serial.print("\tPassword : ");
    Serial.println((char const *)sys_event->event_info.prov_cred_recv.password);
    break;
  }
  case ARDUINO_EVENT_PROV_CRED_FAIL:
  {
    Serial.println("\nProvisioning failed!\nPlease reset to factory and retry provisioning\n");
    if (sys_event->event_info.prov_fail_reason == WIFI_PROV_STA_AUTH_ERROR)
    {
      Serial.println("\nWi-Fi AP password incorrect");
    }
    else
    {
      Serial.println("\nWi-Fi AP not found....Add API \" nvs_flash_erase() \" before beginProvision()");
    }
    break;
  }
  case ARDUINO_EVENT_PROV_CRED_SUCCESS:
    Serial.println("\nProvisioning Successful");
    break;
  case ARDUINO_EVENT_PROV_END:
    Serial.println("\nProvisioning Ends");
    break;
  default:
    break;
  }
}

void setup()
{
  Serial.begin(115200);
  bme.begin(0x77);

  WiFi.onEvent(SysProvEvent);
  // Připojení k WiFi
  Serial.println("Begin Provisioning using BLE");
  // Sample uuid that user can pass during provisioning using BLE
  uint8_t uuid[16] = {0xb4, 0xdf, 0x5a, 0x1c, 0x3f, 0x6b, 0xf4, 0xbf,
                      0xea, 0x4a, 0x82, 0x03, 0x04, 0x90, 0x1a, 0x02};
  WiFiProv.beginProvision(
      WIFI_PROV_SCHEME_BLE, WIFI_PROV_SCHEME_HANDLER_FREE_BLE, WIFI_PROV_SECURITY_1, pop, service_name, service_key, uuid, reset_provisioned);
  log_d("ble qr");
  WiFiProv.printQR(service_name, pop, "ble");
}

void loop()
{

  // wind speed
  int adcValue = analogRead(anemometerPin);

  float voltage = (adcValue / 1023.00) * 5.0;

  if (voltage < minVoltage)
  {
    voltage = minVoltage;
  }
  else if (voltage > maxVoltage)
  {
    voltage = maxVoltage;
  }
  float windSpeed_mps = ((voltage - minVoltage) / (maxVoltage - minVoltage)) * maxWindSpeed;
  float windSpeed_kmh = windSpeed_mps * mps_to_kmh;

  Serial.print("Wind Speed: ");
  Serial.print(windSpeed_kmh);
  Serial.println(" km/h, ");

  // BME280
  printValues();

  delay(1000);
  sendDataToServer();
}
void printValues()
{
  Serial.print("Temperature = ");
  Serial.print(bme.readTemperature());
  Serial.println(" *C");

  Serial.print("Pressure = ");
  Serial.print(bme.readPressure() / 100.0F);
  Serial.println(" hPa");

  Serial.print("Humidity = ");
  Serial.print(bme.readHumidity());
  Serial.println(" %");

  Serial.println();
}
void sendDataToServer()
{
  if (WiFi.status() == WL_CONNECTED)
  {
    HTTPClient http;

    String url = apiUrl +
                 "?sensor_id=" + String(sensor_id) +
                 "&temperature=" + String((double)bme.readTemperature()) +
                 "&pressure=" + String((double)(bme.readPressure() / 100.0F)) +
                 "&humidity=" + String((double)bme.readHumidity()) +
                 "&wind=" + String((double)windSpeed_kmh);

    http.begin(url);
    http.addHeader("accept", "application/json");
    http.addHeader("apikey", "tajny");

    int httpResponseCode = http.POST("");

    if (httpResponseCode > 0)
    {
      Serial.print("Server odpověděl: ");
      Serial.println(httpResponseCode);
      Serial.println(http.getString());
    }
    else
    {
      Serial.print("Chyba HTTP: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }
  else
  {
    Serial.println("WiFi odpojeno, data neodeslána.");
  }
}
