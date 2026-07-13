const express = require("express");
//const verifyPerson = require("../verifyPerson");
const verifyAdmin = require("../verifyAdmin");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const Joi = require("joi");
const cOrders = require("../order/orders.controller");
const Tools = require("../../shared/commonTools");
const pagination = require("../../shared/pagination");
const BadRequest400 = require("../../Exceptions/400Exception");
const idNumControlPOST = require("../../shared/idNumberControlPOST");
const idNumControl = require("../../shared/idNumberControl");
//const getDateID = require("../../shared/getDateID.js")
const getDateid = require("../../shared/getDateID2.js");
const getTransact = require("../../shared/getTrans.js");
//const basicAuth = require("../shared/basicAuth");
const SndMail = require("../../shared/sendMail.js");
const { OrdersSchema } = require("../../validate/validateOrdersInput");
const { customerSchema } = require("../../validate/validatePersonInput");
const authorizePermission = require("../auth_role.js");
const sequelize = require("../../config/database");
const uploadMiddleware = require("../middlewares/uploadMiddleware");
//const { addMonths } = require("date-fns");

// const multer = require("multer");
// const path = require('path');
// const fs = require("fs");

router.get("/api/v1/posproduct", verifyAdmin, async (req, res) => {
  //console.log(req.userDtl[0].id)

  //  SELECT
  //             p.id AS id,
  //             p.bar_code,
  //             p.product_name,
  //             p.selling_price,
  //             p.cost_price,
  //             p.product_code,
  //             p.vat_amtz,
  //             p.unit_sell_price,
  //             p.piecies_value,
  //             IFNULL(d.total_stock, 0) AS qbal
  //         FROM products p
  //         LEFT JOIN (
  //             SELECT d.product_id, SUM(d.stock_bal) AS total_stock
  //             FROM order_details d
  //             JOIN orders o ON o.id = d.orders_id
  //             WHERE o.store = '1'
  //             GROUP BY d.product_id
  //         ) d ON p.id = d.product_id
  //         ORDER BY p.product_name
  const qry = `
            SELECT
                p.id,
                p.bar_code,
                p.product_name,
                p.product_code,
                p.vat_amtz,

                IFNULL(s.total_stock, 0) AS qbal,

                p.mfg_date,
                p.expiry_date,

                DATEDIFF(p.expiry_date, CURDATE()) AS days_left,

                DATEDIFF(p.expiry_date, p.mfg_date) AS total_days,

                ROUND(
                    (
                        DATEDIFF(p.expiry_date, CURDATE()) /
                        NULLIF(DATEDIFF(p.expiry_date, p.mfg_date), 0)
                    ) * 100
                ) AS percent_remaining,

                IFNULL(u.units, JSON_ARRAY()) AS units

            FROM products p

            /* Stock Balance */
            LEFT JOIN (
                SELECT
                    d.product_id,
                    SUM(d.stock_bal) AS total_stock
                FROM order_details d
                INNER JOIN orders o
                    ON o.id = d.orders_id
                WHERE o.store = 1
                GROUP BY d.product_id
            ) s
            ON s.product_id = p.id

            /* Product Units */
            LEFT JOIN (
                SELECT
                    product_id,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'pieces_in', pieces_in,
                            'unitprice', unitprice,
                            'unit_measure', unit_measure,
                            'costprice', costprice
                        )
                    ) AS units
                FROM tblunit
                GROUP BY product_id
            ) u
            ON u.product_id = p.id

            ORDER BY p.product_name;
          `;

  try {
    const results = await sequelize.query(qry, {
      type: sequelize.QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      total: results.length,
      data: results,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  //
});

router.get("/api/v1/poscustomer", verifyAdmin, async (req, res) => {
  //console.log(req.userDtl[0].id)
  let cusType = req.query.cusType;
  let qry = ``;
  if (cusType == "ALL") {
    qry = ` SELECT
              p.id,
              p.full_name,
              p.phone_no,
              p.act_no,
              SUM(t.balance_amt) AS bal
          FROM persons p
          LEFT JOIN transactions t
              ON t.personid = p.id
          WHERE p.flg = 'SHOW' AND contact_type !='SUBSIDIARY'
          GROUP BY
              p.id,
              p.full_name,
              p.phone_no,
              p.act_no;`;
  } else {
    qry = ` SELECT 
              p.id,
              p.full_name,
              p.phone_no,
              p.act_no,
              SUM(t.balance_amt) AS bal
          FROM persons p
          LEFT JOIN transactions t 
              ON t.personid = p.id
          WHERE p.flg = 'SHOW'
            AND p.contact_type = '${`${cusType}`}' AND p.contact_type !='SUBSIDIARY'
          GROUP BY 
              p.id, 
              p.full_name, 
              p.phone_no, 
              p.act_no;`;
  }

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

  //
});

router.get(
  "/api/v1/expenseacct",
  verifyAdmin,
  authorizePermission("expenses"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)
    let cusType = req.query.cusType;
    let qry = ``;

    qry = `SELECT id, full_name FROM persons WHERE la_id IN (7) and ptype='CA' ORDER BY la_id `;

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

    //
  },
);

router.get(
  "/api/v1/capitalacct",
  verifyAdmin,
  authorizePermission("capital"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)
    let cusType = req.query.cusType;
    let qry = ``;

    qry = `SELECT id, full_name FROM persons WHERE la_id IN (13) ORDER BY la_id `;

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

    //
  },
);

router.get(
  "/api/v1/cashbookacct",
  verifyAdmin,
  authorizePermission("cashbook"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)
    let cusType = req.query.cusType;
    let qry = ``;

    qry = `SELECT id, full_name FROM persons WHERE la_id IN (5) ORDER BY la_id `;

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

    //
  },
);

router.get("/api/v1/wallets", verifyAdmin, async (req, res) => {
  //console.log(req.userDtl[0].id)

  try {
    sequelize
      .query(
        `SELECT id, full_name FROM persons WHERE la_id IN (5,6) ORDER BY la_id `,
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
    console.log(error);
    res.status(200).json({
      success: false,
      message: error,
    });
  }

  //
});

router.get(
  "/api/v1/walletsCB",
  verifyAdmin,
  authorizePermission("cashbook"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)

    try {
      sequelize
        .query(
          `SELECT id, full_name FROM persons WHERE la_id IN (6) ORDER BY la_id `,
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
      console.log(error);
      res.status(200).json({
        success: false,
        message: error,
      });
    }

    //
  },
);

router.get(
  "/api/v1/jornals",
  verifyAdmin,
  authorizePermission("journals"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)

    try {
      sequelize
        .query(
          `SELECT id, legder_name, account_number FROM tblledger where id > '5' `,
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
      console.log(error);
      res.status(200).json({
        success: false,
        message: error,
      });
    }

    //
  },
);

router.get(
  "/api/v1/jornalsSub",
  verifyAdmin,
  authorizePermission("journals"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)

    // let laid = req.query.sub

    try {
      sequelize
        .query(
          `SELECT la_id, full_name, act_no FROM persons WHERE contact_type='SUBSIDIARY'  `,
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
      console.log(error);
      res.status(200).json({
        success: false,
        message: error,
      });
    }

    //
  },
);

router.get(
  "/api/v1/allcustomers",
  verifyAdmin,
  authorizePermission("ledger"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)
    const ctype = req.query.ctype;
    try {
      sequelize
        .query(
          `SELECT * FROM persons WHERE flg = 'SHOW' AND contact_type = '${ctype}'`,
          { type: sequelize.QueryTypes.SELECT },
        )

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

    //
  },
);

router.get(
  "/api/v1/customeranal",
  verifyAdmin,
  authorizePermission("cusanalys"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)

    try {
      sequelize
        .query(
          `SELECT p.id, t.dated, SUM(balance_amt) AS bal, SUM(credit_amt) AS crt, SUM(debit_amt) AS dbt, SUM(discount) AS dct, p.full_name, p.ptype FROM transactions t, persons p WHERE p.contact_type = 'CUSTOMER' AND  t.personid = p.id GROUP BY p.id`,
          { type: sequelize.QueryTypes.SELECT },
        )

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

    //
  },
);

router.get(
  "/api/v1/getledgerdtl",
  verifyAdmin,
  authorizePermission("ledgerbal"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)
    const id = req.query.id;
    const ptype = req.query.ptype;
    try {
      sequelize
        .query(
          `select id, dated,description, debit_amt,credit_amt,balance_amt,id,discount from transactions where personid ='${id}' AND type ='${ptype}' `,
          { type: sequelize.QueryTypes.SELECT },
        )

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

    //
  },
);

router.get(
  "/api/v1/trialbalance",
  verifyAdmin,
  authorizePermission("trailbal"),
  async (req, res) => {
    try {
      /* ===============================
       SUBSIDIARY LEDGERS
    =============================== */
      const subsidiary = await sequelize.query(
        `
      SELECT 
        p.id,
        p.full_name,
        p.ptype,
        SUM(t.debit_amt) AS dbt,
        SUM(t.credit_amt) AS crt,
        SUM(t.balance_amt) AS bal,
         p.id
      FROM transactions t
      JOIN persons p ON t.personid = p.id
      WHERE p.contact_type = 'SUBSIDIARY'
      GROUP BY p.id, p.full_name, p.ptype
      ORDER BY p.full_name ASC
    `,
        { type: sequelize.QueryTypes.SELECT },
      );

      /* ===============================
       PAYABLES (SUPPLIERS)
    =============================== */
      const payables = await sequelize.query(
        `
      SELECT 
        SUM(t.debit_amt) AS dbt,
        SUM(t.credit_amt) AS crt,
        SUM(t.balance_amt) AS bal,
        p.id
      FROM transactions t
      JOIN persons p ON t.personid = p.id
      WHERE p.contact_type = 'SUPPLIERS'
      GROUP BY p.id;
    `,
        { type: sequelize.QueryTypes.SELECT },
      );

      /* ===============================
       RECEIVABLES (CUSTOMERS)
    =============================== */
      const receivables = await sequelize.query(
        `
      SELECT 
        SUM(t.debit_amt) AS dbt,
        SUM(t.credit_amt) AS crt,
        SUM(t.balance_amt) AS bal,
         p.id
      FROM transactions t
      JOIN persons p ON t.personid = p.id
      WHERE p.contact_type = 'CUSTOMER'
      GROUP BY p.id;
    `,
        { type: sequelize.QueryTypes.SELECT },
      );

      /* ===============================
       STOCK IN
    =============================== */
      const stockin = await sequelize.query(
        `
      SELECT 
        SUM(t.debit_amt) AS dbt,
        SUM(t.credit_amt) AS crt,
        SUM(t.balance_amt) AS bal
      FROM transactions t
      JOIN persons p ON t.personid = p.id
      WHERE p.contact_type = 'STOCKIN'
      GROUP BY p.id;
    `,
        { type: sequelize.QueryTypes.SELECT },
      );

      /* ===============================
       RESPONSE
    =============================== */
      res.status(200).json({
        success: true,
        message: "Trial balance loaded",
        data: {
          subsidiary,
          payables: payables[0] || { dbt: 0, crt: 0, bal: 0 },
          receivables: receivables[0] || { dbt: 0, crt: 0, bal: 0 },
          stockin: stockin[0] || { dbt: 0, crt: 0, bal: 0 },
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to load trial balance",
      });
    }
  },
);

router.post(
  "/api/v1/getledgerbal",
  verifyAdmin,
  authorizePermission("ledgerbal"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)
    //const id = req.query.id;
    // const ptype = req.query.ptype;
    try {
      sequelize
        .query(
          `SELECT p.full_name,p.act_no, tr.personid, p.id, tr.type AS ptype, SUM(tr.debit_amt) AS dbt, SUM(tr.credit_amt) AS crt, SUM(tr.balance_amt) AS bal FROM transactions tr JOIN persons p ON tr.personid = p.id WHERE tr.type = 'PA' AND p.id = tr.personid GROUP BY tr.personid;   `,
          { type: sequelize.QueryTypes.SELECT },
        )

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

    //
  },
);

router.get(
  "/api/v1/stockbal",
  verifyAdmin,
  authorizePermission("stockin"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)

    // SELECT
    // 									p.id,
    // 									p.product_name,
    // 									p.size,
    // 									p.selling_price,
    // 									p.cost_price,
    // 									p.unit_sell_price,
    // 									p.product_code,
    // 									p.bar_code,
    // 									COALESCE(SUM(d.stock_bal), 0) AS sbal
    // 								FROM
    // 									products p
    // 								LEFT JOIN
    // 									order_details d ON p.id = d.product_id
    // 								LEFT JOIN
    // 									orders o ON d.orders_id = o.id AND o.store = '1'
    // 								GROUP BY
    // 									p.id
    // 								ORDER BY
    // 									p.product_name;

    let qry = "";

    qry = `SELECT 
    p.id, 
    p.product_name, 
    p.size, 
    p.product_code, 
    p.bar_code,

    IFNULL(s.sbal, 0) AS sbal,

    JSON_ARRAYAGG(
        CASE 
            WHEN u.product_id IS NOT NULL THEN JSON_OBJECT(
		'unit_id', u.id,
                'pieces_in', u.pieces_in,
                'unitprice', u.unitprice,
                'unit_measure', u.unit_measure,
                'costprice', u.costprice
            )
        END
    ) AS units

FROM products p

-- ✅ Pre-aggregated stock
LEFT JOIN (
    SELECT 
        d.product_id,
        SUM(d.stock_bal) AS sbal
    FROM order_details d
    JOIN orders o 
        ON o.id = d.orders_id
    WHERE o.store = '1'
    GROUP BY d.product_id
) s ON s.product_id = p.id

-- ✅ Units join (safe now)
 JOIN tblunit u 
    ON u.product_id = p.id

GROUP BY 
    p.id,
    p.product_name,
    p.size,
    p.product_code,
    p.bar_code,
    s.sbal

ORDER BY p.product_name;`;

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

    //
  },
);

router.post("/api/v1/customer", verifyAdmin, async (req, res) => {
  // console.log(req.body);

  const { fullname, email, phone, gender, address, city, contactType } =
    req.body;

  const schema = Joi.object({
    contactType: Joi.string().min(3).required().messages({
      "string.empty": "Contact Type is required",
      "string.min": "Contact Type must be at least 3 characters",
    }),

    fullname: Joi.string().min(3).required().messages({
      "string.empty": "Customers Name is required",
      "string.min": "Customers Name must be at least 3 characters",
    }),

    phone: Joi.string()
      .pattern(/^[0-9]{11}$/) // Nigerian format 11 digits (adjust if needed)
      .required()
      .messages({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Phone number must be 11 digits",
      }),
  });

  const { error } = schema.validate({ fullname, phone, contactType });
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const qry = `
    INSERT INTO persons 
    (contact_type, ptype, la_id, full_name, sex, address, dob, phone_no, city, state, email,
     act_no, passport, isActive, postal_code, store_id, reg_date, last_date_modified, flg)
    VALUES 
    (?, 'PA', '0', ?, ?, ?, '', ?, ?, '', ?, '', '', '1', '', '1', NOW(), NOW(), 'SHOW')
  `;

  try {
    const [result] = await sequelize.query(qry, {
      replacements: [
        contactType,
        fullname,
        gender,
        address,
        phone,
        city,
        email,
      ],
      type: sequelize.QueryTypes.INSERT,
    });

    const acctId = 10000 + Number(result);

    await sequelize.query(`UPDATE persons SET act_no=? WHERE id=?`, {
      replacements: [acctId, result],
      type: sequelize.QueryTypes.UPDATE,
    });

    return res.status(200).json({
      success: true,
      message: "Customer created successfully",
      insertId: result,
    });
  } catch (error) {
    console.error("Insert Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to insert customer",
      error: error.message,
    });
  }
});

