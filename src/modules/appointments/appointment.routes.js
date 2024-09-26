import { Router } from "express";
import { isAuthenticated } from "../../middlewares/isAuthenticated.js";

import { getAll, register, remove, edit } from "./appointment.controller.js";

export const appointmentRoutes = Router();

appointmentRoutes.get("/:id", getAll);

appointmentRoutes.post("/create", isAuthenticated, register);

appointmentRoutes.delete("/remove/:id", remove);

appointmentRoutes.put("/edit/:id", isAuthenticated, edit);
