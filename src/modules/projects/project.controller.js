import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

import appointmentModel from "../appointments/appointment.model.js";
import projectModel from "./project.model.js";

export async function getAll(req, res) {
  try {
    const projects = await projectModel.find({}, { __v: 0 });
    let projectResponse = [];

    if (projects.length > 0) {
      projectResponse = projects;
    }

    return res
      .status(200)
      .json({ total: projectResponse.length, projectResponse });
  } catch (error) {
    return res.status(500).json({ msg: "Erro ao buscar projetos", error });
  }
}

export async function register(req, res) {
  const { title } = req.body;
  console.log(title);

  if (!title) {
    return res.status(422).json({ msg: "Insira um titulo." });
  }

  const titleExists = await projectModel.findOne({ title: title });

  if (titleExists) {
    return res.status(422).json({ msg: "Nome do projeto já existente" });
  }

  const project = new projectModel({
    title,
  });

  try {
    await project.save();

    return res.status(201).json({ msg: "Projeto criado com sucesso!" });
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
}

export async function remove(req, res) {
  let project = await projectModel.findById(req.params.id);

  if (!project) {
    return res.status(400).json({ msg: "Projeto não encontrado" });
  }

  let idProject = project._id;

  await appointmentModel.deleteMany({
    project: { _id: idProject },
  });

  await projectModel.deleteOne({ _id: project.id });

  return res.status(204).json({ msg: "Projeto removido com sucesso!" });
}

export async function edit(req, res) {
  let projectId = await req.params.id;
  if (!ObjectId.isValid(projectId)) {
    res.status(404).json({ msg: "ID não é válido" });
    return;
  }
  let userId = await req.user_id;
  if (!userId) {
    res.status(404).json({ msg: "Usuario não valido" });
    return;
  }

  let project = await projectModel.findById(projectId);

  if (!project) {
    return res.status(422).json({ msg: "Projeto inválido." });
  }

  const { title } = req.body;

  if (!title) {
    return res.status(422).json({ msg: "Nome do projeto inválido" });
  }

  const titleExists = await projectModel.findOne({ title: title });

  if (titleExists) {
    return res.status(422).json({ msg: "Nome do projeto já existente" });
  }

  try {
    await projectModel.updateOne(
      { _id: projectId },
      {
        $set: {
          title,
        },
      },
      { upsert: true }
    );
    return res.status(201).json({ msg: "Apontamento editado com sucesso!" });
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
}
