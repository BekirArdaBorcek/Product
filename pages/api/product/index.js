import DBConnect from "../../../lib/database";
import Product from "../../../model/ProductModel";
import Category from "../../../model/CategoryModel";

export async function GET(req, res) {
  await DBConnect();
  try {
    const products = await Product.find().populate("category");
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ürünler alınırken hata oluştu." });
  }
}

export async function POST(req, res) {
  await DBConnect();
  try {
    const product = new Product(req.body);
    await product.save();
    await product.populate("category");
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ürün oluşturulurken hata oluştu." });
  }
}

export default async function handler(req, res) {
  if (req.method === "GET") return await GET(req, res);
  if (req.method === "POST") return await POST(req, res);
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
