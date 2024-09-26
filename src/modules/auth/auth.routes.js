import "dotenv/config"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Router } from "express";
import userModel from "../users/user.model.js";

export const authRoutes = Router();


authRoutes.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }
 
  const user = await userModel.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  const checkPassword = await bcrypt.compare(password, user.passwordHash);

  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha inválida" });
  }

  if( !user.active ) {
    return res.status(422).json({ msg: "Usuário inativo" });
  }  

  try {
    const secret = process.env.SECRET;

    const token = jwt.sign(
      {
        sub: user._id,
      },
      secret
      // {
      //   expiresIn: '24h'
      // }
    );

    res.status(200).json({ msg: "Autenticação realizada com sucesso!", token });
  } catch (error) {
    res.status(500).json({ msg: error.msg });
  }
});