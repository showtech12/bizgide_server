const express = require("express");
const router = express.Router();
const cClient = require("../clientreg/client.controller");
const { RegisterClientSchema } = require("../validation/ClientValidate");
const verifyAdmin = require("../middleware/verifyAdmin");
const Tools = require("../shared/commonTools");
const pagination = require("../shared/pagination");
const bcrypt = require("bcryptjs");
const sequelize = require("../../config/database");
const { QueryTypes } = require("sequelize");

router.post("/api/v2/register", async (req, res) => {
 // console.log(req.body);
  //console.log(req.userDtl[0].id);
 // return;
  try {
   //console.log("Create Register request:", req.body);

    const { error, value } = RegisterClientSchema.validate(req.body); // Validation
    console.log(value);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message.replace(/\"/g, ""),
      });
    }

    //Check phone uniqueness
    const existingPhone = await cClient.getBySingleCol("phone", value.phone);
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already in use",
      });
    }

    // Check email uniqueness
    const existingEmail = await cClient.getBySingleCol("email", value.email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Generate unique token
    const token = Tools.getUniqueId();
    const nowISO = new Date().toISOString();
    const regDate = Tools.getNowDate();

   

    const myData = {
      ...value,
        subscription_plan:"Trial",
        status:"Active",
        reffer_by:value.refferByID
    }

    //console.log(myData)
    await cClient.create(myData);
    const client_ID = await cClient.MaxID("id");

    // Generate account number
    const acct_no = 190100 + client_ID;
    await cClient.getRecByID("id", acct_no, client_ID);

    const userDetails = await cClient.getOne(client_ID);

    return res.status(200).json({
      success: true,
      message: "Successfully",
      regno: acct_no,
      cleintID: client_ID
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


router.get(
  "/api/v2/register",
  verifyAdmin,
  //authorizePermission("expenses"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)
    

    let qry = ``;

    qry = `SELECT c.*, u.surname AS suz,u.othername AS othr,u.email AS eml, u.acct_no FROM clients c, users u WHERE c.reffer_by = u.id ORDER BY c.id DESC`;
    try {
      sequelize
        .query(qry, { type: sequelize.QueryTypes.SELECT })

        .then((results) => {
          // console.log('Query result:', results);
          res.status(200).json({
            success: true,
            message: "success",
            total: results.length,
            data: results,
          });
        })
        .catch((error) => {
          //console.error('Error fetching data:', error);
          res.status(200).json({
            success: false,
            data: "",
          });
        });
    } catch (error) {
      console.log(error);
      res.status(200).json({
        success: false,
        message: error,
      });
    }
  },
);

module.exports = router;
