import { Request, Response, NextFunction, RequestHandler } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Cottage from '../models/Cottage';
import Reservation from '../models/Reservation';

export class CottageOwnerController {
  // POST /api/cottages  — kreiranje
  create: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ownerId, title, place, services, phone, pricing, coords } = req.body;

      if (!ownerId || !title || !place) {
        res.status(400).json({ message: 'Nedostaju obavezna polja (ownerId, title, place).' }); return;
      }
      if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        res.status(400).json({ message: 'Nevalidan ownerId.' }); return;
      }

      // Kreiraj vikendicu prvo bez slika
      const doc = await Cottage.create({
        owner: ownerId,
        title,
        place,
        services: services ?? '',
        phone: phone ?? '',
        pricing: {
          summer: Number(pricing?.summer ?? 0),
          winter: Number(pricing?.winter ?? 0),
        },
        coords: (coords?.lat != null && coords?.lng != null)
          ? { lat: Number(coords.lat), lng: Number(coords.lng) }
          : undefined,
        images: [],
        ratingAvg: 0,
        ratingCount: 0,
      });

      // Preimenuj folder iz privremenog u stvarni cottageId i ažuriraj putanje
      const images: string[] = [];
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const tempDir = (req as any).tempCottageDir;
        if (tempDir) {
          const oldDir = path.join('uploads', 'cottages', tempDir);
          const newDir = path.join('uploads', 'cottages', doc._id.toString());
          
          // Preimenuj folder
          if (fs.existsSync(oldDir)) {
            fs.renameSync(oldDir, newDir);
            
            // Ažuriraj putanje slika - normalizuj sa /
            req.files.forEach((file: any) => {
              const newPath = file.path.replace(tempDir, doc._id.toString()).replace(/\\/g, '/');
              images.push(newPath);
            });
            
            // Ažuriraj dokument sa slikama
            doc.images = images;
            await doc.save();
          }
        }
      }

      res.status(201).json({ message: 'Vikendica kreirana', data: doc });
    } catch (err) { next(err); }
  };

  // PATCH /api/cottages/:id  — izmena
  update: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: 'Nevalidan ID vikendice.' }); return;
      }

      const allowed = ['title', 'place', 'services', 'phone', 'pricing', 'coords'];
      const update: any = {};
      for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];

      if (update.pricing) {
        update.pricing = {
          summer: Number(update.pricing.summer ?? 0),
          winter: Number(update.pricing.winter ?? 0),
        };
      }
      if (update.coords) {
        const { lat, lng } = update.coords;
        if (lat != null && lng != null) update.coords = { lat: Number(lat), lng: Number(lng) };
        else delete update.coords;
      }

      // Dodaj nove slike ako su uploadovane
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const newImages: string[] = [];
        req.files.forEach((file: any) => {
          // Normalizuj putanju da koristi / umesto \
          const normalizedPath = file.path.replace(/\\/g, '/');
          newImages.push(normalizedPath);
        });
        
        // Preuzmi postojeće slike i dodaj nove
        const cottage = await Cottage.findById(id);
        if (cottage) {
          update.images = [...(cottage.images || []), ...newImages];
        }
      }

      const doc = await Cottage.findByIdAndUpdate(id, update, { new: true });
      if (!doc) { res.status(404).json({ message: 'Vikendica nije pronađena.' }); return; }

      res.status(200).json({ message: 'Vikendica izmenjena', data: doc });
    } catch (err) { next(err); }
  };

  // DELETE /api/cottages/:id  — brisanje (ako nema budućih rezervacija)
  remove: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: 'Nevalidan ID vikendice.' }); return;
      }

      const now = new Date();
      const hasFuture = await Reservation.exists({
        cottage: id,
        status: { $in: ['pending', 'approved'] },
        startDate: { $gte: now },
      });
      if (hasFuture) {
        res.status(400).json({ message: 'Brisanje onemogućeno: postoje buduće rezervacije.' }); return;
      }

      const doc = await Cottage.findByIdAndDelete(id);
      if (!doc) { res.status(404).json({ message: 'Vikendica nije pronađena.' }); return; }

      res.status(200).json({ message: 'Vikendica obrisana', data: { id: doc._id } });
    } catch (err) { next(err); }
  };

  // GET /api/cottages/mine/:ownerId  — sve vikendice vlasnika
  getMine: RequestHandler = async (req, res, next) => {
    try {
      const { ownerId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        res.status(400).json({ message: 'Nevalidan ownerId.' }); return;
      }
      const data = await Cottage.find({ owner: ownerId })
        .sort({ createdAt: -1 })
        .select('title place images pricing ratingAvg ratingCount blockedUntil');
      res.status(200).json({ message: 'OK', data });
    } catch (err) { next(err); }
  };
}
