import DBConnect from "../../../lib/database";
import User from "../../../model/UserModel";
import { requireAdmin } from "../../../middleware/auth";

export default async function handler(req, res) {
  await DBConnect();

  if (req.method === "GET") {
    const authResult = await requireAdmin(req);
    if (authResult.error) {
      return res.status(authResult.status).json({ error: authResult.message });
    }

    try {
      const users = await User.find(
        {},
        "email name role provider isApproved createdAt updatedAt"
      );
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kullanıcılar alınırken hata oluştu." });
    }
    return;
  }

  if (req.method === "PUT") {
    const authResult = await requireAdmin(req);
    if (authResult.error) {
      return res.status(authResult.status).json({ error: authResult.message });
    }

    const { userId, role, isApproved } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Kullanıcı ID'si gereklidir." });
    }

    if (role && !["user", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Geçersiz rol. Sadece 'user' veya 'admin' olabilir." });
    }

    if (isApproved !== undefined && typeof isApproved !== "boolean") {
      return res
        .status(400)
        .json({ error: "Onay durumu boolean değer olmalıdır." });
    }

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı." });
      }

      if (authResult.user.id === userId) {
        return res
          .status(400)
          .json({ error: "Kendi rolünüzü değiştiremezsiniz." });
      }

      if (role) {
        user.role = role;
      }

      if (isApproved !== undefined) {
        user.isApproved = isApproved;
      }

      await user.save();

      res.status(200).json({
        message: "Kullanıcı bilgileri başarıyla güncellendi.",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isApproved: user.isApproved,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Rol güncellenirken hata oluştu." });
    }
    return;
  }

  if (req.method === "DELETE") {
    const authResult = await requireAdmin(req);
    if (authResult.error) {
      return res.status(authResult.status).json({ error: authResult.message });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Kullanıcı ID'si gereklidir." });
    }

    try {
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
