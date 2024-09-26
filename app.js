// imports
import "dotenv/config"
import express, { json } from "express";
import { connect } from "mongoose";

import cors from "cors";

import { userRoutes }  from "./src/modules/users/user.routes.js";
import { projectRoutes }  from "./src/modules/projects/project.routes.js";
import { authRoutes } from "./src/modules/auth/auth.routes.js";
import { appointmentRoutes } from "./src/modules/appointments/appointment.routes.js";

const app = express();

app.use(json());
app.use(cors());

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

app.get("/", (req, res) => {
  res.status(200).json({ msg: "alo" });
});

connect(
    `mongodb+srv://${dbUser}:${dbPass}@projeto-tarefas.ynildyf.mongodb.net/?retryWrites=true&w=majority&appName=projeto-tarefas`
  )
  .then(() => {
    app.listen(3000);
    console.log("Conectou ao banco!");
  })
  .catch((err) => console.log(err));

app.use("/user", userRoutes);
app.use("/project", projectRoutes);
app.use("/auth", authRoutes)
app.use("/appointment", appointmentRoutes)
