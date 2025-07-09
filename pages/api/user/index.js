import DBConnect from "../../../lib/database";
import User from "../../../model/UserModel";

export default async function handler(req, res) {
  await DBConnect();

  if (req.method === "GET") {
    try {
      const users = await User.find({}, "email name password");
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kullanıcılar alınırken hata oluştu." });
    }
    return;
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
