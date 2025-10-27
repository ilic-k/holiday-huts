import { RequestHandler, Request, Response, NextFunction } from "express";
import User from "../models/User";
import RejectedUser from "../models/RejectedUser";
import Cottage from "../models/Cottage";
import Reservation from "../models/Reservation";
import bcrypt from "bcrypt";
import { sanitize } from "../utils/sanitize";
import { detectCardType, PASS_RE } from "../utils/validators";

const add48h = () => new Date(Date.now() + 48 * 60 * 60 * 1000);

export class AdminController {
  // ========== USERS MANAGEMENT ==========
  
  // Lista svih korisnika (vlasnici + turisti + admini)
  getAllUsers: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const users = await User.find({})
        .select("-passwordHash -__v")
        .sort({ createdAt: -1 });
      res.status(200).json({ message: "Success", users });
    } catch (error) {
      next(error);
    }
  };

  // Dodavanje novog korisnika od strane admina (već odobren)
  createUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        username, password, role, name, lastname, gender, 
        address, phone, email, creditCard
      } = req.body;

      if (!username || !email || !password || !role) {
        res.status(400).json({ message: "Nedostaju obavezna polja" });
        return;
      }

      if (!PASS_RE.test(password)) {
        res.status(400).json({ message: "Lozinka nije u ispravnom formatu" });
        return;
      }

      if (creditCard && !detectCardType(String(creditCard).trim())) {
        res.status(400).json({ message: "Broj kreditne kartice nije validan" });
        return;
      }

      // Proveri da li su username ili email odbijeni
      const rejected = await RejectedUser.findOne({
        $or: [{ username }, { email }]
      });
      if (rejected) {
        res.status(400).json({ 
          message: "Korisničko ime ili email su prethodno odbijeni i ne mogu se koristiti" 
        });
        return;
      }

      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        res.status(400).json({ message: "Korisničko ime ili email već postoje" });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        passwordHash,
        role,
        name: sanitize(name),
        lastname: sanitize(lastname),
        gender,
        address: sanitize(address),
        phone: sanitize(phone),
        email,
        creditCard,
        image: "uploads/defaults/user.png",
        approved: true, // admin-created users are auto-approved
        active: true
      });

      const userObj: any = user.toObject();
      delete userObj.passwordHash;

      res.status(201).json({ 
        message: "Korisnik uspešno kreiran", 
        user: userObj 
      });
    } catch (error) {
      next(error);
    }
  };

  // Ažuriranje korisnika
  updateUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const {
        name, lastname, gender, address, phone, email, creditCard, role
      } = req.body;

      const updates: any = {};
      if (name !== undefined) updates.name = sanitize(name);
      if (lastname !== undefined) updates.lastname = sanitize(lastname);
      if (gender !== undefined) updates.gender = gender;
      if (address !== undefined) updates.address = sanitize(address);
      if (phone !== undefined) updates.phone = sanitize(phone);
      if (email !== undefined) updates.email = email;
      if (role !== undefined) updates.role = role;
      
      if (creditCard !== undefined) {
        if (creditCard && !detectCardType(String(creditCard).trim())) {
          res.status(400).json({ message: "Broj kreditne kartice nije validan" });
          return;
        }
        updates.creditCard = creditCard;
      }

      const user = await User.findByIdAndUpdate(id, updates, { new: true })
        .select("-passwordHash -__v");

      if (!user) {
        res.status(404).json({ message: "Korisnik nije pronađen" });
        return;
      }

      res.status(200).json({ message: "Korisnik uspešno ažuriran", user });
    } catch (error) {
      next(error);
    }
  };

  // Brisanje korisnika (full delete)
  deleteUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndDelete(id);
      
      if (!user) {
        res.status(404).json({ message: "Korisnik nije pronađen" });
        return;
      }

      res.status(200).json({ message: "Korisnik uspešno obrisan" });
    } catch (error) {
      next(error);
    }
  };

  // Deaktivacija korisnika (ostaje u bazi ali ne može da se loguje)
  deactivateUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndUpdate(
        id,
        { active: false },
        { new: true }
      ).select("-passwordHash -__v");

      if (!user) {
        res.status(404).json({ message: "Korisnik nije pronađen" });
        return;
      }

      res.status(200).json({ message: "Korisnik uspešno deaktiviran", user });
    } catch (error) {
      next(error);
    }
  };

  // Aktivacija korisnika
  activateUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndUpdate(
        id,
        { active: true },
        { new: true }
      ).select("-passwordHash -__v");

      if (!user) {
        res.status(404).json({ message: "Korisnik nije pronađen" });
        return;
      }

      res.status(200).json({ message: "Korisnik uspešno aktiviran", user });
    } catch (error) {
      next(error);
    }
  };

  // ========== REGISTRATION APPROVAL ==========

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
      const { id } = req.params;
      const user = await User.findByIdAndUpdate(
        id,
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
      const { id } = req.params;
      const user = await User.findById(id);
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
      
      res.status(200).json({ message: "Korisnik uspešno odbijen" });
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
