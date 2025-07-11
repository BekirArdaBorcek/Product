import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      max: 1000000,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    image: {
      type: String,
      default: "",
      match: [
        /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))?$/,
        "Geçerli bir görsel URL'si girin",
      ],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "products" }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
