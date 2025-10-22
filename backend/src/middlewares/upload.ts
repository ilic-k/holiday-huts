import multer from 'multer';
import path from 'path';

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
