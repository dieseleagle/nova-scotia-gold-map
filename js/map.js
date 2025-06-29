// Main JavaScript for Nova Scotia Gold Mining Map
document.addEventListener('DOMContentLoaded', function() {
    // Check if data is available in localStorage for offline use
    let offlineData = localStorage.getItem('novaScotiaGoldData');
    let goldLocations = [];
    
    if (offlineData) {
        try {
            goldLocations = JSON.parse(offlineData);
            console.log('Using offline data');
        } catch (e) {
            console.error('Error parsing offline data:', e);
            goldLocations = allGoldLocations || [];
        }
    } else {
        goldLocations = allGoldLocations || [];
    }
    
    console.log('Total locations before filtering:', goldLocations.length);
    
    // Filter out locations with obviously wrong coordinates
    goldLocations = goldLocations.filter(location => {
        // Check if coordinates exist
        if (location.lat === undefined || location.lng === undefined) {
            console.log(`Skipping location with missing coordinates: ${location.name}`);
            return false;
        }
        
        // Convert to numbers if they're strings
        location.lat = parseFloat(location.lat);
        location.lng = parseFloat(location.lng);
        
        // Check for NaN
        if (isNaN(location.lat) || isNaN(location.lng)) {
            console.log(`Skipping location with invalid coordinates: ${location.name}`);
            return false;
        }
        
        return true;
    });
    
    console.log('Total locations after filtering:', goldLocations.length);
    
    // Initialize the map centered on Nova Scotia
    const map = L.map('map').setView([45.0, -62.5], 8);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);

    // Create a marker cluster group for better performance with many markers
    const markers = L.markerClusterGroup();
    
    // Custom icons for different types of gold locations
    const goldIcons = {
        'abandoned': L.divIcon({
            className: 'gold-marker-icon abandoned',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            html: '<div style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold;">Au</div>'
        }),
        'active-exploration': L.divIcon({
            className: 'gold-marker-icon active',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            html: '<div style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold;">Au</div>'
        }),
        'historical': L.divIcon({
            className: 'gold-marker-icon historical',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            html: '<div style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold;">Au</div>'
        }),
        'panning': L.divIcon({
            className: 'gold-marker-icon panning',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            html: '<div style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold;">Pa</div>'
        }),
        'quartz-rich': L.divIcon({
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            html: '<div style="width: 30px; height: 30px; background-color: white; border: 2px solid #8A2BE2; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #8A2BE2;">Qz</div>'
        })
    };
    
    // Default gold icon for any other status
    const defaultGoldIcon = L.divIcon({
        className: 'gold-marker-icon',
        iconSize: [30, 30],
        html: '<span style="line-height: 30px;">Au</span>'
    });

    // Function to create popup content
    function createPopupContent(location) {
        return `
            <div class="popup-content">
                <div class="popup-title">${location.name}</div>
                <div class="popup-detail"><span class="popup-label">Type:</span> ${location.type ? (location.type.charAt(0).toUpperCase() + location.type.slice(1)) : 'Unknown'}</div>
                <div class="popup-detail"><span class="popup-label">Status:</span> ${formatStatus(location.status)}</div>
                <div class="popup-detail"><span class="popup-label">Size:</span> ${location.size.charAt(0).toUpperCase() + location.size.slice(1)}</div>
                <div class="popup-detail"><span class="popup-label">Discovery:</span> ${location.discoveryYear} ${location.discoverer !== 'Unknown' ? 'by ' + location.discoverer : ''}</div>
                <div class="popup-detail"><span class="popup-label">Production Years:</span> ${location.productionYears}</div>
                <div class="popup-detail"><span class="popup-label">Total Production:</span> ${location.totalProduction}</div>
                <div class="popup-detail"><span class="popup-label">Description:</span> ${location.description}</div>
                <div class="popup-detail"><span class="popup-label">Access Notes:</span> ${location.accessNotes}</div>
                ${location.geology ? `<div class="popup-detail"><span class="popup-label">Geology:</span> ${location.geology}</div>` : ''}
                ${location.mineHazards ? `<div class="popup-detail"><span class="popup-label">Mine Hazards:</span> ${location.mineHazards}</div>` : ''}
                ${location.panningPotential ? `<div class="popup-detail"><span class="popup-label">Panning Potential:</span> ${location.panningPotential}</div>` : ''}
                <div class="popup-buttons">
                    <button class="save-notes-btn" data-id="${location.id}">Add/Edit Notes</button>
                    <button class="directions-btn" data-lat="${location.lat}" data-lng="${location.lng}" data-name="${location.name}">Get Directions</button>
                </div>
            </div>
        `;
    }
    
    // Helper function to format status text
    function formatStatus(status) {
        if (!status) return 'Unknown';
        
        // Replace hyphens with spaces and capitalize each word
        return status.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Function to display location information in the info panel
    function displayLocationInfo(location) {
        const infoPanel = document.getElementById('location-info');
        
        // Get user notes for this location
        const userNotes = getUserNotes(location.id);
        
        infoPanel.innerHTML = `
            <h4>${location.name}</h4>
            <p><strong>Type:</strong> ${location.type ? (location.type.charAt(0).toUpperCase() + location.type.slice(1)) : 'Unknown'}</p>
            <p><strong>Status:</strong> ${formatStatus(location.status)}</p>
            <p><strong>Size:</strong> ${location.size.charAt(0).toUpperCase() + location.size.slice(1)}</p>
            <p><strong>Discovery:</strong> ${location.discoveryYear} ${location.discoverer !== 'Unknown' ? 'by ' + location.discoverer : ''}</p>
            <p><strong>Production Years:</strong> ${location.productionYears}</p>
            <p><strong>Total Production:</strong> ${location.totalProduction}</p>
            <p><strong>Description:</strong> ${location.description}</p>
            <p><strong>Access Notes:</strong> ${location.accessNotes}</p>
            ${location.geology ? `<p><strong>Geology:</strong> ${location.geology}</p>` : ''}
            ${location.mineHazards ? `<p><strong>Mine Hazards:</strong> ${location.mineHazards}</p>` : ''}
            ${location.panningPotential ? `<p><strong>Panning Potential:</strong> ${location.panningPotential}</p>` : ''}
            <div class="user-notes-section">
                <h5>Your Notes</h5>
                <div class="user-notes">${userNotes || 'No notes yet. Click on the marker popup to add notes.'}</div>
            </div>
            <button class="favorite-btn" data-id="${location.id}">${isFavorite(location.id) ? 'Remove from Favorites' : 'Add to Favorites'}</button>
        `;
        
        // Add event listener to the favorite button
        const favoriteBtn = infoPanel.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', function() {
            toggleFavorite(location.id);
            this.textContent = isFavorite(location.id) ? 'Remove from Favorites' : 'Add to Favorites';
        });
    }
    
    // Function to get user notes for a location
    function getUserNotes(locationId) {
        try {
            const notes = localStorage.getItem(`notes-${locationId}`);
            return notes;
        } catch (e) {
            console.error('Error getting notes:', e);
            return null;
        }
    }
    
    // Function to check if a location is a favorite
    function isFavorite(locationId) {
        try {
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            return favorites.includes(locationId);
        } catch (e) {
            console.error('Error checking favorite:', e);
            return false;
        }
    }
    
    // Function to toggle favorite status
    function toggleFavorite(locationId) {
        try {
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const index = favorites.indexOf(locationId);
            
            if (index === -1) {
                favorites.push(locationId);
            } else {
                favorites.splice(index, 1);
            }
            
            localStorage.setItem('favorites', JSON.stringify(favorites));
        } catch (e) {
            console.error('Error toggling favorite:', e);
        }
    }

    // Add markers for each gold location
    goldLocations.forEach(location => {
        // Create custom icon based on status
        const icon = goldIcons[location.status] || defaultGoldIcon;
        
        // Create marker with popup - IMPORTANT: Leaflet uses [lat, lng] order
        const marker = L.marker([location.lat, location.lng], { icon: icon })
            .bindPopup(createPopupContent(location));
        
        // Add click event to update info panel
        marker.on('click', function() {
            displayLocationInfo(location);
        });
        
        // Handle popup button clicks
        marker.on('popupopen', function() {
            setTimeout(() => {
                // Handle notes button
                const saveNotesBtn = document.querySelector('.save-notes-btn[data-id="' + location.id + '"]');
                if (saveNotesBtn) {
                    saveNotesBtn.addEventListener('click', function() {
                        const existingNotes = getUserNotes(location.id) || '';
                        const notes = prompt('Enter your notes for ' + location.name + ':', existingNotes);
                        
                        if (notes !== null) {
                            localStorage.setItem(`notes-${location.id}`, notes);
                            displayLocationInfo(location);
                        }
                    });
                }
                
                // Handle directions button
                const directionsBtn = document.querySelector('.directions-btn[data-lat="' + location.lat + '"][data-lng="' + location.lng + '"]');
                if (directionsBtn) {
                    directionsBtn.addEventListener('click', function() {
                        const lat = this.getAttribute('data-lat');
                        const lng = this.getAttribute('data-lng');
                        const name = this.getAttribute('data-name');
                        getDirections(lat, lng, name);
                    });
                }
            }, 100);
        });
        
        markers.addLayer(marker);
    });

    // Add the markers to the map
    map.addLayer(markers);
    
    // Save data for offline use
    try {
        localStorage.setItem('novaScotiaGoldData', JSON.stringify(goldLocations));
        console.log('Data saved for offline use');
    } catch (e) {
        console.error('Error saving offline data:', e);
    }

    // Filter functionality
    const statusFilter = document.getElementById('status-filter');
    const sizeFilter = document.getElementById('size-filter');
    const typeFilter = document.getElementById('type-filter');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const showFavoritesCheckbox = document.getElementById('show-favorites');

    function filterMarkers() {
        const statusValue = statusFilter.value;
        const sizeValue = sizeFilter.value;
        const typeValue = typeFilter ? typeFilter.value : 'all';
        const searchValue = searchInput.value.toLowerCase();
        const showOnlyFavorites = showFavoritesCheckbox && showFavoritesCheckbox.checked;
        
        // Get favorites list
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        // Remove all markers
        markers.clearLayers();
        
        // Add filtered markers
        goldLocations.forEach(location => {
            // Check if location matches all filters
            const matchesStatus = statusValue === 'all' || location.status === statusValue;
            const matchesSize = sizeValue === 'all' || location.size === sizeValue;
            const matchesType = typeValue === 'all' || location.type === typeValue;
            const matchesFavorites = !showOnlyFavorites || favorites.includes(location.id);
            
            const matchesSearch = searchValue === '' || 
                                 location.name.toLowerCase().includes(searchValue) || 
                                 location.description.toLowerCase().includes(searchValue) ||
                                 (location.geology && location.geology.toLowerCase().includes(searchValue)) ||
                                 (location.panningPotential && location.panningPotential.toLowerCase().includes(searchValue));
            
            if (matchesStatus && matchesSize && matchesType && matchesSearch && matchesFavorites) {
                // Choose the appropriate icon based on status
                const icon = goldIcons[location.status] || defaultGoldIcon;
                
                // Create marker with popup - IMPORTANT: Leaflet uses [lat, lng] order
                const marker = L.marker([location.lat, location.lng], { icon: icon })
                    .bindPopup(createPopupContent(location));
                
                marker.on('click', function() {
                    displayLocationInfo(location);
                });
                
                // Handle notes button click in popup
                marker.on('popupopen', function() {
                    setTimeout(() => {
                        const saveNotesBtn = document.querySelector('.save-notes-btn[data-id="' + location.id + '"]');
                        if (saveNotesBtn) {
                            saveNotesBtn.addEventListener('click', function() {
                                const existingNotes = getUserNotes(location.id) || '';
                                const notes = prompt('Enter your notes for ' + location.name + ':', existingNotes);
                                
                                if (notes !== null) {
                                    localStorage.setItem(`notes-${location.id}`, notes);
                                    displayLocationInfo(location);
                                }
                            });
                        }
                    }, 100);
                });
                
                markers.addLayer(marker);
            }
        });
    }

    // Add event listeners for filters
    statusFilter.addEventListener('change', filterMarkers);
    sizeFilter.addEventListener('change', filterMarkers);
    if (typeFilter) typeFilter.addEventListener('change', filterMarkers);
    if (showFavoritesCheckbox) showFavoritesCheckbox.addEventListener('change', filterMarkers);
    searchButton.addEventListener('click', filterMarkers);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterMarkers();
        }
    });
    
    // Add export favorites button functionality
    const exportFavoritesBtn = document.getElementById('export-favorites');
    if (exportFavoritesBtn) {
        exportFavoritesBtn.addEventListener('click', function() {
            exportFavorites();
        });
    }
    
    // Function to export favorites
    function exportFavorites() {
        try {
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            if (favorites.length === 0) {
                alert('No favorites to export. Add some locations to your favorites first.');
                return;
            }
            
            const favoriteLocations = goldLocations.filter(location => favorites.includes(location.id));
            
            // Create CSV content
            let csvContent = 'Name,Type,Status,Size,Latitude,Longitude,Discovery Year,Production Years,Description,Access Notes\n';
            
            favoriteLocations.forEach(location => {
                csvContent += `"${location.name}",`;
                csvContent += `"${location.type || ''}",`;
                csvContent += `"${location.status || ''}",`;
                csvContent += `"${location.size || ''}",`;
                csvContent += `${location.lat},`;
                csvContent += `${location.lng},`;
                csvContent += `${location.discoveryYear || ''},`;
                csvContent += `"${location.productionYears || ''}",`;
                csvContent += `"${location.description.replace(/"/g, '""') || ''}",`;
                csvContent += `"${location.accessNotes.replace(/"/g, '""') || ''}"\n`;
            });
            
            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'nova-scotia-gold-favorites.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert('Favorites exported successfully!');
        } catch (e) {
            console.error('Error exporting favorites:', e);
            alert('Error exporting favorites. Please try again.');
        }
    }

    // Function to get directions to a location
    function getDirections(lat, lng, name) {
        // Check if we can use the device's native maps app
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            // For mobile devices, open in native maps app
            const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
            window.open(url, '_blank');
        } else {
            // For desktop, open Google Maps in a new tab
            const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
            window.open(url, '_blank');
        }
    }
    
    // Add user's current location functionality
    const locationButton = document.createElement('button');
    locationButton.innerHTML = '📍 My Location';
    locationButton.className = 'location-button';
    locationButton.onclick = function() {
        // Use high accuracy for better results on mobile
        map.locate({setView: true, maxZoom: 16, enableHighAccuracy: true, timeout: 10000, maximumAge: 0});
    };

    // Create a custom control for the location button
    const locationControl = L.Control.extend({
        options: {
            position: 'topleft'
        },
        onAdd: function() {
            return locationButton;
        }
    });

    // Add the custom control to the map
    map.addControl(new locationControl());

    // Handle location found event
    map.on('locationfound', function(e) {
        const userMarker = L.marker(e.latlng).addTo(map)
            .bindPopup('You are here').openPopup();
            
        // Draw a circle around the user's location to show accuracy
        const accuracyCircle = L.circle(e.latlng, {
            radius: e.accuracy / 2,
            weight: 1,
            color: 'blue',
            fillColor: '#3388ff',
            fillOpacity: 0.15
        }).addTo(map);
    });

    // Handle location error
    map.on('locationerror', function(e) {
        alert("Could not find your location: " + e.message);
    });

    // Add a collapsible legend
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = `
            <div class="legend-container" id="legend-container">
                <div class="legend-header">
                    <h4>Legend</h4>
                    <button class="close-button" id="legend-close-btn">×</button>
                </div>
                <div class="legend-content" id="legend-content">
                    <div><span class="legend-icon abandoned"></span> Abandoned Mine</div>
                    <div><span class="legend-icon active"></span> Active Exploration</div>
                    <div><span class="legend-icon historical"></span> Historical Site</div>
                    <div><span class="legend-icon panning"></span> Panning Location</div>
                    <div><span class="legend-icon quartz-rich"></span> Quartz-Rich Location</div>
                    <div style="margin-top: 5px;"><span style="display: inline-block; width: 20px; height: 20px; background-color: blue; border-radius: 50%; margin-right: 5px;"></span> Your Location</div>
                    <div style="margin-top: 10px; font-size: 0.9em;">Data Source: Nova Scotia Mineral Occurrence Database</div>
                </div>
            </div>
            <button class="show-legend-btn" id="show-legend-btn" style="display: none;">Show Legend</button>
        `;
        return div;
    };
    legend.addTo(map);
    
    // Add legend toggle functionality
    setTimeout(() => {
        const legendCloseBtn = document.getElementById('legend-close-btn');
        const showLegendBtn = document.getElementById('show-legend-btn');
        const legendContainer = document.getElementById('legend-container');
        
        if (legendCloseBtn && showLegendBtn && legendContainer) {
            legendCloseBtn.addEventListener('click', function() {
                legendContainer.style.display = 'none';
                showLegendBtn.style.display = 'block';
            });
            
            showLegendBtn.addEventListener('click', function() {
                legendContainer.style.display = 'block';
                showLegendBtn.style.display = 'none';
            });
        }
    }, 500);
    
    // Add offline status indicator
    const offlineStatus = L.control({position: 'bottomleft'});
    offlineStatus.onAdd = function() {
        const div = L.DomUtil.create('div', 'offline-status');
        div.innerHTML = `
            <div class="offline-indicator">
                <span class="status-dot ${navigator.onLine ? 'online' : 'offline'}"></span>
                ${navigator.onLine ? 'Online' : 'Offline'}
            </div>
        `;
        return div;
    };
    offlineStatus.addTo(map);
    
    // Update offline status when connectivity changes
    window.addEventListener('online', function() {
        const indicator = document.querySelector('.offline-indicator');
        if (indicator) {
            indicator.innerHTML = '<span class="status-dot online"></span> Online';
        }
    });
    
    window.addEventListener('offline', function() {
        const indicator = document.querySelector('.offline-indicator');
        if (indicator) {
            indicator.innerHTML = '<span class="status-dot offline"></span> Offline';
        }
    });
});
