const Property = require('../models/Property');
const { geocodeAddress } = require('./geocoder');

/**
 * Migration script to geocode properties that do not have coordinates.
 * Runs on server start.
 */
const migratePropertyCoordinates = async () => {
  try {
    // Auto-approve existing legacy properties without the isApproved field
    const legacyApproval = await Property.updateMany(
      { isApproved: { $exists: false } },
      { $set: { isApproved: true } }
    );
    if (legacyApproval.modifiedCount > 0) {
      console.log(`[Migration] ✅ Auto-approved ${legacyApproval.modifiedCount} legacy properties.`);
    }

    const properties = await Property.find({
      $or: [
        { 'coordinates': { $exists: false } },
        { 'coordinates.lat': { $exists: false } },
        { 'coordinates.lng': { $exists: false } },
        { 'coordinates.lat': null },
        { 'coordinates.lng': null }
      ]
    });

    if (properties.length === 0) {
      console.log('✅ All properties have coordinate entries. No geocoding migration needed.');
      return;
    }

    console.log(`ℹ️ Found ${properties.length} properties missing real coordinates. Migrating...`);
    
    for (const prop of properties) {
      console.log(`[Migration] Geocoding "${prop.title}" at location "${prop.location}"...`);
      const coords = await geocodeAddress(prop.location);
      
      if (coords) {
        prop.coordinates = coords;
        await prop.save();
        console.log(`[Migration] ✅ Updated "${prop.title}" with coordinates: ${coords.lat}, ${coords.lng}`);
      } else {
        console.warn(`[Migration] ⚠️ Could not geocode location "${prop.location}" for property "${prop.title}"`);
      }
      
      // Delay to respect Nominatim API usage guidelines (1 req/sec)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✅ Property coordinates migration completed.');
  } catch (error) {
    console.error('❌ Error during property coordinates migration:', error);
  }
};

module.exports = { migratePropertyCoordinates };
