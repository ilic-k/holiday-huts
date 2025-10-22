import mongoose from 'mongoose';

const cottageSchema = new mongoose.Schema(
  {
    title: String,
    place: String,
    services: String,
    phone: String,

    pricing: {
      summer: Number,
      winter: Number,
    },

    coords: {
      lat: Number,
      lng: Number,
    },

    images: [String],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    blockedUntil: Date,
    ratingAvg: Number,
    ratingCount: Number,
  },
  { timestamps: true }
);

export default mongoose.model('Cottage', cottageSchema);
