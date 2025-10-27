import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const adminRouter = Router();
const controller = new AdminController();

// ========== REGISTRATION APPROVAL (MORA BITI PRE /users/:id) ==========
// Pending registracije
adminRouter.get('/users/pending', controller.getPendingUsers);
adminRouter.patch('/users/:id/approve', controller.approveUser);
adminRouter.delete('/users/:id/reject', controller.rejectUser);

// ========== USER MANAGEMENT ==========
// Lista svih korisnika
adminRouter.get('/users', controller.getAllUsers);

// CRUD operacije nad korisnicima
adminRouter.post('/users', controller.createUser);
adminRouter.patch('/users/:id', controller.updateUser);
adminRouter.delete('/users/:id', controller.deleteUser);

// Deaktivacija/aktivacija korisnika
adminRouter.patch('/users/:id/deactivate', controller.deactivateUser);
adminRouter.patch('/users/:id/activate', controller.activateUser);

// ========== COTTAGE MANAGEMENT ==========
adminRouter.patch('/cottages/:id/block-48h', controller.blockCottage);
adminRouter.get('/cottages/all', controller.getAllCottages);

export default adminRouter;
