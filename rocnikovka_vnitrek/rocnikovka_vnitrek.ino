#include <Wire.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME680.h>
#include "WiFi.h"
#include <HTTPClient.h>
#include "WiFiProv.h"

#define BME_SCK 18
#define BME_MISO 19
#define BME_MOSI 23
#define BME_CS 5

Adafruit_BME680 bme(BME_CS, BME_MOSI, BME_MISO, BME_SCK);

// Wi-Fi připojení
const char *pop = "abcd1234";          // Proof of possession - otherwise called a PIN - string provided by the device, entered by the user in the phone app
const char *service_name = "PROV_123"; // Name of your device (the Espressif apps expects by default device name starting with "Prov_")
const char *service_key = NULL;        // Password used for SofAP method (NULL = no password needed)
bool reset_provisioned = true;         // When true the library will automatically delete previously provisioned data.

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

const String apiUrl = "https://api.mstanice.cz/sensor/data";
int sensor_id = 1;

void setup()
{
  Serial.begin(9600);
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

// Inicializace BME680

void loop()
{
  printValuesBME();
  Serial.println("_________________________________________");
  delay(2000);
  // Odeslání dat na server
  sendDataToServer();

  delay(60000); // 10 minut
}

void printValuesBME()
{
  Serial.print("Teplota: ");
  Serial.print(bme.readTemperature());
  Serial.println(" *C");

  Serial.print("Tlak: ");
  Serial.print(bme.readPressure() / 100.0F);
  Serial.println(" hPa");

  Serial.print("Vlhkost vzduchu: ");
  Serial.print(bme.readHumidity());
  Serial.println(" %");

  Serial.print(F("VOC: "));
  Serial.print(bme.gas_resistance / 1000.0);
  Serial.println(F(" KOhms"));

  Serial.println();
}

// Funkce pro odeslání dat na server
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
                 "&gas=" + String((double)(bme.gas_resistance / 1000.0));

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
