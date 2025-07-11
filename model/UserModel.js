import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    name: { type: String },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    provider: { type: String, default: "credentials" },
    providerId: { type: String },
    isApproved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
