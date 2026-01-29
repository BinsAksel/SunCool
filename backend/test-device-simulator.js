// Test script to simulate ESP32 sending temperature data
// This helps you verify the backend and frontend are working correctly

const http = require('http');

const SERVER_URL = 'localhost';
const SERVER_PORT = 3000;
const SEND_INTERVAL = 3000; // Send every 3 seconds

// Simulate temperature readings (fluctuating between 35-40°C)
function generateTemperature() {
    const baseTemp = 37.0;
    const variation = (Math.random() - 0.5) * 4; // ±2°C variation
    return parseFloat((baseTemp + variation).toFixed(2));
}

function sendTemperatureData(temperature) {
    const data = JSON.stringify({
        temperature: temperature,
        humidity: 0
    });

    const options = {
        hostname: SERVER_URL,
        port: SERVER_PORT,
        path: '/api/temperatures',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
            responseData += chunk;
        });

        res.on('end', () => {
            console.log(`✓ Sent: ${temperature}°C | Response: ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log(`  Server: ${responseData}`);
            }
        });
    });

    req.on('error', (error) => {
        console.error(`✗ Error sending data: ${error.message}`);
        console.error('  Make sure backend server is running on port 3000');
    });

    req.write(data);
    req.end();
}

console.log('╔═══════════════════════════════════════════╗');
console.log('║   ESP32 Temperature Simulator             ║');
console.log('║   Simulating SunCool Device               ║');
console.log('╚═══════════════════════════════════════════╝\n');
console.log(`📡 Target: http://${SERVER_URL}:${SERVER_PORT}/api/temperatures`);
console.log(`⏱️  Sending temperature data every ${SEND_INTERVAL/1000} seconds\n`);
console.log('Press Ctrl+C to stop\n');
console.log('═══════════════════════════════════════════\n');

// Send initial reading
let count = 1;
const temp = generateTemperature();
console.log(`[${count}] 🌡️  Temperature: ${temp}°C`);
sendTemperatureData(temp);

// Send data at intervals
setInterval(() => {
    count++;
    const temp = generateTemperature();
    console.log(`\n[${count}] 🌡️  Temperature: ${temp}°C`);
    sendTemperatureData(temp);
}, SEND_INTERVAL);
