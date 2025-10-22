import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    cottage: { type: mongoose.Schema.Types.ObjectId, ref: 'Cottage' },
    tourist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    startDate: Date,
    endDate: Date,

    adults: Number,
    children: Number,

    priceTotal: Number,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'finished'],
      default: 'pending'
    },

    comment: String,
    rating: Number,
    ownerNote: String,
  },
  { timestamps: true }
);

export default mongoose.model('Reservation', reservationSchema);
