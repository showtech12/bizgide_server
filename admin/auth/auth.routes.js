const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const Joi = require("joi");
const cUser = require("../users/users.controller");
const Tools = require("../../shared/commonTools");
const jwt = require("jsonwebtoken");
const sequelize = require("../../config/database");

router.post("/api/v1/auth/login", async (req, res) => {
  //console.log(req.body);
  const loginDetails = req.body;
  const txtEmail1 = loginDetails.txtEmail;
  const txtPass1 = loginDetails.txtPass;
 // console.log(txtEmail1);

  try {
    // Ensure the request body contains required fields
    const schema = Joi.object({
      //email: Joi.string().email().required(),
      //  password: Joi.string().required()
      txtEmail: Joi.string().email().required().messages({
        "string.email": "Email must be a valid email address",
        "any.required": "Email is required",
        "string.empty": "Email is required",
      }),

      txtPass: Joi.string()
        //.pattern(new RegExp("^[a-zA-Z0-9]{8,20}$"))
        .required()
        .messages({
          "string.pattern.base": "Password character must be within 8 to 20",
          "string.empty": "Password Required",
          "any.required": "Password Required ",
        }),
    });

    const { error } = schema.validate(loginDetails);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    // Use parameterized queries to prevent SQL injection
    const results = await sequelize.query(
      //`SELECT * FROM tblusers WHERE email = :email AND PassWord = :password AND acct_type = 'STAFF'`
      `SELECT 
                 u.*,
                r.rolename,
                r.permission,
                r.permission_module
            FROM tblusers u
            INNER JOIN tblrole r 
                ON u.role_id = r.id
            WHERE 
                u.email = :email 
                AND u.PassWord = :password 
                AND u.acct_type = 'STAFF';`,
      {
        replacements: { email: txtEmail1, password: txtPass1 },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    if (results.length > 0) {
      const user = results[0];
      // console.log(user)

      // Check if the password matches (assuming you hash passwords on registration)
      // const passwordMatch = await bcryptjs.compare(txtPass, user.PassWord);
      // if (!passwordMatch) {
      //     return res.status(401).json({
      //         success: false,
      //         message: "Invalid Login Details"
      //     });
      // }

      const adminID = user.id;
      // console.log(agtID)
      const adminToken = jwt.sign({ id: adminID }, process.env.JWT_SECRET, {
        expiresIn: "8h",
      });

      let options = {
        maxAge: 30 * 60 * 1000, // 30 minutes
        httpOnly: true,
        secure: true,
        sameSite: "None",
      };

      res.cookie("ACCU_SOFTiD", adminToken, options);

      return res.status(200).json({
        success: true,
        message: "Login Successful",
        data: user, // send user details instead of full results
        Token: adminToken,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid Login Details",
      });
    }
  } catch (err) {
    console.error("Database query error: ", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
