import mongoose from 'mongoose';

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI is not set. Articles page will show empty state.');
    return;
  }
  await mongoose.connect(uri, {
    dbName: 'dz64',
  });
  console.log('MongoDB connected');
}
