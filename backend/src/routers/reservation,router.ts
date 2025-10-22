import { Router } from 'express';
import { ReservationController } from '../controllers/reservation.controller';

const reservationRouter = Router();
const controller = new ReservationController();

// 🔹 turista kreira zahtev za rezervaciju
reservationRouter.post('/', controller.create);

// 🔹 turista vidi svoje rezervacije
reservationRouter.get('/mine/:touristId', controller.getMine);

// 🔹 vlasnik vidi rezervacije za svoje vikendice
reservationRouter.get('/owner/:ownerId', controller.getOwnerReservations);

// 🔹 vlasnik odobrava / odbija rezervaciju
reservationRouter.patch('/:id/approve', controller.approveRequest);
reservationRouter.patch('/:id/reject', controller.rejectRequest);

// 🔹 turista otkazuje svoju rezervaciju
reservationRouter.patch('/:id/cancel', controller.cancel);

// 🔹 turista ostavlja komentar i ocenu posle završetka
reservationRouter.patch('/:id/review', controller.leaveReview);

export default reservationRouter;
