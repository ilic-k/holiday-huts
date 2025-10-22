import { NextFunction, RequestHandler, Request, Response } from "express";
import Reservation from "../models/Reservation";
import mongoose from "mongoose";
import Cottage from "../models/Cottage";

export class ReservationController {


  create: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { cottageId, touristId, startDate, endDate, adults, children } =
        req.body;

      // validacija da postoji vikendica, korisnik itd.

      const reservation = await Reservation.create({
        cottage: cottageId,
        tourist: touristId,
        startDate,
        endDate,
        adults,
        children,
        priceTotal: 0, // Za sada 0, kasnije izračunati na osnovu cene vikendice i trajanja rezervacije
        status: "pending",
        comments: "",
        rating: null,
        ownerNote: "",
      });

      res
        .status(201)
        .json({
          message: "Zahtev za rezervaciju je uspešno kreiran.",
          reservation,
        });
    } catch (err) {
      next(err);
    }
  };

  getMine: RequestHandler = async (req, res, next) => {
    try {
      const data = await Reservation.find({ tourist: req.params.touristId })
        .sort({ startDate: -1 })
        .populate("cottage", "title place images");
      res.status(200).json({ message: "OK", data });
    } catch (e) {
      next(e);
    }
  };

  // Vlasnik odobrava zahtev za rezervaciju
  approveRequest: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const reservation = await Reservation.findByIdAndUpdate(
        id,
        { status: "approved" },
        { new: true }
      );
      if (!reservation) {
        res.status(404).json({ message: "Rezervacija nije pronađena." });
        return;
      }
      res
        .status(200)
        .json({ message: "Rezervacija je odobrena.", reservation });
    } catch (err) {
      next(err);
    }
  };

  // Vlasnik odbija zahtev za rezervaciju sa komentarom
  rejectRequest: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { ownerNote } = req.body;
      const reservation = await Reservation.findByIdAndUpdate(
        id,
        { status: "rejected", ownerNote: ownerNote },
        { new: true }
      );
      if (!reservation) {
        res.status(404).json({ message: "Rezervacija nije pronađena." });
        return;
      }
      res
        .status(200)
        .json({ message: "Rezervacija je odbijena.", reservation });
    } catch (err) {
      next(err);
    }
  };

  // Turista ostavlja komentar i ocenu nakon završetka rezervacije
  leaveReview: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { comment, rating } = req.body;
      const reservation = await Reservation.findByIdAndUpdate(
        id,
        { comment: comment, rating: rating, status: "finished" },
        { new: true }
      );
      if (!reservation) {
        res.status(404).json({ message: "Rezervacija nije pronađena." });
        return;
      }
      res
        .status(200)
        .json({ message: "Komentar i ocena su uspešno dodati.", reservation });
    } catch (err) {
      next(err);
    }
  };

  /** 🔹 Vlasnik vidi sve rezervacije za svoje vikendice */
  getOwnerReservations: RequestHandler = async (req, res, next) => {
    try {
      const { ownerId } = req.params;
      const cottages = await Cottage.find({ owner: ownerId }).select('_id');
      const cottageIds = cottages.map(c => c._id);
      const reservations = await Reservation.find({ cottage: { $in: cottageIds } })
        .populate('cottage', 'title place images')
        .populate('tourist', 'username email')
        .sort({ startDate: -1 });
      res.status(200).json({ message: "Rezervacije su uspešno učitane.", reservations });
    } catch (e) {
      next(e);
    }
  };

  // Turista otkazuje svoju rezervaciju ukoliko je za dalje od 24h
  cancel: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      const reservation = await Reservation.findById(id);
      
      if (!reservation) {
        res.status(404).json({ message: "Rezervacija nije pronađena." });
        return;
      }

      if (!reservation.startDate || !reservation.endDate) {
        res.status(404).json({ message: "Datumi pocetka i kraja rezervacije nisu definisani" });
        return;
      }

      const now = new Date();
      if (now >= reservation.startDate) {
        res.status(400).json({ message: 'Rezervaciju nije moguće otkazati nakon početka' });
        return;
      }

      // Provera da li je otkazivanje na manje od 24h
      const hoursDifference = (reservation.startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursDifference < 24) {
        res.status(400).json({ message: 'Rezervaciju nije moguće otkazati manje od 24h pre početka' });
        return;
      }

      reservation.status = 'cancelled';
      await reservation.save();
      res.status(200).json({ message: "Rezervacija je uspešno otkazana.", reservation });
    } catch (err) {
      next(err);
    }
  };
}
