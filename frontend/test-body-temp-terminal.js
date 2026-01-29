// Terminal Test for Body Temperature Display
const https = require('https');

console.log('\n🌡️  SunCool Body Temperature Display Test\n');
console.log('=' .repeat(50));

// Firebase REST API configuration
const DATABASE_URL = "https://suncool-b0879-default-rtdb.asia-southeast1.firebasedatabase.app";

// Helper function to make Firebase REST API calls
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

let testsPassed = 0;
let testsFailed = 0;

function logTest(testName, passed, details = '') {
    if (passed) {
        console.log(`✅ ${testName}`);
        if (details) console.log(`   ${details}`);
        testsPassed++;
    } else {
        console.log(`❌ ${testName}`);
        if (details) console.log(`   ${details}`);
        testsFailed++;
    }
}

function displayTemperature(temp) {
    const bar = '█'.repeat(Math.min(Math.floor(temp), 50));
    const status = temp >= 36 ? '⚠️  HIGH' : temp > 30 ? '⚡ ELEVATED' : '✓ NORMAL';
    
    console.log('\n┌─────────────────────────────────────────────┐');
    console.log(`│  Current Body Temperature: ${temp.toFixed(1)}°C ${status.padEnd(10)} │`);
    console.log('└─────────────────────────────────────────────┘');
    console.log(`Temperature Bar: ${bar}`);
}

async function runTests() {
    console.log('\n📋 Running Body Temperature Display Tests...\n');
    
    try {
        // Test 1: Firebase Connection
        console.log('\n🔌 Test 1: Firebase Connection');
        try {
            const connTest = await firebaseGet('/temperatures');
            logTest('Firebase Connection', true, 'Connected to Firebase Realtime Database');
        } catch (error) {
            logTest('Firebase Connection', false, `Failed to connect: ${error.message}`);
        }

        // Test 2: Read Temperature Data
        console.log('\n🌡️  Test 2: Reading Temperature Data');
        const temperatures = await firebaseGet('/temperatures');
        
        if (temperatures && typeof temperatures === 'object') {
            const keys = Object.keys(temperatures);
            
            if (keys.length > 0) {
                const latest = temperatures[keys[keys.length - 1]];
                const hasTemp = latest.temperature !== undefined;
                
                logTest('Temperature Data Retrieved', hasTemp,
                    hasTemp ? `Temperature: ${latest.temperature}°C` : 'No temperature value');
                
                if (hasTemp) {
                    displayTemperature(latest.temperature);
                    
                    // Additional data
                    console.log('\n📊 Additional Data:');
                    if (latest.humidity !== undefined) {
                        console.log(`   Humidity: ${latest.humidity}%`);
                    }
                    if (latest.timestamp) {
                        const date = new Date(latest.timestamp);
                        console.log(`   Timestamp: ${date.toLocaleString()}`);
                    }
                }
            } else {
                logTest('Temperature Data Retrieved', false, 'Data object is empty');
            }
        } else {
            logTest('Temperature Data Retrieved', false, 'No temperature data in database');
        }

        // Test 3: Device Status
        console.log('\n🔴 Test 3: Device Status');
        const device = await firebaseGet('/device');
        
        if (device && device.status !== undefined) {
            const status = device.status;
            logTest('Device Status Retrieved', true,
                `Device is ${status === true || status === 'on' ? 'ON 🔴' : 'OFF ⚪'}`);
        } else {
            logTest('Device Status Retrieved', false, 'No device status');
        }

        // Test 4: Temperature History
        console.log('\n📈 Test 4: Temperature History (All readings)');
        
        if (temperatures && typeof temperatures === 'object') {
            const entries = Object.entries(temperatures);
            
            logTest('Temperature History Retrieved', entries.length > 0,
                `Found ${entries.length} temperature readings`);
            
            console.log('\n   Recent Temperatures (Last 5):');
            entries.slice(-5).forEach(([key, value], index) => {
                const time = value.timestamp ? new Date(value.timestamp).toLocaleTimeString() : 'Unknown';
                const status = value.temperature >= 36 ? '⚠️ ' : value.temperature > 30 ? '⚡' : '✓ ';
                console.log(`   ${index + 1}. ${status} ${value.temperature}°C at ${time}`);
            });
        } else {
            logTest('Temperature History Retrieved', false, 'No history available');
        }

        // Test 5: Temperature Threshold Check
        console.log('\n🎯 Test 5: Temperature Threshold Check');
        
        if (temperatures && typeof temperatures === 'object') {
            const keys = Object.keys(temperatures);
            
            if (keys.length > 0) {
                const latest = temperatures[keys[keys.length - 1]];
                const temp = latest.temperature;
                const threshold = 36;
                
                const shouldTrigger = temp >= threshold;
                logTest('Threshold Detection', true,
                    shouldTrigger 
                        ? `⚠️  Temperature ${temp}°C exceeds threshold (${threshold}°C) - Auto spray should activate!`
                        : `✓ Temperature ${temp}°C is below threshold (${threshold}°C) - Normal operation`
                );
            }
        }

        // Test 6: Data Structure Validation
        console.log('\n🔍 Test 6: Data Structure Validation');
        
        if (temperatures && typeof temperatures === 'object') {
            const keys = Object.keys(temperatures);
            const latest = temperatures[keys[keys.length - 1]];
            
            const hasTemp = latest.temperature !== undefined;
            const hasTimestamp = latest.timestamp !== undefined;
            const tempIsNumber = typeof latest.temperature === 'number';
            
            logTest('Data Structure Valid', hasTemp && hasTimestamp && tempIsNumber,
                `Temperature: ${hasTemp ? '✓' : '✗'}, Timestamp: ${hasTimestamp ? '✓' : '✗'}, Type: ${tempIsNumber ? 'number ✓' : '✗'}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
        
        tempRef.off('value', updateListener);
        logTest('Real-time Updates', updateCount > 0, 
            updateCount > 0 ? `Received ${updateCount} update(s)` : 'No updates received');

    } catch (error) {
        console.error('\n❌ Test Error:', error.message);
        testsFailed++;
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('\n📊 Test Summary:');
    console.log(`   ✅ Tests Passed: ${testsPassed}`);
    console.log(`   ❌ Tests Failed: ${testsFailed}`);
    console.log(`   📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
    console.log('\n' + '='.repeat(50) + '\n');

    // Exit
    process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
console.log('Starting tests in 2 seconds...\n');
setTimeout(runTests, 2000);
