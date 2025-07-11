import DBConnect from "../../../lib/database";
import Product from "../../../model/ProductModel";
import Category from "../../../model/CategoryModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  await DBConnect();
  const { id } = req.query;

  // Get user session
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Giriş yapmalısınız" });
  }

  if (req.method === "GET") {
    try {
      // Check if product belongs to user
      const product = await Product.findOne({
        _id: id,
        userId: session.user.id,
      }).populate("category");
      if (!product) {
        return res
          .status(404)
          .json({ error: "Ürün bulunamadı veya size ait değil." });
      }
      res.status(200).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ürün alınırken hata oluştu." });
    }
  } else if (req.method === "PUT") {
    try {
      // Check if product belongs to user
      const product = await Product.findOne({
        _id: id,
        userId: session.user.id,
      });
      if (!product) {
        return res
          .status(404)
          .json({ error: "Ürün bulunamadı veya size ait değil." });
      }

      // If category is being updated, verify it belongs to user
      if (req.body.category) {
        const category = await Category.findOne({
          _id: req.body.category,
          userId: session.user.id,
        });
        if (!category) {
          return res
            .status(403)
            .json({ error: "Bu kategoriye ürün taşıyamazsınız" });
        }
      }

      const updateData = req.body;
      const updated = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
      }).populate("category");
      res.status(200).json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ürün güncellenirken hata oluştu." });
    }
  } else if (req.method === "DELETE") {
    try {
      // Check if product belongs to user
      const product = await Product.findOne({
        _id: id,
        userId: session.user.id,
      });
      if (!product) {
        return res
          .status(404)
          .json({ error: "Ürün bulunamadı veya size ait değil." });
      }

      const deleted = await Product.findByIdAndDelete(id);
      res.status(200).json({ message: "Ürün silindi." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ürün silinirken hata oluştu." });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
