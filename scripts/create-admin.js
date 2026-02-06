const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';

async function createAdmin() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    const adminsCollection = db.collection('admins');
    
    // Check if admin already exists
    const existingAdmin = await adminsCollection.findOne({ username: ADMIN_USERNAME });
    if (existingAdmin) {
      console.log(`Admin with username '${ADMIN_USERNAME}' already exists!`);
      return;
    }
    
    // Hash the PIN
    console.log('Hashing PIN...');
    const saltRounds = 12;
    const hashedPin = await bcrypt.hash(ADMIN_PIN, saltRounds);
    
    // Create admin
    console.log('Creating admin...');
    const admin = {
      username: ADMIN_USERNAME,
      pin: hashedPin,
      role: 'admin',
      createdAt: new Date()
    };
    
    const result = await adminsCollection.insertOne(admin);
    console.log(`Admin '${ADMIN_USERNAME}' created successfully with ID: ${result.insertedId}`);
    console.log(`\nLogin credentials:`);
    console.log(`  Username: ${ADMIN_USERNAME}`);
    console.log(`  PIN: ${ADMIN_PIN}`);
    console.log(`\n⚠️  Please keep these credentials secure!`);
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Database connection closed.');
    }
  }
}

// Run the script
createAdmin();
