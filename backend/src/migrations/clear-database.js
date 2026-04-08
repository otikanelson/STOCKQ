/**
 * Database cleanup script - clears all collections except keeps the schema
 * Run with: node src/migrations/clear-database.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const COLLECTIONS_TO_CLEAR = [
  'users',
  'stores', 
  'products',
  'sales',
  'globalproducts',
  'categories',
  'alertsettings',
  'notifications',
  'predictions',
];

async function clearDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to:', mongoose.connection.host);
    console.log('📦 Database:', mongoose.connection.name);
    console.log('');

    for (const collection of COLLECTIONS_TO_CLEAR) {
      try {
        const result = await mongoose.connection.db.collection(collection).deleteMany({});
        console.log(`🗑️  Cleared '${collection}': ${result.deletedCount} documents removed`);
      } catch (err) {
        console.log(`⚠️  Skipped '${collection}': ${err.message}`);
      }
    }

    console.log('');
    console.log('✅ Database cleared successfully. Ready for fresh setup.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
}

clearDatabase();
