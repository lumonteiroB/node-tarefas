import bcrypt from "bcrypt";
import { genSalt, hash } from "bcrypt";
import { Types } from "mongoose";
const { ObjectId } = Types;

import appointmentModel from "../appointments/appointment.model.js";
import userModel from "./user.model.js";

export async function getById(req, res) {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    res.status(404).json({ msg: "ID não é válido" });
    return;
  }

  const user = await userModel.findById(id, { password: 0, __v: 0 });

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  const userAppointments = await userModel.find({ userId: id });

  const userResponse = {
    name: user.name,
    email: user.email,
    appointments: userAppointments,
  };

  return res.status(200).json(userResponse);
}

export async function getAll(req, res) {
  try {
    const users = await userModel.find({}, { passwordHash: 0, __v: 0 });
    let usersResponse = [];

    if (users.length > 0) {
      usersResponse = users;
    }

    return res.status(200).json(usersResponse);
  } catch (error) {
    return res.status(500).json({ msg: "Erro ao buscar usuários", error });
  }
}

export async function getMe(req, res) {
  const user_id = req.user_id;
  if (!ObjectId.isValid(user_id)) {
    res.status(404).json({ msg: "ID não é válido" });
    return;
  }

  const user = await userModel.findById(user_id, { password: 0, __v: 0 });

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  if (!user.active) {
    return res.status(404).json({ msg: "Usuario inativo" });
  }

  const userAppointments = await appointmentModel
    .find({ userId: user_id }, { createdAt: 0 })
    .populate("project", "title");

  userAppointments.sort(compareDates);

  const userResponse = {
    name: user.name,
    email: user.email,
    admin: user.admin,
    id: user._id,
    appointments: userAppointments,
  };

  return res.status(200).json(userResponse);
}

export async function activeInactive(req, res) {
  const user_id = req.params.id;
  if (!ObjectId.isValid(user_id)) {
    res.status(404).json({ msg: "ID não é válido" });
    return;
  }

  const user = await userModel.findById(user_id, { password: 0, __v: 0 });

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  try {
    await userModel.updateOne(
      { _id: user_id },
      { $set: { active: !user.active } },
      { upsert: true }
    );
  } catch {
    return res.status(400).json({ msg: "Erro ao ativar/inativar o usuario." });
  }
  let activeOrInactive = !user.active ? "Ativado" : "Inativado";
  res.status(200).json({ msg: `${activeOrInactive} com sucesso!` });
}

function compareDates(a, b) {
  // Extrair somente a parte da data (ano, mês e dia)
  const dateA = new Date(a.dateOperation).setHours(0, 0, 0, 0);
  const dateB = new Date(b.dateOperation).setHours(0, 0, 0, 0);

  // Comparar as datas
  if (dateA > dateB) return -1;
  if (dateA < dateB) return 1;
  return 0;
}

export async function register(req, res) {
  const { name, email, admin } = req.body;

  // validations
  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigatório!" });
  }

  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }

  const userExists = await userModel.findOne({ email: email });

  if (userExists) {
    return res.status(422).json({ msg: "Por favor, utilize outro e-mail!" });
  }

  let password = generateRandomPassword()

  const salt = await genSalt(12);
  const passwordHash = await hash(password, salt);

  const user = new userModel({
    name,
    email,
    admin,
    passwordHash,
  });

  try {
    await user.save();

    res.status(201).json({ msg: "Usuário criado com sucesso!", senha: `Senha do usuario: ${password}` });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
}

function generateRandomPassword() {
  let password = '';
  for (let i = 0; i < 6; i++) {
    password += Math.floor(Math.random() * 10); // Gera um número aleatório entre 0 e 9 e adiciona à senha
  }
  return password;
}

export async function update(req, res) {
  const user_id = req.user_id;
  if (!ObjectId.isValid(user_id)) {
    res.status(404).json({ msg: "ID não é válido" });
    return;
  }
  const user = await userModel.findById(user_id, { password: 0, __v: 0 });

  if (!user) {
    return res.status(404).json({ msg: "Erro ao encontrar usuário" });
  }

  const { name, email } = req.body;

  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigatório!" });
  }
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }

  try {
    await userModel.updateOne(
      { _id: user_id },
      { $set: { name: name, email: email } },
      { upsert: true }
    );
  } catch {
    return res.status(400).json({ msg: "Erro ao ativar/inativar o usuario."});
  }
  res.status(200).json({ msg: `Editado com sucesso!`,dataUser: {name: name, admin: user.admin} });
}

export async function updatePassword(req, res) {
  const user_id = req.user_id;
  if (!ObjectId.isValid(user_id)) {
    res.status(404).json({ msg: "ID não é válido" });
    return;
  }
  const user = await userModel.findById(user_id, { __v: 0 });

  if (!user) {
    return res.status(404).json({ msg: "Erro ao encontrar usuário" });
  }

  const { currentPassword, newPassword } = req.body;

  const checkPassword = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );

  if (!checkPassword) {
    return res.status(422).json({ msg: "A senha atual está incorreta!" });
  }

  if (!newPassword) {
    return res.status(422).json({ msg: "A nova senha é obrigatória!" });
  }
  
  const salt = await genSalt(12);
  const newPasswordHash = await hash(newPassword, salt);
  try {
    await userModel.updateOne(
      { _id: user_id },
      { $set: { passwordHash: newPasswordHash } },
      { upsert: true }
    );
  } catch {
    return res.status(400).json({ msg: "Erro ao trocar de senha" });
  }
  res.status(200).json({ msg: `Senha redefinida com sucesso!` });
}
