import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

// Definindo o schema para o modelo de usuário
const projectSchema = new Schema({
  title: {
    type: String,
  },
  dateCreate: {
    type: Date,
    default: Date.now,
  }
});

// Criando o modelo de usuário com base no schema
const Project = model("Project", projectSchema);

export default Project;
