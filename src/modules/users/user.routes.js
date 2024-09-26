import { Router } from "express";
import { isAuthenticated } from "../../middlewares/isAuthenticated.js";

import { getById, getAll, getMe, register, activeInactive, update, updatePassword} from "./user.controller.js";

export const userRoutes = Router();

userRoutes.get("/me", isAuthenticated, getMe);

userRoutes.get("/all", getAll);

userRoutes.get("/:id", getById);

userRoutes.post("/register", register);

userRoutes.put("/activeInactive/:id",  activeInactive);

userRoutes.put("/update", isAuthenticated, update);

userRoutes.put("/updatePassword", isAuthenticated, updatePassword);


