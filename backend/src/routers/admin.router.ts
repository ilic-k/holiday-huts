import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const adminRouter = Router();
const controller = new AdminController();

// korisnici
adminRouter.get('/users/pending', controller.getPendingUsers);
adminRouter.patch('/users/:id/approve', controller.approveUser);
adminRouter.delete('/users/:id/reject', controller.rejectUser);

// vikendice
adminRouter.patch('/cottages/:id/block-48h', controller.blockCottage);

// analitika / kontrole kvaliteta
adminRouter.get('/cottages/all', controller.getAllCottages);

export default adminRouter;
