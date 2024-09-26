import { Router } from "express";
import { isAuthenticated } from "../../middlewares/isAuthenticated.js";

import { getAll, register, remove, edit } from "./project.controller.js";

export const projectRoutes = Router();

projectRoutes.get("/", getAll);

projectRoutes.post("/create", isAuthenticated, register);

projectRoutes.put("/edit/:id", isAuthenticated, edit);

projectRoutes.delete("/remove/:id", remove);

