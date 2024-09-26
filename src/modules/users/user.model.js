import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

// Definindo o schema para o modelo de usuário
const userSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  admin: {
    type: Boolean,
  },
  password: {
    type: String,
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
  passwordHash: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true
  },
});

// Criando o modelo de usuário com base no schema
const User = model("User", userSchema);

export default User;
