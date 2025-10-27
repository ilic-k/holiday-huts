// controllers/auth.controller.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';
import User from '../models/User';
import RejectedUser from '../models/RejectedUser';
import { detectCardType, PASS_RE } from '../utils/validators';
import { processProfileImage } from '../middlewares/image'; // proveri putanju
import { sanitize } from '../utils/sanitize';

export class AuthController {
  // Tipizuj kao RequestHandler => povratni tip je void | Promise<void>
  register: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        username, password, role, name, lastname, gender, address, phone, email, creditCard
      } = req.body;

      if (!username || !email || !password) {
        if (req.file?.path) await fs.unlink(req.file.path);
        res.status(400).json({ message: 'Nedostaju obavezna polja' });
        return;
      }

      if (!PASS_RE.test(password)) {
        if (req.file?.path) await fs.unlink(req.file.path);
        res.status(400).json({ message: 'Lozinka nije u ispravnom formatu' });
        return;
      }

      if (!detectCardType(String(creditCard || '').trim())) {
        if (req.file?.path) await fs.unlink(req.file.path);
        res.status(400).json({ message: 'Broj kreditne kartice nije validan' });
        return;
      }

      // Proveri da li su username ili email odbijeni
      const rejected = await RejectedUser.findOne({
        $or: [{ username }, { email }]
      });
      if (rejected) {
        if (req.file?.path) await fs.unlink(req.file.path);
        res.status(400).json({ 
          message: 'Korisničko ime ili email su prethodno odbijeni i ne mogu se koristiti' 
        });
        return;
      }

      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        if (req.file?.path) await fs.unlink(req.file.path);
        res.status(400).json({ message: 'Korisničko ime ili email već postoje' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      let imagePath = 'uploads/defaults/user.png';
      if (req.file?.path) {
        const safeUser = String(username).replace(/[^a-zA-Z0-9_-]/g, '');
        const finalPath = `uploads/users/${safeUser}.png`;
        await processProfileImage(req.file.path, finalPath);
        imagePath = finalPath;
      }

      const user = await User.create({
        username,
        passwordHash, // u šemi neka se zove isto
        role: role || 'turista',
        name,
        lastname,
        gender,
        address,
        phone,
        email,
        creditCard,
        image: imagePath,
        approved: false
      });

      res.status(201).json({
        message: 'Zahtev za registraciju je poslat. Nalog čeka odobrenje administratora.',
      });
    } catch (err) {
      try { if (req.file?.path) await fs.unlink(req.file.path); } catch {}
      next(err);
    }
  }

  login: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ message: 'Nedostaju kredencijali' });
        return;
      }

      const user = await User.findOne({ username });
      if (!user) {
        res.status(401).json({ message: 'Neispravni podaci za prijavu' });
        return;
      }

      if (!user.approved) {
        res.status(403).json({ message: 'Nalog nije odobren od strane administratora' });
        return;
      }

      // Proveri da li je korisnik deaktiviran
      if (!user.active) {
        res.status(403).json({ message: 'Nalog je deaktiviran' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({ message: 'Neispravni podaci za prijavu' });
        return;
      }

      res.status(200).json({ message: 'Uspesno ste se prijavili', user: sanitize(user) });
    } catch (err) {
      next(err);
    }
  };

  changePassword: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        username, oldPassword, newPassword
      } = req.body;

      if (!username || !oldPassword || !newPassword) {
        res.status(400).json({ message: 'Nedostaju podaci' });
        return;
      }

      // Validacija formata nove lozinke
      if (!PASS_RE.test(newPassword)) {
        res.status(400).json({ message: 'Nova lozinka nije u traženom formatu (6-10 karaktera, počinje slovom, sadrži veliko slovo, 3+ mala slova, broj i specijalan karakter)' });
        return;
      }

      const user = await User.findOne({ username });
      if (!user) {
        res.status(404).json({ message: 'Korisnik ne postoji' });
        return;
      }

      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isOldPasswordValid) {
        res.status(401).json({ message: 'Stara lozinka nije ispravna' });
        return;
      }

      const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
      if (isSamePassword) {
        res.status(400).json({ message: 'Nova lozinka mora biti različita od stare' });
        return;
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      user.passwordHash = newPasswordHash;
      await user.save();

      res.status(200).json({ message: 'Lozinka je uspešno promenjena' });
    } catch (err) {
      next(err);
    }
  }; 
  
  adminLogin: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        res.status(400).json({ message: 'Nedostaju kredencijali' });
        return;
      }

      const admin = await User.findOne({ username });
      if (!admin) {
        res.status(401).json({ message: 'Neispravni podaci za prijavu' });
        return;
      }

      if (admin.role !== 'admin') {
        res.status(403).json({ message: 'Nedozvoljen pristup' });
        return;
      }

      if (!admin.approved) {
        res.status(403).json({ message: 'Nalog nije odobren od strane administratora' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({ message: 'Neispravni podaci za prijavu' });
        return;
      }

      res.status(200).json({ message: 'Uspesno ste se prijavili', user: sanitize(admin) });
    } catch (err) {
      next(err);
    }
  };
}
