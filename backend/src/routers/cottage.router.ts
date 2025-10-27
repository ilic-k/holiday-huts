import { Router, Request, Response, NextFunction } from 'express';
import { CottageController } from '../controllers/cottage.controller';
import { CottageOwnerController } from '../controllers/cottage.owner.controller';
import { cottageUpload } from '../middlewares/upload';
import multer from 'multer';

const cottageRouter = Router();
const cottageController = new CottageController();
const ownerController = new CottageOwnerController();

// Wrapper for handling multer errors
const uploadMiddleware = (uploadFn: any) => {
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

// PUBLIC
cottageRouter.get('/stats', cottageController.getStats);
cottageRouter.get('/', cottageController.getAll);
cottageRouter.get('/:id/comments', cottageController.getComments);
cottageRouter.get('/:id', cottageController.getOne);

// OWNER
cottageRouter.get('/mine/:ownerId', ownerController.getMine);
cottageRouter.post('/', uploadMiddleware(cottageUpload.array('images', 10)), ownerController.create);
cottageRouter.patch('/:id', uploadMiddleware(cottageUpload.array('images', 10)), ownerController.update);
cottageRouter.delete('/:id', ownerController.remove);

export default cottageRouter;
