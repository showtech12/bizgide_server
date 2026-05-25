const express = require("express");
const verifyAdmin = require("../verifyAdmin");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const Joi = require("joi");
const cChat = require("./chat.controller");
const Tools = require("../../shared/commonTools");
const pagination = require("../../shared/pagination");
const BadRequest400 = require("../../Exceptions/400Exception");
const idNumControlPOST = require("../../shared/idNumberControlPOST");
const idNumControl = require("../../shared/idNumberControl");

router.get("/api/v1/mesages", async (req, res) => {

  const pages = await cChat.getAllMsg(req.mypages);
  res.status(200).json({
    success:true,
    data:pages,
  })
  //res.send(pages);
});
