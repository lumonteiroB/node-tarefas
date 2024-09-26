import { Types } from "mongoose";
const { ObjectId } = Types;
import appointmentModel from "./appointment.model.js";
import userModel from "../users/user.model.js";

export async function getAll(req, res) {
  let idUser = await userModel.findById(req.params.id);
  if (!idUser) {
    return res.status(400).json({ msg: "Nenhum usuário encontrado." });
  }
  
  try {
    const appointmentExists = await appointmentModel
      .find(
        {
          userId: idUser,
        },
        { createdAt: 0 }
      )
      .populate("project", "title");
  
    if (appointmentExists.length === 0) {
      return res.status(400).json({ msg: "Nenhum apontamento cadastrado." });
    }
  
    // Mapeando para substituir `project` pelo `title`
    let appointmentResponse = appointmentExists.map((appointment) => {
      return {
        ...appointment.toObject(),
        project: appointment.project.title,
      };
    });
  
    // Ordenando as datas (você precisa definir `compareDates`)
    appointmentResponse.sort(compareDates);
  
    return res
      .status(200)
      .json({ total: appointmentResponse.length, appointmentResponse });
  } catch (error) {
    return res.status(500).json({ msg: "Erro ao buscar projetos", error });
  }
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
  let userId = await req.user_id;
  if (!userId) {
    res.status(404).json({ msg: "Usuario não valido" });
    return;
  }
  const { description, project, numberHours, dateOperation } = req.body;

  if (!description) {
    return res.status(422).json({ msg: "Descrição inválida" });
  }
  if (!project) {
    return res.status(422).json({ msg: "Projeto inválido" });
  }
  if (!numberHours) {
    return res.status(422).json({ msg: "Quantidade de horas invalida" });
  }
  if (!userId) {
    return res.status(422).json({ msg: "Usuário inválido" });
  }
  if (!dateOperation) {
    return res.status(422).json({ msg: "Data de atuação invalida." });
  }

  let dateFormat = new Date(dateOperation).toISOString();

  const numberHoursExceeded = await appointmentModel.find({
    dateOperation: dateFormat,
    userId: userId,
  });
  let sum = 0;

  for (let i = 0; i < numberHoursExceeded.length; i++) {
    sum += Number(numberHoursExceeded[i].numberHours);
  }
  if (sum > 24) {
    return res.status(422).json({ msg: "Numero de horas excedido." });
  }

  const appointment = new appointmentModel({
    description,
    project,
    numberHours,
    userId,
    dateOperation,
  });

  try {
    await appointment.save();

    return res.status(201).json({ msg: "Apontamento feito com sucesso!" });
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
}

export async function edit(req, res) {
  let appointmentId = await req.params.id;
  if (!ObjectId.isValid(appointmentId)) {
    res.status(404).json({ msg: "ID não é válido" });
    return;
  }
  let userId = await req.user_id;
  if (!userId) {
    res.status(404).json({ msg: "Usuario não valido" });
    return;
  }
  let appointment = await appointmentModel.findById(appointmentId);

  if (!appointment) {
    return res.status(422).json({ msg: "Apontamento inválido." });
  }

  const { description, project, numberHours, dateOperation } = req.body;

  if (!description) {
    return res.status(422).json({ msg: "Descrição inválida" });
  }
  if (!project) {
    return res.status(422).json({ msg: "Projeto inválido" });
  }
  if (!numberHours) {
    return res.status(422).json({ msg: "Quantidade de horas invalida" });
  }
  if (!dateOperation) {
    return res.status(422).json({ msg: "Data de atuação invalida." });
  }

  const numberHoursExceeded = await appointmentModel.find({
    dateOperation: dateOperation,
  });

  let hourDateEdit = appointment.numberHours;

  let sum = 0;

  for (let i = 0; i < numberHoursExceeded.length; i++) {
    sum += Number(numberHoursExceeded[i].numberHours);
  }

  sum = sum - hourDateEdit;

  if (sum + numberHours > 24) {
    return res.status(422).json({ msg: "Numero de horas excedido." });
  }

  try {
    await appointmentModel.updateOne(
      { _id: appointmentId },
      {
        $set: {
          description,
          project,
          numberHours,
          userId,
          dateOperation,
        },
      },
      { upsert: true }
    );
    return res.status(201).json({ msg: "Apontamento editado com sucesso!" });
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
}

export async function remove(req, res) {
  let appointment = await appointmentModel.findById(req.params.id);

  if (!appointment) {
    return res.status(400).json({ msg: "Apontamento invalido" });
  }

  await appointmentModel.deleteOne({ _id: appointment._id });

  return res.status(200).json({ msg: "Projeto removido com sucesso" });
}
