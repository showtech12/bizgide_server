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
const AuthRole = require("../auth_role.js");
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

// router.post("/api/v1/uploadAll", verifyAdmin, UpldVeri, async (req, res) => {

//   const prdtid = req.body.prdtid;

//   if (!req.files || req.files.length === 0 || req.files.length > 7) {
//     return res.status(400).json({ message: 'No files were uploaded or too many files.' });
//   }

//   // Set output directory
//   const outputDir = path.join(__dirname, '../../uploads/' + prdtid + '/');

//   // Ensure the 'uploads/' directory exists
//   if (!fs.existsSync(outputDir)) {
//     fs.mkdirSync(outputDir, { recursive: true });
//   }

//   try {
//     let x = 0;
//     const promises = req.files.map(async (file) => {
//       x += 1;
//       const extension = path.extname(file.originalname).toLowerCase();
//       const resizedImagePath = `/uploads/${prdtid}/pix${x}${extension}`;  // Relative path for response
//       const absoluteImagePath = path.join(__dirname, `../../uploads/${prdtid}/pix${x}${extension}`);  // Absolute path for saving

//       // Resize and add text to the image using sharp
//       await sharp(file.buffer)
//       .resize({ width: 600, height: 450, fit: 'cover', kernel: sharp.kernel.lanczos3 }) // Use Lanczos3 for high-quality resizing

//         .composite([{
//           input: Buffer.from(
//             `<svg width="500" height="50">
//               <text x="130" y="35" font-size="30" fill="#cbd2d9">Cool Real Estate Property</text>
//             </svg>`
//           ),
//           gravity: 'center' // Position the text at the bottom
//         }])
//         .toFile(absoluteImagePath);  // Save to the absolute path

//       return resizedImagePath;  // Return the relative path
//     });

//     const processedImages = await Promise.all(promises);

//     await fs.readdir(outputDir, (err, files) => {
//       if (err) {
//        // return res.status(500).json({message:'Unable to scan directory: ' + err});
//         return res.status(400).json({message:'No Property Image Uploaded'});
//       }

//       const images = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

//       //const imagePaths = images.map(file => `uploads/${prdtid}/${file}`);
//       const imagePaths = images.map(file => `uploads/${prdtid}/${file}`);
//      // res.json({ images: imagePaths });
//      //pix_paths
//      sequelize.query(`UPDATE products SET pix_paths='${imagePaths}' WHERE id='${prdtid}' `, { type: sequelize.QueryTypes.UPDATE });

//       res.json({ message: 'Images uploaded and processed successfully', images: imagePaths });

//     });

//   } catch (error) {
//     console.error('Error processing images:', error);
//     res.status(500).send('Error processing images.');
//   }

// });

router.post(
  "/api/v1/product",
  verifyAdmin,
  AuthRole("ADMIN", "CASHIER"),
  async (req, res, next) => {
    // console.log(req.userDtl);
    //console.log(req.body);
    const usr_id = req.userDtl.id;
    const { error, value } = ProductSchema.validate(req.body);

    if (error) {
      console.log(error);

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
        mfg_date:req.body.txtMfDate,
        expiry_date:req.body.txtExpDate,

      };

      // console.log(myData)
      await cProduct.create(myData);
      const Max_ID = await cProduct.MaxID("id");

      const act_no1 = 20000 + Max_ID;
      // // //console.log(act_no1);
      await cProduct.getRecByID("id", act_no1, Max_ID);

      const [insertResult] = await sequelize.query(
      `INSERT INTO tblunit (product_id, unit_measure, pieces_in, unitprice, costprice)
              VALUES (?, 'PIECES', '1', ?, ?)`,
      {
        replacements: [Max_ID, req.body.txtPrice, req.body.txtCostPrice],
        type: sequelize.QueryTypes.INSERT,
      },
    );

    if(insertResult){

        res.status(200).json({
        success: true,
        message: "Successful",
        
      });

    }

    }
  },
);


