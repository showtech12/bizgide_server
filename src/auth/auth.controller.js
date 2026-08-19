const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sequelize = require("../../config/database");
//const { QueryTypes } = require("sequelize");

const login = async (req, res) => {
 // console.log(req.body);
  //console.log("helloo")
  try {
    const schema = Joi.object({
      txtEmail: Joi.string().email().required().messages({
        "string.email": "Email must be a valid email address",
        "string.empty": "Email is required",
        "any.required": "Email is required",
      }),

      txtPass: Joi.string().required().messages({
        "string.empty": "Password is required",
        "any.required": "Password is required",
      }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { txtEmail, txtPass } = req.body;

    const users = await sequelize.query(
      `
      SELECT
        u.id,
        u.surname,
        u.othername,
        u.email,
        u.phone,
        u.role_id,
        u.password,
        r.rolename,
        r.permission
        
      FROM users u
      INNER JOIN tblrole r
        ON u.role_id = r.id
      WHERE
        u.email = :email
        
      LIMIT 1
      `,
      {
        replacements: { email: txtEmail },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid Login Details",
      });
    }

    const user = users[0];
    //console.log(user.password)

    // For hashed passwords
    const passwordMatch = await bcrypt.compare(txtPass, user.password);

    //  console.log(passwordMatch)

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Login Details",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role_id: user.role_id,
        auth_type: "BizAdmn",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "5h",
      },
    );

    res.cookie("BizGAdm_SOFTiD", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 8 * 60 * 60 * 1000,
    });

    delete user.PassWord;

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      data: user,
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  login,
};
