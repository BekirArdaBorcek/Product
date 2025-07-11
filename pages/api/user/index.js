import DBConnect from "../../../lib/database";
import User from "../../../model/UserModel";
import { requireAdmin } from "../../../middleware/auth";

export default async function handler(req, res) {
  await DBConnect();

  if (req.method === "GET") {
    // Admin kontrolü
    const authResult = await requireAdmin(req);
    if (authResult.error) {
      return res.status(authResult.status).json({ error: authResult.message });
    }

    try {
      const users = await User.find(
        {},
        "email name role provider createdAt updatedAt"
      );
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kullanıcılar alınırken hata oluştu." });
    }
    return;
  }

  if (req.method === "PUT") {
    // Admin kontrolü
    const authResult = await requireAdmin(req);
    if (authResult.error) {
      return res.status(authResult.status).json({ error: authResult.message });
    }

    const { userId, role } = req.body;

    if (!userId || !role) {
      return res
        .status(400)
        .json({ error: "Kullanıcı ID'si ve rol gereklidir." });
    }

    if (!["user", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Geçersiz rol. Sadece 'user' veya 'admin' olabilir." });
    }

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı." });
      }

      // Kendi rolünü değiştirmeye çalışıyor mu?
      if (authResult.user.id === userId) {
        return res
          .status(400)
          .json({ error: "Kendi rolünüzü değiştiremezsiniz." });
      }

      user.role = role;

      await user.save();

      res.status(200).json({
        message: "Kullanıcı rolü başarıyla güncellendi.",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Rol güncellenirken hata oluştu." });
    }
    return;
  }

  if (req.method === "DELETE") {
    // Admin kontrolü
    const authResult = await requireAdmin(req);
    if (authResult.error) {
      return res.status(authResult.status).json({ error: authResult.message });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Kullanıcı ID'si gereklidir." });
    }

    try {
      // Kendi hesabını silmeye çalışıyor mu?
      if (authResult.user.id === userId) {
        return res
          .status(400)
          .json({ error: "Kendi hesabınızı silemezsiniz." });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı." });
      }

      await User.findByIdAndDelete(userId);

      res.status(200).json({
        message: "Kullanıcı başarıyla silindi.",
        deletedUser: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kullanıcı silinirken hata oluştu." });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
