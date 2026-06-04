const express = require("express");
const verifyAdmin = require("../verifyAdmin");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const Joi = require("joi");
const Tools = require("../../shared/commonTools");
const pagination = require("../../shared/pagination");
const BadRequest400 = require("../../Exceptions/400Exception");
const idNumControlPOST = require("../../shared/idNumberControlPOST");
const UpldVeri = require("../../shared/uploadVerify");
const idNumControl = require("../../shared/idNumberControl");
//const basicAuth = require("../shared/basicAuth");
const authorizePermission = require("../auth_role.js");

const sequelize = require("../../config/database");

router.post("/api/v1/settings", verifyAdmin, async (req, res, next) => {
  try {
    console.log(req.body);

    const settingsSchema = Joi.object({
      expiringAlertPercent: Joi.number().min(0).max(100).required().messages({
        "number.base": "Expiring alert percent must be a number",
        "number.min": "Expiring alert percent cannot be less than 0",
        "number.max": "Expiring alert percent cannot be greater than 100",
        "any.required": "Expiring alert percent is required",
      }),

      stockOutPercent: Joi.number().min(0).required().messages({
        "number.base": "Minimum Stock out  must be a number",
        "number.min": "Minimum Stock out cannot be less than 0",
        "any.required": "Minimum Stock out is required",
      }),

      priceMarginPercent: Joi.number().min(0).max(100).required().messages({
        "number.base": "Price margin percent must be a number",
        "number.min": "Price margin percent cannot be less than 0",
        "number.max": "Price margin percent cannot be greater than 100",
        "any.required": "Price margin percent is required",
      }),

      currency: Joi.string().trim().min(3).required().messages({
        "string.empty": "Currency is required",
      }),
    });

    // Validate
    const { error, value } = settingsSchema.validate(req.body, {
      abortEarly: false,
      // convert: true,
      stripUnknown: true,
    });
    //console.log(error);
    if (error) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: error.details[0].message.replace(/\"/g, ""),
      });
    }

    await sequelize.query(
      `
      UPDATE tblsettings
      SET
        expiring_perct = :expiringAlertPercent,
        stock_out_perct = :stockOutPercent,
        profit_margin_perct = :priceMarginPercent,
        currency = :currency
      WHERE id = 1
      `,
      {
        replacements: {
          expiringAlertPercent: value.expiringAlertPercent,
          stockOutPercent: value.stockOutPercent,
          priceMarginPercent: value.priceMarginPercent,
          currency: value.currency,
        },
        type: sequelize.QueryTypes.UPDATE,
      },
    );

    //console.log("success");

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get(
  "/api/v1/settings",
  verifyAdmin,
  authorizePermission("settings"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)

    try {
      sequelize
        .query(
          `  SELECT expiring_perct, stock_out_perct, profit_margin_perct FROM tblsettings WHERE id='1'`,
          { type: sequelize.QueryTypes.SELECT },
        )

        .then((results) => {
          // console.log('Query result:', results);
          res.status(200).json({
            success: true,
            message: "success",
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
      //console.log(error);
      res.status(200).json({
        success: false,
        message: error,
      });
    }

    //
  },
);

router.get(
  "/api/v1/roles",
  verifyAdmin,
  // authorizePermission("view_role"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)

    try {
      sequelize
        .query(`SELECT id,rolename, permission FROM tblrole`, {
          type: sequelize.QueryTypes.SELECT,
        })

        .then((results) => {
          // console.log('Query result:', results);
          res.status(200).json({
            success: true,
            message: "success",
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
      //console.log(error);
      res.status(200).json({
        success: false,
        message: error,
      });
    }

    //
  },
);

router.post(
  "/api/v1/uptroles",
  verifyAdmin,
  authorizePermission("settings"),
  async (req, res, next) => {
     console.log(req.body);
    //m_perct = Number(req.body.margin_pect);
    const permission = req.body.permitz;
    const rlname = req.body.role_name;
    const id = req.body.id;

   

  //   const rolePermissionSchema = Joi.object({
  //     permission: Joi.string().required().messages({
  //       "string.empty": "Permission is required",
  //       "any.required": "Permission is required",
  //     }),

  //     rlname: Joi.string().trim().min(2).max(250).required().messages({
  //       "string.empty": "Role name is required",
  //       "string.min": "Role name must be at least 2 characters",
  //       "string.max": "Role name cannot exceed 250 characters",
  //       "any.required": "Role name is required",
  //     }),

  //     id: Joi.number().integer().required().messages({
  //       "number.base": "Role ID must be a number",
  //       "any.required": "Role ID is required",
  //     }),
  //   });

   

  //  // Validate
  //   const { error, value } = rolePermissionSchema.validate(req.body, {
  //     abortEarly: false,
  //     // convert: true,
  //     stripUnknown: true,
  //   });
  //   //console.log(error);
  //   if (error) {
  //     return res.status(400).json({
  //       success: false,
  //       code: 400,
  //       message: error.details[0].message.replace(/\"/g, ""),
  //     });
  //   }

    try {

const roles = req.body;

for (const role of roles) {


await sequelize.query(
  `
  UPDATE tblrole
  SET 
    permission = :permission,
    rolename = :role_name
  WHERE id = :id
  `,
  {
    replacements: {
      permission: role.permitz,
      role_name: role.role_name,
      id: role.id,
    },

    type: sequelize.QueryTypes.UPDATE,
  }
);


}

return res.status(200).json({
success: true,
message: "Permissions updated successfully",
});

} catch (error) {

console.error(error);

return res.status(500).json({
success: false,
message: "Server error",
});

}

  },
);

router.post(
  "/api/v1/setmargin",
  verifyAdmin,
  authorizePermission("settings"),
  async (req, res, next) => {
    // console.log(req.body);
    m_perct = Number(req.body.margin_pect);

    try {
      await sequelize.query(
        `
        UPDATE tblunit
        SET unitprice = costprice * (1 + :mPerct);
      `,
        {
          replacements: {
            mPerct: m_perct / 100,
          },
          type: sequelize.QueryTypes.UPDATE,
        },
      );

      //console.log("success");

      return res.status(200).json({
        success: true,
        message: "Successfully",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

module.exports = router;
