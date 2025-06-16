// User Contributions - Nova Scotia Gold Map
// Allows users to add their own gold panning locations to the map

// Initialize user contributions from localStorage or create empty array
let userContributions = [];

// Load user contributions from localStorage if available
function loadUserContributions() {
    const savedContributions = localStorage.getItem('userGoldLocations');
    if (savedContributions) {
        try {
            userContributions = JSON.parse(savedContributions);
            console.log(`Loaded ${userContributions.length} user contributions`);
        } catch (e) {
            console.error('Error loading user contributions:', e);
            userContributions = [];
        }
    }
}

// Save user contributions to localStorage
function saveUserContributions() {
    localStorage.setItem('userGoldLocations', JSON.stringify(userContributions));
}

// Add a new user contribution
function addUserContribution(location) {
    // Generate a unique ID for the new location (user IDs start at 1000)
    const newId = 1000 + userContributions.length;
    
    // Add required fields if missing
    const newLocation = {
        id: newId,
        type: location.type || 'recreational',
        status: location.status || 'user-submitted',
        size: location.size || 'small',
        discoveryYear: location.discoveryYear || new Date().getFullYear(),
        discoverer: location.discoverer || 'Anonymous',
        productionYears: location.productionYears || 'Recreational only',
        totalProduction: location.totalProduction || 'Unknown',
        mineHazards: location.mineHazards || 'None reported',
        ...location
    };
    
    // Add to user contributions
    userContributions.push(newLocation);
    
    // Save to localStorage
    saveUserContributions();
    
    return newLocation;
}

// Delete a user contribution by ID
function deleteUserContribution(id) {
    const initialLength = userContributions.length;
    userContributions = userContributions.filter(loc => loc.id !== id);
    
    if (userContributions.length < initialLength) {
        saveUserContributions();
        return true;
    }
    return false;
}

// Get all user contributions
function getUserContributions() {
    return userContributions;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadUserContributions();
});
