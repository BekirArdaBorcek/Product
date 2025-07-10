import DBConnect from "../../../lib/database";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Sadece GET isteği desteklenir." });
  }

  try {
    await DBConnect();
    res.status(200).json({
      message: "MongoDB bağlantısı başarılı!",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      error: "MongoDB bağlantı hatası",
      details: error.message,
    });
  }
}
