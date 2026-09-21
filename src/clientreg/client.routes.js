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
const cPersons = require("../../admin/persons/persons.controller");
//const mRoles = require("../roles/roles.model");
const cRoles = require("../roles/roles.controller");

// router.post("/api/v2/register", async (req, res) => {
//   // console.log(req.body);
//   //console.log(req.userDtl[0].id);
//   const transaction = await sequelize.transaction();
//   try {
//     //console.log("Create Register request:", req.body);

//     const { error, value } = RegisterClientSchema.validate(req.body); // Validation
//     //console.log(value);
//     if (error) {
//       return res.status(400).json({
//         success: false,
//         message: error.details[0].message.replace(/\"/g, ""),
//       });
//     }

//     //Check phone uniqueness
//     const existingPhone = await cClient.getBySingleCol("phone", value.phone);
//     if (existingPhone) {
//       return res.status(400).json({
//         success: false,
//         message: "Phone number already in use",
//       });
//     }

//     // Check email uniqueness
//     const existingEmail = await cClient.getBySingleCol("email", value.email);
//     if (existingEmail) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already in use",
//       });
//     }

//     // Generate unique token
//     const token = Tools.getUniqueId();
//     const nowISO = new Date().toISOString();
//     const regDate = Tools.getNowDate();

//     const today = new Date();
//     const myToday = today.toISOString().split("T")[0];
//     const twoWeeksLater = new Date(today);
//     twoWeeksLater.setDate(today.getDate() + 14);

//     const Duedate = twoWeeksLater.toISOString().split("T")[0];

//     //console.log(Duedate);

//     const myData = {
//       ...value,
//       suborder_id: 0,
//       status: "ACTIVE",
//       reffer_by: value.refferByID,
//       // due_date: Duedate,
//       is_active: 1,
//     };

//     //console.log(myData);
//     //return false;
//     await cClient.create(myData);
//     const client_ID = await cClient.MaxID("id");

//     // Generate account number
//     const acct_no = 190100 + client_ID;
//     await cClient.getRecByID("id", acct_no, client_ID);

//     //await cClient.updateOneColumn(client_ID, "suborder_id","")

//     //const userDetails = await cClient.getOne(client_ID);
//     //==============================================================
//     const [subOrderMaxID] = await sequelize.query(
//       `
//     INSERT INTO tblsuborder
//       (
//         sub_id,
//         client_id,
//         due_date,
//         isactive,
//         sub_status,
//         start_date
      
//       )
//     VALUES
//       (
//         :sub_id,
//         :client_id,
//         :due_date,
//         :isactive,
//         :sub_status,
//         :startDate
        
//       )`,
//       {
//         replacements: {
//           sub_id: 1,
//           client_id: client_ID,
//           due_date: Duedate,
//           isactive: 1,
//           sub_status: "Active",
//           startDate: myToday,
//         },
//         type: sequelize.QueryTypes.INSERT,
//         transaction,
//       },
//     );
//     //===========================================
//     await cClient.updateOneColumn(client_ID, "suborder_id", subOrderMaxID);
//     //============================================

