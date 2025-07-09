import DBConnect from "../../../lib/database";
import Category from "../../../model/CategoryModel";
import Product from "../../../model/ProductModel";

export default async function handler(req, res) {
  await DBConnect();
  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      const deleted = await Category.findByIdAndDelete(id);
      if (!deleted)
        return res.status(404).json({ error: "Kategori bulunamadı." });
      res.status(200).json({ message: "Kategori silindi." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kategori silinirken hata oluştu." });
    }
  } else if (req.method === "GET") {
    try {
      const category = await Category.findById(id);
      if (!category)
        return res.status(404).json({ error: "Kategori bulunamadı." });
      // O kategoriye ait ürünleri getir
      const products = await Product.find({ category: id });
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
      const updateData = req.body;
      const updated = await Category.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!updated)
        return res.status(404).json({ error: "Kategori bulunamadı." });
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
