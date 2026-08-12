import dns from "dns";
import mongoose from "mongoose";

// Node's c-ares resolver fails SRV lookups (querySrv ECONNREFUSED) against
// some ISP/router DNS servers even though the OS resolver handles them fine.
// Point Node at Google's DNS so mongodb+srv:// lookups succeed.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

/**
 * In serverless environments (Vercel, Lambda) the module scope can be
 * reused across invocations, so we cache the connection on the global
 * object to avoid exhausting MongoDB's connection limit on every request.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error(
      "Missing MONGODB_URI. Add it to .env.local — see .env.example."
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
