/**
 * Calculates the distance between two coordinates in kilometers.
 * @param {number} lat1 - Latitude of the first point
 * @param {number} lon1 - Longitude of the first point
 * @param {number} lat2 - Latitude of the second point
 * @param {number} lon2 - Longitude of the second point
 * @returns {number} Distance in kilometers
 */

function getHaversineDistance(lat1, lon1, lat2, lon2) {
    const EARTH_RADIUS_KM = 6371; // Average radius of the Earth, as request

    // 1. Convert degrees to radians (the math requires radians)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const rLat1 = lat1 * Math.PI / 180;
    const rLat2 = lat2 * Math.PI / 180;

    // 2. Haversine formula calculation
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(rLat1) * Math.cos(rLat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // 3. Final distance in kilometers
    return EARTH_RADIUS_KM * c;
}

module.exports = {
    getHaversineDistance,
}