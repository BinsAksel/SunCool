// Simple Terminal Test for Body Temperature Display
const https = require('https');

const DATABASE_URL = "https://suncool-b0879-default-rtdb.asia-southeast1.firebasedatabase.app";

console.log('\n🌡️  SunCool Body Temperature Display Test\n');
console.log('='.repeat(60));

function firebaseGet(path) {
    return new Promise((resolve, reject) => {
        const url = `${DATABASE_URL}${path}.json`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function displayTemp(temp) {
    const bar = '█'.repeat(Math.min(Math.floor(temp), 50));
    let status, color;
    
    if (temp >= 36) {
        status = '⚠️  HIGH TEMPERATURE - AUTO SPRAY TRIGGERED!';
        color = '\x1b[31m'; // Red
    } else if (temp > 30) {
        status = '⚡ ELEVATED TEMPERATURE';
        color = '\x1b[33m'; // Yellow
    } else {
        status = '✓ NORMAL TEMPERATURE RANGE';
        color = '\x1b[32m'; // Green
    }
    
    console.log('\n' + color + '┌────────────────────────────────────────────────────────┐');
    console.log(`│  Current Body Temperature: ${temp.toFixed(1)}°C`.padEnd(57) + '│');
    console.log(`│  Status: ${status}`.padEnd(57) + '│');
    console.log('└────────────────────────────────────────────────────────┘\x1b[0m');
    console.log(`\nTemperature Bar: ${color}${bar}\x1b[0m`);
}

async function runTest() {
    try {
        console.log('\n📡 Connecting to Firebase...');
        
        // Fetch all data
        console.log('\n🔍 Fetching temperature data from Firebase...');
        const temperatures = await firebaseGet('/temperatures');
        
        console.log('\n📦 Raw data received:');
        console.log(JSON.stringify(temperatures, null, 2));
        
        if (temperatures && typeof temperatures === 'object') {
            const entries = Object.entries(temperatures);
            console.log(`\n✅ Found ${entries.length} temperature reading(s)`);
            
            if (entries.length > 0) {
                // Get the latest temperature
                const [latestKey, latestData] = entries[entries.length - 1];
                
                console.log('\n📊 Latest Temperature Data:');
                console.log(`   Key: ${latestKey}`);
                console.log(`   Temperature: ${latestData.temperature}°C`);
                console.log(`   Humidity: ${latestData.humidity || 'N/A'}%`);
                console.log(`   Timestamp: ${latestData.timestamp ? new Date(latestData.timestamp).toLocaleString() : 'N/A'}`);
                
                // Display temperature
                if (latestData.temperature !== undefined) {
                    displayTemp(latestData.temperature);
                    
                    // Threshold check
                    console.log('\n🎯 Threshold Analysis:');
                    console.log(`   Current: ${latestData.temperature}°C`);
                    console.log(`   Threshold: 36°C`);
                    
                    if (latestData.temperature >= 36) {
                        console.log('\x1b[31m   ⚠️  ALERT: Temperature exceeds threshold!');
                        console.log('   🤖 Auto spray should be activated!\x1b[0m');
                    } else {
                        console.log('\x1b[32m   ✓ Temperature is within safe range\x1b[0m');
                    }
                }
                
                // Show history
                if (entries.length > 1) {
                    console.log('\n📈 Temperature History (Last 5 readings):');
                    entries.slice(-5).forEach(([key, data], index) => {
                        const time = data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Unknown';
                        const icon = data.temperature >= 36 ? '⚠️ ' : data.temperature > 30 ? '⚡' : '✓ ';
                        console.log(`   ${index + 1}. ${icon} ${data.temperature}°C at ${time}`);
                    });
                }
            } else {
                console.log('\n❌ No temperature readings found in database');
            }
        } else {
            console.log('\n❌ No temperature data available');
        }
        
        // Check device status
        console.log('\n🔴 Device Status Check:');
        const device = await firebaseGet('/device');
        
        if (device && device.status !== undefined) {
            const isOn = device.status === true || device.status === 'on';
            console.log(`   Status: ${isOn ? '🔴 ON' : '⚪ OFF'}`);
        } else {
            console.log('   Status: Unknown (no data)');
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('\n✅ Body Temperature Display Test Completed!\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\n' + '='.repeat(60));
        console.log('\n❌ Test Failed!\n');
        process.exit(1);
    }
}

// Run the test
console.log('\nStarting test in 2 seconds...\n');
setTimeout(runTest, 2000);
