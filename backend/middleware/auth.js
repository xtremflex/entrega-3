module.exports = function (req, res, next) {
  const uid = req.cookies.uid;

  if (!uid) {
    return res.status(401).json({ error: "No autorizado" });
  }

  // Guardamos el id del usuario en la request
  req.uid = uid;
  next();
};
