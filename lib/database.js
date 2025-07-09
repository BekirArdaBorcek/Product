import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!global._mongoose) {
  global._mongoose = { conn: null, promise: null };
}

async function DBConnect() {
  if (global._mongoose.conn) {
    return global._mongoose.conn;
  }

  if (!global._mongoose.promise) {
    global._mongoose.promise = mongoose.connect(MONGODB_URI);
  }

  try {
    global._mongoose.conn = await global._mongoose.promise;
    return global._mongoose.conn;
  } catch (error) {
    console.error("MongoDB bağlantı hatası:", error);
    throw new Error("MongoDB bağlantısı başarısız oldu");
  }
}

export default DBConnect;
