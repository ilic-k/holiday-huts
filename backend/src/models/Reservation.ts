import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    cottage: { type: mongoose.Schema.Types.ObjectId, ref: 'Cottage', required: true },
    tourist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0 },

    priceTotal: { type: Number, required: true },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'finished'],
      default: 'pending'
    },

    comment: String,
    rating: Number,
    ownerNote: { type: String, default: '' }
  },
  { timestamps: true }
);

reservationSchema.index({ createdAt: -1 });

export default mongoose.model('Reservation', reservationSchema);