router.post(
  "/api/v1/savejournal",
  verifyAdmin,
  authorizePermission("journals"),
  async (req, res) => {
    const { txtLedgerName, JournalID, ledgerLabel } = req.body;
    const d = new Date().toISOString().split("T")[0];
    const schema = Joi.object({
      txtLedgerName: Joi.string().min(3).required().messages({
        "string.empty": " Ledger Name is required",
        "string.min": " Ledger Name must be at least 3 characters",
      }),

      // ledgerLabel: Joi.string().min(3).required().messages({
      //     "string.empty": " Ledger Name is required",
      //     "string.min": " Ledger Name must be at least 3 characters"
      //   }),

      JournalID: Joi.number().integer().positive().required().messages({
        "number.base": "Journal Category  must be a number",
        "number.positive": "Invalid Journal Category",
        "any.required": "Journal Category is required",
      }),
    });

    const { error } = schema.validate({ txtLedgerName, JournalID });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const qry = `
    INSERT INTO persons 
    (contact_type,ptype,full_name,act_no,isActive,postal_code,store_id,reg_date,la_id)
    VALUES 
    ('SUBSIDIARY', 'CA', ?, 0, 1, ?, 0, ?, ?)
  `;

    try {
      const [result] = await sequelize.query(qry, {
        replacements: [txtLedgerName, ledgerLabel, d, JournalID],
        type: sequelize.QueryTypes.INSERT,
      });

      return res.status(200).json({
        success: true,
        message: "Saved",
        insertId: result,
      });
    } catch (error) {
      console.error("Insert Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to insert customer",
        error: error.message,
      });
    }
  },
);

router.post("/api/v1/customerupdate", verifyAdmin, async (req, res) => {
  const { id, fullname, email, phone, gender, address, city } = req.body;

  // Validate fullname & phone only
  const schema = Joi.object({
    fullname: Joi.string().min(3).required().messages({
      "string.empty": "Customers Name is required",
      "string.min": "Customers Name must be at least 3 characters",
    }),
    phone: Joi.string()
      .pattern(/^[0-9]{11}$/)
      .required()
      .messages({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Phone number must be 11 digits",
      }),
  });

  const { error } = schema.validate({ fullname, phone });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Customer ID is required for update",
    });
  }

  try {
    const qry = `
      UPDATE persons
      SET full_name = ?, 
          sex = ?, 
          address = ?, 
          phone_no = ?, 
          city = ?, 
          email = ?, 
          last_date_modified = NOW()
      WHERE id = ?
    `;

    const [result] = await sequelize.query(qry, {
      replacements: [fullname, gender, address, phone, city, email, id],
      type: sequelize.QueryTypes.UPDATE,
    });

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      updatedId: id,
    });
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update customer",
      error: error.message,
    });
  }
});

router.post("/api/v1/hidecus", verifyAdmin, async (req, res, next) => {
  await sequelize
    .query(`UPDATE persons SET flg='HIDE' WHERE id ='${req.body.id}'`, {
      type: sequelize.QueryTypes.UPDATE,
    })
    .then(() => {
      res.status(200).json({
        success: true,
        message: "Deactivated Successful",
      });
    });
});

