import DBConnect from "../../../lib/database";
import User from "../../../model/UserModel";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Sadece POST isteği destekleniyor." });

  await DBConnect();
  const { email, password, name } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email ve şifre zorunlu." });

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ error: "Bu email zaten kayıtlı." });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({
    email,
    password: hashed,
    name,
    provider: "credentials",
    role: "user", // Yeni kullanıcılar varsayılan olarak "user" rolü alır
  });
  await user.save();

  res.status(201).json({
    message: "Kayıt başarılı! Giriş yapabilirsiniz.",
    user: { email: user.email, name: user.name },
  });
}
