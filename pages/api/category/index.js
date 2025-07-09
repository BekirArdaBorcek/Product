import DBConnect from "../../../lib/database";
import Category from "../../../model/CategoryModel";
import Product from "../../../model/ProductModel";

export async function GET(req, res) {
  await DBConnect();
  try {
    const categories = await Category.find();
    // Her kategori için ilgili ürünleri ekle
    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
        const products = await Product.find({ category: category._id });
        return { ...category.toObject(), products };
      })
    );
    res.status(200).json(categoriesWithProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Kategoriler alınırken hata oluştu." });
  }
}

export async function POST(req, res) {
  await DBConnect();
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Kategori oluşturulurken hata oluştu." });
  }
}

export default async function handler(req, res) {
  if (req.method === "GET") return await GET(req, res);
  if (req.method === "POST") return await POST(req, res);
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
