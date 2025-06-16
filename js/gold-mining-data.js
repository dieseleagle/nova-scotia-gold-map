// Comprehensive Nova Scotia Gold Mining Data
// Combined dataset of all gold mining locations in Nova Scotia
// Focusing on historical, abandoned, and active gold mining sites

// Import individual data parts
document.write('<script src="js/gold-mining-data-part1.js"></script>');
document.write('<script src="js/gold-mining-data-part2.js"></script>');
document.write('<script src="js/gold-mining-data-part3.js"></script>');
document.write('<script src="js/gold-mining-data-part4.js"></script>');
document.write('<script src="js/gold-panning-locations.js"></script>');
document.write('<script src="js/additional-gold-panning-locations.js"></script>');

// Combine all data parts into a single array
const allGoldLocations = [
    ...goldMiningDataPart1,
    ...goldMiningDataPart2,
    ...goldMiningDataPart3,
    ...goldMiningDataPart4,
    ...goldPanningLocations,
    ...additionalGoldPanningLocations
];
