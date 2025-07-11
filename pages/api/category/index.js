import DBConnect from "../../../lib/database";
import Category from "../../../model/CategoryModel";
import Product from "../../../model/ProductModel";
import User from "../../../model/UserModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export async function GET(req, res) {
  await DBConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Giriş yapmalısınız" });
  }

  try {
    const categories = await Category.find({ userId: session.user.id });
    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
        const products = await Product.find({
          category: category._id,
          userId: session.user.id,
        });
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

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Giriş yapmalısınız" });
  }

  try {
    const categoryData = {
      ...req.body,
      userId: session.user.id,
    };

    const category = new Category(categoryData);
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
