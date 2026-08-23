import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  if (!uri) {
    console.warn('MONGODB_URI is not set; starting without a database connection.');
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5_000 });
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
  }
}

export function databaseStatus() {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
}
