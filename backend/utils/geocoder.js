/**
 * Geocodes a text location string into latitude and longitude coordinates.
 * Uses the OpenStreetMap Nominatim API.
 * 
 * @param {string} location - The address/location to geocode (e.g. 'Galle')
 * @returns {Promise<{lat: number, lng: number}|null>} The coordinates or null if geocoding failed
 */
const geocodeAddress = async (location) => {
  if (!location || typeof location !== 'string' || !location.trim()) {
    return null;
  }
  
  try {
    const query = encodeURIComponent(location.trim());
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=lk`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LuxestateApp/1.0 (contact@luxestate.com)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Nominatim HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (error) {
    console.error(`[Geocoder] Failed to geocode location "${location}":`, error.message);
  }
  return null;
};

module.exports = { geocodeAddress };
