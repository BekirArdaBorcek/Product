import DBConnect from "../../../lib/database";
import User from "../../../model/UserModel";
import Category from "../../../model/CategoryModel";
import Product from "../../../model/ProductModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await DBConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || session.user.role !== "admin") {
    return res.status(401).json({ error: "Admin yetkisi gerekli" });
  }

  try {
    const users = await User.find({}, { password: 0 });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const categoryCount = await Category.countDocuments({
          userId: user._id,
        });
        const productCount = await Product.countDocuments({ userId: user._id });

        return {
          ...user.toObject(),
          categoryCount,
          productCount,
        };
      })
    );

    res.status(200).json(usersWithStats);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Kullanıcı istatistikleri alınırken hata oluştu" });
  }
}
