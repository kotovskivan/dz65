import { MongoClient } from 'mongodb';

let client;
let db;

export async function connectDB(uri, dbName) {
  if (db) return db;
  client = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 10000 });
  await client.connect();
  db = client.db(dbName);
  console.log('MongoDB connected:', dbName);
  return db;
}

export function getDB() {
  if (!db) throw new Error('DB not initialized');
  return db;
}

export async function closeDB() {
  if (client) await client.close();
  db = null;
  client = null;
}