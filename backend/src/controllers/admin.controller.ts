import { RequestHandler, Request, Response, NextFunction } from "express";
import User from "../models/User";
import RejectedUser from "../models/RejectedUser";
import Cottage from "../models/Cottage";
import mongoose from "mongoose";
import Reservation from "../models/Reservation";

const add48h = () => new Date(Date.now() + 48 * 60 * 60 * 1000);

export class AdminController {
  // Lista korisnika koji cekaju odobrenje (approved:false)
  getPendingUsers: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const users = await User.find({ approved: false }).select(
        "username email role image createdAt"
      );
      res.status(200).json({ message: "Success", users });
    } catch (error) {
      next(error);
    }
  };

  approveUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.params;
      const user = await User.findByIdAndUpdate(
        userId,
        { approved: true },
        { new: true }
      ).select("-passwordHash -__v");
      if (!user) {
        res.status(404).json({ message: "Korisnik nije pronađen" });
        return;
      }
      res.status(200).json({ message: "Korisnik uspesno odobren", user });
    } catch (error) {
      next(error);
    }
  };

  rejectUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.params;
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: "Korisnik nije pronađen" });
        return;
      }

      if (user.approved) {
        res
          .status(400)
          .json({ message: "Ne možete odbiti već odobrenog korisnika" });
        return;
      }

      // dodaj ga u rejected kolekciju
      await RejectedUser.create({
        username: user.username,
        email: user.email,
      });

      // sada ga obriši iz glavne kolekcije
      await user.deleteOne();
    } catch (error) {
      next(error);
    }
  };

  blockCottage: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const cottageId = req.params;
      const cottage = await Cottage.findByIdAndUpdate(
        cottageId,
        { blockedUntil: add48h() },
        { new: true }
      );
      if (!cottage) {
        res.status(404).json({ message: "Kućica nije pronađena" });
        return;
      }
      res
        .status(200)
        .json({ message: "Kućica uspešno blokirana na 48h", cottage });
    } catch (error) {
      next(error);
    }
  };

    getLowRatedCottages: RequestHandler = async (req, res, next) => {
        try {
            const pipeline = [
            { $match: { rating: { $ne: null }, status: 'finished' } },
            { $sort: { endDate: -1 } },
            { $group: { _id: '$cottage', last3: { $push: '$rating' } } },
            { $project: {
                last3: { $slice: ['$last3', 3] },
                lowCount: {
                    $size: {
                    $filter: {
                        input: { $slice: ['$last3', 3] },
                        as: 'r',
                        cond: { $lt: ['$$r', 2] }
                    }
                    }
                }
                }
            },
            { $match: { lowCount: 3 } }
            ];

        const agg = await Reservation.aggregate<any>(pipeline as any);

        // dovedi podatke o vikendicama
        const cottageIds = agg.map((a: any) => a._id);
        const cottages = await Cottage.find({ _id: { $in: cottageIds } })
            .select('title place images ratingAvg ratingCount blockedUntil');

        // mapiranje lowCount uz cottage
        const lowMap = new Map(agg.map((a: any) => [String(a._id), a.lowCount]));
        const data = cottages.map(c => ({
            ...c.toObject(),
            lowCount: lowMap.get(String(c._id)) ?? 0
        }));

        res.status(200).json({ message: 'OK', data });
        } catch (e) { next(e); }
    };
}
