import { NextFunction, RequestHandler, Request, Response } from "express";
import User from "../models/User";
import { sanitize } from "../utils/sanitize";
import { processProfileImage } from "../middlewares/image";
import path from "path";

export class UserController {

    getProfile: RequestHandler = async (req: Request, res: Response, next: NextFunction)=> {
        try {
            const { username } = req.params;

            const user = await User.findOne({ username });
            if (!user) {
                res.status(404).json({ message: 'Korisnik ne postoji' });
                return;
            }

            res.status(200).json({message: "Profil korisnika uspesno dobijen", user: sanitize(user) });
        } catch (err) {
            next(err);
        }
    };

  updateProfile: RequestHandler = async (req, res, next) => {
    try {
      const { username } = req.params;

      const user = await User.findOne({ username });
      if (!user) {
        res.status(404).json({ message: 'Korisnik nije pronađen' });
        return;
      }

      // Ažuriraj polja ako su prisutna u zahtevu
      if (req.body.name) { user.name = req.body.name; }
      if (req.body.lastname) user.lastname = req.body.lastname;
      if (req.body.address) user.address = req.body.address;
      if (req.body.phone) user.phone = req.body.phone;
      if (req.body.email) user.email = req.body.email;
      if (req.body.creditCard) user.creditCard = req.body.creditCard;

      // Ako postoji nova profilna slika
      if (req.file?.path) {
        const safeUser = String(username).replace(/[^a-zA-Z0-9_-]/g, '');
        const final = path.join('uploads', 'users', `${safeUser}.png`);
        await processProfileImage(req.file.path, final);
        user.image = final;
      }

      await user.save();

      res.status(200).json({
        message: 'Profil uspešno ažuriran',
        user: sanitize(user)
      });
    } catch (err) {
      next(err);
    }
  };
}