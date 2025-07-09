import DBConnect from "../../../lib/database";
import User from "../../../model/UserModel";

export default async function handler(req, res) {
  await DBConnect();
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const user = await User.findById(id, "email name password");
      if (!user)
        return res.status(404).json({ error: "Kullanıcı bulunamadı." });
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kullanıcı alınırken hata oluştu." });
    }
    return;
  }

  if (req.method === "DELETE") {
    try {
      const deleted = await User.findByIdAndDelete(id);
      if (!deleted)
        return res.status(404).json({ error: "Kullanıcı bulunamadı." });
      res.status(200).json({ message: "Kullanıcı silindi." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kullanıcı silinirken hata oluştu." });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