//     const Subsdiary = [
//       {
//         la_id: 1,
//         full_name: "PURCHASES ACCOUNT",
//         contact_type: "SUBSIDIARY",
//         ptype: "CA",
//         clt_id: client_ID,
//         store_id: 1,
//         flg: "SHOW",
//       },
//       {
//         la_id: 2,
//         full_name: "SALES ACCOUNT",
//         contact_type: "SUBSIDIARY",
//         ptype: "CA",
//         clt_id: client_ID,
//         store_id: 1,
//         flg: "SHOW",
//       },
//       {
//         la_id: 3,
//         full_name: "RETURN INWARD",
//         contact_type: "SUBSIDIARY",
//         ptype: "CA",
//         clt_id: client_ID,
//         store_id: 1,
//         flg: "SHOW",
//       },
//       {
//         la_id: 4,
//         full_name: "RETURN OUTWARD",
//         contact_type: "SUBSIDIARY",
//         ptype: "CA",
//         clt_id: client_ID,
//         store_id: 1,
//       },
//       {
//         la_id: 5,
//         full_name: "CASH ACCOUNT",
//         contact_type: "SUBSIDIARY",
//         ptype: "CA",
//         clt_id: client_ID,
//         store_id: 1,
//         flg: "SHOW",
//       },
//       {
//         la_id: 7,
//         full_name: "ADMINISTRATIVE COST",
//         contact_type: "SUBSIDIARY",
//         ptype: "CA",
//         clt_id: client_ID,
//         store_id: 1,
//         flg: "SHOW",
//       },
//       {
//         la_id: 7,
//         full_name: "OPERATION COST",
//         contact_type: "SUBSIDIARY",
//         ptype: "CA",
//         clt_id: client_ID,
//         store_id: 1,
//         flg: "SHOW",
//       },
//       {
//         la_id: 7,
//         full_name: "FINANCE COST",
//         contact_type: "SUBSIDIARY",
//         ptype: "CA",
//         clt_id: client_ID,
//         store_id: 1,
//       },
//       {
//         la_id: 7,
//         full_name: "OTHER EXPENSES",
//         contact_type: "SUBSIDIARY",
//         ptype: "CA",
//         clt_id: client_ID,
//         store_id: 1,
//         flg: "SHOW",
//       },
//       {
//         la_id: 8,
//         full_name: "LAND",
//         contact_type: "SUBSIDIARY",
//         ptype: "CA",
//         clt_id: client_ID,
//         store_id: 1,
//         flg: "SHOW",
//       },
//       {
//         la_id: 13,
//         full_name: "CAPITAL",
//         contact_type: "SUBSIDIARY",
//         ptype: "CA",
//         clt_id: client_ID,
//         store_id: 1,
//         flg: "SHOW",
//       },
//       {
//         la_id: 14,
//         full_name: "OTHER INCOME",
//         contact_type: "SUBSIDIARY",
//         ptype: "CA",
//         clt_id: client_ID,
//         store_id: 1,
//         flg: "SHOW",
//       },
//       {
//         la_id: 0,
//         full_name: "CASH SALES",
//         contact_type: "CUSTOMER",
//         ptype: "PA",
//         clt_id: client_ID,
//         store_id: 1,
//         flg: "SHOW",
//       },
//       {
//         la_id: 0,
//         full_name: "SUPPLIERS",
//         contact_type: "SUPPLIERS",
//         ptype: "PA",
//         clt_id: client_ID,
//         store_id: 1,
//         flg: "SHOW",
//       },
//       {
//         la_id: 0,
//         full_name: value.company_name,
//         contact_type: "STOCKIN",
//         ptype: "",
//         clt_id: client_ID,
//         store_id: 1,
//         flg: "SHOW",
//       },
//     ];

//     await mPersons.bulkCreate(Subsdiary, { transaction });
//     //cPersons
//     //==============================================
//     const Roles = [
//       {
//         rolename: "ADMIN",
//         permission:
//           "subhistory,dashboard,ledger,pos,stockin,purchase,returnin,returnout,reprint,expenses,capital,users,products,view_unit,all_inventory,backup,cashbook,customeranalysis,evacuate,expire_noti,inventory,jornals,ledgerbal,otherincome,post,prev,saleanalysis,salesincome,salesrecord,settings,statement,stockout,suppliers,trailbal,cusanalys,uptroles,accountreport,journals",
//         clt_id: client_ID,
//       },

//       {
//         rolename: "CASHIER",
//         permission:
//           "dashboard,ledger,pos,purchase,returnin,returnout,reprint,expenses,all_inventory,customeranalysis,products",
//         clt_id: client_ID,
//       },

//       {
//         rolename: "USER",
//         permission: "dashboard,ledger,pos,all_inventory",
//         clt_id: client_ID,
//       },
//     ];
//     await mRoles.bulkCreate(Roles, { transaction });
//     //============================================

//     await sequelize.query(
//       `
//     INSERT INTO tblsettings
//       (
//         validate_stockbal,
//         expiring_perct,
//         stock_out_perct,
//         profit_margin_perct,
//         currency,
//         clt_id
//       )
//     VALUES
//       (
//         :validate_stockbal,
//         :expiring_perct,
//         :stock_out_perct,
//         :profit_margin_perct,
//         :currency,
//         :clt_id
//       )
//   `,
//       {
//         replacements: {
//           validate_stockbal: "YES",
//           expiring_perct: 30,
//           stock_out_perct: 90,
//           profit_margin_perct: 10,
//           currency: "NGN",
//           clt_id: client_ID,
//         },
//         type: sequelize.QueryTypes.INSERT,
//         transaction,
//       },
//     );
//     //===========================================
//     await transaction.commit();
//     return res.status(200).json({
//       success: true,
//       message: "Successfully",
//       regno: acct_no,
//       cleintID: client_ID,
//     });
//   } catch (err) {
//     await transaction.rollback();
//     console.error(err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// });



