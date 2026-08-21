const express = require("express");
const verifyAdmin = require("../verifyAdmin");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const Joi = require("joi");
const cProduct = require("./products.controller");
const Tools = require("../../shared/commonTools");
const pagination = require("../../shared/pagination");
const BadRequest400 = require("../../Exceptions/400Exception");
const idNumControlPOST = require("../../shared/idNumberControlPOST");
const UpldVeri = require("../../shared/uploadVerify");
const idNumControl = require("../../shared/idNumberControl");
//const basicAuth = require("../shared/basicAuth");
//const Verifyadm = require("../verifyAdmin");
//const multer = require("multer");
const sequelize = require("../../config/database");
const {
  ProductSchema,
  ProductSchemaEdit,
} = require("../../validate/validate_input");
const path = require("path");
const fs = require("fs");
const authorizePermission = require("../auth_role.js");
//const sharp = require('sharp');

router.post("/api/v1/images", verifyAdmin, async (req, res) => {
  const prdid = req.body.prdid;
  const directoryPath = path.join(__dirname, "../../uploads/" + prdid + "/");

  //console.log(directoryPath);
  // Read all files in the directory
  await fs.readdir(directoryPath, (err, files) => {
    if (err) {
      // return res.status(500).json({message:'Unable to scan directory: ' + err});
      return res.status(400).json({ message: "No Property Image Uploaded" });
    }

    const images = files.filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file));

    const imagePaths = images.map((file) => `uploads/${prdid}/${file}`);
    res.json({ images: imagePaths });
  });
});

router.post(
  "/api/v1/product",
  verifyAdmin,
  authorizePermission("products"),
  async (req, res, next) => {
     const client_id = req.userDtl[0].client_id;
    // console.log(req.userDtl);
    //console.log(req.body);
    const usr_id = req.userDtl[0].id;
    const { error, value } = ProductSchema.validate(req.body);

    if (error) {
     // console.log(error);

      return res.status(400).json({
        success: false,
        code: 400,
        message: error.details[0].message.replace(/\"/g, ""),
      });
    } else {
      //console.log(value);
      //console.log(req.body);
      // const token = Tools.getUniqueId();
      // const d = "2024-04-29";
      const dt = new Date().toISOString();
      const d = Tools.getNowDate();

      //var prdtDesc = req.body.txtPrdtDesc.replace(/[,'']/g, '');

      myData = {
        product_name: req.body.txtPrdtName.toUpperCase(),
        bar_code: req.body.txtBarcode,
        size: "",
        selling_price: 0,
        unit_sell_price: 0,
        cost_price: 0,
        model: "",
        brand: "",
        category: "",
        store_id: 1,
        quantity: "YES",
        dateid: 1,
        user_id: usr_id,
        vat_amtz: 0,
        flag: "SHOW",
        // piecies_value: req.body.txtPcsInWhole,
        product_code: "100",
        dated: d,
        mfg_date: req.body.txtMfDate ,
        expiry_date: req.body.txtExpDate,
        clt_id:client_id
      };

      // console.log(myData)
      await cProduct.create(myData);
      const Max_ID = await cProduct.MaxID("id");

      const act_no1 = 20000 + Max_ID;
      // // //console.log(act_no1);
      await cProduct.getRecByID("id", act_no1, Max_ID);

      const [insertResult] = await sequelize.query(
        `INSERT INTO tblunit (product_id, unit_measure, pieces_in, unitprice, costprice,clt_id)
              VALUES (?, 'PIECES', '1', ?, ?,?)`,
        {
          replacements: [Max_ID, req.body.txtPrice,req.body.txtCostPrice,client_id],
          type: sequelize.QueryTypes.INSERT,
        },
      );

      if (insertResult) {
        res.status(200).json({
          success: true,
          message: "Successful",
        });
      }
    }
  },
);

router.post("/api/v1/addunit", verifyAdmin, async (req, res, next) => {
  //const usr_id = req.userDtl[0].dataValues.id;
const client_id = req.userDtl[0].client_id;
  const Joi = require("joi");

  //console.log(req.body);

  const unitSchema = Joi.object({
    txtUnitPrdt_Id: Joi.number().integer().required().messages({
      "number.base": "Product ID must be a number",
      "any.required": "Product ID is required",
    }),

    UnitMesure: Joi.string().trim().uppercase().min(2).required().messages({
      "string.empty": "Unit measure is required",
      "string.min": "Unit measure must be at least 2 characters",
    }),

    txtPiecesValue: Joi.number().integer().min(1).required().messages({
      "number.base": "Pieces must be a number",
      "number.min": "Pieces must be at least 1",
    }),

    txtUnitSellPrice: Joi.number().precision(2).positive().required().messages({
      "number.base": "Unit price must be a number",
      "number.positive": "Unit price must be greater than 0",
    }),

    txtUnitCostprice: Joi.number().required().messages({
      "number.base": "Cost price must be a number",
    }),
  });

  // ✅ VALIDATION STEP
  const { error, value } = unitSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      // success: false,
      // message: error.details.map((e) => e.message),

      success: false,
      code: 400,
      message: error.details[0].message.replace(/\"/g, ""),
    });
  }

  const query = `
    INSERT INTO tblunit 
    (product_id, unit_measure, pieces_in, unitprice, costprice,clt_id) 
    VALUES 
    (:product_id, :unit_measure, :pieces_in, :unitprice, :costprice, :cltID)
  `;

  try {
    await sequelize.query(query, {
      replacements: {
        product_id: value.txtUnitPrdt_Id,
        unit_measure: value.UnitMesure,
        pieces_in: value.txtPiecesValue,
        unitprice: value.txtUnitSellPrice,
        costprice: value.txtUnitCostprice,
        cltID: client_id,
      },
      type: sequelize.QueryTypes.INSERT,
    });

    res.status(201).json({
      success: true,
      message: "Unit inserted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Insert failed",
      error: error.message,
    });
  }
});

