import { MongoClient } from "mongodb";

// Do not throw at module import time — some tooling or dev workflows import
// modules before .env.local is loaded. Export a function that returns the
// cached client promise or null when MONGODB_URI is not configured.
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

export function getMongoClientPromise(): Promise<MongoClient> | null {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (!globalForMongo._mongoClientPromise) {
    // Create client with default options. Do NOT force TLS or allow invalid certs
    // globally — that can break localhost connections and is insecure.
    const client = new MongoClient(uri);
    globalForMongo._mongoClientPromise = client.connect();
  }
  return globalForMongo._mongoClientPromise;
}

export default getMongoClientPromise;
