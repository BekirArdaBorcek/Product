import { getToken } from "next-auth/jwt";
import DBConnect from "../../../lib/database";
import User from "../../../model/UserModel";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Environment kontrolü
    if (!process.env.NEXTAUTH_SECRET) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Token almayı dene
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        details: "No valid session token found",
      });
    }

    // Database'den user bilgilerini al
    await DBConnect();
    const user = await User.findById(token.id, "-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
      provider: user.provider,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
