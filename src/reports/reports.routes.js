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
const Joi = require("joi");

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

router.get(
  "/api/v2/allplans",
  verifyAdmin,
  //authorizePermission("expenses"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)

    let qry = ``;

    qry = `SELECT * FROM tblsubscription `;
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

router.post("/api/v2/createplan", verifyAdmin, async (req, res) => {
  try {
    // ============================================================
    // 1. VALIDATE REQUEST BODY
    // ============================================================

    const schema = Joi.object({
      plan_name: Joi.string().trim().min(2).max(100).required().messages({
        "string.empty": "Plan name is required",
        "string.min": "Plan name must be at least 2 characters",
        "any.required": "Plan name is required",
      }),

      period: Joi.number()
        .integer()
        //.valid(1, 3, 6, 9, 12)
        .required()
        .messages({
          "number.base": "Subscription period must be a number",
          "any.only": "Subscription period must be 1, 3, 6, 9, or 12 months",
          "any.required": "Subscription period is required",
        }),

      amount: Joi.number().positive().precision(2).required().messages({
        "number.base": "Subscription amount must be a number",
        "number.positive": "Subscription amount must be greater than 0",
        "any.required": "Subscription amount is required",
      }),

      no_of_user: Joi.number().integer().min(1).required().messages({
        "number.base": "Number of staff must be a number",
        "number.integer": "Number of staff must be a whole number",
        "number.min": "Number of staff must be at least 1",
        "any.required": "Number of staff is required",
      }),

      no_of_space: Joi.number().integer().min(1).required().messages({
        "number.base": "Subscription space must be a number",
        "number.integer": "Subscription space must be a whole number",
        "number.min": "Subscription space must be at least 1",
        "any.required": "Subscription space is required",
      }),
    });

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    // ============================================================
    // 2. GET LOGGED-IN USER ID
    // ============================================================

    const user_id = req.userDtl?.[0]?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unable to identify logged-in user",
      });
    }

    // ============================================================
    // 3. INSERT INTO tblsubscription
    // ============================================================

    const qry = `
        INSERT INTO tblsubscription
        (
          sub_name,
          sub_period,
          sub_amount,
          no_of_staff,
          sub_space,
          user_id
        )
        VALUES
        (
          :sub_name,
          :sub_period,
          :sub_amount,
          :no_of_staff,
          :sub_space,
          :user_id
        )
      `;

    const [result] = await sequelize.query(qry, {
      replacements: {
        sub_name: value.plan_name,
        sub_period: value.period,
        sub_amount: value.amount,
        no_of_staff: value.no_of_user,
        sub_space: value.no_of_space,
        user_id: user_id,
      },
      type: sequelize.QueryTypes.INSERT,
    });

    // ============================================================
    // 4. RESPONSE
    // ============================================================

    return res.status(201).json({
      success: true,
      message: "Subscription plan created successfully",
      //   data: {
      //     id: result,
      //     sub_name: value.sub_name,
      //     sub_period: value.sub_period,
      //     sub_amount: value.sub_amount,
      //     no_of_staff: value.no_of_staff,
      //     sub_space: value.sub_space,
      //     user_id: user_id,
      //   },
    });
  } catch (error) {
    console.error("Create subscription plan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create subscription plan",
      error: error.message,
    });
  }
});

router.post("/api/v2/updateplan", verifyAdmin, async (req, res) => {
  try {
    console.log(req.body)
    // ============================================================
    // 1. VALIDATE REQUEST BODY
    // ============================================================

    const schema = Joi.object({
      id: Joi.number().integer().positive().required().messages({
        "number.base": "Plan ID must be a number",
        "number.integer": "Plan ID must be a whole number",
        "number.positive": "Plan ID must be greater than 0",
        "any.required": "Plan ID is required",
      }),

      plan_name: Joi.string().trim().min(2).max(100).required().messages({
        "string.empty": "Plan name is required",
        "string.min": "Plan name must be at least 2 characters",
        "any.required": "Plan name is required",
      }),

      period: Joi.number()
        .integer()
        .valid(1, 3, 6, 9, 12)
        .required()
        .messages({
          "number.base": "Subscription period must be a number",
          "any.only": "Subscription period must be 1, 3, 6, 9, or 12 months",
          "any.required": "Subscription period is required",
        }),

      amount: Joi.number().positive().precision(2).required().messages({
        "number.base": "Subscription amount must be a number",
        "number.positive": "Subscription amount must be greater than 0",
        "any.required": "Subscription amount is required",
      }),

       no_of_user: Joi.number().integer().min(1).required().messages({
        "number.base": "Number of staff must be a number",
        "number.integer": "Number of staff must be a whole number",
        "number.min": "Number of staff must be at least 1",
        "any.required": "Number of staff is required",
      }),

      no_of_space: Joi.number().integer().min(1).required().messages({
        "number.base": "Subscription space must be a number",
        "number.integer": "Subscription space must be a whole number",
        "number.min": "Subscription space must be at least 1",
        "any.required": "Subscription space is required",
      }),
    });

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // ============================================================
    // 2. VALIDATION ERROR
    // ============================================================

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    // ============================================================
    // 3. CHECK THAT PLAN EXISTS
    // ============================================================

    const checkQuery = `
        SELECT id
        FROM tblsubscription
        WHERE id = :id
        LIMIT 1
      `;

    const [existingPlan] = await sequelize.query(checkQuery, {
      replacements: {
        id: value.id,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    // ============================================================
    // 4. UPDATE PLAN
    // ============================================================

    const updateQuery = `
        UPDATE tblsubscription
        SET
          sub_name = :sub_name,
          sub_period = :sub_period,
          sub_amount = :sub_amount,
          no_of_staff = :no_of_staff,
          sub_space = :sub_space,
          last_time_updte= :ltime
        WHERE id = :id
      `;

    const [result] = await sequelize.query(updateQuery, {
      replacements: {
        id: value.id,
        sub_name: value.plan_name,
        sub_period: value.period,
        sub_amount: value.amount,
        no_of_staff: value.no_of_user,
        sub_space: value.no_of_space,
        ltime : new Date()
      },
      type: sequelize.QueryTypes.UPDATE,
    });

    // ============================================================
    // 5. RESPONSE
    // ============================================================

    return res.status(200).json({
      success: true,
      message: "Subscription plan updated successfully",
      data: {
        id: value.id,
        sub_name: value.sub_name,
        sub_period: value.sub_period,
        sub_amount: value.sub_amount,
        no_of_staff: value.no_of_staff,
        sub_space: value.sub_space,
      },
    });
  } catch (error) {
    console.error("Update subscription plan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update subscription plan",
      error: error.message,
    });
  }
});

module.exports = router;
