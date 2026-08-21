const express = require("express");
const verifyAdmin = require("../verifyAdmin");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const Joi = require("joi");
const cUser = require("./users.controller");
const Tools = require("../../shared/commonTools");
const pagination = require("../../shared/pagination");
const BadRequest400 = require("../../Exceptions/400Exception");
const idNumControlPOST = require("../../shared/idNumberControlPOST");
const idNumControl = require("../../shared/idNumberControl");
//const basicAuth = require("../shared/basicAuth");
const SndMail = require("../../shared/sendMail.js");
const {
  UserSchema,
  UserSchemaEdit,
} = require("../../validate/validateUserInput");
const authorizePermission = require("../auth_role.js");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sequelize = require("../../config/database.js");

const allowedFileTypes = /jpeg|jpg|png|gif/;

const storage = multer.memoryStorage();
const upload = multer({
  // storage: storage,
  limits: { fileSize: 1024 * 1024 }, // Limit file size to 1 MB

  fileFilter: (req, file, cb) => {
    const extname = allowedFileTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedFileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
}).single("img1");

router.post("/upload", (req, res) => {
  const d = Tools.getUniqueId();

  //console.log(d)
  upload(req, res, async (err) => {
    if (err) {
      // Multer error (e.g., file too large or wrong file type)
      return res.status(200).send({ message: err.message });
      // return res.status(400).send({ message: "file too big" });
    }

    if (!req.file) {
      // No file uploaded
      return res.status(200).send({ message: "No file uploaded" });
    }

    try {
      const extension = path.extname(req.file.originalname).toLowerCase();

      const filePath = "./uploads/pix" + d + extension;
      await fs.promises.writeFile(filePath, req.file.buffer);
      res.status(200).send({ message: "File uploaded successfully" });
    } catch (writeError) {
      res.status(500).send({
        message: "Error writing file to disk",
        error: writeError.message,
      });
    }

    // const d = new date();
    //  await fs.promises.writeFile("./uploads/profile1.png", req.file.buffer);
    //  res.send({message:'Upload successful'});
  });

  // console.log(req.file);

  // res.send();
});

router.post(
  "/api/v1/clientuser",

  async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      // console.log(req.body);

      const {
        surname,
        othername,
        email,
        phone,
        password,
        regNo,
        company_name,
        clientid,
      } = req.body;
      // const { error, value } = UserSchema.validate(req.body); // Validation

      // if (error) {
      //   return res.status(400).json({
      //     success: false,
      //     message: error.details[0].message.replace(/\"/g, ""),
      //   });
      // }

      const schema = Joi.object({
        surname: Joi.string()
          .min(2)
          .max(200)
          //.required()
          .messages({
            "string.empty": "Surname is required",
            "string.min": "Surname must be at least 2 characters long",
            "string.max": "Surname cannot exceed 50 characters",
            "any.required": "Surname is required",
          }),

        othername: Joi.string().alphanum().min(2).max(200).required().messages({
          "string.min": "othername must be at least 2 characters long",
          "string.max": "othername cannot exceed 50 characters",
          "any.required": "othername is required",
          "string.empty": "othername is required",
        }),

        email: Joi.string().email().required().messages({
          "string.email": "Email must be a valid email address",
          "any.required": "Email is required",
          "string.empty": "othername is required",
        }),

        password: Joi.string()
          //.pattern(/^[a-zA-Z0-9@#$%^&*]{8,20}$/)
          .min(8)
          .max(20)

          .required()
          .messages({
            // "string.pattern.base": "Password character must be within 8 to 20",
            "string.min": "Password must be at least 8 characters long",
            "string.max": "Password cannot exceed 20 characters",
            "string.empty": "Password Required",
            "any.required": "Password Required ",
          }),

        phone: Joi.string()
          .pattern(/^\d{11}$/)
          .required()
          .messages({
            "string.empty": "Phone Number is required",
            "string.pattern.base": "Phone number must be an 11-digit number",
            "any.required": "Phone Required min of 2 and must not Exceed 50",
          }),
      });

      const { error } = schema.validate({
        surname,
        othername,
        email,
        password,
        phone,
      });
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message.replace(/\"/g, ""),
        });
      }

      // Check phone uniqueness
      const existingPhone = await cUser.getBySingleCol("phone", phone);
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone number already in use",
        });
      }

      // Check email uniqueness
      const existingEmail = await cUser.getBySingleCol("email", email);
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

      // Hash password if needed (here plain for demo)
      const hashedPass = password; // Replace with bcrypt if required

      // Build user record
      const myData = {
        acct_type: "CLIENT",
        surname: surname.toUpperCase(),
        othername: othername.toUpperCase(),
        email: email,
        phone: phone,
        client_reg_no: regNo,
        client_id: clientid,
        acct_no: "",
        User_Name: company_name.toUpperCase(),
        PassWord: hashedPass,
        role_id: 1,
        position: "ADMIN",
        IsActive: "YES",
        ISLogin: "NO",
        Date_Last_Modified: nowISO,
        Date_Last_Login: nowISO,
        Time_Last_Login: nowISO,
        Date_Last_LogOut: nowISO,
        store_id: 1,
        store_name: "", // Optional: fetch from store list if needed
        gender: "",
        createdAt: nowISO,
        Token: token,
        reg_date: regDate,
        state: "",
        local_gvt: "",
        country: "",
        isVeri: "NO",
      };

      // Create user
      await cUser.create(myData, transaction);
      const user_ID = await cUser.MaxID("id");

      // Generate account number
      const acct_no = 190100 + user_ID;
      await cUser.getRecByID("id", acct_no, user_ID); // Not sure what this does in your code

      const userDetails = await cUser.getUser(user_ID);
      await transaction.commit();

      return res.status(201).json({
        success: true,
        message: "Successfully",
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

router.get(
  "/api/v1/users",
  verifyAdmin,
  pagination,
  authorizePermission("users"),
  async (req, res) => {
    const client_id = req.userDtl[0].client_id;
    const pages = await cUser.getAllUsers(req.mypages, client_id);
    res.status(200).json({
      success: true,
      data: pages,
    });
    //res.send(pages);
  },
);

router.post(
  "/api/v1/user",
  verifyAdmin,
  authorizePermission("users"),
  async (req, res) => {
    const transaction = await sequelize.transaction();
    const client_id = req.userDtl[0].client_id;
    try {
      const { error, value } = UserSchema.validate(req.body); // Validation

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

      // Hash password if needed (here plain for demo)
      const hashedPass = value.password; // Replace with bcrypt if required

      // Build user record
      const myData = {
        acct_type: "STAFF",
        surname: value.surname.toUpperCase(),
        othername: value.othername.toUpperCase(),
        email: value.email,
        phone: value.phone,
        acct_no: "",
        User_Name: value.username.toUpperCase(),
        PassWord: hashedPass,
        role_id: value.position.value,
        position: value.position.label.toUpperCase(),
        IsActive: value.active.toUpperCase(),
        ISLogin: "NO",
        Date_Last_Modified: nowISO,
        Date_Last_Login: nowISO,
        Time_Last_Login: nowISO,
        Date_Last_LogOut: nowISO,
        store_id: value.store || 1,
        store_name: "", // Optional: fetch from store list if needed
        gender: value.gender.toUpperCase(),
        createdAt: nowISO,
        Token: token,
        reg_date: regDate,
        state: "",
        local_gvt: "",
        country: "",
        isVeri: "NO",
        client_id:client_id
      };

      // Create user
      await cUser.create(myData, transaction);
      const user_ID = await cUser.MaxID("id");

      // Generate account number
      const acct_no = 190100 + user_ID;
      await cUser.getRecByID("id", acct_no, user_ID); // Not sure what this does in your code

      const userDetails = await cUser.getUser(user_ID);
      await transaction.commit();

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          id: userDetails.id,
          surname: userDetails.surname,
          othername: userDetails.othername,
          email: userDetails.email,
          acct_no: acct_no.toString(),
          createdAt: userDetails.createdAt,
          account_data: userDetails,
        },
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

router.get("/api/v1/user/:id", verifyAdmin, idNumControl, async (req, res) => {
  const id = req.params.id;
  // console.log(id);
  const dtls = await cUser.getUser(id);
  res.send(dtls);
});

//router.put('/users/:id', idNumControlPOST, basicAuth, async (req, res) => {
router.post(
  "/api/v1/userupdate",
  verifyAdmin,
  authorizePermission("users"),
  async (req, res) => {
    const transaction = await sequelize.transaction();
    //const authUser = req.authedUser;
    //const id = req.params.id;

    //console.log(req.body);
    // return;

    try {
      const { error, value } = UserSchemaEdit.validate(req.body); // Validation

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message.replace(/\"/g, ""),
        });
      }

      //if(!Number.isNaN(id)){}
      const id = Number.parseInt(req.body.id);

      await cUser.UpdateUser(id, req.body, transaction);
      await transaction.commit();
      res.status(200).json({
        success: true,
        message: "Record Updated",
      });
    } catch (error) {
      await transaction.rollback();
    }
  },
);

router.post(
  "/api/v1/deleteuser",
  verifyAdmin,
  authorizePermission("users"),
  idNumControlPOST,
  async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      await cUser.deleteUser(req.body.id, transaction);

      await transaction.commit();

      return res.json({
        success: true,
      });
    } catch (err) {
      await transaction.rollback();

      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
    //console.log(req.body.id);
    // const transaction = await sequelize.transaction();
    // await cUser.deleteUser(req.body.id, transaction);
    // transaction.commit();
    // res.status(200).json({
    //   success: true,
    //   message: "Record Deleted Succesfully",
    // });

    // res.send("User Deleted");
  },
);

router.get("/api/v1/logout", (req, res) => {
  // res.clearCookie("ACCU_SOFTiD", {
  //   httpOnly: true,
  //   sameSite: "strict",
  //   secure: true
  // });

  return res.status(200).json({
    success: true,
    message: "Logout Successful",
  });
});

router.get(
  "/api/v1/verify_token",
  verifyAdmin,
  //authorizePermission("ADMIN"),
  async (req, res, next) => {
    // console.log(req.body.token);
    // console.log(req.userDtl)
    // res.clearCookie('MySessionIDCool');
    return res.status(200).send({
      code: 200,
      success: "true",
      message: "Verified",
      // token:req.currentToken
    });
    // res.send("User Deleted");
  },
);

module.exports = router;
