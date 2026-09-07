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
const mPersons = require("../../admin/persons/persons.model");
const mRoles = require("../roles/roles.model");

router.get(
  "/api/v2/activeplan",
  verifyAdmin,
  //authorizePermission("expenses"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)

    let qry = ``;

    qry = `SELECT
            c.company_name,
            c.surname,
            c.othername,
            c.email,
            c.phone,
            c.reg_acct_id,

            s.sub_name,
            s.sub_amount,
            s.no_of_staff,
            s.sub_space,

            o.isactive,
            o.due_date,
            o.tnx_ref,
            o.start_date,
            o.sub_status

        FROM clients AS c

        INNER JOIN tblsuborder AS o
            ON o.client_id = c.id

        INNER JOIN tblsubscription AS s
            ON o.sub_id = s.id

        WHERE o.isactive = 1;`;
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


router.get(
  "/api/v2/expiredplan",
  verifyAdmin,
  //authorizePermission("expenses"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)

    let qry = ``;

    qry = `SELECT
            c.company_name,
            c.surname,
            c.othername,
            c.email,
            c.phone,
            c.reg_acct_id,

            s.sub_name,
            s.sub_amount,
            s.no_of_staff,
            s.sub_space,

            o.isactive,
            o.due_date,
            o.tnx_ref,
            o.start_date,
            o.sub_status

        FROM clients AS c

        INNER JOIN tblsuborder AS o
            ON o.client_id = c.id

        INNER JOIN tblsubscription AS s
            ON o.sub_id = s.id

        WHERE o.isactive = 0;`;
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