router.post(
  "/api/v1/addstck",
  verifyAdmin,
  authorizePermission("stockin"),
  async (req, res, next) => {
    // console.log(req.body);

    const {
      stocktype,
      addbal,
      prdtid,
      // storeID,
      productname,
      sbal,
      cost,
      code,
      sel_price,
      selectedUnit,
      selectedPieces_in,
      units,
    } = req.body;

    const Joi = require("joi");

    const schema = Joi.object({
      prdtid: Joi.number().integer().positive().required().messages({
        "number.base": "Product ID must be a number",
        "number.integer": "Product ID must be an integer",
        "number.positive": "Product ID must be greater than zero",
        "any.required": "Product ID is required",
      }),

      cost: Joi.number().min(0).required().messages({
        "number.base": "Cost must be a number",
        "number.min": "Cost cannot be less than 0",
        "any.required": "Cost is required",
      }),

      sbal: Joi.number().min(0).required().messages({
        "number.base": "Stock balance must be a number",
        "number.min": "Stock balance cannot be less than 0",
        "any.required": "Stock balance is required",
      }),

      sel_price: Joi.number().min(0).required().messages({
        "number.base": "Selling price must be a number",
        "number.min": "Selling price cannot be less than 0",
        "any.required": "Selling price is required",
      }),

      selectedPieces_in: Joi.number().min(1).required().messages({
        "number.base": "Selected Pieces in must be a number",
        "number.min": "Selected Pieces in cannot be less than 1",
        "any.required": "Selected Pieces in is required",
      }),

      selectedUnit: Joi.string()
        //.valid("PIECES", "BOX", "CARTON")
        .required()
        .messages({
          "any.only": "Selected Unit must be PIECES, BOX, or CARTON",
          "any.required": "Selected Unit is required",
        }),

      addbal: Joi.number().min(0).required().messages({
        "number.base": "Stock Value must be a number",
        "number.min": "Stock Value cannot be less than 0",
        "any.required": "Stock Value is required",
      }),

      stocktype: Joi.string()
        .valid("ADD", "REMOVE", "ADJUST")
        .required()
        .messages({
          "any.only": "Stock Type must be ADD, REMOVE, or ADJUST",
          "any.required": "Stock Type is required",
        }),

      units: Joi.array()
        // .items(
        //   Joi.object({
        //     unit_id: Joi.number().integer().required(),
        //     costprice: Joi.number().min(0).required(),
        //     pieces_in: Joi.number().min(1).required(),
        //     unitprice: Joi.number().min(0).required(),
        //     //unit_measure: Joi.string().valid("PIECES", "BOX", "CARTON").required(),
        //   })
        // )
        .min(1)
        .required(),
    }).prefs({ convert: true }); // <-- key: converts numeric strings to numbers

    const { error } = schema.validate({
      prdtid,
      stocktype,
      addbal,
      cost,
      selectedUnit,
      selectedPieces_in,
      sbal,
      sel_price,
      units,
    });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const str_id = req.userDtl[0].store_id;
    const or_mode = "stockin";
    const d = new Date().toISOString().split("T")[0];
    const dt = new Date();
    const usr_id = req.userDtl[0].id;

    try {
      // STEP 1: Get the STOCKIN person ID
      const [personResult] = await sequelize.query(
        `SELECT id FROM persons WHERE store_id = ? AND contact_type = 'STOCKIN' LIMIT 1`,
        { replacements: [str_id], type: sequelize.QueryTypes.SELECT },
      );

      const persons_id = personResult?.id;
      if (!persons_id) {
        return res.status(400).json({
          success: false,
          message: "No STOCKIN account found for this store",
        });
      }

      // STEP 2: Insert into orders table
      const [insertResult] = await sequelize.query(
        `INSERT INTO orders (persons_id, invoice_no, order_mode, dates, store, users_id, transact_id)
       VALUES (?, '0', ?, ?, ?, ?, '0')`,
        {
          replacements: [persons_id, or_mode, d, str_id, usr_id],
          type: sequelize.QueryTypes.INSERT,
        },
      );

      console.log(insertResult);
      //return false;
      const orMax = insertResult; // Inserted order ID

      // STEP 3: Update invoice number
      const inv_no = 1992000 + Number(orMax);

      await sequelize.query(`UPDATE orders SET invoice_no = ? WHERE id = ?`, {
        replacements: [inv_no, orMax],
        type: sequelize.QueryTypes.UPDATE,
      });

      //STEP 4
      const tline = addbal * cost;
      //const  penalty = addbal * cost;
      const dateId = await getDateid.getDateID();
      //const dateId = 0;
      console.log("hhhhhh");

      await getTransact.ProcessTransact(
        "Stock In",
        persons_id,
        "PA",
        tline,
        0,
        0,
        usr_id,
        15,
        dateId,
        0,
      );

      await getTransact.ProcessTransact(
        "Puchase Ledger Stock In ",
        1,
        "CA",
        0,
        tline,
        0,
        usr_id,
        1,
        dateId,
        0,
      );

      //STEP 5

      // STEP 5: Insert into Details table

      function toBase(quantity, selectedPieces_in) {
        return quantity * selectedPieces_in;
      }

      function toBasePrice(quantity, selectedPieces_in) {
        return quantity * selectedPieces_in;
      }

      const txtQty = toBase(addbal, selectedPieces_in);
      const stk_bal = txtQty;
      let qty_bal = 0;
      const costp = addbal * cost;

      const [insertDetail] = await sequelize.query(
        `INSERT INTO order_details (
        orders_id, product_id, quantity, sales_price, discount, total_line, gain,
        unit_price, time_id, basket_count, dated, order_mode, stock_bal, qty_bal,
        vats_amount, date_time, total_costline, manifacture_date, expire_date,
        commisn_amt, stock_bal_value,qty_type
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
        {
          replacements: [
            orMax, // orders_id
            prdtid, // product_id
            addbal, // quantity
            sel_price, // sales_price
            0, // discount
            tline, // total_line
            0, // gain
            cost, // unit_price
            dateId, // time_id
            1, // basket_count (fixed)
            d, // dated
            or_mode, // order_mode
            stk_bal, // stock_bal
            0, // qty_bal (fixed)
            qty_bal, // vats_amount
            dt, // date_time
            costp, // total_costline
            0, // manifacture_date
            0, // expire_date
            0, // commisn_amt
            costp, // stock_bal_value
            selectedUnit, // stock_bal_value
          ],
          type: sequelize.QueryTypes.INSERT,
        },
      );

      //insertDetail
      qty_bal = await getTransact.getStockBal(prdtid, 1);

      await sequelize.query(
        `UPDATE order_details SET qty_bal=?  WHERE id = ?`,
        {
          replacements: [qty_bal, insertDetail],
          type: sequelize.QueryTypes.UPDATE,
        },
      );

      return res.status(200).json({
        success: true,
        message: "Stock Added Successfull",
        // order_id: orMax,
        // invoice_no: inv_no
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Error creating order",
        error: error.message,
      });
    }
  },
);

router.post(
  "/api/v1/singleinv",
  verifyAdmin,
  authorizePermission("inventory"),
  async (req, res) => {
    const schema = Joi.object({
      store: Joi.number().integer().positive().required().messages({
        "number.base": "Please Select Store must ",
        "number.positive": "Invalid Please ",
        "any.required": "Please Select Store is required",
      }),

      product: Joi.number().integer().positive().required().messages({
        "number.base": "Product ID must be a number",
        "number.positive": "Invalid Product ID",
        "any.required": "Please Select Product Name",
      }),

      Ledger: Joi.alternatives()
        .try(Joi.number().integer().positive(), Joi.string().trim().min(1))
        .required()
        .messages({
          "alternatives.match": "Ledger must be a number or text",
          "any.required": "Please Select Customer Name",
        }),

      dateTo: Joi.string().trim().min(3).required().messages({
        "any.only": "Please Select Date To",
        "any.required": "Please Select Date To",
      }),

      dateFrom: Joi.string().trim().required().messages({
        "any.only": "Please Select Date From",
        "any.required": "Please Select Date From",
      }),
    });

    // ===================== VALIDATE REQUEST =====================
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      convert: true,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((d) => d.message),
      });
    }

    // ===================== EXTRACT VALIDATED DATA =====================
    const { store, product, Ledger, dateTo, dateFrom } = value;

    let qry = ``;

    if (Ledger == "ALL") {
      qry = `SELECT
              o.dates,
              d.quantity,
              d.unit_price,
              pr.product_name,
              pr.product_code,
              d.total_line,
              p.full_name,
              p.act_no,
              p.contact_type,
              
              d.qty_bal,
              d.order_mode,
              u.surname,
              u.othername,
              
              d.stock_bal,
              d.qty_type,

              JSON_ARRAYAGG(
                  JSON_OBJECT(
                      'unit_measure', tu.unit_measure,
                      'pieces_in', tu.pieces_in,
                      'unitprice', tu.unitprice
                  )
              ) AS units

          FROM orders o
          INNER JOIN order_details d ON d.orders_id = o.id
          INNER JOIN products pr ON pr.id = d.product_id
          INNER JOIN persons p ON p.id = o.persons_id
          INNER JOIN tblusers u ON u.id = o.users_id
          INNER JOIN tbltimes tm ON tm.id = d.time_id
          LEFT JOIN tblunit tu ON tu.product_id = pr.id

          WHERE o.store = ${store}
            AND d.product_id = ${product}
            AND tm.dated BETWEEN '${dateFrom}' AND '${dateTo}'

          GROUP BY d.id
          ORDER BY d.id;`;
    } else {
      qry = `SELECT
              o.dates,
              d.quantity,
              d.unit_price,
              pr.product_name,
              pr.product_code,
              d.total_line,
              p.full_name,
              p.act_no,
              p.contact_type,
              
              d.qty_bal,
              d.order_mode,
              u.surname,
              u.othername,
            
              d.stock_bal,
              d.qty_type,

              JSON_ARRAYAGG(
                  JSON_OBJECT(
                      'unit_measure', tu.unit_measure,
                      'pieces_in', tu.pieces_in,
                      'unitprice', tu.unitprice
                  )
              ) AS units

          FROM orders o
          INNER JOIN order_details d ON d.orders_id = o.id
          INNER JOIN products pr ON pr.id = d.product_id
          INNER JOIN persons p ON p.id = o.persons_id
          INNER JOIN tblusers u ON u.id = o.users_id
          INNER JOIN tbltimes tm ON tm.id = d.time_id
          LEFT JOIN tblunit tu ON tu.product_id = pr.id

          WHERE o.store = ${store}
            AND d.product_id = ${product} AND o.person_id = ${Ledger}
            AND tm.dated BETWEEN '${dateFrom}' AND '${dateTo}'

          GROUP BY d.id
          ORDER BY d.id;`;
    }
    console.log(qry);
    try {
      sequelize
        .query(qry, { type: sequelize.QueryTypes.SELECT })

        .then((results) => {
          console.log("Query result:", results);
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
  "/api/v1/stockrpt",
  verifyAdmin,
  authorizePermission("salesrecord"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)
    //console.log(req.body);

    const schema = Joi.object({
      store: Joi.number().integer().positive().required().messages({
        "number.base": "Please Select Store must ",
        "number.positive": "Invalid Please ",
        "any.required": "Please Select Store is required",
      }),

      // product: Joi.number()
      //   .integer()
      //   .positive()
      //   .required()
      //   .messages({
      //     "number.base": "Product ID must be a number",
      //     "number.positive": "Invalid Product ID",
      //     "any.required": "Please Select Product Name",
      //   }),

      // Ledger: Joi.number()
      //   .integer()
      //   .positive()
      //   .required()
      //   .messages({
      //     "number.base": "Customer ID must be a number",
      //     "number.positive": "Invalid Customer ID",
      //     "any.required": "Please Select Customer Name",
      //   }),

      dateTo: Joi.string().trim().min(3).required().messages({
        "any.only": "Please Select Date To",
        "any.required": "Please Select Date To",
      }),

      dateFrom: Joi.string().trim().required().messages({
        "any.only": "Please Select Date From",
        "any.required": "Please Select Date From",
      }),
    });

    // ===================== VALIDATE REQUEST =====================
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      convert: true,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((d) => d.message),
      });
    }

    // ===================== EXTRACT VALIDATED DATA =====================
    const {
      store,
      //product,
      //Ledger,
      dateTo,
      dateFrom,
    } = value;

    let qry = ``;
    qry = `SELECT
						t.*,

						/* Available Stock */
						((t.opening_stock + t.purchases + t.RI) - t.RO) AS available_stock,

						/* Closing Stock */
						((t.opening_stock + t.purchases + t.RI - t.RO) - t.sales) AS closing_stock,

						/* Values */
						(t.opening_stock * t.cost_price) AS opening_value,

						t.purchase_value,

						((t.opening_stock + t.purchases + t.RI - t.RO) * t.cost_price) AS available_value,

						t.sales_value,

						(((t.opening_stock + t.purchases + t.RI - t.RO) - t.sales) * t.cost_price) AS closing_value,

						/* Gross Profit */
						(t.sales_value - (t.sales * t.cost_price)) AS gross_profit

							FROM
							(
								SELECT
									p.id,
									p.product_code,
									p.product_name,
									p.cost_price,
									p.selling_price,

									/* Opening Stock */
									COALESCE(
									(
										SELECT od.qty_bal
										FROM order_details od
										INNER JOIN orders oo
											ON oo.id = od.orders_id
										WHERE od.product_id = p.id
										AND oo.store = 1
										AND od.dated < '${dateFrom}'
										ORDER BY od.dated DESC, od.id DESC
										LIMIT 1
									),0) AS opening_stock,

									/* Purchases */
									COALESCE(SUM(
										CASE
											WHEN o.order_mode IN ('Bought','Stock_in')
											THEN ABS(d.stock_bal)
											ELSE 0
										END
									),0) AS purchases,

									/* Purchase Value */
									COALESCE(SUM(
										CASE
											WHEN o.order_mode IN ('Bought','Stock_in')
											THEN d.total_costline
											ELSE 0
										END
									),0) AS purchase_value,

									/* Sales */
									COALESCE(SUM(
										CASE
											WHEN o.order_mode IN ('Sold')
											THEN ABS(d.stock_bal)
											ELSE 0
										END
									),0) AS sales,

									/* RI */
									COALESCE(SUM(
										CASE
											WHEN o.order_mode IN ('Returnin')
											THEN ABS(d.stock_bal)
											ELSE 0
										END
									),0) AS RI,

									/* RO */
									COALESCE(SUM(
										CASE
											WHEN o.order_mode IN ('Returnout')
											THEN ABS(d.stock_bal)
											ELSE 0
										END
									),0) AS RO,


									/* Sales Value */
									COALESCE(SUM(
										CASE
											WHEN o.order_mode IN ('Sold')
											THEN d.total_line
											ELSE 0
										END
									),0) AS sales_value

								FROM products p

								LEFT JOIN order_details d
									ON d.product_id = p.id

								LEFT JOIN orders o
									ON o.id = d.orders_id
									AND o.store = 1
									AND o.dates BETWEEN '${dateFrom}' AND '${dateTo}'

								GROUP BY
									p.id,
									p.product_code,
									p.product_name,
									p.cost_price,
									p.selling_price

							) t

							ORDER BY t.product_name;`;

    try {
      sequelize
        .query(qry, { type: sequelize.QueryTypes.SELECT })

        .then((results) => {
          //  console.log("Query result:", results);
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

    //
  },
);

router.post(
  "/api/v1/salesrecord",
  verifyAdmin,
  authorizePermission("salesrecord"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)
    //console.log(req.body);

    const schema = Joi.object({
      store: Joi.number().integer().positive().required().messages({
        "number.base": "Please Select Store must ",
        "number.positive": "Invalid Please ",
        "any.required": "Please Select Store is required",
      }),

      // product: Joi.number()
      //   .integer()
      //   .positive()
      //   .required()
      //   .messages({
      //     "number.base": "Product ID must be a number",
      //     "number.positive": "Invalid Product ID",
      //     "any.required": "Please Select Product Name",
      //   }),

      // Ledger: Joi.number()
      //   .integer()
      //   .positive()
      //   .required()
      //   .messages({
      //     "number.base": "Customer ID must be a number",
      //     "number.positive": "Invalid Customer ID",
      //     "any.required": "Please Select Customer Name",
      //   }),

      dateTo: Joi.string().trim().min(3).required().messages({
        "any.only": "Please Select Date To",
        "any.required": "Please Select Date To",
      }),

      dateFrom: Joi.string().trim().required().messages({
        "any.only": "Please Select Date From",
        "any.required": "Please Select Date From",
      }),

      recType: Joi.string().trim().required().messages({
        "any.only": "Record Type Required",
        "any.required": "Record Type Required",
      }),
    });

    // ===================== VALIDATE REQUEST =====================
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      convert: true,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((d) => d.message),
      });
    }

    // ===================== EXTRACT VALIDATED DATA =====================
    const {
      store,
      //product,
      //Ledger,
      dateTo,
      dateFrom,
      recType,
    } = value;

    let qry = ``;
    qry = `SELECT 
                d.order_mode,
                u.surname,
                u.othername,
                u.acct_no,
                d.dated,
                p.id AS person_id,
                p.full_name,
                p.act_no,
                pr.product_code,
                pr.product_name,
                d.quantity,
                o.invoice_no,
                o.transact_id,
                d.sales_price,
                d.commisn_amt,
                d.total_line,
                d.qty_type,
                pr.piecies_value
            FROM order_details d
            INNER JOIN orders o ON d.orders_id = o.id
            INNER JOIN products pr ON d.product_id = pr.id
            INNER JOIN persons p ON o.persons_id = p.id
            INNER JOIN tblusers u ON o.users_id = u.id
            WHERE p.contact_type = '${recType}'
            AND o.store = '${store}'
            AND d.dated BETWEEN '${dateFrom}' AND '${dateTo}'`;

    try {
      sequelize
        .query(qry, { type: sequelize.QueryTypes.SELECT })

        .then((results) => {
          //console.log("Query result:", results);
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

    //
  },
);

router.post(
  "/api/v1/salesinc",
  verifyAdmin,
  authorizePermission("salesincome"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)
    // console.log(req.body);

    const schema = Joi.object({
      store: Joi.number().integer().positive().required().messages({
        "number.base": "Please Select Store must ",
        "number.positive": "Invalid Please ",
        "any.required": "Please Select Store is required",
      }),

      // product: Joi.number()
      //   .integer()
      //   .positive()
      //   .required()
      //   .messages({
      //     "number.base": "Product ID must be a number",
      //     "number.positive": "Invalid Product ID",
      //     "any.required": "Please Select Product Name",
      //   }),

      // Ledger: Joi.number()
      //   .integer()
      //   .positive()
      //   .required()
      //   .messages({
      //     "number.base": "Customer ID must be a number",
      //     "number.positive": "Invalid Customer ID",
      //     "any.required": "Please Select Customer Name",
      //   }),

      dateTo: Joi.string().trim().min(3).required().messages({
        "any.only": "Please Select Date To",
        "any.required": "Please Select Date To",
      }),

      dateFrom: Joi.string().trim().required().messages({
        "any.only": "Please Select Date From",
        "any.required": "Please Select Date From",
      }),
    });

    // ===================== VALIDATE REQUEST =====================
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      convert: true,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((d) => d.message),
      });
    }

    // ===================== EXTRACT VALIDATED DATA =====================
    const {
      store,
      //product,
      //Ledger,
      dateTo,
      dateFrom,
    } = value;

    let qry = ``;
    qry = `SELECT
                    t.dated,
                    t.description,
                    t.type,
                    t.discount,
                    t.balance_amt
                  FROM transactions t
                  INNER JOIN tblledger ld
                    ON t.ledger_id = ld.id
                  WHERE t.dated BETWEEN '${dateFrom}' AND '${dateTo}'
                    AND t.type = 'CA'
                    AND t.ledger_id IN (5, 6)
                    AND t.str_id = '${store}';
                  `;

    try {
      sequelize
        .query(qry, { type: sequelize.QueryTypes.SELECT })

        .then((results) => {
          console.log("Query result:", results);
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

    //
  },
);

router.post(
  "/api/v1/salesanal",
  verifyAdmin,
  authorizePermission("saleanalysis"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)
    // console.log(req.body);

    const schema = Joi.object({
      store: Joi.number().integer().positive().required().messages({
        "number.base": "Please Select Store must ",
        "number.positive": "Invalid Please ",
        "any.required": "Please Select Store is required",
      }),

      // product: Joi.number()
      //   .integer()
      //   .positive()
      //   .required()
      //   .messages({
      //     "number.base": "Product ID must be a number",
      //     "number.positive": "Invalid Product ID",
      //     "any.required": "Please Select Product Name",
      //   }),

      Ledger: Joi.alternatives()
        .try(Joi.number().integer().positive(), Joi.string().trim().min(1))
        .required()
        .messages({
          "alternatives.match": "Ledger must be a number or text",
          "any.required": "Please Select Customer Name",
        }),

      dateTo: Joi.string().trim().min(3).required().messages({
        "any.only": "Please Select Date To",
        "any.required": "Please Select Date To",
      }),

      dateFrom: Joi.string().trim().required().messages({
        "any.only": "Please Select Date From",
        "any.required": "Please Select Date From",
      }),
      SaType: Joi.string().trim().required().messages({
        "any.only": "Type Is Required",
        "any.required": "Type Is Required",
      }),
    });

    // ===================== VALIDATE REQUEST =====================
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      convert: true,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((d) => d.message),
      });
    }
    // console.log(req.body);
    // ===================== EXTRACT VALIDATED DATA =====================
    const {
      store,
      SaType,
      //product,
      Ledger,
      dateTo,
      dateFrom,
    } = value;

    let qry = ``;
    console.log(SaType);
    if (SaType == "SALES") {
      if (Ledger == "ALL") {
        qry = `SELECT o.persons_id, d.id,d.qty_type, d.orders_id, pr.product_name,pr.selling_price,pr.cost_price,pr.product_code,d.discount, d.dated, d.quantity, d.sales_price, d.total_line, d.order_mode,o.invoice_no,t.description,d.date_time, pr.piecies_value FROM order_details d, orders o, transactions t,products pr WHERE o.store ='${store}' AND d.product_id=pr.id AND d.orders_id = o.id AND o.transact_id = t.id AND o.order_mode IN ("Sold","Returnin") AND d.dated BETWEEN '${dateFrom}' AND '${dateTo}'; `;
      } else {
        qry = `SELECT o.persons_id, d.id,d.qty_type, d.orders_id, pr.product_name,pr.selling_price,pr.cost_price,pr.product_code,d.discount, d.dated, d.quantity, d.sales_price, d.total_line,d.order_mode,o.invoice_no,t.description,d.date_time,pr.piecies_value FROM order_details d, orders o, transactions t,products pr  WHERE o.store ='${store}' AND d.product_id=pr.id AND d.orders_id = o.id  AND o.persons_id = '${Ledger}'  AND o.transact_id = t.id AND o.order_mode IN ("Sold","Returnin") AND d.dated BETWEEN '${dateFrom}' AND '${dateTo}'`;
        //  // console.log(Ledger)
      }
    } else if (SaType == "PURCHASE") {
      if (Ledger == "ALL") {
        qry = `SELECT o.persons_id, d.id,d.qty_type, d.orders_id, pr.product_name,pr.selling_price,pr.cost_price,pr.product_code,d.discount, d.dated, d.quantity, d.sales_price, d.total_line, d.order_mode,o.invoice_no,t.description,d.date_time, pr.piecies_value FROM order_details d, orders o, transactions t,products pr WHERE o.store ='${store}' AND d.product_id=pr.id AND d.orders_id = o.id AND o.transact_id = t.id AND o.order_mode IN ("Bought","Returnout") AND d.dated BETWEEN '${dateFrom}' AND '${dateTo}'; `;
      } else {
        qry = `SELECT o.persons_id, t.ord_id, d.id,d.qty_type, d.orders_id, pr.product_name,pr.selling_price,pr.cost_price,pr.product_code,d.discount, d.dated, d.quantity, d.sales_price, d.total_line,d.order_mode,o.invoice_no,t.description,d.date_time,pr.piecies_value FROM order_details d, orders o, transactions t,products pr  WHERE o.store ='${store}' AND d.product_id=pr.id AND d.orders_id = o.id  AND o.persons_id = '${Ledger}'  AND o.id = t.ord_id AND t.type='PA' AND o.order_mode IN ("Bought","Returnout") AND d.dated BETWEEN '${dateFrom}' AND '${dateTo}'`;
        //  // console.log(Ledger)
      }
    }

     console.log(qry);

    try {
      sequelize
        .query(qry, { type: sequelize.QueryTypes.SELECT })

        .then((results) => {
          //console.log("Query result:", results);
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

    //
  },
);

router.post("/api/v1/delOrder", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required.",
      });
    }

    const qry = `
      DELETE o, od, tr
      FROM orders o
      LEFT JOIN order_details od
        ON od.orders_id = o.id
      LEFT JOIN transactions tr
	      ON tr.ord_id = o.id
      WHERE o.id = :id
    `;

    await sequelize.query(qry, {
      replacements: { id },
      type: sequelize.QueryTypes.DELETE,
    });

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete order.",
      error: error.message,
    });
  }
});

router.post(
  "/api/v1/evacuaterec",
  verifyAdmin,
  authorizePermission("evacuate"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)
    // console.log(req.body);

    const schema = Joi.object({
      // store: Joi.number()
      //   .integer()
      //   .positive()
      //   .required()
      //   .messages({
      //     "number.base": "Please Select Store must ",
      //     "number.positive": "Invalid Please ",
      //     "any.required": "Please Select Store is required",
      //   }),

      // product: Joi.number()
      //   .integer()
      //   .positive()
      //   .required()
      //   .messages({
      //     "number.base": "Product ID must be a number",
      //     "number.positive": "Invalid Product ID",
      //     "any.required": "Please Select Product Name",
      //   }),

      // Ledger: Joi.number()
      //   .integer()
      //   .positive()
      //   .required()
      //   .messages({
      //     "number.base": "Customer ID must be a number",
      //     "number.positive": "Invalid Customer ID",
      //     "any.required": "Please Select Customer Name",
      //   }),

      dateTo: Joi.string().trim().min(3).required().messages({
        "any.only": "Please Select Date To",
        "any.required": "Please Select Date To",
      }),

      dateFrom: Joi.string().trim().required().messages({
        "any.only": "Please Select Date From",
        "any.required": "Please Select Date From",
      }),
    });

    // ===================== VALIDATE REQUEST =====================
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      convert: true,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((d) => d.message),
      });
    }

    // ===================== EXTRACT VALIDATED DATA =====================
    const {
      // store,
      //product,
      //Ledger,
      dateTo,
      dateFrom,
    } = value;

    let qry = ``;
             qry = `SELECT 
                        t.userid,
                        u.surname,
                        u.othername,
                        t.dated,
                        SUM(CASE 
                                WHEN t.type = 'CA' AND t.personid = '2' 
                                THEN t.credit_amt 
                                ELSE 0 
                            END) AS sales,

                        SUM(CASE 
                                WHEN t.type = 'CA' AND t.personid = '3' 
                                THEN t.debit_amt 
                                ELSE 0 
                            END) AS ri,

                        SUM(CASE 
                                WHEN t.type = 'CA' AND t.ledger_id = '6' 
                                THEN t.balance_amt 
                                ELSE 0 
                            END) AS bank,
                            
                            SUM(CASE 
                                WHEN t.TYPE = 'CA' AND t.ledger_id = '5' 
                                THEN t.balance_amt 
                                ELSE 0 
                            END) AS cash,
                            
                            SUM(CASE 
                                WHEN t.TYPE = 'CA' AND t.ca_id IN (5,6) 
                                THEN t.balance_amt 
                                ELSE 0 
                            END) AS deposite,
                            
                            SUM(CASE 
                                WHEN t.type = 'CA' AND t.ledger_id = '7' 
                                THEN t.debit_amt 
                                ELSE 0 
                            END) AS withdraw,
                            
                            SUM(CASE 
                                WHEN t.TYPE = 'CA' AND t.ledger_id IN (2,6,5,7,3) 
                                THEN t.balance_amt 
                                ELSE 0 
                            END) AS bal,
                            
                            SUM(CASE 
                                WHEN t.ledger_id ='2' AND t.type='CA' 
                                THEN t.discount 
                                ELSE 0 
                            END) AS dsc
                            

                    FROM transactions t, tblusers u  WHERE t.userid= u.id AND t.dated BETWEEN '${dateFrom}' AND '${dateTo}'
                    GROUP BY userid;
                  `;

                  console.log(qry);
    //  qry = `SELECT
    //           t.dated,
    //           t.description,
    //           t.type,
    //           t.discount,
    //           t.balance_amt
    //         FROM transactions t
    //         INNER JOIN tblledger ld
    //           ON t.ledger_id = ld.id
    //         WHERE t.dated BETWEEN '${dateFrom}' AND '${dateTo}'
    //           AND t.type = 'CA'
    //           AND t.ledger_id IN (5, 6)
    //           AND t.str_id = '${store}';
    //         `

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

    //
  },
);

router.post(
  "/api/v1/getpost",
  verifyAdmin,
  authorizePermission("post"),
  async (req, res) => {
    try {
      // ===================== VALIDATION SCHEMA =====================
      const schema = Joi.object({
        walletID: Joi.number().integer().positive().required().messages({
          "number.base": "Payment wallet must be a number",
          "number.positive": "Invalid payment wallet",
          "any.required": "Payment wallet is required",
        }),

        customerID: Joi.number().integer().positive().required().messages({
          "number.base": "Customer ID must be a number",
          "number.positive": "Invalid Customer ID",
          "any.required": "Customer ID is required",
        }),

        txtAmount: Joi.number().positive().required().messages({
          "number.base": "Amount must be numeric",
          "number.positive": "Amount must be greater than zero",
          "any.required": "Amount is required",
        }),

        txtDesc: Joi.string().trim().min(3).required().messages({
          "string.empty": "Description is required",
        }),

        posttype: Joi.string().valid("CREDIT", "DEBIT").required().messages({
          "any.only": "Post type must be CREDIT or DEBIT",
          "any.required": "Post type is required",
        }),

        customerName: Joi.string().trim().required(),

        walletText: Joi.string().trim().required(),
      });

      // ===================== VALIDATE REQUEST =====================
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        convert: true,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details.map((d) => d.message),
        });
      }

      // ===================== EXTRACT VALIDATED DATA =====================
      const {
        walletID,
        customerID,
        txtAmount,
        txtDesc,
        posttype,
        customerName,
        walletText,
      } = value;

      // ===================== BUSINESS RULES =====================
      if (walletID === customerID) {
        return res.status(400).json({
          success: false,
          message: "Wallet and Customer ledger cannot be the same",
        });
      }

      // ===================== SYSTEM VALUES =====================
      const usr_id = req.userDtl[0].id;
      const dateId = await getDateid.getDateID();

      const cashid = await getTransact.get1Col("la_id", "persons", walletID);

      // ===================== POSTING LOGIC =====================
      if (posttype === "DEBIT") {
        // First Leg – Credit Wallet (Cash Account)
        let desc = `Cash paid by ${customerName} via ${walletText} - ${txtDesc}`;

        await getTransact.ProcessCheckout(
          desc,
          walletID,
          "CA",
          0,
          txtAmount,
          walletID,
          usr_id,
          cashid,
          dateId,
          0,
          0,
          0,
        );

        // Second Leg – Debit Customer Ledger
        desc = `Cash paid by ${customerName} via ${walletText} - ${txtDesc}`;

        const TxID = await getTransact.ProcessCheckout(
          desc,
          customerID,
          "PA",

          txtAmount,
          0,
          walletID,
          usr_id,
          cashid,
          dateId,
          0,
          0,
          0,
        );
      }

      if (posttype === "CREDIT") {
        // First Leg – Debit Wallet (Cash Account)
        let desc = `Cash paid to ${customerName}`;

        await getTransact.ProcessCheckout(
          desc,
          walletID,
          "CA",
          txtAmount,
          0,
          cashid,
          usr_id,
          walletID,
          dateId,
          0,
          0,
          0,
        );

        // Second Leg – Credit Customer Ledger
        desc = `Cash paid to ${customerName} via ${walletText} - ${txtDesc}`;

        await getTransact.ProcessCheckout(
          desc,
          customerID,
          "PA",
          0,
          txtAmount,
          cashid,
          usr_id,
          walletID,
          dateId,
          0,
          0,
          0,
        );
      }

      // ===================== SUCCESS RESPONSE =====================
      return res.status(200).json({
        success: true,
        message: "Checkout completed successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Server error occurred while processing transaction",
      });
    }
  },
);

