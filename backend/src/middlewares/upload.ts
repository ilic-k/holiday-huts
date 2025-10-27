import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Generic upload error handler wrapper
export const uploadMiddleware = (uploadFn: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    uploadFn(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Slika je prevelika. Maksimalna veličina je 5MB.' });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message || 'Greška prilikom upload-a slike.' });
      }
      next();
    });
  };
};

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, 'uploads/tmp'),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${Date.now()}${ext}`);
  }
});

export const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const ok = /image\/(png|jpeg|jpg)/.test(file.mimetype);
    if (ok) {
      cb(null, true);
    } else {
      cb(new Error('Dozvoljeni su samo JPG i PNG'));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// Cottage-specific storage with organized folder structure
const cottageStorage = multer.diskStorage({
  destination: (req, __, cb) => {
    // Get cottage ID from params or generate temporary unique ID for new cottages
    const cottageId = req.params.id || `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const dir = `uploads/cottages/${cottageId}`;
    
    // Store temp ID in request for controller to use later
    if (!req.params.id) {
      (req as any).tempCottageDir = cottageId;
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const timestamp = Date.now();
    cb(null, `${timestamp}${ext}`);
  }
});

export const cottageUpload = multer({
  storage: cottageStorage,
  fileFilter: (_, file, cb) => {
    const ok = /image\/(png|jpeg|jpg)/.test(file.mimetype);
    if (ok) {
      cb(null, true);
    } else {
      cb(new Error('Dozvoljeni su samo JPG i PNG'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB za slike vikendica
});