router.post("/api/v1/addunit", verifyAdmin, async (req, res, next) => {
  //const usr_id = req.userDtl.dataValues.id;

  const Joi = require("joi");

  console.log(req.body)

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
    (product_id, unit_measure, pieces_in, unitprice, costprice) 
    VALUES 
    (:product_id, :unit_measure, :pieces_in, :unitprice, :costprice)
  `;

  try {
    await sequelize.query(query, {
      replacements: {
        product_id: value.txtUnitPrdt_Id,
        unit_measure: value.UnitMesure,
        pieces_in: value.txtPiecesValue,
        unitprice: value.txtUnitSellPrice,
        costprice: value.txtUnitCostprice,
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
  //const usr_id = req.userDtl.dataValues.id;

  const Joi = require("joi");

  console.log(req.body)

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


router.post("/api/v1/product11", verifyAdmin, async (req, res, next) => {
  //console.log(req.userDtl);
  //console.log(req.body)
  const usr_id = req.userDtl.dataValues.id;
  // const { error, value } = schema.validate(req.body, { abortEarly: false });
  //const { error, value } = schema.validate(req.body);

  const { error, value } = ProductSchema.validate(req.body);

  if (error) {
    console.log(error);
    //const errorMessages = error.details.map((detail) => detail.message);
    // return res.status(400).json({ errors: errorMessages });
    //throw new BadRequest400(error.details[0].message);
    //throw new Error(error.details[0].message)
    // BadRequest400
    return res.status(200).json({
      success: false,
      code: 200,
      message: error.details[0].message.replace(/\"/g, ""),
    });
  } else {
    //console.log(value);
    //console.log(req.body);
    // const token = Tools.getUniqueId();
    // const d = "2024-04-29";
    const dt = new Date().toISOString();
    const d = Tools.getNowDate();

    var prdtDesc = req.body.txtPrdtDesc.replace(/[,'']/g, "");

    const query = `
  INSERT INTO products 
  (
    product_name, bar_code, category, prdt_type, prdt_sub_type, 
    prdt_state, prdt_lgv, prdt_area, prdt_desc, size, isFunished, 
    isShared, isServiced, unit_sell_price, cost_price, model, 
    brand, store_id, product_code, dateid, user_id, vat_amtz, 
    flag, dated, timed, pix_paths, prdt_address, t_toilet, 
    t_bathroom, parking_space, vid_link, isAvailable, whatsapp_no
  ) 
  VALUES 
  ('${req.body.prdtName.toUpperCase()}', '${req.body.txtPrice}','${req.body.cboCat}', 
    '${req.body.cboType}','', '${req.body.cboState.toUpperCase()}', '${req.body.cboLgv.toUpperCase()}', 
    '${req.body.txtArea.toUpperCase()}','${prdtDesc}','${req.body.cboSize.toUpperCase()}', 
    '${req.body.cboIsFurnished.toUpperCase()}','${req.body.cboIsShared.toUpperCase()}','YES', 
    '${req.body.txtPrice}','0','','','0','','1',${usr_id},'0','${req.body.txtStatus.toUpperCase()}','${d}', '${dt}','','${req.body.txtAddress}','${req.body.cboToilet}','${req.body.cboBathe}','${req.body.cboPark}','${req.body.txtVidLink}','${req.body.cboIsAvalaible}',''
  )`;

    // console.log(query)
    try {
      sequelize.query(query, { type: sequelize.QueryTypes.INSERT });
    } catch (error) {
      res.status(200).json({
        success: false,
        message: "Not Successful",
      });
    }

    // myData = {
    //   product_name: req.body.prdtName.toUpperCase(),
    //   selling_price: req.body.txtPrice,
    //   category: req.body.cboCat,
    //   prdt_type: req.body.cboType,
    //   prdt_sub_type: "",
    //   prdt_state: req.body.cboState.toUpperCase(),
    //   prdt_lgv: req.body.cboLgv.toUpperCase(),
    //   prdt_area: req.body.txtArea.toUpperCase(),
    //   prdt_desc: req.body.txtPrdtDesc,
    //   isFunished: req.body.cboIsFurnished.toUpperCase(),
    //   isShared: req.body.cboIsShared.toUpperCase(),
    //   isServiced: "YES",
    //   unit_sell_price: req.body.txtPrice,
    //   cost_price: 0,
    //   model: "",
    //   brand: "",
    //   store_id: 0,
    //   product_code: "100",
    //   dateid: 1,
    //   user_id: usr_id,
    //   vat_amtz: 0,
    //   flag: req.body.txtStatus.toUpperCase(),
    //   dated:d,
    //   timed:dt,
    //   size: req.body.cboSize.toUpperCase(),
    //   prdt_address: req.body.txtAddress,
    //   t_toilet: req.body.cboToilet,
    //   t_bathroom: req.body.cboBathe,
    //   parking_space: req.body.cboPark,
    //   vid_link: req.body.txtVidLink,
    //   isAvailable: req.body.cboIsAvalaible,
    //   whatsapp_no: req.body.txtWhasApp,
    //   //createdAt: d,
    //   //Token: token,
    // };

    // console.log(myData)
    // await cProduct.create(myData);
    const Max_ID = await cProduct.MaxID("id");

    const act_no1 = 20000 + Max_ID;
    // //console.log(act_no1);
    await cProduct.getRecByID("id", act_no1, Max_ID);
    //const prdtDtls = await cProduct.getProduct(Max_ID);
    // console.log(userDtls.dataValues);
    //  res.status(200).json({ message: "Success" });
    res.status(200).json({
      success: true,
      message: "Successful",
      // data: prdtDtls,
      // data: {
      //   id: userDtls.dataValues.id,
      //   surname: userDtls.dataValues.surname,
      //   othername: userDtls.dataValues.othername,
      //   email: userDtls.dataValues.email,
      //   acct_no: act_no1.toString(),
      //   Date_Last_Modified: userDtls.dataValues.Date_Last_Modified,
      //   createdAt: userDtls.dataValues.createdAt,
      //   account_data: userDtls.dataValues,
      // },
    });

    // const UsrzID = await productervice.MaxID("id");
  }
});

router.get(
  "/api/v1/unitmeasures",
  verifyAdmin,
  AuthRole("ADMIN", "CASHIER"),
  async (req, res) => {
   const prdtid = req.query.id

    try {
      sequelize
        .query(
          `  SELECT id, product_id, unit_measure, pieces_in, unitprice, costprice FROM tblunit WHERE product_id ='${prdtid}'`,
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
  AuthRole("ADMIN", "CASHIER"),
  async (req, res) => {
    //console.log(req.userDtl.id)

   
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
              GROUP BY p.id, p.product_name, p.selling_price;`,
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
  AuthRole("ADMIN", "CASHIER"),
  async (req, res) => {
    const perct_value = Number(req.query.pv);

    console.log(perct_value)

    try {

      const rows = await sequelize.query(`
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
        AND expiry_date IS NOT NULL;
      `, {
        type: sequelize.QueryTypes.SELECT
      });

      const expired = [];
      const critical = [];
      const expiringSoon = [];

      for (const product of rows) {

        if (product.days_left <= 0) {
          expired.push(product);
        }

        else if (product.percent_remaining <= perct_value) {
          console.log(product.percent_remaining )
          //console.log(product.id )
          critical.push(product);
        }

        else if (product.days_left == 10) {
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
        }
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }

  }
);

router.get("/api/v1/productadmin", verifyAdmin, async (req, res) => {
  //console.log(req.userDtl.id)
  //   const pages = await cProduct.getAllproductsWhereUserz(req.userDtl.id);
  //  // console.log(pages);
  //   res.send(pages);

  sequelize
    .query(
      `SELECT pr.id, pr.dated, pr.product_name, pr.selling_price, pr.category, pr.prdt_type, pr.prdt_sub_type, pr.prdt_state,pr.prdt_lgv,pr.prdt_area,pr.prdt_desc,pr.isFunished,pr.isShared,pr.isServiced, pr.unit_sell_price,pr.product_code,pr.flag, pr.prdt_address,pr.t_toilet,pr.t_bathroom,pr.parking_space,pr.vid_link,pr.isAvailable,pr.whatsapp_no, pr.pix_paths, u.surname, u.othername,u.phone,u.store_name,pr.size FROM tblusers u, products pr WHERE pr.user_id = u.id  ORDER BY pr.id DESC`,
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
});

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