router.post(
  "/api/v1/getexpense",
  verifyAdmin,
  authorizePermission("expenses"),
  async (req, res) => {
    try {
      // ===================== VALIDATION SCHEMA =====================
      const schema = Joi.object({
        walletID: Joi.number().integer().positive().required().messages({
          "number.base": "Payment wallet must be a number",
          "number.positive": "Invalid payment wallet",
          "any.required": "Payment wallet is required",
        }),

        AccountID: Joi.number().integer().positive().required().messages({
          "number.base": "Customer ID must be a number",
          "number.positive": "Invalid Customer ID",
          "any.required": "Customer ID is required",
        }),

        txtAmount: Joi.number().positive().required().messages({
          "number.base": "Amount must be numeric",
          "number.positive": "Amount must be greater than zero",
          "any.required": "Amount is required",
        }),

        txtDesc: Joi.string().trim().min(3).required().messages({
          "string.empty": "Description is required",
        }),

        posttype: Joi.string().valid("CREDIT", "DEBIT").required().messages({
          "any.only": "Post type must be CREDIT or DEBIT",
          "any.required": "Post type is required",
        }),

        AccountName: Joi.string().trim().required(),

        walletText: Joi.string().trim().required(),
      });

      // ===================== VALIDATE REQUEST =====================
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        convert: true,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details.map((d) => d.message),
        });
      }

      // ===================== EXTRACT VALIDATED DATA =====================
      const {
        walletID,
        AccountID,
        txtAmount,
        txtDesc,
        posttype,
        AccountName,
        walletText,
      } = value;

      // ===================== BUSINESS RULES =====================
      if (walletID === AccountID) {
        return res.status(400).json({
          success: false,
          message: "Wallet and Customer ledger cannot be the same",
        });
      }

      // ===================== SYSTEM VALUES =====================
      const usr_id = req.userDtl[0].id;
      const dateId = await getDateid.getDateID();

      // ===================== POSTING LOGIC =====================
      if (posttype === "CREDIT") {
        const cashid = await getTransact.get1Col("la_id", "persons", walletID);
        // First Leg – Credit Wallet (Cash Account)
        let desc = `Remove from ${walletText} wallet Account to ${AccountName} Account - ${txtDesc}`;

        await getTransact.ProcessCheckout(
          desc,
          walletID,
          "CA",
          txtAmount,
          0,

          cashid,
          usr_id,
          walletID,
          dateId,
          0,
          0,
          0,
        );

        // Second Leg – Debit Customer Ledger
        desc = `Remove from ${walletText} wallet Account to ${AccountName} Account - ${txtDesc}`;
        const cashidA = await getTransact.get1Col(
          "la_id",
          "persons",
          AccountID,
        );
        await getTransact.ProcessCheckout(
          desc,
          AccountID,
          "CA",
          0,
          txtAmount,

          AccountID,
          usr_id,
          cashidA,
          dateId,
          0,
          0,
          0,
        );
      }

      if (posttype === "DEBIT") {
        // First Leg – Debit Wallet (Cash Account)
        let desc = `Return to ${walletText} wallet Account from ${AccountName} Account - ${txtDesc}`;
        const cashid = await getTransact.get1Col("la_id", "persons", walletID);
        await getTransact.ProcessCheckout(
          desc,
          walletID,
          "CA",
          0,
          txtAmount,

          cashid,
          usr_id,
          walletID,
          dateId,
          0,
          0,
          0,
        );

        // Second Leg – Credit Customer Ledger
        desc = `Return to ${walletText} wallet Account from ${AccountName} Account - ${txtDesc}`;
        const cashidA = await getTransact.get1Col(
          "la_id",
          "persons",
          AccountID,
        );
        await getTransact.ProcessCheckout(
          desc,
          AccountID,
          "CA",

          txtAmount,
          0,
          AccountID,
          usr_id,
          cashidA,
          dateId,
          0,
          0,
          0,
        );
      }

      // ===================== SUCCESS RESPONSE =====================
      return res.status(200).json({
        success: true,
        message: "Successful",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Server error occurred while processing transaction",
      });
    }
  },
);

