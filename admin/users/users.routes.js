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
      res
        .status(500)
        .send({
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

router.get(
  "/api/v1/users",
  verifyAdmin,
  pagination,
  authorizePermission("users"),
  async (req, res) => {
    const pages = await cUser.getAllUsers(req.mypages);
    res.status(200).json({
      success: true,
      data: pages,
    });
    //res.send(pages);
  },
);

router.post("/api/v1/changepass", async (req, res, next) => {
  const txtEmail = req.body.email;
  const ResetCode = req.body.resetcode;
  const newpass = req.body.newpass;

  const myRes = await cUser.getChangePass(txtEmail, ResetCode, newpass);

  if (myRes == "Failed") {
    res.status(200).json({
      success: false,
      message: "inValid Reset Code",
    });
  }
  res.status(200).json({
    success: true,
    message: "Password Changed, Please  Login",
  });
});

router.post("/api/v1/reset", async (req, res, next) => {
  // Update

  const txtEmail = req.body.email;
  const ResetCode = Tools.getUniqueId();

  await cUser.getResetPass(txtEmail, ResetCode);

  let bdymsg = "";
  let MyMail = "tristian.hickle9@ethereal.email";
  //let MyMail=req.body.txtEmail;
  // bdymsg +='<a href="localhost:5000/verify/'+user_ID+'" > Verify </a>';
  bdymsg +=
    "<style> #link1 {background-color: #04AA6D;border: none;color: white;padding: 16px 32px;text-decoration: none;margin: 4px 2px;cursor: pointer;}</style>";

  bdymsg +=
    '<h2 style="text-align:center;font-weight:bold">Reset Password </h2>';
  bdymsg +=
    '<p style="text-align:center;font-weight:bold">Click to Change your password</p>';
  bdymsg +=
    '<a href="https://safeafrica.ng/veri_account.php?id=' +
    ResetCode +
    '"  id="link1" style="text-align:center" class=""> Change Password </a>';

  SndMail.getSendMail(bdymsg, MyMail, "Password Reset", "");

  res.status(200).json({
    success: true,
    message: "Password Reset, Please check your mail to proceed",
  });

  // res.status(200).json({
  //   success:true,
  //   message:"Password Reset"
  // })
});

router.post(
  "/api/v1/user",
  verifyAdmin,
  authorizePermission("ADMIN"),
  async (req, res) => {
    try {
      console.log("Create user request:", req.body);

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
        position: value.position.toUpperCase(),
        IsActive: value.active.toUpperCase(),
        ISLogin: "NO",
        Date_Last_Modified: nowISO,
        Date_Last_Login: nowISO,
        Time_Last_Login: nowISO,
        Date_Last_LogOut: nowISO,
        store_id: value.store || 1,
        store_name: "GREENHEYS CREDIT", // Optional: fetch from store list if needed
        gender: value.gender.toUpperCase(),
        createdAt: nowISO,
        Token: token,
        reg_date: regDate,
        state: "",
        local_gvt: "",
        country: "",
        isVeri: "NO",
      };

      // Create user
      await cUser.create(myData);
      const user_ID = await cUser.MaxID("id");

      // Generate account number
      const acct_no = 190100 + user_ID;
      await cUser.getRecByID("id", acct_no, user_ID); // Not sure what this does in your code

      const userDetails = await cUser.getUser(user_ID);

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

      await cUser.UpdateUser(id, req.body);
      res.status(200).json({
        success: true,
        message: "Record Updated",
      });
    } catch (error) {}
  },
);

router.post(
  "/api/v1/deleteuser",
  verifyAdmin,
  authorizePermission("users"),
  idNumControlPOST,
  async (req, res, next) => {
    console.log(req.body.id);
    await cUser.deleteUser(req.body.id);

    res.status(200).json({
      success: true,
      message: "Record Deleted Succesfully",
    });

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
