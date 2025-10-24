import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User';
import Cottage from './models/Cottage';
import Reservation from './models/Reservation';

const MONGO_URI = process.env.DB_URL || 'mongodb://localhost:27017/pia2425';

async function runSeed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Promise.all([User.deleteMany({}), Cottage.deleteMany({}), Reservation.deleteMany({})]);
    console.log('🧹 Cleared old data');

    // --- USERS ---
    const passwordHash = await bcrypt.hash('123456A!', 10);

    const admin = await User.create({
      username: 'admin',
      passwordHash,
      role: 'admin',
      name: 'Admin',
      lastname: 'User',
      email: 'admin@mail.com',
      approved: true
    });

    const owner = await User.create({
      username: 'vlada',
      passwordHash,
      role: 'vlasnik',
      name: 'Vladimir',
      lastname: 'Jovanović',
      email: 'vlada@mail.com',
      approved: true
    });

    const tourist = await User.create({
      username: 'pera',
      passwordHash,
      role: 'turista',
      name: 'Petar',
      lastname: 'Petrović',
      email: 'pera@mail.com',
      approved: true
    });

    console.log('👤 Users seeded');

    // --- COTTAGES ---
    const cottage1 = await Cottage.create({
      title: 'Brvnara Tara',
      place: 'Tara',
      owner: owner._id,
      images: [],
      pricing: { summer: 50, winter: 40 },
      ratingAvg: 4.3,
      ratingCount: 12,
    });

    const cottage2 = await Cottage.create({
      title: 'Planinska kuća Zlatibor',
      place: 'Zlatibor',
      owner: owner._id,
      images: [],
      pricing: { summer: 60, winter: 45 },
      ratingAvg: 4.8,
      ratingCount: 21,
    });

    console.log('🏠 Cottages seeded');

    // --- RESERVATIONS ---
    const now = new Date();

    // 1. prošla rezervacija (finished + rating)
    await Reservation.create({
      cottage: cottage1._id,
      tourist: tourist._id,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-05'),
      adults: 2,
      children: 1,
      priceTotal: 4 * 50,
      status: 'finished',
      rating: 5,
      comment: 'Sjajna brvnara, sve preporuke!'
    });

    // 2. aktivna rezervacija (approved, još traje)
    await Reservation.create({
      cottage: cottage1._id,
      tourist: tourist._id,
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
      adults: 2,
      children: 0,
      priceTotal: 3 * 50,
      status: 'approved'
    });

    // 3. nova rezervacija (pending)
    await Reservation.create({
      cottage: cottage2._id,
      tourist: tourist._id,
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8),
      adults: 2,
      children: 0,
      priceTotal: 3 * 60,
      status: 'pending'
    });

    console.log('📅 Reservations seeded');
    console.log('✅ Seed completed successfully');

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

runSeed();