router.post(
  "/api/v1/getcapital",
  verifyAdmin,
  authorizePermission("capital"),
  async (req, res) => {
    try {
      // ===================== VALIDATION SCHEMA =====================
      const schema = Joi.object({
        walletID: Joi.number().integer().positive().required().messages({
          "number.base": "Payment wallet must be a number",
          "number.positive": "Invalid payment wallet",
          "any.required": "Payment wallet is required",
        }),

        AccountID: Joi.number().integer().positive().required().messages({
          "number.base": "Customer ID must be a number",
          "number.positive": "Invalid Customer ID",
          "any.required": "Customer ID is required",
        }),

        txtAmount: Joi.number().positive().required().messages({
          "number.base": "Amount must be numeric",
          "number.positive": "Amount must be greater than zero",
          "any.required": "Amount is required",
        }),

        // txtDesc: Joi.string()
        //   .trim()
        //   .min(3)
        //   .required()
        //   .messages({
        //     "string.empty": "Description is required",
        //   }),

        // posttype: Joi.string()
        //   .valid("CREDIT", "DEBIT")
        //   .required()
        //   .messages({
        //     "any.only": "Post type must be CREDIT or DEBIT",
        //     "any.required": "Post type is required",
        //   }),

        AccountName: Joi.string().trim().required(),

        walletText: Joi.string().trim().required(),
      });

      // ===================== VALIDATE REQUEST =====================
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        convert: true,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details.map((d) => d.message),
        });
      }

      // ===================== EXTRACT VALIDATED DATA =====================
      const {
        walletID,
        AccountID,
        txtAmount,
        // txtDesc,
        // posttype,
        AccountName,
        walletText,
      } = value;

      // ===================== BUSINESS RULES =====================
      if (walletID === AccountID) {
        return res.status(400).json({
          success: false,
          message: "Wallet and Customer ledger cannot be the same",
        });
      }

      // ===================== SYSTEM VALUES =====================
      const usr_id = req.userDtl[0].id;
      const dateId = await getDateid.getDateID();
      const cashid = await getTransact.get1Col("la_id", "persons", walletID);

      // ===================== POSTING LOGIC =====================
      //if (posttype === "CREDIT") {
      // First Leg – Credit Wallet (Cash Account)
      //let desc = `Remove from ${walletText} wallet Account to ${AccountName} Account - ${txtDesc}`;
      let desc = `Remove from  ${AccountName} Account to ${walletText} wallet Account`;

      await getTransact.ProcessCheckout(
        desc,
        walletID,
        "CA",
        0,
        txtAmount,
        cashid,
        usr_id,
        walletID,
        dateId,
        0,
        0,
        0,
      );

      // Second Leg – Debit Customer Ledger
      desc = `Remove from  ${AccountName} Account to ${walletText} wallet Account`;

      await getTransact.ProcessCheckout(
        desc,
        AccountID,
        "CA",
        txtAmount,
        0,
        cashid,
        usr_id,
        walletID,
        dateId,
        0,
        0,
        0,
      );

      // }

      // if (posttype === "DEBIT") {
      //   // First Leg – Debit Wallet (Cash Account)
      //   let desc = `Return to ${walletText} wallet Account from ${AccountName} Account - ${txtDesc}`;

      //   await getTransact.ProcessCheckout(
      //     desc,
      //     walletID,
      //     "CA",
      //      0,
      //     txtAmount,

      //     cashid,
      //     usr_id,
      //     walletID,
      //     dateId,
      //     0,
      //     0,
      //     0
      //   );

      //   // Second Leg – Credit Customer Ledger
      //   desc = `Return to ${walletText} wallet Account from ${AccountName} Account - ${txtDesc}`;

      //   await getTransact.ProcessCheckout(
      //     desc,
      //     AccountID,
      //     "CA",

      //     txtAmount,
      //     0,
      //     cashid,
      //     usr_id,
      //     walletID,
      //     dateId,
      //     0,
      //     0,
      //     0
      //   );
      // }

      // ===================== SUCCESS RESPONSE =====================
      return res.status(200).json({
        success: true,
        message: "Successful",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Server error occurred while processing transaction",
      });
    }
  },
);

router.post(
  "/api/v1/getcashbook",
  verifyAdmin,
  authorizePermission("cashbook"),
  async (req, res) => {
    try {
      // ===================== VALIDATION SCHEMA =====================
      const schema = Joi.object({
        walletID: Joi.number().integer().positive().required().messages({
          "number.base": "Payment wallet must be a number",
          "number.positive": "Invalid payment wallet",
          "any.required": "Payment wallet is required",
        }),

        AccountID: Joi.number().integer().positive().required().messages({
          "number.base": "Customer ID must be a number",
          "number.positive": "Invalid Customer ID",
          "any.required": "Customer ID is required",
        }),

        txtAmount: Joi.number().positive().required().messages({
          "number.base": "Amount must be numeric",
          "number.positive": "Amount must be greater than zero",
          "any.required": "Amount is required",
        }),

        // txtDesc: Joi.string()
        //   .trim()
        //   .min(3)
        //   .required()
        //   .messages({
        //     "string.empty": "Description is required",
        //   }),

        posttype: Joi.string().valid("CREDIT", "DEBIT").required().messages({
          "any.only": "Post type must be CREDIT or DEBIT",
          "any.required": "Post type is required",
        }),

        AccountName: Joi.string().trim().required(),

        walletText: Joi.string().trim().required(),
      });

      // ===================== VALIDATE REQUEST =====================
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        convert: true,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details.map((d) => d.message),
        });
      }

      // ===================== EXTRACT VALIDATED DATA =====================
      const {
        walletID,
        AccountID,
        txtAmount,
        // txtDesc,
        posttype,
        AccountName,
        walletText,
      } = value;

      // ===================== BUSINESS RULES =====================
      if (walletID === AccountID) {
        return res.status(400).json({
          success: false,
          message: "Wallet and Customer ledger cannot be the same",
        });
      }

      // ===================== SYSTEM VALUES =====================
      const usr_id = req.userDtl[0].id;
      const dateId = await getDateid.getDateID();
      const cashid = await getTransact.get1Col("la_id", "persons", walletID);

      // ===================== POSTING LOGIC =====================
      if (posttype === "CREDIT") {
        let desc = `Amount Withdraw from  ${AccountName}`;
        // Second Leg – Debit Customer Ledger

        await getTransact.ProcessCheckout(
          desc,
          AccountID,
          "CA",
          txtAmount,
          0,
          5,
          usr_id,
          5,
          dateId,
          0,
          0,
          0,
        );

        // First Leg – Credit Wallet (Cash Account)
        //let desc = `Remove from ${walletText} wallet Account to ${AccountName} Account - ${txtDesc}`;
        desc = `Amount Saved to ${walletText}`;

        await getTransact.ProcessCheckout(
          desc,
          walletID,
          "CA",
          0,
          txtAmount,
          cashid,
          usr_id,
          walletID,
          dateId,
          0,
          0,
          0,
        );
      }

      if (posttype === "DEBIT") {
        // First Leg – Debit Wallet (Cash Account)
        let desc = `Amount Saved to ${AccountName}`;

        await getTransact.ProcessCheckout(
          desc,
          AccountID,
          "CA",
          0,
          txtAmount,

          5,
          usr_id,
          5,
          dateId,
          0,
          0,
          0,
        );

        // Second Leg – Credit Customer Ledger
        desc = `Amount Withdraw from  ${walletText}`;

        await getTransact.ProcessCheckout(
          desc,
          walletID,
          "CA",
          txtAmount,
          0,

          cashid,
          usr_id,
          walletID,
          dateId,
          0,
          0,
          0,
        );
      }

      // ===================== SUCCESS RESPONSE =====================
      return res.status(200).json({
        success: true,
        message: "Successful",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Server error occurred while processing transaction",
      });
    }
  },
);

