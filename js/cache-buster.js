// Cache buster to ensure latest data is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cache buster running...');
    
    // Add timestamp to localStorage to force reload of data
    const lastUpdate = new Date().toISOString();
    localStorage.setItem('mapDataLastUpdate', lastUpdate);
    
    // Clear any cached data
    localStorage.removeItem('novaScotiaGoldData');
    
    console.log('Cache cleared. Data will be freshly loaded.');
});
