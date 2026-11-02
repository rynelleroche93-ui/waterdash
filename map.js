// Initialize 2D Map centered on Mysuru, Karnataka
const map = L.map('map', {
    zoomControl: false
}).setView([12.2958, 76.6551], 13);

// Add custom dark-themed OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Apply dark filter to tiles for consistency with your app theme
setTimeout(() => {
    document.querySelectorAll('.leaflet-tile-pane').forEach(el => {
        el.classList.add('dark-tiles');
    });
}, 200);

// Add custom zoom controls to the top right
L.control.zoom({ position: 'topright' }).addTo(map);

// Marker for Chamundi Hill reference point
L.marker([12.2778, 76.6713]).addTo(map)
    .bindPopup("<b>Chamundi Hill</b><br>High Elevation Ridge Landmark");

// Marker for City Center / Palace area
L.marker([12.3052, 76.6551]).addTo(map)
    .bindPopup("<b>Mysore Palace Zone</b><br>Central Distribution Node");