router.post(
  "/api/v1/postotherincome",
  verifyAdmin,
  authorizePermission("otherincome"),
  async (req, res) => {
    try {
      // ===================== VALIDATION SCHEMA =====================
      const schema = Joi.object({
        walletID: Joi.number().integer().positive().required().messages({
          "number.base": "Payment wallet must be a number",
          "number.positive": "Invalid payment wallet",
          "any.required": "Payment wallet is required",
        }),

        // AccountID: Joi.number()
        //   .integer()
        //   .positive()
        //   .required()
        //   .messages({
        //     "number.base": "Customer ID must be a number",
        //     "number.positive": "Invalid Customer ID",
        //     "any.required": "Customer ID is required",
        //   }),

        txtAmount: Joi.number().positive().required().messages({
          "number.base": "Amount must be numeric",
          "number.positive": "Amount must be greater than zero",
          "any.required": "Amount is required",
        }),

        txtDesc: Joi.string().trim().min(3).required().messages({
          "string.empty": "Description is required",
        }),

        // posttype: Joi.string()
        //   .valid("CREDIT", "DEBIT")
        //   .required()
        //   .messages({
        //     "any.only": "Post type must be CREDIT or DEBIT",
        //     "any.required": "Post type is required",
        //   }),

        // AccountName: Joi.string()
        //   .trim()
        //   .required(),

        walletText: Joi.string().trim().required(),
      });

      // ===================== VALIDATE REQUEST =====================
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        convert: true,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details.map((d) => d.message),
        });
      }

      // ===================== EXTRACT VALIDATED DATA =====================
      const {
        walletID,
        // AccountID,
        txtAmount,
        txtDesc,
        // posttype,
        //AccountName,
        walletText,
      } = value;

      // ===================== BUSINESS RULES =====================
      // if (walletID === AccountID) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Wallet and Customer ledger cannot be the same",
      //   });
      // }

      // ===================== SYSTEM VALUES =====================
      const usr_id = req.userDtl[0].id;
      const dateId = await getDateid.getDateID();
      const cashid = await getTransact.get1Col("la_id", "persons", walletID);

      // ===================== POSTING LOGIC =====================
      //if (posttype === "CREDIT") {
      // First Leg – Credit Wallet (Cash Account)
      //let desc = `Remove from ${walletText} wallet Account to ${AccountName} Account - ${txtDesc}`;
      let desc = `Other Income to ${walletText} wallet Account`;

      await getTransact.ProcessCheckout(
        desc,
        walletID,
        "CA",
        0,
        txtAmount,
        5,
        usr_id,
        5,
        dateId,
        0,
        0,
        0,
      );

      // Second Leg – Debit Customer Ledger
      desc = txtDesc;
      const cashidA = await getTransact.get1Col("la_id", "persons", 6);
      await getTransact.ProcessCheckout(
        desc,
        6,
        "CA",
        txtAmount,
        0,
        6,
        usr_id,
        cashidA,
        dateId,
        0,
        0,
        0,
      );

      // }

      // if (posttype === "DEBIT") {
      //   // First Leg – Debit Wallet (Cash Account)
      //   let desc = `Return to ${walletText} wallet Account from ${AccountName} Account - ${txtDesc}`;

      //   await getTransact.ProcessCheckout(
      //     desc,
      //     walletID,
      //     "CA",
      //      0,
      //     txtAmount,

      //     cashid,
      //     usr_id,
      //     walletID,
      //     dateId,
      //     0,
      //     0,
      //     0
      //   );

      //   // Second Leg – Credit Customer Ledger
      //   desc = `Return to ${walletText} wallet Account from ${AccountName} Account - ${txtDesc}`;

      //   await getTransact.ProcessCheckout(
      //     desc,
      //     AccountID,
      //     "CA",

      //     txtAmount,
      //     0,
      //     cashid,
      //     usr_id,
      //     walletID,
      //     dateId,
      //     0,
      //     0,
      //     0
      //   );
      // }

      // ===================== SUCCESS RESPONSE =====================
      return res.status(200).json({
        success: true,
        message: "Successful",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Server error occurred while processing transaction",
      });
    }
  },
);

router.post(
  "/api/v1/postprev",
  verifyAdmin,
  authorizePermission("prev"),
  async (req, res) => {
    try {
      // ===================== VALIDATION SCHEMA =====================
      const schema = Joi.object({
        // walletID: Joi.number()
        //   .integer()
        //   .positive()
        //   .required()
        //   .messages({
        //     "number.base": "Payment wallet must be a number",
        //     "number.positive": "Invalid payment wallet",
        //     "any.required": "Payment wallet is required",
        //   }),

        customerID: Joi.number().integer().positive().required().messages({
          "number.base": "Customer ID must be a number",
          "number.positive": "Invalid Customer ID",
          "any.required": "Customer ID is required",
        }),

        txtAmount: Joi.number().positive().required().messages({
          "number.base": "Amount must be numeric",
          "number.positive": "Amount must be greater than zero",
          "any.required": "Amount is required",
        }),

        // txtDesc: Joi.string()
        //   .trim()
        //   .min(3)
        //   .required()
        //   .messages({
        //     "string.empty": "Description is required",
        //   }),

        posttype: Joi.string().valid("CREDIT", "DEBIT").required().messages({
          "any.only": "Post type must be CREDIT or DEBIT",
          "any.required": "Post type is required",
        }),

        customerName: Joi.string().trim().required(),

        // walletText: Joi.string()
        //   .trim()
        //   .required(),
      });

      // ===================== VALIDATE REQUEST =====================
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        convert: true,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details.map((d) => d.message),
        });
      }

      // ===================== EXTRACT VALIDATED DATA =====================
      const {
        //walletID,
        customerID,
        txtAmount,
        //txtDesc,
        posttype,
        customerName,
        //walletText,
      } = value;

      // ===================== BUSINESS RULES =====================
      // if (walletID === AccountID) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Wallet and Customer ledger cannot be the same",
      //   });
      // }

      // ===================== SYSTEM VALUES =====================
      const usr_id = req.userDtl[0].id;
      const dateId = await getDateid.getDateID();
      const cashid = await getTransact.get1Col("la_id", "persons", customerID);

      // ===================== POSTING LOGIC =====================
      if (posttype === "CREDIT") {
        // First Leg – Credit Wallet (Cash Account)
        //let desc = `Remove from ${walletText} wallet Account to ${AccountName} Account - ${txtDesc}`;
        let desc = `Previous Balance for ${customerName}`;

        await getTransact.ProcessCheckout(
          desc,
          customerID,
          "PA",
          0,
          txtAmount,
          10,
          usr_id,
          2,
          dateId,
          0,
          0,
          0,
        );
      }

      if (posttype === "DEBIT") {
        // First Leg – Debit Wallet (Cash Account)
        let desc = `Return to ${customerName} Account `;

        await getTransact.ProcessCheckout(
          desc,
          customerID,
          "PA",
          txtAmount,
          0,
          10,
          usr_id,
          2,
          dateId,
          0,
          0,
          0,
        );
      }

      // ===================== SUCCESS RESPONSE =====================
      return res.status(200).json({
        success: true,
        message: "Successful",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Server error occurred while processing transaction",
      });
    }
  },
);

