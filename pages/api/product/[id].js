import DBConnect from "../../../lib/database";
import Product from "../../../model/ProductModel";

export default async function handler(req, res) {
  await DBConnect();
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const product = await Product.findById(id).populate("category");
      if (!product) return res.status(404).json({ error: "Ürün bulunamadı." });
      res.status(200).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ürün alınırken hata oluştu." });
    }
  } else if (req.method === "PUT") {
    try {
      const updateData = req.body;
      const updated = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
      }).populate("category");
      if (!updated) return res.status(404).json({ error: "Ürün bulunamadı." });
      res.status(200).json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ürün güncellenirken hata oluştu." });
    }
  } else if (req.method === "DELETE") {
    try {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Ürün bulunamadı." });
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
