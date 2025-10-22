import { Router } from 'express';
import { CottageController } from '../controllers/cottage.controller';

const cottageRouter = Router();
const controller = new CottageController();

cottageRouter.get('/', controller.getAll);
cottageRouter.get('/:id', controller.getOne);

// ToDo
// cottageRouter.post('/', controller.create);
// cottageRouter.get('/mine', controller.getMine);

export default cottageRouter;
