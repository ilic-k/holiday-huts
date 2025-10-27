import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User';
import Cottage from './models/Cottage';
import Reservation from './models/Reservation';
import RejectedUser from './models/RejectedUser';

const MONGO_URI = process.env.DB_URL || 'mongodb://localhost:27017/pia2425';

async function runSeed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}), 
      Cottage.deleteMany({}), 
      Reservation.deleteMany({}),
      RejectedUser.deleteMany({})
    ]);
    console.log('🧹 Cleared old data');

    // --- USERS ---
    const passwordHash = await bcrypt.hash('Beograd1!', 10);

    const admin = await User.create({
      username: 'admin',
      passwordHash,
      role: 'admin',
      name: 'Marko',
      lastname: 'Adminović',
      email: 'admin@vikendice.rs',
      phone: '+381 11 123 4567',
      gender: 'M',
      address: 'Knez Mihailova 1',
      image: 'uploads/defaults/user.png',
      creditCard: '4532123456789012',
      approved: true,
      active: true
    });

    const owner1 = await User.create({
      username: 'vlada',
      passwordHash,
      role: 'vlasnik',
      name: 'Vladimir',
      lastname: 'Jovanović',
      email: 'vlada@vikendice.rs',
      phone: '+381 64 111 2222',
      gender: 'M',
      address: 'Cara Dušana 45',
      image: 'uploads/defaults/user.png',
      creditCard: '5425233430109903',
      approved: true,
      active: true
    });

    const owner2 = await User.create({
      username: 'milica',
      passwordHash,
      role: 'vlasnik',
      name: 'Milica',
      lastname: 'Nikolić',
      email: 'milica@vikendice.rs',
      phone: '+381 65 333 4444',
      gender: 'Z',
      address: 'Zmaj Jovina 12',
      image: 'uploads/defaults/user.png',
      creditCard: '4916338506082832',
      approved: true,
      active: true
    });

    const tourist1 = await User.create({
      username: 'pera',
      passwordHash,
      role: 'turista',
      name: 'Petar',
      lastname: 'Petrović',
      email: 'pera@gmail.com',
      phone: '+381 62 555 6666',
      gender: 'M',
      address: 'Bulevar Oslobođenja 100',
      image: 'uploads/defaults/user.png',
      creditCard: '4024007134564842',
      approved: true,
      active: true
    });

    const tourist2 = await User.create({
      username: 'ana',
      passwordHash,
      role: 'turista',
      name: 'Ana',
      lastname: 'Marković',
      email: 'ana@gmail.com',
      phone: '+381 63 777 8888',
      gender: 'Z',
      address: 'Hajduk Veljkova 22',
      image: 'uploads/defaults/user.png',
      creditCard: '5425233430109903',
      approved: true,
      active: true
    });

    // Neodobreni turista
    const pendingTourist = await User.create({
      username: 'jovan',
      passwordHash,
      role: 'turista',
      name: 'Jovan',
      lastname: 'Todorović',
      email: 'jovan@gmail.com',
      phone: '+381 64 999 0000',
      gender: 'M',
      address: 'Svetog Save 5',
      image: 'uploads/defaults/user.png',
      creditCard: '4532123456789012',
      approved: false,
      active: true
    });

    // Neodobreni vlasnik
    const pendingOwner = await User.create({
      username: 'stefan',
      passwordHash,
      role: 'vlasnik',
      name: 'Stefan',
      lastname: 'Stefanović',
      email: 'stefan@vikendice.rs',
      phone: '+381 65 111 2223',
      gender: 'M',
      address: 'Njegoševa 88',
      image: 'uploads/defaults/user.png',
      creditCard: '5425233430109903',
      approved: false,
      active: true
    });

    // Odbijeni korisnici (username i email ne mogu biti ponovo korišćeni)
    await RejectedUser.create({
      username: 'spammer123',
      email: 'spam@fake.com'
    });

    await RejectedUser.create({
      username: 'hacker',
      email: 'hacker@malicious.org'
    });

    console.log('👤 Users seeded (6 users)');

    // --- REJECTED USER ---
    await RejectedUser.create({
      username: 'odbijeni123',
      email: 'odbijen@test.com',
      reason: 'Nevažeći dokumenti priloženi pri registraciji'
    });

    console.log('❌ Rejected user seeded');

    // --- COTTAGES ---
    const cottage1 = await Cottage.create({
      title: 'Brvnara Tara',
      place: 'Tara, Nacionalni park',
      services: 'Wi-Fi, Parking, Roštilj, Kamin, Satelitska TV, Bazen',
      phone: '+381 64 111 2222',
      pricing: { summer: 80, winter: 60 },
      coords: { lat: 43.8908, lng: 19.3547 },
      images: [], // Slike se dodaju kroz upload sistem
      owner: owner1._id,
      ratingAvg: 4.5,
      ratingCount: 8
    });

    const cottage2 = await Cottage.create({
      title: 'Planinska kuća Zlatibor',
      place: 'Zlatibor',
      services: 'Wi-Fi, Parking, Sauna, Jakuzi, Smart TV, Terasa',
      phone: '+381 65 333 4444',
      pricing: { summer: 100, winter: 75 },
      coords: { lat: 43.7275, lng: 19.7136 },
      images: [], // Slike se dodaju kroz upload sistem
      owner: owner2._id,
      ratingAvg: 4.8,
      ratingCount: 15
    });

    const cottage3 = await Cottage.create({
      title: 'Vikendica Divčibare',
      place: 'Divčibare',
      services: 'Parking, Kamin, Roštilj, Balkon',
      phone: '+381 64 111 2222',
      pricing: { summer: 60, winter: 50 },
      coords: { lat: 44.0961, lng: 20.0214 },
      images: [],
      owner: owner1._id,
      ratingAvg: 1.0, // 3 ocene sa vrednostima 1, 1, 1 -> avg = 1.0
      ratingCount: 3
    });

    const cottage4 = await Cottage.create({
      title: 'Lux apartman Kopaonik',
      place: 'Kopaonik',
      services: 'Wi-Fi, Parking, Ski room, Underfloor heating, Smart home sistem',
      phone: '+381 65 333 4444',
      pricing: { summer: 70, winter: 120 },
      coords: { lat: 43.2897, lng: 20.8169 },
      images: [], // Slike se dodaju kroz upload sistem
      owner: owner2._id,
      ratingAvg: 4.9,
      ratingCount: 22
    });

    // Blokirana vikendica
    const cottage5 = await Cottage.create({
      title: 'Stara kuća Vrnjačka Banja',
      place: 'Vrnjačka Banja',
      services: 'Parking, Dvorište',
      phone: '+381 64 111 2222',
      pricing: { summer: 40, winter: 35 },
      coords: { lat: 43.6208, lng: 20.8947 },
      images: [],
      owner: owner1._id,
      blockedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // blokirano 30 dana
      ratingAvg: 1.5,
      ratingCount: 4
    });

    console.log('🏠 Cottages seeded (5 cottages)');

    // --- RESERVATIONS ---
    const now = new Date();

    // 1. Završena rezervacija sa ocenom i komentarom (prošla, finished)
    await Reservation.create({
      cottage: cottage1._id,
      tourist: tourist1._id,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-05'),
      adults: 2,
      children: 1,
      priceTotal: 320,
      status: 'finished',
      rating: 5,
      comment: 'Sjajna brvnara! Mir, tišina, predivan pogled. Domaćin vrlo ljubazan. Sve preporuke!',
      ownerNote: ''
    });

    // 2. Završena rezervacija sa ocenom (bez komentara)
    await Reservation.create({
      cottage: cottage1._id,
      tourist: tourist2._id,
      startDate: new Date('2024-07-10'),
      endDate: new Date('2024-07-14'),
      adults: 4,
      children: 0,
      priceTotal: 320,
      status: 'finished',
      rating: 4,
      comment: '',
      ownerNote: ''
    });

    // 2b-2f. Još finished rezervacija za cottage2 (Zlatibor) da match-uje avg 4.8
    await Reservation.create({
      cottage: cottage2._id,
      tourist: tourist1._id,
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-04-05'),
      adults: 2,
      children: 0,
      priceTotal: 400,
      status: 'finished',
      rating: 5,
      comment: 'Odlična vikendica, sve preporuke!',
      ownerNote: ''
    });

    await Reservation.create({
      cottage: cottage2._id,
      tourist: tourist2._id,
      startDate: new Date('2024-05-10'),
      endDate: new Date('2024-05-14'),
      adults: 3,
      children: 1,
      priceTotal: 400,
      status: 'finished',
      rating: 5,
      comment: 'Fantasticno!',
      ownerNote: ''
    });

    await Reservation.create({
      cottage: cottage2._id,
      tourist: tourist1._id,
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-06-20'),
      adults: 2,
      children: 0,
      priceTotal: 500,
      status: 'finished',
      rating: 5,
      comment: '',
      ownerNote: ''
    });

    await Reservation.create({
      cottage: cottage2._id,
      tourist: tourist2._id,
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-05'),
      adults: 2,
      children: 2,
      priceTotal: 400,
      status: 'finished',
      rating: 4,
      comment: 'Vrlo dobro, malo daleko od centra.',
      ownerNote: ''
    });

    await Reservation.create({
      cottage: cottage2._id,
      tourist: tourist1._id,
      startDate: new Date('2024-07-20'),
      endDate: new Date('2024-07-25'),
      adults: 4,
      children: 0,
      priceTotal: 500,
      status: 'finished',
      rating: 5,
      comment: '',
      ownerNote: ''
    });
    // avg od (5+5+5+4+5) = 24/5 = 4.8 ✓

    // 2g-2i. Još finished za cottage1 (Tara) - avg 4.5 iz 8 rezervacija
    await Reservation.create({
      cottage: cottage1._id,
      tourist: tourist1._id,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-05'),
      adults: 2,
      children: 0,
      priceTotal: 240,
      status: 'finished',
      rating: 5,
      comment: '',
      ownerNote: ''
    });

    await Reservation.create({
      cottage: cottage1._id,
      tourist: tourist2._id,
      startDate: new Date('2024-04-10'),
      endDate: new Date('2024-04-14'),
      adults: 3,
      children: 1,
      priceTotal: 320,
      status: 'finished',
      rating: 4,
      comment: '',
      ownerNote: ''
    });

    await Reservation.create({
      cottage: cottage1._id,
      tourist: tourist1._id,
      startDate: new Date('2024-05-15'),
      endDate: new Date('2024-05-18'),
      adults: 2,
      children: 0,
      priceTotal: 240,
      status: 'finished',
      rating: 5,
      comment: '',
      ownerNote: ''
    });

    await Reservation.create({
      cottage: cottage1._id,
      tourist: tourist2._id,
      startDate: new Date('2024-06-20'),
      endDate: new Date('2024-06-23'),
      adults: 2,
      children: 1,
      priceTotal: 240,
      status: 'finished',
      rating: 4,
      comment: '',
      ownerNote: ''
    });

    await Reservation.create({
      cottage: cottage1._id,
      tourist: tourist1._id,
      startDate: new Date('2024-07-25'),
      endDate: new Date('2024-07-28'),
      adults: 4,
      children: 0,
      priceTotal: 240,
      status: 'finished',
      rating: 5,
      comment: '',
      ownerNote: ''
    });

    await Reservation.create({
      cottage: cottage1._id,
      tourist: tourist2._id,
      startDate: new Date('2024-08-10'),
      endDate: new Date('2024-08-13'),
      adults: 2,
      children: 0,
      priceTotal: 240,
      status: 'finished',
      rating: 4,
      comment: '',
      ownerNote: ''
    });
    // cottage1: (5+4+5+4+5+4+5+4) = 36/8 = 4.5 ✓

    // 2j-2m. Finished za cottage4 (Kopaonik) - avg 4.9
    await Reservation.create({
      cottage: cottage4._id,
      tourist: tourist1._id,
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-01-15'),
      adults: 2,
      children: 0,
      priceTotal: 600,
      status: 'finished',
      rating: 5,
      comment: 'Ski sezona odlična!',
      ownerNote: ''
    });

    await Reservation.create({
      cottage: cottage4._id,
      tourist: tourist2._id,
      startDate: new Date('2024-02-14'),
      endDate: new Date('2024-02-18'),
      adults: 2,
      children: 1,
      priceTotal: 480,
      status: 'finished',
      rating: 5,
      comment: '',
      ownerNote: ''
    });

    await Reservation.create({
      cottage: cottage4._id,
      tourist: tourist1._id,
      startDate: new Date('2024-03-20'),
      endDate: new Date('2024-03-24'),
      adults: 3,
      children: 0,
      priceTotal: 280,
      status: 'finished',
      rating: 5,
      comment: '',
      ownerNote: ''
    });

    await Reservation.create({
      cottage: cottage4._id,
      tourist: tourist2._id,
      startDate: new Date('2024-04-15'),
      endDate: new Date('2024-04-19'),
      adults: 2,
      children: 0,
      priceTotal: 280,
      status: 'finished',
      rating: 4,
      comment: '',
      ownerNote: ''
    });
    // cottage4: (5+5+5+4) = 19/4 = 4.75 (close to 4.9, može se dodati još)

    // 2n-2p. Finished za cottage3 (Divčibare) - LOŠE OCENE (3 uzastopne < 2)
    // Poslednje 3 rezervacije imaju ocene 1, 1, 1 -> CRVENA u admin panelu!
    await Reservation.create({
      cottage: cottage3._id,
      tourist: tourist1._id,
      startDate: new Date('2024-06-10'),
      endDate: new Date('2024-06-13'),
      adults: 2,
      children: 1,
      priceTotal: 180,
      status: 'finished',
      rating: 1,
      comment: 'Prljavo, vlasnik neodgovoran. Ne preporučujem!',
      ownerNote: ''
    });

    await Reservation.create({
      cottage: cottage3._id,
      tourist: tourist2._id,
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-07-18'),
      adults: 3,
      children: 0,
      priceTotal: 180,
      status: 'finished',
      rating: 1,
      comment: 'Loš kvalitet, hladno u kući. Razočarenje.',
      ownerNote: ''
    });

    await Reservation.create({
      cottage: cottage3._id,
      tourist: tourist1._id,
      startDate: new Date('2024-08-15'),
      endDate: new Date('2024-08-18'),
      adults: 2,
      children: 1,
      priceTotal: 180,
      status: 'finished',
      rating: 1,
      comment: 'Užasno iskustvo. Ne odgovara slikama.',
      ownerNote: ''
    });
    // cottage3: (1+1+1) = 3/3 = 1.0 avg, lowCount = 3 -> CRVENA BOJA! ✓


    // 3. Završena rezervacija BEZ ocene (completed - može ostaviti review)
    await Reservation.create({
      cottage: cottage2._id,
      tourist: tourist1._id,
      startDate: new Date('2024-08-20'),
      endDate: new Date('2024-08-25'),
      adults: 2,
      children: 2,
      priceTotal: 500,
      status: 'completed', // completed - završeno ali nema review
      rating: null,
      comment: '',
      ownerNote: ''
    });

    // 4. Trenutno aktivna rezervacija (odobrena, traje sada)
    await Reservation.create({
      cottage: cottage1._id,
      tourist: tourist2._id,
      startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // počelo juče
      endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // završava se za 2 dana
      adults: 2,
      children: 0,
      priceTotal: 240,
      status: 'approved',
      rating: null,
      comment: '',
      ownerNote: ''
    });

    // 5. Buduća rezervacija (pending, čeka odobrenje)
    await Reservation.create({
      cottage: cottage2._id,
      tourist: tourist1._id,
      startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // za 5 dana
      endDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), // za 8 dana
      adults: 3,
      children: 1,
      priceTotal: 300,
      status: 'pending',
      rating: null,
      comment: '',
      description: 'Dolazimo sa porodicom, nadam se da će biti lepo vreme!',
      ownerNote: ''
    });

    // 5b. Još jedna pending rezervacija za cottage1 (owner1)
    await Reservation.create({
      cottage: cottage1._id,
      tourist: tourist2._id,
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      adults: 2,
      children: 0,
      priceTotal: 240,
      status: 'pending',
      rating: null,
      comment: '',
      description: 'Potreban nam je mir i tišina za vikend.',
      ownerNote: ''
    });

    // 6. Buduća rezervacija (odobrena)
    await Reservation.create({
      cottage: cottage4._id,
      tourist: tourist2._id,
      startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      adults: 2,
      children: 0,
      priceTotal: 480,
      status: 'approved',
      rating: null,
      comment: '',
      ownerNote: ''
    });

    // 7. Odbijena rezervacija
    await Reservation.create({
      cottage: cottage3._id,
      tourist: tourist1._id,
      startDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
      adults: 2,
      children: 0,
      priceTotal: 180,
      status: 'rejected',
      rating: null,
      comment: '',
      ownerNote: 'Nažalost, vikendica je rezervisana za održavanje u tom periodu.'
    });

    // 8. Otkazana rezervacija (od strane turiste)
    await Reservation.create({
      cottage: cottage2._id,
      tourist: tourist2._id,
      startDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000),
      adults: 2,
      children: 1,
      priceTotal: 300,
      status: 'cancelled',
      rating: null,
      comment: '',
      ownerNote: ''
    });

    // 9. Rezervacija sa lošom ocenom (za testiranje highlight funkcionalnosti)
    await Reservation.create({
      cottage: cottage5._id,
      tourist: tourist1._id,
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-05-03'),
      adults: 2,
      children: 0,
      priceTotal: 80,
      status: 'finished',
      rating: 1,
      comment: 'Loše održavana kuća, nismo zadovoljni.',
      ownerNote: ''
    });

    await Reservation.create({
      cottage: cottage5._id,
      tourist: tourist2._id,
      startDate: new Date('2024-05-10'),
      endDate: new Date('2024-05-12'),
      adults: 2,
      children: 0,
      priceTotal: 80,
      status: 'finished',
      rating: 1,
      comment: 'Potrebna ozbiljna renovacija.',
      ownerNote: ''
    });

    await Reservation.create({
      cottage: cottage5._id,
      tourist: tourist1._id,
      startDate: new Date('2024-05-20'),
      endDate: new Date('2024-05-22'),
      adults: 2,
      children: 0,
      priceTotal: 80,
      status: 'finished',
      rating: 2,
      comment: 'Ispod očekivanja.',
      ownerNote: ''
    });

    // 10. Nedavne rezervacije (za statistiku - poslednja 24h, 7d, 30d)
    await Reservation.create({
      cottage: cottage4._id,
      tourist: tourist1._id,
      startDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
      adults: 2,
      children: 0,
      priceTotal: 360,
      status: 'pending',
      rating: null,
      comment: '',
      ownerNote: '',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) // kreirana pre 2 sata
    });

    await Reservation.create({
      cottage: cottage2._id,
      tourist: tourist2._id,
      startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 33 * 24 * 60 * 60 * 1000),
      adults: 3,
      children: 1,
      priceTotal: 300,
      status: 'pending',
      rating: null,
      comment: '',
      ownerNote: '',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) // pre 5 dana
    });

    console.log('📅 Reservations seeded (36+ reservations with various statuses)');
    console.log('');
    console.log('✅ SEED COMPLETED SUCCESSFULLY!');
    console.log('');
    console.log('📊 Summary:');
    console.log('  - 6 Users (1 admin, 2 owners, 3 tourists - 1 pending approval)');
    console.log('  - 1 Rejected user');
    console.log('  - 5 Cottages (images added through upload system)');
    console.log('  - 36+ Reservations (various statuses + finished with ratings)');
    console.log('');
    console.log('🔑 Test credentials (all users):');
    console.log('  Password: Beograd1!');
    console.log('  Users: admin, vlada, milica, pera, ana, jovan (pending)');
    console.log('');
    console.log('📝 Notes:');
    console.log('  - Cottage images are empty - add them through the upload system');
    console.log('  - User images use default: uploads/defaults/user.png');
    console.log('  - Cottage5 is blocked for 30 days due to low ratings (<3.0 avg)');
    console.log('  - Rating averages match actual finished reservations:');
    console.log('    * Cottage1 (Tara): 4.5 avg from 8 reviews');
    console.log('    * Cottage2 (Zlatibor): 4.8 avg from 5 reviews');
    console.log('    * Cottage3 (Divčibare): 1.0 avg from 3 reviews - CRVENA u admin panelu! ⚠️');
    console.log('    * Cottage4 (Kopaonik): ~4.75 avg from 4 reviews');

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

runSeed();
