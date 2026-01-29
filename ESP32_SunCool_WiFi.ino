#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

// ===== WiFi CREDENTIALS =====
const char* ssid = "YOUR_WIFI_SSID";          // Replace with your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";   // Replace with your WiFi password

// ===== SERVER CONFIGURATION =====
const char* serverUrl = "http://YOUR_SERVER_IP:3000/api/temperatures";  // Replace with your server IP
// Example: "http://192.168.1.100:3000/api/temperatures"

// ===== PIN DEFINITIONS =====
#define TEMP_PIN 4        // DS18B20 data pin
#define FAN_PIN 16        // MOSFET gate for fan
#define MIST_PIN 17       // MOSFET gate for mist module

// ===== TEMPERATURE THRESHOLD =====
#define TEMP_THRESHOLD 38.0  // Celsius

// ===== TIMING =====
#define SEND_INTERVAL 2000        // Send data every 2 seconds (2000ms)
#define STATUS_CHECK_INTERVAL 3000 // Check device status every 3 seconds

// ===== ONE WIRE SETUP =====
OneWire oneWire(TEMP_PIN);
DallasTemperature sensors(&oneWire);

unsigned long lastSendTime = 0;
unsigned long lastStatusCheck = 0;
bool remoteControlEnabled = false; // Device status from web app

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Initialize pins
  pinMode(FAN_PIN, OUTPUT);
  pinMode(MIST_PIN, OUTPUT);
  digitalWrite(FAN_PIN, LOW);
  digitalWrite(MIST_PIN, LOW);

  // Initialize temperature sensor
  sensors.begin();

  Serial.println("\n\n=================================");
  Serial.println("SunCool - Temperature Monitoring System");
  Serial.println("=================================\n");

  // Connect to WiFi
  connectToWiFi();

  Serial.println("\nSystem Ready!");
  Serial.println("=================================\n");
}

void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n✗ WiFi Connection Failed!");
    Serial.println("Please check your credentials and try again.");
  }
}

void sendTemperatureData(float temperature) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗ WiFi not connected. Attempting to reconnect...");
    connectToWiFi();
    return;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["temperature"] = temperature;
  doc["humidity"] = 0;  // Add humidity sensor if you have one, or set to 0
  
  String jsonData;
  serializeJson(doc, jsonData);

  // Send POST request
  int httpResponseCode = http.POST(jsonData);

  if (httpResponseCode > 0) {
    Serial.print("✓ Data sent successfully | HTTP Response: ");
    Serial.println(httpResponseCode);
    
    String response = http.getString();
    Serial.print("Server Response: ");
    Serial.println(response);
  } else {
    Serial.print("✗ Error sending data | Error code: ");
    Serial.println(httpResponseCode);
    Serial.print("Error: ");
    Serial.println(http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}

bool checkDeviceStatus() {
  if (WiFi.status() != WL_CONNECTED) {
    return remoteControlEnabled; // Return last known status if offline
  }

  HTTPClient http;
  
  // Build URL to check device status
  String statusUrl = String(serverUrl);
  statusUrl.replace("/temperatures", "/device/status");
  
  http.begin(statusUrl);
  int httpResponseCode = http.GET();

  if (httpRespon🌡️  Temperature: ");
  Serial.print(temperatureC);
  Serial.println(" °C");

  // Check device status from web app
  unsigned long currentTime = millis();
  if (currentTime - lastStatusCheck >= STATUS_CHECK_INTERVAL) {
    checkDeviceStatus();
    lastStatusCheck = currentTime;
  }

  // Control fan and mist (remote control OR temperature threshold)
  controlFanAndMist(temperatureC); Serial.println(httpResponseCode);
  }

  http.end();
  return remoteControlEnabled;
}

void controlFanAndMist(float temperature) {
  bool shouldActivate = false;
  String reason = "";

  // Check if remote control is enabled from web app
  if (remoteControlEnabled) {
    shouldActivate = true;
    reason = "Remote Control (App Command)";
  } 
  // Auto-activate if temperature exceeds threshold
  else if (temperature > TEMP_THRESHOLD) {
    shouldActivate = true;
    reason = "High Temperature Auto-Activation";
  }

  // Control the devices
  if (shouldActivate) {
    digitalWrite(FAN_PIN, HIGH);
    digitalWrite(MIST_PIN, HIGH);
    Serial.print("✓ Fan & Mist: ON - ");
    Serial.println(reason);
  } else {
    digitalWrite(FAN_PIN, LOW);
    digitalWrite(MIST_PIN, LOW);
    Serial.println("○ Fan & Mist: OFF");
  }
}

void loop() {
  // Request temperature reading
  sensors.requestTemperatures();
  float temperatureC = sensors.getTempCByIndex(0);

  // Check if reading is valid
  if (temperatureC == DEVICE_DISCONNECTED_C || temperatureC == 85.0) {
    Serial.println("⚠ Error: Could not read temperature data!");
    delay(2000);
    return;
  }

  // Print temperature
  Serial.println("\n--- Temperature Reading ---");
  Serial.print("Temperature: ");
  Serial.print(temperatureC);
  Serial.println(" °C");

  // Control fan and mist based on temperature
  if (temperatureC > TEMP_THRESHOLD) {
    digitalWrite(FAN_PIN, HIGH);
    digitalWrite(MIST_PIN, HIGH);
    Serial.println("Status: Fan & Mist ON (Cooling Active)");
  } else {
    digitalWrite(FAN_PIN, LOW);
    digitalWrite(MIST_PIN, LOW);
    Serial.println("Status: Fan & Mist OFF (Normal)");
  }

  // Send data to server at specified interval
  unsigned long currentTime = millis();
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    Serial.println("\n📡 Sending data to server...");
    sendTemperatureData(temperatureC);
    lastSendTime = millis()

  delay(2000); // Read every 2 seconds
}
