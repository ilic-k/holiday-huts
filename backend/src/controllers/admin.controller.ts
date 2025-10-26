import { RequestHandler, Request, Response, NextFunction } from "express";
import User from "../models/User";
import RejectedUser from "../models/RejectedUser";
import Cottage from "../models/Cottage";
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
      const { id } = req.params;
      const cottage = await Cottage.findByIdAndUpdate(
        id,
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

    getAllCottages: RequestHandler = async (req, res, next) => {
        try {
            // Agregacija za vikendice sa poslednje 3 ocene
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
            }
            ];

        const agg = await Reservation.aggregate<any>(pipeline as any);

        // Dovedi SVE vikendice
        const allCottages = await Cottage.find({})
            .select('title place images ratingAvg ratingCount blockedUntil owner')
            .populate('owner', 'username email');

        // Mapiranje lowCount za vikendice sa ocenama
        const lowMap = new Map(agg.map((a: any) => [String(a._id), a.lowCount]));
        
        // Dodaj flag shouldHighlight za svaku vikendicu
        const data = allCottages.map(c => ({
            ...c.toObject(),
            lowCount: lowMap.get(String(c._id)) ?? 0,
            isLowRated: (lowMap.get(String(c._id)) ?? 0) === 3, // flag za crvenu boju
            isBlocked: c.blockedUntil && c.blockedUntil > new Date()
        }));

        res.status(200).json({ message: 'OK', data });
        } catch (e) { next(e); }
    };
}
