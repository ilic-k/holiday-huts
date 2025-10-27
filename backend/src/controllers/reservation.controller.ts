import { NextFunction, RequestHandler, Request, Response } from "express";
import Reservation from "../models/Reservation";
import mongoose from "mongoose";
import Cottage from "../models/Cottage";

const SUMMER_MONTHS = [5, 6, 7, 8]; // maj–avgust (1-based)

function calcPrice(
  startISO: string,
  endISO: string,
  pricing: { summer: number; winter: number }
) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  let total = 0;
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const month = d.getMonth() + 1;
    total += SUMMER_MONTHS.includes(month) ? pricing.summer : pricing.winter;
  }
  return total;
}

export class ReservationController {

  create: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { cottageId, touristId, startDate, endDate, adults, children = 0, description = '' } =
        req.body;

      if (!cottageId || !touristId || !startDate || !endDate || !adults) {
        res
          .status(400)
          .json({ message: "Nedostaju obavezna polja za rezervaciju." });
        return;
      }

      if (adults < 1) {
        res.status(400).json({ message: "Mora biti bar jedan odrasli." });
        return;
      }

      // Validacija datuma
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        res
          .status(400)
          .json({ message: "Datum završetka mora biti posle datuma početka." });
        return;
      }

      if (start < new Date()) {
        res
          .status(400)
          .json({ message: "Datum početka ne može biti u prošlosti." });
        return;
      }

      // Provera da li vikendica postoji
      const cottage = await Cottage.findById(cottageId);
      if (!cottage) {
        res.status(404).json({ message: "Vikendica nije pronađena." });
        return;
      }

      // Provera da li je vikendica blokirana
      if (cottage.blockedUntil && cottage.blockedUntil > new Date()) {
        res.status(400).json({
          message: `Vikendica je blokirana do ${cottage.blockedUntil.toLocaleString()}.`,
        });
        return;
      }

      // Provera preklapanja sa postojećim rezervacijama
      const overlappingReservation = await Reservation.findOne({
        cottage: cottageId,
        status: { $in: ["pending", "approved"] }, // Samo aktivne rezervacije
        $or: [
          // Nova rezervacija počinje tokom postojeće
          { startDate: { $lte: start }, endDate: { $gt: start } },
          // Nova rezervacija završava se tokom postojeće
          { startDate: { $lt: end }, endDate: { $gte: end } },
          // Nova rezervacija obuhvata postojeću
          { startDate: { $gte: start }, endDate: { $lte: end } },
        ],
      });

      if (overlappingReservation) {
        res.status(400).json({
          message: "Vikendica je već rezervisana u traženom periodu.",
        });
        return;
      }

      // Validacija description
      if (description && description.length > 500) {
        res.status(400).json({
          message: "Opis dodatnih zahteva ne može biti duži od 500 karaktera.",
        });
        return;
      }

            // izračunaj cenu po danima (leto/zima)
      const priceTotal = calcPrice(startDate, endDate, {
        summer: cottage.pricing?.summer ?? 0,
        winter: cottage.pricing?.winter ?? 0
      });

      const reservation = await Reservation.create({
        cottage: cottageId,
        tourist: touristId,
        startDate: start,
        endDate: end,
        adults,
        children,
        description: description?.trim() || '',
        priceTotal: priceTotal,
        status: "pending",
        comments: "",
        rating: null,
        ownerNote: "",
      });

      res.status(201).json({
        message: "Zahtev za rezervaciju je uspešno kreiran.",
        reservation,
      });
    } catch (err) {
      next(err);
    }
  };

  getMine: RequestHandler = async (req, res, next) => {
    try {
      // Prvo ažuriraj sve approved rezervacije čiji je endDate prošao na 'completed'
      const now = new Date();
      await Reservation.updateMany(
        {
          tourist: req.params.touristId,
          status: 'approved',
          endDate: { $lt: now }
        },
        { $set: { status: 'completed' } }
      );

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

      if (!ownerNote || ownerNote.trim().length === 0) {
        res.status(400).json({ message: "Morate uneti razlog odbijanja." });
        return;
      }

      const reservation = await Reservation.findByIdAndUpdate(
        id,
        { status: "rejected", ownerNote: ownerNote.trim() },
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
leaveReview: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;                  // reservation id
    const { comment, rating } = req.body;

    // 1) Validacije ulaza (granice)
    const rNum = Number(rating);
    if (!Number.isFinite(rNum) || rNum < 1 || rNum > 5) {
      res.status(400).json({ message: 'Ocena mora biti ceo broj 1–5.' });
      return;
    }
    if (comment && String(comment).length > 500) {
      res.status(400).json({ message: 'Komentar je predugačak (max 500 karaktera).' });
      return;
    }

    // 2) Nađi rezervaciju i proveri eligibility
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      res.status(404).json({ message: 'Rezervacija nije pronađena.' });
      return;
    }

    // opcionalno: proveri da review ostavlja vlasnik rezervacije (ako imaš auth)
    // if (String(reservation.tourist) !== req.user.id) { ... }
    if (String(reservation.tourist) !== req.body.touristId) {
      res.status(403).json({ message: 'Nije dozvoljeno ostavljanje ocene za tuđu rezervaciju.' });
      return;
    }

    if (!reservation.endDate) {
      res.status(400).json({ message: 'Rezervacija nema definisan datum završetka.' });
      return;
    }

    const now = new Date();
    const eligible =
      (reservation.status === 'approved' || reservation.status === 'completed' || reservation.status === 'finished') &&
      reservation.endDate < now &&
      (reservation.rating == null || reservation.rating === 0) &&  // još nije ocenjena
      (!reservation.comment || reservation.comment.trim() === '');  // nema komentar ili je prazan

    if (!eligible) {
      res.status(400).json({ message: 'Ocenjivanje nije dozvoljeno za ovu rezervaciju.' });
      return;
    }

    // 3) Upisi review na REZERVACIJU i “zakljuĉaj” je kao finished
    reservation.comment = comment ?? '';
    reservation.rating = rNum;
    reservation.status = 'finished';
    await reservation.save();

    // 4) Re-izračunaj agregate za vikendicu (avg + count) iz svih završenih rezervacija sa ocenom
    const stats = await Reservation.aggregate([
      { $match: { cottage: reservation.cottage, status: 'finished', rating: { $ne: null } } },
      { $group: { _id: '$cottage', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const avg = stats[0]?.avg ?? 0;
    const count = stats[0]?.count ?? 0;

    await Cottage.findByIdAndUpdate(reservation.cottage, {
      ratingAvg: avg,
      ratingCount: count
    });

    res.status(200).json({
      message: 'Komentar i ocena su uspešno dodati.',
      reservation
    });
  } catch (err) {
    next(err);
  }
};


  /** 🔹 Vlasnik vidi sve rezervacije za svoje vikendice */
  getOwnerReservations: RequestHandler = async (req, res, next) => {
    try {
      const { ownerId } = req.params;
      const cottages = await Cottage.find({ owner: ownerId }).select("_id");
      const cottageIds = cottages.map((c) => c._id);
      const reservations = await Reservation.find({
        cottage: { $in: cottageIds },
      })
        .populate("cottage", "title place images")
        .populate("tourist", "username email")
        .sort({ startDate: -1 });
      res
        .status(200)
        .json({ message: "Rezervacije su uspešno učitane.", reservations });
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
        res
          .status(404)
          .json({
            message: "Datumi pocetka i kraja rezervacije nisu definisani",
          });
        return;
      }

      const now = new Date();
      if (now >= reservation.startDate) {
        res
          .status(400)
          .json({ message: "Rezervaciju nije moguće otkazati nakon početka" });
        return;
      }

      // Provera da li je otkazivanje na manje od 24h
      const hoursDifference =
        (reservation.startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursDifference < 24) {
        res
          .status(400)
          .json({
            message:
              "Rezervaciju nije moguće otkazati manje od 24h pre početka",
          });
        return;
      }

      reservation.status = "cancelled";
      await reservation.save();
      res
        .status(200)
        .json({ message: "Rezervacija je uspešno otkazana.", reservation });
    } catch (err) {
      next(err);
    }
  };
}
