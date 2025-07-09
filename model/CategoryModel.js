import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      match: [/^[a-zA-ZğüşöçıİĞÜŞÖÇ\s]+$/, "Sadece harf ve boşluk olmalı"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    image: {
      type: String,
      default: "",
      match: [
        /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))?$/,
        "Geçerli bir görsel URL'si girin",
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "categories" }
);

export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);
