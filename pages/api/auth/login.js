import DBConnect from "../../../lib/database";
import User from "../../../model/UserModel";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Sadece POST isteği desteklenir." });

  await DBConnect();
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "Kullanıcı bulunamadı." });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Şifre hatalı." });

  res.status(200).json({
    message: "Giriş başarılı.",
    user: { email: user.email, name: user.name },
  });
}
