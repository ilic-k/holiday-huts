// routers/user.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { upload } from '../middlewares/upload';

const userRouter = Router();
const controller = new UserController();

userRouter.get('/:username', controller.getProfile);
userRouter.patch('/:username', upload.single('image'), controller.updateProfile);

export default userRouter;
