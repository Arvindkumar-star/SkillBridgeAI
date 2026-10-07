const mongoose = require('mongoose');
const config = require('./env');

let memoryServer = null;

const connectDB = async () => {
  if (config.USE_MEMORY_DB) {
    return await connectMemoryDB();
  }

  try {
    const maskedUri = config.MONGODB_URI.includes('@')
      ? config.MONGODB_URI.replace(/:([^:@]+)@/, ':****@')
      : config.MONGODB_URI;

    console.log(`Connecting to MongoDB at: ${maskedUri}...`);
    mongoose.set('strictQuery', false);

    await mongoose.connect(config.MONGODB_URI, {
      dbName: 'skill_to_job',
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB Atlas Connected Successfully to database "skill_to_job".');
  } catch (error) {
    console.warn(`Could not connect to MongoDB Atlas (${error.message})`);
    console.log('Falling back to in-memory MongoDB Server for uninterrupted local execution...');
    await connectMemoryDB();
  }
};

const connectMemoryDB = async () => {
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    console.log(`Starting in-memory MongoDB instance at ${uri}...`);
    await mongoose.connect(uri, { dbName: 'skill_to_job' });
    console.log('In-Memory MongoDB Connected Successfully.');
  } catch (memErr) {
    console.error('Failed to initialize in-memory MongoDB server:', memErr);
    throw memErr;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
