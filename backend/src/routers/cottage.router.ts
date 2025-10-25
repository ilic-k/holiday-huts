import { Router } from 'express';
import { CottageController } from '../controllers/cottage.controller';
import { CottageOwnerController } from '../controllers/cottage.owner.controller';

const cottageRouter = Router();
const cottageController = new CottageController();
const ownerController = new CottageOwnerController

// PUBLIC
cottageRouter.get('/stats', cottageController.getStats);
cottageRouter.get('/', cottageController.getAll);
cottageRouter.get('/:id/comments', cottageController.getComments);
cottageRouter.get('/:id', cottageController.getOne);

// OWNER
cottageRouter.get('/mine/:ownerId', ownerController.getMine);
cottageRouter.post('/', ownerController.create);
cottageRouter.patch('/:id', ownerController.update);
cottageRouter.delete('/:id', ownerController.remove);

export default cottageRouter;
