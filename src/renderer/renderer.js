const { ipcRenderer } = require('electron');

let map;
let currentLocationMarker;
let targetLocationMarker;
let isConnected = false;
let currentLocation = { lat: 37.7749, lng: -122.4194 }; // Default: San Francisco

// Initialize the application
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    initializeMap();
    bindEventListeners();
    updateUI();
}

function initializeMap() {
    // Initialize Leaflet map
    map = L.map('map').setView([currentLocation.lat, currentLocation.lng], 13);

    // Add OpenStreetMap tiles (free alternative to Google Maps)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add current location marker
    currentLocationMarker = L.marker([currentLocation.lat, currentLocation.lng])
        .addTo(map)
        .bindPopup('Current Location')
        .openPopup();

    // Handle map clicks
    map.on('click', function(e) {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);
        
        document.getElementById('target-lat').value = lat;
        document.getElementById('target-lng').value = lng;
        
        updateTargetMarker(lat, lng);
    });
}

function bindEventListeners() {
    // Connect button
    document.getElementById('connect-btn').addEventListener('click', connectToiPhone);
    
    // Set location button
    document.getElementById('set-location-btn').addEventListener('click', setLocation);
    
    // Restore GPS button
    document.getElementById('restore-gps-btn').addEventListener('click', restoreRealGPS);
    
    // Get current location button
    document.getElementById('get-current-btn').addEventListener('click', getCurrentLocation);
    
    // Speed slider
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    speedSlider.addEventListener('input', () => {
        speedValue.textContent = speedSlider.value;
    });
}

async function connectToiPhone() {
    updateStatus('Connecting to iPhone...');
    
    try {
        const result = await ipcRenderer.invoke('connect-iphone');
        
        if (result.success) {
            isConnected = true;
            document.getElementById('device-status').textContent = 
                `Device: ${result.deviceName} (iOS ${result.iosVersion})`;
            document.getElementById('connect-btn').textContent = 'Connected ✓';
            document.getElementById('connect-btn').style.background = '#4CAF50';
            updateStatus('iPhone connected successfully');
        } else {
            updateStatus(`Connection failed: ${result.error}`);
        }
    } catch (error) {
        updateStatus(`Connection error: ${error.message}`);
    }
    
    updateUI();
}

async function setLocation() {
    if (!isConnected) {
        updateStatus('Please connect iPhone first');
        return;
    }

    const lat = parseFloat(document.getElementById('target-lat').value);
    const lng = parseFloat(document.getElementById('target-lng').value);

    if (isNaN(lat) || isNaN(lng)) {
        updateStatus('Please enter valid coordinates');
        return;
    }

    updateStatus('Setting location...');

    try {
        const result = await ipcRenderer.invoke('set-location', { latitude: lat, longitude: lng });
        
        if (result.success) {
            currentLocation = { lat, lng };
            updateCurrentLocationMarker(lat, lng);
            updateLocationDisplay(lat, lng);
            updateStatus('Location updated successfully');
        } else {
            updateStatus(`Failed to set location: ${result.error}`);
        }
    } catch (error) {
        updateStatus(`Error: ${error.message}`);
    }
}

async function restoreRealGPS() {
    if (!isConnected) {
        updateStatus('Please connect iPhone first');
        return;
    }

    updateStatus('Restoring real GPS...');

    try {
        const result = await ipcRenderer.invoke('restore-real-gps');
        
        if (result.success) {
            updateStatus('Real GPS restored successfully');
        } else {
            updateStatus(`Failed to restore GPS: ${result.error}`);
        }
    } catch (error) {
        updateStatus(`Error: ${error.message}`);
    }
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            document.getElementById('target-lat').value = lat.toFixed(6);
            document.getElementById('target-lng').value = lng.toFixed(6);
            
            updateTargetMarker(lat, lng);
            map.setView([lat, lng], 13);
            
            updateStatus('Current real location loaded');
        }, (error) => {
            updateStatus('Failed to get current location');
        });
    } else {
        updateStatus('Geolocation not supported');
    }
}

function updateCurrentLocationMarker(lat, lng) {
    if (currentLocationMarker) {
        currentLocationMarker.setLatLng([lat, lng]);
    } else {
        currentLocationMarker = L.marker([lat, lng]).addTo(map);
    }
    currentLocationMarker.bindPopup('Current Spoofed Location').openPopup();
}

function updateTargetMarker(lat, lng) {
    if (targetLocationMarker) {
        targetLocationMarker.setLatLng([lat, lng]);
    } else {
        targetLocationMarker = L.marker([lat, lng], {
            color: 'red',
            icon: L.icon({
                iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjRkY0NDQ0Ii8+Cjwvc3ZnPgo=',
                iconSize: [24, 24]
            })
        }).addTo(map);
    }
    targetLocationMarker.bindPopup('Target Location');
}

function updateLocationDisplay(lat, lng) {
    document.getElementById('current-lat').textContent = lat.toFixed(6);
    document.getElementById('current-lng').textContent = lng.toFixed(6);
}

function updateStatus(message) {
    document.getElementById('status-message').textContent = message;
    console.log(`Status: ${message}`);
}

function updateUI() {
    const buttons = document.querySelectorAll('button:not(#connect-btn)');
    buttons.forEach(btn => {
        btn.disabled = !isConnected;
    });
}

function setFavorite(lat, lng) {
    document.getElementById('target-lat').value = lat;
    document.getElementById('target-lng').value = lng;
    updateTargetMarker(lat, lng);
    map.setView([lat, lng], 13);
}