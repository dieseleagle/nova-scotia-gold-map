# Nova Scotia Gold Mining Interactive Map

An interactive web application that displays historical and active gold mining locations in Nova Scotia to help with gold panning activities.

## Features

- Interactive map showing gold mining locations throughout Nova Scotia
- Detailed information about each location including:
  - Discovery history
  - Production years
  - Total gold production
  - Access notes for panning
- Filtering options by:
  - Status (active/historical)
  - Size (large/medium/small)
- Search functionality
- User location tracking
- Mobile-responsive design

## Data Source

This application uses data from the Nova Scotia Mineral Occurrence Database, provided by the Nova Scotia Department of Natural Resources and Renewables under the Nova Scotia Open Government License.

- Data source: [Nova Scotia Mineral Occurrence Database](https://novascotia.ca/natr/meb/download/dp002.asp)
- License: [Nova Scotia Open Government License](https://novascotia.ca/opendata/licence.asp)

## Current Implementation

The current version uses sample data based on known gold districts in Nova Scotia. For a production version, the application should be updated to use the actual data from the Nova Scotia Mineral Occurrence Database.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- [Leaflet.js](https://leafletjs.com/) - Open-source JavaScript library for interactive maps
- [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) - Plugin for clustering markers

## How to Use

1. Open `index.html` in a web browser
2. Browse the map to find gold mining locations
3. Click on markers to view detailed information
4. Use filters to narrow down locations by status or size
5. Use the search function to find specific locations
6. Click "My Location" to see your current position relative to mining sites

## Future Enhancements

- Integration with the actual Nova Scotia Mineral Occurrence Database
- Offline capability for use in remote areas
- Directions to accessible panning locations
- User notes and favorites
- Additional geological information
- Historical photos and documentation

## License

This project is open source and available under the MIT License.
