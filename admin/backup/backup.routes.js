const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { exec } = require("child_process");
const verifyAdmin = require("../verifyAdmin");
const sequelize = require("../../config/database");
const authorizePermission = require("../auth_role.js");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");

const util = require("util");
const execAsync = util.promisify(exec);

router.get(
  "/api/v1/lastBackup",
  verifyAdmin,
  authorizePermission("ADMIN", "CASHIER"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)

    try {
      sequelize
        .query(`SELECT bk_Dated FROM tblbackuptime WHERE id = '1'`, {
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
      console.log(error);
      res.status(200).json({
        success: false,
        message: error,
      });
    }

    //
  },
);

router.post("/sync-to-server", verifyAdmin, async (req, res) => {
  const dumpFile = path.join(__dirname, "backup.sql");

  //console.log(req.currentToken)
  let d = new Date().toISOString().split("T")[0];
  let t = new Date().toISOString().split("T")[1];
  const dt = d + " " + t;

  const dt1 = new Date().toISOString();

  try {
    // 1. Dump DB
    await execAsync(
      `"C:\\wamp64\\bin\\mysql\\mysql8.3.0\\bin\\mysqldump.exe" -u root asademo > "${dumpFile}"`,
    );

    //  console.log("Dump successful ✅");

    // 2. Upload to VPS
    const form = new FormData();
    form.append("file", fs.createReadStream(dumpFile));

    await axios.post("https://demoapi.accusoftapp.com/api/import-db", form, {
      headers: {
        ...form.getHeaders(),
        Authorization: "Bearer " + req.currentToken,
      },
    });

    sequelize.query(`UPDATE tblbackuptime SET bk_Dated=? WHERE id=?`, {
      replacements: [dt1, 1],
      type: sequelize.QueryTypes.UPDATE,
    });

    return res.status(200).json({
      success: true,
      message: "Database synced successfully 🚀",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Sync failed ❌",
      error: error.message,
    });
  }
});

router.post(
  "/api/import-db",
  verifyAdmin,
  upload.single("file"),
  async (req, res) => {
    // 🔐 Secure it
    if (req.headers.authorization !== "Bearer " + req.currentToken) {
      return res.status(403).send("Unauthorized");
    }

    //console.log(req.file.path)
    // res.status(200).json({
    //             success: true,
    //             message: "success",

    //           });

    const filePath = req.file.path;

    // exec(
    //   `mysql --defaults-extra-file=/home/asap-demoapi/htdocs/demoapi.accusoftapp.com/admin/backup/db.cnf asademo < "${filePath}"`
    //   ,
    // (err) => {
    //   if (err) {
    //     return res.status(500).send("Import failed");
    //   }

    //   //res.send("Database imported successfully ✅");

    //   res.status(200).json({
    //         success: true,
    //         message: "Database imported successfully ✅",

    //       });
    // }
    // );

    let d = new Date().toISOString().split("T")[0];
    let t = new Date().toISOString().split("T")[1];
    const dt = d + " " + t;

    const dt1 = new Date().toISOString();

    await exec(
      `mysql -u asademouser -p'9gDxr7q#JRoBTdYr#u8M' asademo < ${filePath}`,
      (err) => {
        if (err) {
          return res.status(500).send("Import failed");
        }

        //res.send("Database imported successfully ✅");

        sequelize.query(`UPDATE tblbackuptime SET bk_Dated=? WHERE id=?`, {
          replacements: [dt1, 1],
          type: sequelize.QueryTypes.UPDATE,
        });

        res.status(200).json({
          success: true,
          message: "Database imported successfully ✅",
        });
      },
    );
  },
);

module.exports = router;
