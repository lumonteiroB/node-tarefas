import "dotenv/config"

import jwt from 'jsonwebtoken';

export const isAuthenticated = (req, res, next) => {
  const authToken = req.headers.authorization;

  if (!authToken) return res.status(401).json({ msg: 'Não autorizado' });

  const [bearer, token] = authToken.split(' ');

  if (bearer !== 'Bearer') return res.status(401).json({ msg: 'Formato do token inválido' });

  try {
    const { sub } = jwt.verify(token, process.env.SECRET);
    req.user_id = sub;
    return next();
  } catch (err) {
    return res.status(401).json({ msg: 'Não autorizado' });
  }
};
