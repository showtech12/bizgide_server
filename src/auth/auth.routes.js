const express = require("express");
const router = express.Router();

const { login } = require("./auth.controller");

router.post("/api/v1/authadm/login",login)


//router.post("/api/v1/auth/login", async (req, res) => {
//})

module.exports = router;