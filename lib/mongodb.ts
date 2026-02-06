// lib/mongodb.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGO_URI || "";

if (!MONGODB_URI) {
  throw new Error("Please add your MongoDB connection string to .env");
}

/**
 * Caching the connection in global (for Next.js hot reload in dev)
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "patients", // optional but good practice
        bufferCommands: false,
      })
      .then((mongoose) => {
        console.log("✅ MongoDB connected");
        return mongoose;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
