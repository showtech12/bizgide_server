const express = require("express");
const router = express.Router();
const cUser = require("../users/user.controller");
const {
  createUserSchema,
  EditUserSchema,
} = require("../validation/CreatUserSchema");
const verifyAdmin = require("../middleware/verifyAdmin");
const Tools = require("../shared/commonTools");
const pagination = require("../shared/pagination");
const bcrypt = require("bcryptjs");
const sequelize = require("../../config/database");
const { QueryTypes } = require("sequelize");

router.post("/api/v2/user", verifyAdmin, async (req, res) => {
   //console.log(req.body);
  //console.log(req.userDtl[0].id);

  try {
   // console.log("Create user request:", req.body);

    const { error, value } = createUserSchema.validate(req.body); // Validation

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message.replace(/\"/g, ""),
      });
    }

    // Check phone uniqueness
    const existingPhone = await cUser.getBySingleCol("phone", value.phone);
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already in use",
      });
    }

    // Check email uniqueness
    const existingEmail = await cUser.getBySingleCol("email", value.email);
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

    // Hash password
    const hashedPass = await bcrypt.hash(value.password, 10);

    // Hash password if needed (here plain for demo)
    // hashedPass = value.password; // Replace with bcrypt if required

    //console.log(value);

    const myData = {
      ...value,
      acct_type:value.userType,
      surname: value.surname?.toUpperCase(),
      othername: value.othername?.toUpperCase(),
      updated_at: req.userDtl[0].id,
      created_by: req.userDtl[0].id,
      gender: value.gender.toUpperCase(),
      password: hashedPass,
      status: value.status.toUpperCase(),
      created_at: nowISO,
    };

 

    //console.log(myData)
    // Create user
    await cUser.create(myData);
    const user_ID = await cUser.MaxID("id");

    // Generate account number
    const acct_no = 2000 + user_ID;
    await cUser.getRecByID("id", acct_no, user_ID);

    // const userDetails = await cUser.getUser(user_ID);

    return res.status(200).json({
      success: true,
      message: "User created successfully",
      // data: {
      //   id: userDetails.id,
      //   surname: userDetails.surname,
      //   othername: userDetails.othername,
      //   email: userDetails.email,
      //   acct_no: acct_no.toString(),
      //   createdAt: userDetails.createdAt,
      //   account_data: userDetails,
      // },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post(
  "/api/v2/userupdate",
  verifyAdmin,
  // authorizePermission("users"),
  async (req, res) => {
    //console.log(req.body)

    try {
      const {
        id,
        surname,
        othername,
        email,
        phone,
        gender,
        status,
        role_id,
        password,
        userType
      } = req.body;

      const data = {
        surname,
        othername,
        email,
        phone,
        gender,
        status,
        role_id,
        userType
      };

      if (password && password.trim() !== "") {
        data.password = password;
      }

      const { error, value } = EditUserSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details.map((err) => err.message),
        });
      }

      await cUser.update(Number(id), value);

      return res.status(200).json({
        success: true,
        message: "Record Updated",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

router.get(
  "/api/v2/users",
  verifyAdmin,
  //authorizePermission("expenses"),
  async (req, res) => {
   // console.log(req.userDtl[0].id);
    //console.log("Helloo")
    const t = req.query.t;

    let qry = ``;

    qry = `SELECT 
                u.*,
                r.rolename,
                r.permission
            FROM users u
            INNER JOIN tblrole r
            ON u.role_id = r.id
            WHERE u.acct_type = '${t}' ORDER BY id DESC;`;
    try {
      sequelize
        .query(qry, { type: sequelize.QueryTypes.SELECT })

        .then((results) => {
           //console.log('Query result:', results);
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
  "/api/v2/users1",
  verifyAdmin,
  pagination,
  // authorizePermission("users"),
  async (req, res) => {
    const pages = await cUser.getAllUsers(req.mypages);
    res.status(200).json({
      success: true,
      data: pages,
    });
    //res.send(pages);
  },
);

module.exports = router;