router.post("/api/v1/gettransact", verifyAdmin, async (req, res, next) => {
  // console.log(req.body);

  const {
    payVia,
    AmtPaid,
    CartType,
    orderMode,
    customer,
    cart,
    TAmtPayable,
    TDsc,
    AllPays,
  } = req.body;

  const paymentSchema = Joi.object({
    payVia: Joi.number().integer().positive().required().messages({
      "number.base": "Payment wallet must be a number",
      "number.positive": "Invalid payment wallet",
      "any.required": "Payment wallet is required",
    }),

    AmtPaid: Joi.number().min(0).precision(2).required().messages({
      "number.base": "Amount paid must be a number",
      "number.min": "Amount cannot be negative",
      "any.required": "Amount paid is required",
    }),
  });

  const schema = Joi.object({
    cart: Joi.array().min(1).required().messages({
      "array.base": "Cart must be an array",
      "array.min": "Cart cannot be empty",
    }),

    // customer: Joi.array()
    // .min(1)
    // .required()
    // .messages({
    //   "array.base": "Customer Data must be an array",
    //   "array.min": "Customer Data cannot be empty"
    // }),

    customer: Joi.object().allow(null, "").optional(),

    AllPays: Joi.array()
      .items(paymentSchema)
      .min(1)
      .unique("payVia") // prevents duplicate wallets
      .required()
      .messages({
        "array.base": "Payments must be an array",
        "array.min": "At least one payment is required",
        "array.unique": "Duplicate payment wallets are not allowed",
      }),

    CartType: Joi.string()
      //.valid("CUSTOMER", "WALKIN")
      .required(),

    orderMode: Joi.string()
      // .valid("Sold", "Held")
      .required(),

    TAmtPayable: Joi.number().positive().required(),

    TDsc: Joi.number().min(0).required(),
  });

  //const { error } = schema.validate({ payVia, AmtPaid, CartType, orderMode });
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message),
    });
  }

  // if (error) {
  //   return res.status(400).json({ success: false, message: error.details[0].message });
  // }

  const str_id = req.userDtl[0].store_id;
  // const or_mode = "stockin";
  const d = new Date().toISOString().split("T")[0];
  const dt = new Date();
  const usr_id = req.userDtl[0].id;
  let resData = null;

  try {
    // STEP 2: Insert into orders table
    const [insertResult] = await sequelize.query(
      `INSERT INTO orders (persons_id, invoice_no, order_mode, dates, store, users_id, transact_id)
              VALUES (?, '0', ?, ?, ?, ?, '0')`,
      {
        replacements: [customer.id, orderMode, d, str_id, usr_id],
        type: sequelize.QueryTypes.INSERT,
      },
    );

    const orMax = insertResult; // Inserted order ID
    //console.log(orMax);

    // STEP 3: Update invoice number
    const inv_no = 12000 + Number(orMax);

    await sequelize.query(`UPDATE orders SET invoice_no = ? WHERE id = ?`, {
      replacements: [inv_no, orMax],
      type: sequelize.QueryTypes.UPDATE,
    });

    if (CartType === "CUSTOMER") {
      //     $typez ="RECEIPT";
      //==================== First Leg =====================
      let desc = `Sold to ${customer.full_name} On Credit `;
      let ca_id = 0;

      //const  penalty = addbal * cost;
      const dateId = await getDateid.getDateID();

      const TxID = await getTransact.ProcessCheckout(
        desc,
        customer.id,
        "PA",
        0,
        TAmtPayable,
        0,
        usr_id,
        2,
        dateId,
        orMax,
        TDsc,
        0,
      );

      await sequelize.query(`UPDATE orders SET transact_id = ? WHERE id = ?`, {
        replacements: [TxID, orMax],
        type: sequelize.QueryTypes.UPDATE,
      });

      desc = `Sales Ledger Debited For ${customer.full_name}`;

      await getTransact.ProcessCheckout(
        desc,
        2,
        "CA",
        TAmtPayable,
        0,
        0,
        usr_id,
        2,
        dateId,
        orMax,
        TDsc,
        0,
      );

      //===========================PAYMENT POST ================================

      for (let item of AllPays) {
        //console.log(item.AmtPaid);
        //AmtPaid = Number(item.AmtPaid);

        const cashid = await getTransact.get1Col(
          "la_id",
          "persons",
          item.payVia,
        );
        let desc = `Cash Paid By ${customer.full_name} Via ${item.payViaText}`;
        let TDsc = 0;

        await getTransact.ProcessCheckout(
          desc,
          item.payVia,
          "CA",
          0,
          Number(item.AmtPaid),
          cashid,
          usr_id,
          cashid,
          dateId,
          orMax,
          TDsc,
          0,
        );

        await getTransact.ProcessCheckout(
          desc,
          customer.id,
          "PA",
          Number(item.AmtPaid),
          0,
          0,
          usr_id,
          cashid,
          dateId,
          orMax,
          TDsc,
          0,
        );
      }

      for (let item of cart) {
        // let QtyType = item.prdtType;
        let QtyType = item.prdtType; // e.g. "BOX"

        const selectedUnit = item.units.find(
          (u) => u.unit_measure === QtyType.toUpperCase(),
        );

        if (!selectedUnit) {
          // console.log("Unit not found for", item.product_name);
          continue;
        }

        let BaseQty = Number(item.qty * item.unitsInSelected);
        let Qty = Number(item.qty);
        const costPrice = Number(selectedUnit.costprice);
        const unit_price = Number(selectedUnit.unitprice);
        const sellPrice = Number(item.price);
        const discount = Number(item.discount) || 0;
        //const piecesValue = Number(item.piecies_value);
        let sellp = 0;
        sellp = Qty * sellPrice - discount;

        // Normalize quantity for PIECES
        // if (item.prdtType === "pieces" && piecesValue > 0) {
        //   Qty = Qty / piecesValue;
        //   QtyType = "PIECES";
        //   sellp = Qty * sellPrice * piecesValue - discount;
        // }

        // Calculations (always use normalized Qty)
        const costp = Qty * costPrice;

        const gain = sellp - costp;

        const orderMode = "Sold";
        const stk_bal = -BaseQty;
        const qtyBal = Number(item.qbal) - BaseQty;
        const stkBalVal = -sellp;

        //console.log({ Qty, sellp, costp, gain });

        await sequelize.query(
          `INSERT INTO order_details (
                            orders_id, product_id, quantity, sales_price, discount, total_line, gain,
                            unit_price, time_id, basket_count, dated, order_mode, stock_bal, qty_bal,
                            vats_amount, date_time, total_costline, manifacture_date, expire_date,
                            commisn_amt, stock_bal_value, qty_type
                          )
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          {
            replacements: [
              orMax, // orders_id
              item.id, // product_id
              item.qty, // ✅ normalized quantity
              sellPrice, // sales_price
              discount, // discount
              sellp, // total_line
              gain, // gain
              unit_price,
              dateId,
              1,
              d,
              orderMode,
              stk_bal,
              qtyBal,
              0,
              dt,
              costp,
              0,
              0,
              0,
              stkBalVal,
              QtyType,
            ],
            type: sequelize.QueryTypes.INSERT,
          },
        );
      }

      const ledgerResult = await sequelize.query(
        `SELECT SUM(balance_amt) AS bal FROM transactions WHERE personid=?`,
        {
          replacements: [customer.id],
          type: sequelize.QueryTypes.SELECT,
        },
      );

      // Extract the actual balance number
      const LedgerBal = ledgerResult[0]?.bal || 0;
      const staffUser = req.userDtl[0].surname + " " + req.userDtl[0].othername;

      resData = {
        ...req.body,
        LedgerBal,
        staffUser,
        InvNo: inv_no,
      };

      // console.log(resData);

      // return resData
    }

    //console.log(resData)
    return res.status(200).json({
      success: true,
      message: "check Out Successfull",
      respData: resData,
      // order_id: orMax,
      // invoice_no: inv_no
    });
  } catch (error) {
    //console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
});

router.post("/api/v1/gettransactRI", verifyAdmin, async (req, res, next) => {
  //console.log(req.body)

  const {
    payVia,
    AmtPaid,
    CartType,
    orderMode,
    customer,
    cart,
    TAmtPayable,
    TDsc,
    AllPays,
  } = req.body;

  const paymentSchema = Joi.object({
    payVia: Joi.number().integer().positive().required().messages({
      "number.base": "Payment wallet must be a number",
      "number.positive": "Invalid payment wallet",
      "any.required": "Payment wallet is required",
    }),

    AmtPaid: Joi.number().positive().precision(2).required().messages({
      "number.base": "Amount paid must be a number",
      "number.positive": "Amount must be greater than zero",
      "any.required": "Amount paid is required",
    }),
  });

  const schema = Joi.object({
    cart: Joi.array().min(1).required().messages({
      "array.base": "Cart must be an array",
      "array.min": "Cart cannot be empty",
    }),

    // customer: Joi.array()
    // .min(1)
    // .required()
    // .messages({
    //   "array.base": "Customer Data must be an array",
    //   "array.min": "Customer Data cannot be empty"
    // }),

    customer: Joi.object().allow(null, "").optional(),

    // AllPays: Joi.array()
    //   .items(paymentSchema)
    //   .min(1)
    //   .unique("payVia") // prevents duplicate wallets
    //   .required()
    //   .messages({
    //     "array.base": "Payments must be an array",
    //     "array.min": "At least one payment is required",
    //     "array.unique": "Duplicate payment wallets are not allowed"
    //   }),

    CartType: Joi.string()
      //.valid("CUSTOMER", "WALKIN")
      .required(),

    orderMode: Joi.string()
      // .valid("Sold", "Held")
      .required(),

    TAmtPayable: Joi.number().positive().required(),

    TDsc: Joi.number().min(0).required(),
  });

  //const { error } = schema.validate({ payVia, AmtPaid, CartType, orderMode });
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message),
    });
  }

  // if (error) {
  //   return res.status(400).json({ success: false, message: error.details[0].message });
  // }

  const str_id = req.userDtl[0].store_id;
  // const or_mode = "stockin";
  const d = new Date().toISOString().split("T")[0];
  const dt = new Date();
  const usr_id = req.userDtl[0].id;

  try {
    // STEP 2: Insert into orders table
    const [insertResult] = await sequelize.query(
      `INSERT INTO orders (persons_id, invoice_no, order_mode, dates, store, users_id, transact_id)
       VALUES (?, '0', ?, ?, ?, ?, '0')`,
      {
        replacements: [customer.id, orderMode, d, str_id, usr_id],
        type: sequelize.QueryTypes.INSERT,
      },
    );

    const orMax = insertResult; // Inserted order ID

    // STEP 3: Update invoice number
    const inv_no = 12000 + Number(orMax);

    await sequelize.query(`UPDATE orders SET invoice_no = ? WHERE id = ?`, {
      replacements: [inv_no, orMax],
      type: sequelize.QueryTypes.UPDATE,
    });

    if (CartType === "RETURNIN") {
      //     $typez ="RECEIPT";
      //==================== First Leg =====================
      let desc = `Return Goods From ${customer.full_name} `;
      let ca_id = 0;

      //const  penalty = addbal * cost;
      const dateId = await getDateid.getDateID();

      await getTransact.ProcessCheckout(
        desc,
        customer.id,
        "PA",
        TAmtPayable,
        0,
        0,
        usr_id,
        3,
        dateId,
        orMax,
        TDsc,
        0,
      );

      desc = `RI Ledger Credited For ${customer.full_name}`;

      await getTransact.ProcessCheckout(
        desc,
        3,
        "CA",
        0,
        TAmtPayable,
        0,
        usr_id,
        3,
        dateId,
        orMax,
        TDsc,
        0,
      );

      for (let item of cart) {
        let QtyType = item.prdtType;

        const selectedUnit = item.units.find(
          (u) => u.unit_measure === QtyType.toUpperCase(),
        );

        if (!selectedUnit) {
          // console.log("Unit not found for", item.product_name);
          continue;
        }

        let BaseQty = Number(item.qty * item.unitsInSelected);
        let Qty = Number(item.qty);
        const costPrice = Number(selectedUnit.costprice);
        const unit_price = Number(selectedUnit.unitprice);
        const sellPrice = Number(item.price);
        const discount = Number(item.discount) || 0;

        let sellp = 0;
        sellp = Qty * sellPrice;

        // Calculations (always use normalized Qty)
        const costp = Qty * costPrice;

        let gain = sellp - costp;

        let qty_bal = 0;
        // let costp = Number( item.qty * item.cost_price);
        // sellp = Number( item.qty * item.price);
        // let gain = sellp - costp;
        let orderMode = "Returnin";
        let stk_bal = BaseQty;
        const qtyBal = Number(item.qbal) + BaseQty;
        gain = -1 * gain;
        let stkBalVal = -sellp;

        const [insertDetail] = await sequelize.query(
          `INSERT INTO order_details (
                    orders_id, product_id, quantity, sales_price, discount, total_line, gain,
                    unit_price, time_id, basket_count, dated, order_mode, stock_bal, qty_bal,
                    vats_amount, date_time, total_costline, manifacture_date, expire_date,
                    commisn_amt, stock_bal_value,qty_type
                  )
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
          {
            replacements: [
              orMax, // orders_id
              item.id, // product_id
              item.qty, // quantity
              item.price, // sales_price
              item.discount, // discount
              sellp, // total_line
              gain, // gain
              unit_price, // unit_price
              dateId, // time_id
              1, // basket_count (fixed)
              d, // dated
              orderMode, // order_mode
              stk_bal, // stock_bal
              qtyBal, // qty_bal (fixed)
              0, // vats_amount
              dt, // date_time
              costp, // total_costline
              0, // manifacture_date
              0, // expire_date
              0, // commisn_amt
              stkBalVal, // stock_bal_value
              QtyType, // stock_bal_value
            ],
            type: sequelize.QueryTypes.INSERT,
          },
        );
      }
    }

    if (CartType === "RETURNOUT") {
      //     $typez ="RECEIPT";
      //==================== First Leg =====================
      let desc = `Return Goods To ${customer.full_name} `;
      let ca_id = 0;

      //const  penalty = addbal * cost;
      const dateId = await getDateid.getDateID();

      await getTransact.ProcessCheckout(
        desc,
        customer.id,
        "PA",
        0,
        TAmtPayable,
        0,
        usr_id,
        4,
        dateId,
        orMax,
        TDsc,
        0,
      );

      desc = `RO Ledger Debited For ${customer.full_name}`;

      await getTransact.ProcessCheckout(
        desc,
        4,
        "CA",
        TAmtPayable,
        0,
        0,
        usr_id,
        4,
        dateId,
        orMax,
        TDsc,
        0,
      );

      // for (let item of AllPays) {
      //     //console.log(item.AmtPaid);
      //     //AmtPaid = Number(item.AmtPaid);

      //    const cashid = await getTransact.get1Col("la_id","persons",item.payVia);
      //     let desc = `Cash Paid By ${customer.full_name} Via ${item.payViaText}`;
      //     let TDsc =0;

      //     await getTransact.ProcessCheckout(desc, 0, "CA",  0, Number(item.AmtPaid), cashid, usr_id, cashid, dateId, 0,TDsc,0);

      //      await getTransact.ProcessCheckout(desc, customer.id, "PA",  Number(item.AmtPaid), 0, 0, usr_id, cashid, dateId, 0,TDsc,0);

      //   }

      for (let item of cart) {
        let QtyType = item.prdtType;

        const selectedUnit = item.units.find(
          (u) => u.unit_measure === QtyType.toUpperCase(),
        );

        if (!selectedUnit) {
          //console.log("Unit not found for", item.product_name);
          continue;
        }

        let BaseQty = Number(item.qty * item.unitsInSelected);
        let Qty = Number(item.qty);
        const costPrice = Number(selectedUnit.costprice);
        const unit_price = Number(selectedUnit.unitprice);
        const sellPrice = Number(item.price);
        const discount = Number(item.discount) || 0;

        let sellp = 0;
        let costp = 0;
        sellp = Qty * sellPrice;
        costp = Qty * costPrice;

        //let gain = sellp - costp;
        let gain = 0;
        let orderMode = "Returnout";
        let stk_bal = -BaseQty;
        let qtyBal = Number(item.qbal - BaseQty);
        let stkBalVal = -sellp;

        //========================

        const [insertDetail] = await sequelize.query(
          `INSERT INTO order_details (
                    orders_id, product_id, quantity, sales_price, discount, total_line, gain,
                    unit_price, time_id, basket_count, dated, order_mode, stock_bal, qty_bal,
                    vats_amount, date_time, total_costline, manifacture_date, expire_date,
                    commisn_amt, stock_bal_value,qty_type
                  )
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
          {
            replacements: [
              orMax, // orders_id
              item.id, // product_id
              item.qty, // quantity
              item.price, // sales_price
              item.discount, // discount
              sellp, // total_line
              gain, // gain
              unit_price, // unit_price
              dateId, // time_id
              1, // basket_count (fixed)
              d, // dated
              orderMode, // order_mode
              stk_bal, // stock_bal
              qtyBal, // qty_bal (fixed)
              0, // vats_amount
              dt, // date_time
              costp, // total_costline
              0, // manifacture_date
              0, // expire_date
              0, // commisn_amt
              stkBalVal, // stock_bal_value
              QtyType, // stock_bal_value
            ],
            type: sequelize.QueryTypes.INSERT,
          },
        );
      }
    }

    if (CartType === "SUPPLIERS") {
      //     $typez ="RECEIPT";
      //==================== First Leg =====================
      let desc = `Bought From  ${customer.full_name} `;
      let ca_id = 0;

      //const  penalty = addbal * cost;
      const dateId = await getDateid.getDateID();

      await getTransact.ProcessCheckout(
        desc,
        customer.id,
        "PA",
        TAmtPayable,
        0,
        0,
        usr_id,
        1,
        dateId,
        orMax,
        TDsc,
        0,
      );

      desc = `Puchase Ledger Credited For ${customer.full_name}`;

      await getTransact.ProcessCheckout(
        desc,
        1,
        "CA",
        0,
        TAmtPayable,
        0,
        usr_id,
        1,
        dateId,
        orMax,
        TDsc,
        0,
      );

      for (let item of cart) {
        let QtyType = item.prdtType;

        const selectedUnit = item.units.find(
          (u) => u.unit_measure === QtyType.toUpperCase(),
        );

        if (!selectedUnit) {
          // console.log("Unit not found for", item.product_name);
          continue;
        }

        let BaseQty = Number(item.qty * item.unitsInSelected);
        let Qty = Number(item.qty);
        const costPrice = Number(selectedUnit.costprice);
        const unit_price = Number(selectedUnit.unitprice);
        const sellPrice = Number(item.price);
        const discount = Number(item.discount) || 0;

        let sellp = 0;
        let costp = 0;
        sellp = Qty * sellPrice;
        costp = Qty * costPrice;

        let gain = sellp - costp;
        let orderMode = "Bought";
        let stk_bal = BaseQty;
        let qtyBal = Number(item.qbal) + BaseQty;
        let stkBalVal = sellp;

        const [insertDetail] = await sequelize.query(
          `INSERT INTO order_details (
                    orders_id, product_id, quantity, sales_price, discount, total_line, gain,
                    unit_price, time_id, basket_count, dated, order_mode, stock_bal, qty_bal,
                    vats_amount, date_time, total_costline, manifacture_date, expire_date,
                    commisn_amt, stock_bal_value,qty_type
                  )
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
          {
            replacements: [
              orMax, // orders_id
              item.id, // product_id
              item.qty, // quantity
              item.price, // sales_price
              item.discount, // discount
              sellp, // total_line
              gain, // gain
              unit_price, // unit_price
              dateId, // time_id
              1, // basket_count (fixed)
              d, // dated
              orderMode, // order_mode
              stk_bal, // stock_bal
              qtyBal, // qty_bal (fixed)
              0, // vats_amount
              dt, // date_time
              costp, // total_costline
              0, // manifacture_date
              0, // expire_date
              0, // commisn_amt
              stkBalVal, // stock_bal_value
              QtyType, // stock_bal_value
            ],
            type: sequelize.QueryTypes.INSERT,
          },
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Successfull",
      // order_id: orMax,
      // invoice_no: inv_no
    });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
});

