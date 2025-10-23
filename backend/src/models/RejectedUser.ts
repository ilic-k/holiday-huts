// models/RejectedUser.ts
import mongoose from 'mongoose';

const rejectedSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true }
  },
  { timestamps: true }
);

export default mongoose.model('RejectedUser', rejectedSchema);
