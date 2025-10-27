import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["turista", "vlasnik", "admin"],
      required: true,
    },

    name: { type: String, trim: true },
    lastname: { type: String, trim: true },
    gender: { type: String, enum: ["M", "Z"] }, // opcioni zahtev
    address: { type: String, trim: true },
    phone: { type: String, trim: true },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    image: { type: String, default: "uploads/defaults/user.png" },

    creditCard: { type: String }, // čuvaj maskirano (npr. **** **** **** 1234) ili plain samo za vežbe
    approved: { type: Boolean, default: false }, // admin mora da odobri registraciju
    active: { type: Boolean, default: true }, // deaktivacija korisnika
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
