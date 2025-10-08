import { MongoClient } from "mongodb";
let client; let clientPromise;
const uri = process.env.MONGODB_URI;
if (!uri) { throw new Error("Missing MONGODB_URI"); }
export function getDbName(){ return process.env.MONGODB_DB || "dz65"; }
export async function getClient(){
  if (!clientPromise){
    client = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 });
    clientPromise = client.connect();
  }
  return clientPromise;
}
export async function getCollection(){
  const conn = await getClient();
  const db = conn.db(getDbName());
  return db.collection(process.env.MONGODB_COLLECTION || "items");
}
