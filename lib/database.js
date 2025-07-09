import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!global._mongoose) {
  global._mongoose = { conn: null, promise: null };
}

async function DBConnect() {
  if (global._mongoose.conn) {
    console.log("[MongoDB] Var olan bağlantı kullanıldı.");
    return global._mongoose.conn;
  }
  if (!global._mongoose.promise) {
    global._mongoose.promise = (async () => {
      try {
        const mongooseInstance = await mongoose.connect(MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log("[MongoDB] Yeni bağlantı kuruldu.");
        return mongooseInstance;
      } catch (error) {
        console.error("MongoDB bağlantı hatası:", error);
        throw new Error("MongoDB bağlantısı başarısız oldu");
      }
    })();
  }
  global._mongoose.conn = await global._mongoose.promise;
  return global._mongoose.conn;
}

export default DBConnect;
