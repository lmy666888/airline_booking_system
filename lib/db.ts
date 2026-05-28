import mongoose from "mongoose";

//cache the connection
const g = globalThis as typeof globalThis &
{
  _mongoConn?: typeof mongoose | null;
  _mongoPromise?: Promise<typeof mongoose> | null;
};

if (!g._mongoConn) g._mongoConn = null;

if (!g._mongoPromise) g._mongoPromise = null;

export async function connectDB()
{
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (g._mongoConn) return g._mongoConn;
  if (!g._mongoPromise) {
    g._mongoPromise = mongoose.connect(uri, { bufferCommands: false });
  }
  g._mongoConn = await g._mongoPromise;
  return g._mongoConn;
}
