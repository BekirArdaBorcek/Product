import DBConnect from "../../../lib/database";
import Category from "../../../model/CategoryModel";
import Product from "../../../model/ProductModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  await DBConnect();
  const { id } = req.query;

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Giriş yapmalısınız" });
  }

  if (req.method === "DELETE") {
    try {
      const category = await Category.findOne({
        _id: id,
        userId: session.user.id,
      });
      if (!category) {
        return res
          .status(404)
          .json({ error: "Kategori bulunamadı veya size ait değil." });
      }

      const deleted = await Category.findByIdAndDelete(id);
      res.status(200).json({ message: "Kategori silindi." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kategori silinirken hata oluştu." });
    }
  } else if (req.method === "GET") {
    try {
      const category = await Category.findOne({
        _id: id,
        userId: session.user.id,
      });
      if (!category) {
        return res
          .status(404)
          .json({ error: "Kategori bulunamadı veya size ait değil." });
      }

      const products = await Product.find({
        category: id,
        userId: session.user.id,
      });
      res.status(200).json({
        ...category.toObject(),
        products,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kategori alınırken hata oluştu." });
    }
  } else if (req.method === "PUT") {
    try {
      const category = await Category.findOne({
        _id: id,
        userId: session.user.id,
      });
      if (!category) {
        return res
          .status(404)
          .json({ error: "Kategori bulunamadı veya size ait değil." });
      }

      const updateData = req.body;
      const updated = await Category.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      res.status(200).json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kategori güncellenirken hata oluştu." });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
