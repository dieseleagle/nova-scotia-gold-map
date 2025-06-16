// Comprehensive Nova Scotia Gold Mining Data
// Combined dataset of all gold mining locations in Nova Scotia
// Focusing on historical, abandoned, and active gold mining sites

// Import individual data parts
document.write('<script src="js/gold-mining-data-part1.js"></script>');
document.write('<script src="js/gold-mining-data-part2.js"></script>');
document.write('<script src="js/gold-mining-data-part3.js"></script>');
document.write('<script src="js/gold-mining-data-part4.js"></script>');

// Combine all data parts into a single array
const allGoldLocations = [
    ...goldMiningData1,
    ...goldMiningData2,
    ...goldMiningData3,
    ...goldMiningData4
];
