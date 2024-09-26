import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

// Definindo o schema para o modelo de usuário
const appointmentSchema = new Schema({
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  numberHours: {
    type: String,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
  },
  dateOperation: {
    type: Date,
    required: true
  },
});

// Criando o modelo de usuário com base no schema
const Appointment = model("Appointment", appointmentSchema);

export default Appointment;