router.post("/api/v1/updateunit", verifyAdmin, async (req, res, next) => {
  //const usr_id = req.userDtl[0].dataValues.id;
const client_id = req.userDtl[0].client_id;
  const Joi = require("joi");

  console.log(req.body);

  const unitSchema = Joi.object({
    txtUnitPrdt_Id: Joi.number().integer().required().messages({
      "number.base": "Product ID must be a number",
      "any.required": "Product ID is required",
    }),

    id: Joi.number().integer().required().messages({
      "number.base": "Unit ID must be a number",
      "any.required": "Unit ID is required",
    }),

    UnitMesure: Joi.string().trim().uppercase().min(2).required().messages({
      "string.empty": "Unit measure is required",
      "string.min": "Unit measure must be at least 2 characters",
    }),

    txtPiecesValue: Joi.number().integer().min(1).required().messages({
      "number.base": "Pieces must be a number",
      "number.min": "Pieces must be at least 1",
    }),

    txtUnitSellPrice: Joi.number().precision(2).positive().required().messages({
      "number.base": "Unit price must be a number",
      "number.positive": "Unit price must be greater than 0",
    }),

    txtUnitCostprice: Joi.number().required().messages({
      "number.base": "Cost price must be a number",
    }),
  });

  // ✅ VALIDATION STEP
  const { error, value } = unitSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      // success: false,
      // message: error.details.map((e) => e.message),

      success: false,
      code: 400,
      message: error.details[0].message.replace(/\"/g, ""),
    });
  }

  const query = `
  UPDATE tblunit 
  SET 
    pieces_in = :pieces_in,
    unitprice = :unitprice,
    costprice = :costprice
  WHERE id = :id
`;

  try {
    await sequelize.query(query, {
      replacements: {
        id: value.id,
        // unit_measure: value.UnitMesure,
        pieces_in: value.txtPiecesValue,
        unitprice: value.txtUnitSellPrice,
        costprice: value.txtUnitCostprice,
      },
      type: sequelize.QueryTypes.UPDATE,
    });

    res.status(200).json({
      success: true,
      message: "Unit updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
});



router.get(
  "/api/v1/unitmeasures",
  verifyAdmin,
  authorizePermission("products", "view_unit"),
  async (req, res) => {
    const client_id = req.userDtl[0].client_id;
    const prdtid = req.query.id;

    try {
      sequelize
        .query(
          `  SELECT id, product_id, unit_measure, pieces_in, unitprice, costprice FROM tblunit WHERE product_id ='${prdtid}' AND clt_id='${client_id}'`,
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
  "/api/v1/product",
  verifyAdmin,
  authorizePermission("products"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)
const client_id = req.userDtl[0].client_id;
    // SELECT p.id, p.product_name, p.size, p.selling_price, p.cost_price, p.unit_sell_price, p.product_code, p.vat_amtz, p.category, p.model, p.brand , u.surname , u.othername , u.acct_no , p.bar_code, p.piecies_value FROM products p , tblusers u WHERE flag='SHOW' AND p.user_id = u.id ORDER BY p.id DESC

    try {
      sequelize
        .query(
          `  SELECT
                p.id,
                p.product_name,
                p.product_code,
                p.vat_amtz,
                p.category,
                p.model,
                p.brand,
                p.mfg_date,
                p.expiry_date,
                p.bar_code,
                uz.surname,
                uz.othername, 
                uz.acct_no,
                p.bar_code,
                JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'pieces_in', u.pieces_in,
                    'unitprice', u.unitprice,
                    'unit_measure', u.unit_measure,
                    'costprice', u.costprice
                  )
                ) AS units
              FROM products p
              JOIN tblunit u ON u.product_id = p.id
              JOIN tblusers uz ON uz.id = p.user_id 
              WHERE p.clt_id = '${client_id}'
              GROUP BY p.id ORDER BY p.id DESC ;`,
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

router.get(
  "/api/v1/expirenotify",
  verifyAdmin,
   //authorizePermission("products"),
  async (req, res) => {
    const perct_value = Number(req.query.pv);
const client_id = req.userDtl[0].client_id;
   // console.log(perct_value);

    try {
      const rows = await sequelize.query(
        `
       SELECT 
          *,
          DATEDIFF(expiry_date, CURDATE()) AS days_left,
          DATEDIFF(expiry_date, mfg_date) AS total_days,

          ROUND(
            (DATEDIFF(expiry_date, CURDATE()) / 
            DATEDIFF(expiry_date, mfg_date)) * 100
          ) AS percent_remaining

      FROM products
      WHERE mfg_date IS NOT NULL
        AND expiry_date IS NOT NULL AND clt_id = '${client_id}';
      `,
        {
          type: sequelize.QueryTypes.SELECT,
        },
      );

      const expired = [];
      const critical = [];
      const expiringSoon = [];

      for (const product of rows) {
        if (product.days_left <= 0) {
          expired.push(product);
        } else if (product.percent_remaining <= perct_value) {
          console.log(product.percent_remaining);
          //console.log(product.id )
          critical.push(product);
        } else if (product.days_left == 10) {
          expiringSoon.push(product);
        }
      }

      return res.status(200).json({
        success: true,

        summary: {
          expired: expired.length,
          critical: critical.length,
          expiringSoon: expiringSoon.length,
        },

        data: {
          expired,
          critical,
          expiringSoon,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);



router.post("/api/v1/hideprdt", verifyAdmin, async (req, res, next) => {
  await sequelize
    .query(`UPDATE products SET flag='HIDE' WHERE id ='${req.body.id}'`, {
      type: sequelize.QueryTypes.UPDATE,
    })
    .then(() => {
      res.status(200).json({
        success: true,
        message: "Deactivated Successful",
      });
    });
});

router.post("/api/v1/deleteImg", verifyAdmin, async (req, res, next) => {
  //  "/uploads/3/pix1.png",
  //console.log(req.body.imgPath)
  const prdid = req.body.prtID;
  const outputDir = path.join(__dirname, "../../" + req.body.imgPath);
  const AllFiles = path.join(__dirname, "../../uploads/" + prdid + "/");
  // Delete the file
  fs.unlink(outputDir, (err) => {
    if (err) {
      res.status(200).json({ success: false, message: err });
      // console.error('Error while deleting the file:', err);
    } else {
      fs.readdir(AllFiles, (err, files) => {
        if (err) {
          // return res.status(500).json({message:'Unable to scan directory: ' + err});
          return res
            .status(400)
            .json({ message: "No Property Image Uploaded" });
        }

        const images = files.filter((file) =>
          /\.(jpg|jpeg|png|gif)$/i.test(file),
        );

        const imagePaths = images.map((file) => `uploads/${prdid}/${file}`);
        // res.json({ images: imagePaths });
        sequelize.query(
          `UPDATE products SET pix_paths='${imagePaths}' WHERE id='${prdid}' `,
          { type: sequelize.QueryTypes.UPDATE },
        );
        res.status(200).json({
          success: true,
          message: "Image Deleted",
          images: imagePaths,
        });
      });

      // res.status(200).json({success:true,message:"Image Deleted"})
      //console.log('File successfully deleted!');
    }
  });
  //console.log(outputDir)
});

router.post("/api/v1/productUpdt", verifyAdmin, async (req, res) => {
  //console.log(req.body);
  //return

  try {
    const { error, value } = ProductSchemaEdit.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      //console.log(error);

      return res.status(400).json({
        success: false,
        code: 400,
        message: error.details[0].message.replace(/\"/g, ""),
      });
    } else {
      const id = Number.parseInt(req.body.id);

      await cProduct.Updateproduct(id, req.body);
      res.status(200).json({
        success: true,
        message: "Product Updated",
      });
    }
  } catch (error) {}
});

module.exports = router;
