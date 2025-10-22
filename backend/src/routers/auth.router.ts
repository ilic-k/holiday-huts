import { Router } from "express";
import { upload } from "../middlewares/upload";
import { AuthController } from "../controllers/auth.controller";

const authRouter = Router();
const controller = new AuthController();

authRouter.post("/register", upload.single("image"), controller.register);
authRouter.post("/login", controller.login);
authRouter.post("/change-password", controller.changePassword);
authRouter.post("/admin/login", controller.adminLogin);

export default authRouter;
