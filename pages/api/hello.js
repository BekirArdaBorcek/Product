// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import DBConnect from "../../lib/database";

export default async function handler(req, res) {
  await DBConnect();
  res.status(200).json({ name: "John Doe" });
}
