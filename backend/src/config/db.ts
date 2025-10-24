import mongoose from 'mongoose';
export const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pia2425');
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};