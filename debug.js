// Debug script to identify map issues
console.log("Debug script loaded");

// Check if DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    // Check if map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error("Map container not found!");
        return;
    }
    console.log("Map container found with dimensions:", 
        mapContainer.offsetWidth + "x" + mapContainer.offsetHeight);
    
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error("Leaflet library not loaded!");
        return;
    }
    console.log("Leaflet version:", L.version);
    
    // Check if marker cluster plugin is loaded
    if (!L.MarkerClusterGroup) {
        console.error("Leaflet.markercluster plugin not loaded!");
    } else {
        console.log("MarkerCluster plugin loaded");
    }
    
    // Check if gold data is available
    if (typeof allGoldLocations === 'undefined') {
        console.error("Gold locations data not loaded!");
    } else {
        console.log("Gold locations data loaded with", allGoldLocations.length, "locations");
    }
    
    // Try to initialize a test map
    try {
        console.log("Attempting to initialize test map...");
        const testMap = L.map('map-debug', {
            center: [45.0, -62.5],
            zoom: 8
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(testMap);
        
        console.log("Test map initialized successfully");
    } catch (e) {
        console.error("Error initializing test map:", e);
    }
});