router.post("/api/v2/register", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // =========================================================
    // 1. VALIDATE REQUEST
    // =========================================================
    const { error, value } = RegisterClientSchema.validate(req.body);

    if (error) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: error.details[0].message.replace(/"/g, ""),
      });
    }

    // =========================================================
    // 2. CHECK PHONE
    // =========================================================
    const existingPhone = await cClient.getBySingleCol(
      "phone",
      value.phone,
      { transaction }
    );

    if (existingPhone) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Phone number already in use",
      });
    }

    // =========================================================
    // 3. CHECK EMAIL
    // =========================================================
    const existingEmail = await cClient.getBySingleCol(
      "email",
      value.email,
      { transaction }
    );

    if (existingEmail) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // =========================================================
    // 4. GENERATE DATES
    // =========================================================
    const today = new Date();

    const myToday = today.toISOString().split("T")[0];

    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);

    const Duedate = twoWeeksLater.toISOString().split("T")[0];

    // =========================================================
    // 5. CREATE CLIENT
    // =========================================================
    const myData = {
      ...value,
      suborder_id: 0,
      status: "ACTIVE",
      reffer_by: value.refferByID,
      is_active: 1,
    };

    const createdClient = await cClient.create(myData, {
      transaction,
    });

    // IMPORTANT:
    // Get the ID directly from the created record.
    const client_ID = createdClient.id;

    if (!client_ID) {
      throw new Error("Client ID was not returned after client creation");
    }

    // =========================================================
    // 6. GENERATE ACCOUNT NUMBER
    // =========================================================
    const acct_no = 190100 + Number(client_ID);

    await cClient.getRecByID(
      "id",
      acct_no,
      client_ID,
      { transaction }
    );

    // =========================================================
    // 7. CREATE SUBSCRIPTION ORDER
    // =========================================================
    const [subOrderResult] = await sequelize.query(
      `
        INSERT INTO tblsuborder
        (
          sub_id,
          client_id,
          due_date,
          isactive,
          sub_status,
          start_date
        )
        VALUES
        (
          :sub_id,
          :client_id,
          :due_date,
          :isactive,
          :sub_status,
          :startDate
        )
      `,
      {
        replacements: {
          sub_id: 1,
          client_id: client_ID,
          due_date: Duedate,
          isactive: 1,
          sub_status: "Active",
          startDate: myToday,
        },
        type: sequelize.QueryTypes.INSERT,
        transaction,
      }
    );

    // MySQL returns the inserted ID here.
    const subOrderId = subOrderResult;

    if (!subOrderId) {
      throw new Error("Subscription order was not created");
    }

    // =========================================================
    // 8. UPDATE CLIENT WITH SUBORDER ID
    // =========================================================
    await cClient.updateOneColumn(
      client_ID,
      "suborder_id",
      subOrderId,
      { transaction }
    );

    // =========================================================
    // 9. CREATE DEFAULT ACCOUNTS / PERSONS
    // =========================================================
    const Subsdiary = [
      {
        la_id: 1,
        full_name: "PURCHASES ACCOUNT",
        contact_type: "SUBSIDIARY",
        ptype: "CA",
        clt_id: client_ID,
        store_id: 1,
        flg: "SHOW",
      },
      {
        la_id: 2,
        full_name: "SALES ACCOUNT",
        contact_type: "SUBSIDIARY",
        ptype: "CA",
        clt_id: client_ID,
        store_id: 1,
        flg: "SHOW",
      },
      {
        la_id: 3,
        full_name: "RETURN INWARD",
        contact_type: "SUBSIDIARY",
        ptype: "CA",
        clt_id: client_ID,
        store_id: 1,
        flg: "SHOW",
      },
      {
        la_id: 4,
        full_name: "RETURN OUTWARD",
        contact_type: "SUBSIDIARY",
        ptype: "CA",
        clt_id: client_ID,
        store_id: 1,
      },
      {
        la_id: 5,
        full_name: "CASH ACCOUNT",
        contact_type: "SUBSIDIARY",
        ptype: "CA",
        clt_id: client_ID,
        store_id: 1,
        flg: "SHOW",
      },
      {
        la_id: 7,
        full_name: "ADMINISTRATIVE COST",
        contact_type: "SUBSIDIARY",
        ptype: "CA",
        clt_id: client_ID,
        store_id: 1,
        flg: "SHOW",
      },
      {
        la_id: 7,
        full_name: "OPERATION COST",
        contact_type: "SUBSIDIARY",
        ptype: "CA",
        clt_id: client_ID,
        store_id: 1,
        flg: "SHOW",
      },
      {
        la_id: 7,
        full_name: "FINANCE COST",
        contact_type: "SUBSIDIARY",
        ptype: "CA",
        clt_id: client_ID,
        store_id: 1,
      },
      {
        la_id: 7,
        full_name: "OTHER EXPENSES",
        contact_type: "SUBSIDIARY",
        ptype: "CA",
        clt_id: client_ID,
        store_id: 1,
        flg: "SHOW",
      },
      {
        la_id: 8,
        full_name: "LAND",
        contact_type: "SUBSIDIARY",
        ptype: "CA",
        clt_id: client_ID,
        store_id: 1,
        flg: "SHOW",
      },
      {
        la_id: 13,
        full_name: "CAPITAL",
        contact_type: "SUBSIDIARY",
        ptype: "CA",
        clt_id: client_ID,
        store_id: 1,
        flg: "SHOW",
      },
      {
        la_id: 14,
        full_name: "OTHER INCOME",
        contact_type: "SUBSIDIARY",
        ptype: "CA",
        clt_id: client_ID,
        store_id: 1,
        flg: "SHOW",
      },
      {
        la_id: 0,
        full_name: "CASH SALES",
        contact_type: "CUSTOMER",
        ptype: "PA",
        clt_id: client_ID,
        store_id: 1,
        flg: "SHOW",
      },
      {
        la_id: 0,
        full_name: "SUPPLIERS",
        contact_type: "SUPPLIERS",
        ptype: "PA",
        clt_id: client_ID,
        store_id: 1,
        flg: "SHOW",
      },
      {
        la_id: 0,
        full_name: value.company_name,
        contact_type: "STOCKIN",
        ptype: "",
        clt_id: client_ID,
        store_id: 1,
        flg: "SHOW",
      },
    ];

    await cPersons.bulkCreate(Subsdiary, {
      transaction,
    });

    // =========================================================
    // 10. CREATE DEFAULT ROLES
    // =========================================================
    const Roles = [
      {
        rolename: "ADMIN",
        permission:
          "subhistory,dashboard,ledger,pos,stockin,purchase,returnin,returnout,reprint,expenses,capital,users,products,view_unit,all_inventory,backup,cashbook,customeranalysis,evacuate,expire_noti,inventory,jornals,ledgerbal,otherincome,post,prev,saleanalysis,salesincome,salesrecord,settings,statement,stockout,suppliers,trailbal,cusanalys,uptroles,accountreport,journals",
        clt_id: client_ID,
      },
      {
        rolename: "CASHIER",
        permission:
          "dashboard,ledger,pos,purchase,returnin,returnout,reprint,expenses,all_inventory,customeranalysis,products",
        clt_id: client_ID,
      },
      {
        rolename: "USER",
        permission:
          "dashboard,ledger,pos,all_inventory",
        clt_id: client_ID,
      },
    ];

    await cRoles.bulkCreate(Roles, {
      transaction,
    });

    // =========================================================
    // 11. CREATE DEFAULT SETTINGS
    // =========================================================
    await sequelize.query(
      `
        INSERT INTO tblsettings
        (
          validate_stockbal,
          expiring_perct,
          stock_out_perct,
          profit_margin_perct,
          currency,
          clt_id
        )
        VALUES
        (
          :validate_stockbal,
          :expiring_perct,
          :stock_out_perct,
          :profit_margin_perct,
          :currency,
          :clt_id
        )
      `,
      {
        replacements: {
          validate_stockbal: "YES",
          expiring_perct: 30,
          stock_out_perct: 90,
          profit_margin_perct: 10,
          currency: "NGN",
          clt_id: client_ID,
        },
        type: sequelize.QueryTypes.INSERT,
        transaction,
      }
    );

    // =========================================================
    // 12. EVERYTHING SUCCEEDED
    // =========================================================
    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Successfully",
      regno: acct_no,
      cleintID: client_ID,
    });

  } catch (err) {
    // =========================================================
    // ANY ERROR = ROLLBACK EVERYTHING
    // =========================================================
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    console.error("Registration failed:", err);

    return res.status(500).json({
      success: false,
      message: "Registration failed. No changes were saved.",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : undefined,
    });
  }
});









router.get(
  "/api/v2/register",
  verifyAdmin,
  //authorizePermission("expenses"),
  async (req, res) => {
    //console.log(req.userDtl[0].id)

    let qry = ``;

    qry = `SELECT c.*, u.surname AS suz,u.othername AS othr,u.email AS eml, u.acct_no FROM clients c, users u WHERE c.reffer_by = u.id ORDER BY c.id DESC`;
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

//router.patch(

module.exports = router;
