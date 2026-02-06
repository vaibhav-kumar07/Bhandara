import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI

let client: MongoClient
let db: Db

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db
  }
  if (!uri) {
    throw new Error('MONGODB_URI is not set')
  }
  try {
    client = new MongoClient(uri)
    await client.connect()
    db = client.db()
    console.log('Connected to MongoDB')
    return db
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase() first.')
  }
  return db
}
