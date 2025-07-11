import DBConnect from "../../../lib/database";
import User from "../../../model/UserModel";
import { requireOwnershipOrAdmin } from "../../../middleware/auth";

export default async function handler(req, res) {
  await DBConnect();

  const { id } = req.query;

  if (req.method === "GET") {
    // Kendi bilgisine erişiyor veya admin mi kontrol et
    const authResult = await requireOwnershipOrAdmin(req, id);
    if (authResult.error) {
      return res.status(authResult.status).json({ error: authResult.message });
    }

    try {
      const user = await User.findById(
        id,
        "email name role provider createdAt updatedAt"
      );

      if (!user) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı." });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kullanıcı alınırken hata oluştu." });
    }
    return;
  }

  if (req.method === "PUT") {
    // Kendi bilgisine erişiyor veya admin mi kontrol et
    const authResult = await requireOwnershipOrAdmin(req, id);
    if (authResult.error) {
      return res.status(authResult.status).json({ error: authResult.message });
    }

    const { name, email } = req.body;

    try {
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı." });
      }

      // Email güncelleniyorsa, başka kullanıcıda aynı email var mı kontrol et
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: id } });
        if (existingUser) {
          return res
            .status(400)
            .json({ error: "Bu email adresi zaten kullanılıyor." });
        }
        user.email = email;
      }

      if (name !== undefined) {
        user.name = name;
      }

      await user.save();

      res.status(200).json({
        message: "Kullanıcı başarıyla güncellendi.",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kullanıcı güncellenirken hata oluştu." });
    }
    return;
  }

  if (req.method === "DELETE") {
    // Kendi hesabını silmeye çalışıyor veya admin mi kontrol et
    const authResult = await requireOwnershipOrAdmin(req, id);
    if (authResult.error) {
      return res.status(authResult.status).json({ error: authResult.message });
    }

    // Kendi hesabını silmeye çalışıyor mu?
    if (authResult.user.id === id) {
      return res.status(400).json({ error: "Kendi hesabınızı silemezsiniz." });
    }

    try {
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı." });
      }

      await User.findByIdAndDelete(id);

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