router.get(
  "/api/v1/stockout",
  verifyAdmin,
  authorizePermission("stockout"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)
    const miniVal = req.query.mv;

    try {
      sequelize
        .query(
          `   SELECT 
                s.stk,
                pr.id,
                pr.product_name,
                pr.product_code,

                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'unit_measure', u.unit_measure,
                        'pieces_in', u.pieces_in,
                        'unitprice', u.unitprice,
                        'costprice', u.costprice
                    )
                ) AS units

            FROM products pr

            -- Stock calculation
            JOIN (
                SELECT 
                    d.product_id,
                    SUM(d.stock_bal) AS stk
                FROM order_details d
                JOIN orders o 
                    ON d.orders_id = o.id
                WHERE o.store = '1'
                GROUP BY d.product_id
            ) s 
                ON s.product_id = pr.id

            -- Units
            LEFT JOIN tblunit u 
                ON u.product_id = pr.id

            GROUP BY pr.id

            HAVING s.stk <= ${miniVal};
                `,
          { type: sequelize.QueryTypes.SELECT },
        )

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
      // console.log(error);
      res.status(200).json({
        success: false,
        message: error,
      });
    }

    //
  },
);

router.get(
  "/api/v1/allinv",
  verifyAdmin,
  authorizePermission("all_inventory"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)

    try {
      sequelize
        .query(
          `    SELECT 
                  s.stk,
                  pr.id,
                  pr.product_name,
                  pr.product_code,

                  JSON_ARRAYAGG(
                    JSON_OBJECT(
                      'unit_measure', u.unit_measure,
                      'pieces_in', u.pieces_in,
                      'unitprice', u.unitprice,
                      'costprice', u.costprice
                    )
                  ) AS units

                FROM products pr

                -- ✅ Correct stock calculation first
                JOIN (
                  SELECT 
                    d.product_id,
                    SUM(d.stock_bal) AS stk
                  FROM order_details d
                  JOIN orders o ON d.orders_id = o.id
                  WHERE o.store = '1'
                  GROUP BY d.product_id
                ) s ON s.product_id = pr.id

                -- Units join AFTER aggregation
                LEFT JOIN tblunit u ON u.product_id = pr.id

                GROUP BY pr.id;
                `,
          { type: sequelize.QueryTypes.SELECT },
        )

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
      //console.log(error);
      res.status(200).json({
        success: false,
        message: error,
      });
    }

    //
  },
);

router.get("/api/v1/allpinvoice", verifyAdmin, async (req, res) => {
  //console.log(req.userDtl[0].id)
  let pid = req.query.pid;
  //console.log(pid)

  try {
    sequelize
      .query(
        `
                      SELECT 
                        d.orders_id,
                        SUM(d.quantity) AS qty,
                        SUM(d.sales_price) AS sp,
                        SUM(d.discount) AS dc,
                        SUM(d.total_line) AS tl,
                        o.invoice_no
                    FROM order_details d
                    JOIN orders o ON d.orders_id = o.id
                    WHERE o.persons_id = ${pid}
                    GROUP BY d.orders_id, o.invoice_no
                    ORDER BY d.orders_id DESC;
                  `,
        { type: sequelize.QueryTypes.SELECT },
      )

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
    //console.log(error);
    res.status(200).json({
      success: false,
      message: error,
    });
  }

  //
});

router.get("/api/v1/viewRcpt", verifyAdmin, async (req, res) => {
  //console.log(req.userDtl[0].id)
  let oid = req.query.oid;
  // console.log(oid)

  try {
    sequelize
      .query(
        `
            SELECT pr.product_name, pr.product_code, pr.piecies_value, d.quantity, d.sales_price, d.discount, d.total_line, d.orders_id, o.dates FROM order_details d, products pr, orders o WHERE d.product_id = pr.id AND d.orders_id = '${oid}' AND d.orders_id = o.id
                  `,
        { type: sequelize.QueryTypes.SELECT },
      )

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
    // console.log(error);
    res.status(200).json({
      success: false,
      message: error,
    });
  }

  //
});

router.get("/api/v1/stores", verifyAdmin, async (req, res) => {
  //console.log(req.userDtl[0].id)

  try {
    sequelize
      .query(
        `SELECT id,store_name, store_code FROM store order by store_name`,
        { type: sequelize.QueryTypes.SELECT },
      )

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
    // console.log(error);
    res.status(200).json({
      success: false,
      message: error,
    });
  }

  //
});

router.post(
  "/api/v1/profitloss",
  verifyAdmin,
  authorizePermission("statement"),
  async (req, res) => {
    //console.log(req.body);
    try {
      const { cboTime, cboCatSel } = req.body;

      const year = new Date().getFullYear();

      let dateFilter = "";
      let dateFilterStock = "";
      let params = [];
      let paramsStock = [];

      // =========================
      // DATE FILTER BUILDER (SAFE)
      // =========================

      if (cboCatSel === "Monthly") {
        dateFilter = `AND t.month_num = '${cboTime}' AND t.Year = '${year}'`;
        // params = [cboTime, year];

        const [[minMonth]] = await sequelize.query(
          "SELECT MIN(month_num) AS lstM FROM tbltimes",
        );

        const lastMonth = String(parseInt(cboTime) - 1).padStart(2, "0");

        dateFilterStock = `AND t.month_num BETWEEN '${minMonth.lstM}' AND '${lastMonth}' AND t.Year = '${year}'`;
        // paramsStock = [minMonth.lstM, lastMonth, year];
      }

      if (cboCatSel === "Quaterly") {
        dateFilter = `AND t.Quarter = '${cboTime}' AND t.Year = '${year}'`;
        //params = [cboTime, year];

        const [[minQuarter]] = await sequelize.query(
          `SELECT MIN(Quarter) AS lstM FROM tbltimes WHERE Year = '${year}'`,
        );

        dateFilterStock = `AND t.Quarter BETWEEN '${minQuarter.lstM}' AND '${cboTime}' AND t.Year = '${year}'`;
        //paramsStock = [minQuarter.lstM, cboTime, year];
      }

      if (cboCatSel === "Yearly") {
        dateFilter = `AND t.Year = '${cboTime}'`;
        //params = [cboTime];

        dateFilterStock = `AND t.Year = '${year}'`;
        //paramsStock = [year];
      }

      // =========================
      // 🔥 MAIN AGGREGATED QUERY
      // =========================

      const qry = `
        SELECT
          COALESCE(SUM(CASE WHEN d.order_mode = 'Sold' THEN d.total_line END),0) AS sold,
          COALESCE(SUM(CASE WHEN d.order_mode = 'Sold' THEN d.total_costline END),0) AS sold_cost,
          COALESCE(SUM(CASE WHEN d.order_mode = 'Sold' THEN d.discount END),0) AS discount_allowed,

          COALESCE(SUM(CASE WHEN d.order_mode = 'Returnin' THEN d.total_line END),0) AS return_in,
          COALESCE(SUM(CASE WHEN d.order_mode = 'Returnin' THEN d.total_costline END),0) AS return_in_cost,

          COALESCE(SUM(CASE WHEN d.order_mode IN ('Bought','Transfer','stockin') THEN d.total_line END),0) AS purchases,
          COALESCE(SUM(CASE WHEN d.order_mode IN ('Bought','Transfer','stockin') THEN d.discount END),0) AS discount_received,

          COALESCE(SUM(CASE WHEN d.order_mode = 'Returnout' THEN d.total_line END),0) AS return_out

        FROM order_details d
        JOIN tbltimes t ON t.id = d.time_id
        WHERE d.order_mode IN ('Sold','Returnin','Bought','Transfer','stockin','Returnout')
        ${dateFilter}
        `;

      //console.log(qry)
      // console.log(params)

      const [summaryRows] = await sequelize.query(qry);

      const data = summaryRows[0];

      // =========================
      // STOCK VALUE
      // =========================

      //console.log(dateFilterStock);
      //console.log(paramsStock);

      const [[stockRow]] = await sequelize.query(
        `
        SELECT COALESCE(SUM(d.stock_bal_value),0) AS stock_value
        FROM order_details d
        JOIN tbltimes t ON t.id = d.time_id
        WHERE 1=1 ${dateFilterStock}
        `,
        // paramsStock
      );

      //console.log(stockRow)
      // =========================
      // OTHER INCOME
      // =========================

      const [[incomeRow]] = await sequelize.query(
        `
        SELECT COALESCE(SUM(tr.credit_amt),0) AS other_income
        FROM transactions tr
        JOIN tbltimes t ON t.id = tr.dateid
        WHERE tr.personid = '6' 
        AND tr.ledger_id = '14'
        ${dateFilter}
        `,
      );

      // =========================
      // EXPENSES
      // =========================

      const [expenseRows] = await sequelize.query(
        `
        SELECT 
          p.id,
          p.full_name,
          COALESCE(SUM(tr.debit_amt),0) AS amount
        FROM transactions tr
        JOIN persons p ON p.id = tr.personid
        JOIN tbltimes t ON t.id = tr.dateid
        WHERE p.la_id = '7'
        ${dateFilter}
        GROUP BY p.id, p.full_name
        `,
      );

      // =========================
      // CALCULATIONS
      // =========================

      const sold = Number(data.sold);
      const returnIn = Number(data.return_in);
      const returnOut = Number(data.return_out);
      const purchases = Number(data.purchases);
      const costsold = Number(data.sold_cost);

      const discountAllowed = Number(data.discount_allowed);
      const discountReceived = Number(data.discount_received);

      const stockValue = Number(stockRow.stock_value);
      const otherIncome = Number(incomeRow.other_income);

      const sales = sold - returnIn;

      const Tavail =
        purchases +
        Number(data.return_in_cost) +
        stockValue -
        (returnOut + Number(data.sold_cost));

      const costOfSales = purchases + stockValue - (returnOut + Tavail);
      // console.log(costOfSales);

      const grossProfit = Number(sales) - Number(costOfSales);

      let totalExpenses = 0;

      const expenses = expenseRows.map((e) => {
        totalExpenses += e.amount;
        return e;
      });

      const netProfit =
        grossProfit +
        (discountReceived || 0 + otherIncome || 0) -
        (totalExpenses || 0 + discountAllowed || 0);

      // console.log(grossProfit);
      // console.log(otherIncome);
      // console.log(discountAllowed);
      // console.log(netProfit);

      // =========================
      // RESPONSE
      // =========================

      return res.status(200).json({
        success: true,
        period: cboTime,
        summary: {
          sales,
          costOfSales,
          grossProfit,
          otherIncome: otherIncome + discountReceived,
          discountAllowed,
          totalExpenses,
          netProfit,
        },
        breakdown: {
          sold,
          costsold,
          returnIn,
          returnOut,
          purchases,
          stockValue,
        },
        expenses,
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
//==================================

module.exports = router;
