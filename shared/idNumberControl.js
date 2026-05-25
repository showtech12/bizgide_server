module.exports = (req, res, next) => {
  const id = Number.parseInt(req.params.id);

  //console.log(id);
  if (Number.isNaN(id)) {
    return res.status(400).json({
      code: 400,
      message: "Invalid ID",
    });
  }
  next();
};
