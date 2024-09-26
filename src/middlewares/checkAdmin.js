import { userModel } from "../modules/users/user.model.js";

export const checkAdmin = async (req, res, next) => {
  const user = await userModel.findById(req.user_id);

  if (user.admin) {
    
    return res.status(401).json({ msg: "Não autorizado" });
  }
};
