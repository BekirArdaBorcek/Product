import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // OAuth kullanıcıları için opsiyonel
    name: { type: String },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    }, // Kullanıcı rolü
    provider: { type: String, default: "credentials" }, // credentials, google, github
    providerId: { type: String }, // OAuth provider'dan gelen ID
  },
  {
    timestamps: true, // createdAt, updatedAt otomatik eklenir
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
