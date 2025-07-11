import DBConnect from "../../../lib/database";
import Product from "../../../model/ProductModel";
import Category from "../../../model/CategoryModel";
import User from "../../../model/UserModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export async function GET(req, res) {
  await DBConnect();

  // Get user session
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Giriş yapmalısınız" });
  }

  try {
    // Only get products for the current user
    const products = await Product.find({ userId: session.user.id }).populate(
      "category"
    );
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ürünler alınırken hata oluştu." });
  }
}

export async function POST(req, res) {
  await DBConnect();

  // Get user session
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Giriş yapmalısınız" });
  }

  try {
    // Verify that the category belongs to the user
    const category = await Category.findOne({
      _id: req.body.category,
      userId: session.user.id,
    });

    if (!category) {
      return res
        .status(403)
        .json({ error: "Bu kategoriye ürün ekleyemezsiniz" });
    }

    // Add userId to product data
    const productData = {
      ...req.body,
      userId: session.user.id,
    };

    const product = new Product(productData);
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
