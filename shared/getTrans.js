const sequelize = require("../config/database");

const ProcessTransact = async (
  desc1,
  prs_ID1,
  Atype1,
  Crdtamt1,
  DbtAmt1,
  ca_id,
  Usr_id,
  lgrID,
  date_Id,
  OrdID,
  transaction,
  clientID,
) => {
  // console.log(desc1 + " "+ prs_ID1 +" " +Atype1 + " "+Crdtamt1+" "+DbtAmt1+" "+ca_id+" "+Usr_id+" "+lgrID+" "+" "+date_Id+" "+OrdID )

  try {
    // First transaction details
    //let Dated = currentDate.toISOString().split("T")[0];
    const d = new Date().toISOString().split("T")[0]; // Example for date handling
    const desc = desc1 || ""; // Handle undefined Desc
    const prs_ID = prs_ID1;
    const Atype = Atype1 || "CA";
    const dsc = 0;
    const vatAmt = 0;
    const DbtAmt = DbtAmt1;
    const Crdtamt = Crdtamt1;
    const BalAmt = DbtAmt1 - Crdtamt1;
    const caID = ca_id;
    const Usrid = Usr_id;
    const ledgerID = lgrID;
    const dd = new Date(); // Example for date handling
    let monthNum = (new Date().getMonth() + 1).toString().padStart(2, "0");
    const dateId = date_Id;
    const strID = 1;
    const transID = "0";
    const Ord_ID = OrdID;

    // First transaction insert
    await sequelize.query(
      `INSERT INTO transactions 
            (dated, Description, PersonID, type, Discount, vatAmt, Debit_Amt, Credit_Amt, Balance_Amt, CA_ID, UserID, ledger_id, Date_Last_Modified, Month, DateID, str_id, trans_id, ord_id,clt_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
      {
        replacements: [
          d,
          desc,
          prs_ID,
          Atype,
          dsc,
          vatAmt,
          DbtAmt,
          Crdtamt,
          BalAmt,
          caID,
          Usrid,
          ledgerID,
          d,
          monthNum,
          dateId,
          strID,
          transID,
          Ord_ID,
          clientID,
        ],
        type: sequelize.QueryTypes.INSERT,
        transaction,
      },
    );

    let ResMAxID = await sequelize.query(
      `SELECT MAX(id) AS id FROM transactions`,
      { type: sequelize.QueryTypes.SELECT, transaction },
    );

    var maxID = Number(ResMAxID[0].id);
    //console.log(maxID)
    //const TrandID = 10000 + Number(maxID);
    const TrandID = 100000 + (Number(maxID) || 0);

    await sequelize.query(
      `UPDATE transactions SET trans_id ='${TrandID}' WHERE id ='${maxID}'`,
      { type: sequelize.QueryTypes.UPDATE, transaction },
    );

    return TrandID;

    // return result[0].id;

    // Second transaction details
    //   const CrdtamtPA = 0;
    //   const DbtAmtPA = req.body.OrdAmt ;
    //   const BalAmtPA = DbtAmt1 - Crdtamt1;
    //   const prs_IDPA = req.body.PIDG;
    //   const AtypePA = "PA";
    //   const descPA = "Monthly Loan Repay By --- Via ----";

    //   // Second transaction insert
    //   await sequelize.query(
    //     `INSERT INTO transactions
    //     (dated, DESCRIPTION, PersonID, type, Discount, vatAmt, Debit_Amt, Credit_Amt, Balance_Amt, CA_ID, UserID, ledger_id, Date_Last_Modified, Month, DateID, str_id, trans_id, ord_id)
    //     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    //     {
    //       replacements: [
    //         d, desc1, prs_ID1, Atype1, dsc, vatAmt, DbtAmt1,
    //         Crdtamt1, BalAmt1, caID, Usrid, ledgerID, dd,
    //         monthNum, dateId, strID, transID, Ord_ID
    //       ],
    //       type: sequelize.QueryTypes.INSERT
    //     }
    //   );

    // Success response
    //   res.status(200).json({
    //     success: true,
    //     message: "Transaction processed successfully",
    //   });
  } catch (error) {
    await transaction.rollback();
    console.error("Error processing transaction:", error);
    return error;
    // res.status(500).json({
    //   success: false,
    //   message: "An error occurred while processing the transaction",
    //   error: error.message
    // });
  }
};

const getStockBal = async (prdtid, str_id, transaction, clientID) => {
  try {
    const [result] = await sequelize.query(
      `
      SELECT COALESCE(SUM(d.stock_bal), 0) AS sbal
      FROM order_details d
      INNER JOIN orders o ON d.orders_id = o.id
      WHERE d.product_id = ?
        AND o.store = ?
        AND o.clt_id = ?
      FOR UPDATE
      `,
      {
        replacements: [prdtid, str_id, clientID],
        type: sequelize.QueryTypes.SELECT,
        transaction,
      },
    );

    return Number(result.sbal);
  } catch (error) {
    console.error("Error fetching stock balance:", error);
    throw error;
  }
};

const get1Col = async (col, table, id, clientID) => {
  try {
    // Whitelist validation (IMPORTANT)
    const allowedTables = ["persons", "wallets", "products"]; // adjust
    const allowedColumns = ["la_id", "name", "balance"]; // adjust

    if (!allowedTables.includes(table)) {
      throw new Error("Invalid table name");
    }

    if (!allowedColumns.includes(col)) {
      throw new Error("Invalid column name");
    }

    const result = await sequelize.query(
      `SELECT ${col} FROM ${table} WHERE id = ? AND clt_id='${clientID}' LIMIT 1`,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT,
      },
    );

    return result.length ? result[0][col] : null;
  } catch (error) {
    console.error("Error fetching column:", error);
    throw error;
  }
};

const getIdByColumn = async (table, searchColumn, searchValue, clientID) => {
  try {
    // Whitelist validation
    const allowedTables = ["persons", "wallets", "products"];

    const allowedColumns = ["id", "la_id", "name", "balance"];

    if (!allowedTables.includes(table)) {
      throw new Error("Invalid table name");
    }

    if (!allowedColumns.includes(searchColumn)) {
      throw new Error("Invalid column name");
    }

    const result = await sequelize.query(
      `SELECT id 
       FROM ${table} 
       WHERE ${searchColumn} = ? 
       AND clt_id = ? 
       LIMIT 1`,
      {
        replacements: [searchValue, clientID],
        type: sequelize.QueryTypes.SELECT,
      },
    );

    return result.length ? result[0].id : null;
  } catch (error) {
    console.error("Error fetching ID:", error);
    throw error;
  }
};

const ProcessCheckout = async (
  desc1,
  prs_ID1,
  Atype1,
  Crdtamt1,
  DbtAmt1,
  ca_id,
  Usr_id,
  lgrID,
  date_Id,
  OrdID,
  Tdsc,
  Tvat,
  transaction,
  ClientID,
) => {
  // console.log(desc1 + " "+ prs_ID1 +" " +Atype1 + " "+Crdtamt1+" "+DbtAmt1+" "+ca_id+" "+Usr_id+" "+lgrID+" "+" "+date_Id+" "+OrdID )

  let retries = 3;

  while (retries > 0) {
    //const transaction = await sequelize.transaction();

    //const transaction = await sequelize.transaction();

    try {
      //   // First transaction details
      //let Dated = currentDate.toISOString().split("T")[0];
      const d = new Date().toISOString().split("T")[0]; // Example for date handling
      const desc = desc1 || ""; // Handle undefined Desc
      const prs_ID = prs_ID1;
      const Atype = Atype1 || "CA";
      const dsc = Tdsc;
      const vatAmt = Tvat;
      const DbtAmt = DbtAmt1;
      const Crdtamt = Crdtamt1;
      const BalAmt = DbtAmt1 - Crdtamt1;
      const caID = ca_id;
      const Usrid = Usr_id;
      const ledgerID = lgrID;
      const dd = new Date(); // Example for date handling
      let monthNum = (new Date().getMonth() + 1).toString().padStart(2, "0");
      const dateId = date_Id;
      const strID = 1;
      //const transID = "0";
      const Ord_ID = OrdID;

      const [result] = await sequelize.query(
        `INSERT INTO transactions
        (
            dated,
            Description,
            PersonID,
            type,
            Discount,
            vatAmt,
            Debit_Amt,
            Credit_Amt,
            Balance_Amt,
            CA_ID,
            UserID,
            ledger_id,
            Date_Last_Modified,
            Month,
            DateID,
            str_id,
            trans_id,
            ord_id,
            clt_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            d,
            desc,
            prs_ID,
            Atype,
            dsc,
            vatAmt,
            DbtAmt,
            Crdtamt,
            BalAmt,
            caID,
            Usrid,
            ledgerID,
            d,
            monthNum,
            dateId,
            strID,
            0,
            Ord_ID,
            ClientID,
          ],
          type: sequelize.QueryTypes.INSERT,
          transaction,
        },
      );

      const insertId = result;

      const transID = 100000 + insertId;

      await sequelize.query(
        `UPDATE transactions
         SET trans_id = ?
         WHERE id = ?`,
        {
          replacements: [transID, insertId],
          type: sequelize.QueryTypes.UPDATE,
          transaction,
        },
      );

      //await transaction.commit();

      return insertId;
    } catch (err) {
      //console.log(err);
      await transaction.rollback();

      if (err.original?.code === "ER_LOCK_DEADLOCK") {
        retries--;

        if (!retries) throw err;

        await new Promise((r) => setTimeout(r, 100));

        continue;
      }

      throw err;
    }
  }

  // try {
  //   // First transaction details
  //   //let Dated = currentDate.toISOString().split("T")[0];
  //   const d = new Date().toISOString().split("T")[0]; // Example for date handling
  //   const desc = desc1 || ""; // Handle undefined Desc
  //   const prs_ID = prs_ID1;
  //   const Atype = Atype1 || "CA";
  //   const dsc =  Tdsc;
  //   const vatAmt =  Tvat;
  //   const DbtAmt =  DbtAmt1;
  //   const Crdtamt = Crdtamt1 ;
  //   const BalAmt = DbtAmt1 - Crdtamt1;
  //   const caID = ca_id;
  //   const Usrid = Usr_id;
  //   const ledgerID = lgrID;
  //   const dd = new Date(); // Example for date handling
  //   let monthNum = (new Date().getMonth() + 1).toString().padStart(2, "0");
  //   const dateId = date_Id;
  //   const strID = 1;
  //   const transID = "0";
  //   const Ord_ID = OrdID;

  //   // First transaction insert
  //   await sequelize.query(
  //     `INSERT INTO transactions
  //     (dated, Description, PersonID, type, Discount, vatAmt, Debit_Amt, Credit_Amt, Balance_Amt, CA_ID, UserID, ledger_id, Date_Last_Modified, Month, DateID, str_id, trans_id, ord_id)
  //     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  //     {
  //       replacements: [
  //         d, desc, prs_ID, Atype, dsc, vatAmt, DbtAmt,
  //         Crdtamt, BalAmt, caID, Usrid, ledgerID, d,
  //         monthNum, dateId, strID, transID, Ord_ID
  //       ],
  //       type: sequelize.QueryTypes.INSERT
  //     }
  //   );

  //   let ResMAxID = await sequelize.query(
  //     `SELECT MAX(id) AS id FROM transactions`,
  //     { type: sequelize.QueryTypes.SELECT }
  // );

  // var maxID = Number(ResMAxID[0].id)
  // //console.log(maxID)
  // //const TrandID = 10000 + Number(maxID);
  // const TrandID = 100000 + (Number(maxID) || 0);

  // await sequelize.query(
  //     `UPDATE transactions SET trans_id ='${TrandID}' WHERE id ='${maxID}'`,
  //     { type: sequelize.QueryTypes.UPDATE }
  // );

  // return  maxID;

  // } catch (error) {
  //   console.error('Error processing transaction:', error);
  //   return error;
  //   // res.status(500).json({
  //   //   success: false,
  //   //   message: "An error occurred while processing the transaction",
  //   //   error: error.message
  //   // });
  // }
};

const QtyBal = async (prdtID, transaction, clientID) => {
  const [QBal] = await sequelize.query(
    `
       SELECT SUM(stock_bal) AS qtyBal
        FROM order_details
        WHERE product_id = ? AND clt_id = ?
        FOR UPDATE
        `,
    {
      replacements: [prdtID, clientID],
      type: sequelize.QueryTypes.SELECT,
      transaction,
    },
  );
  const BalQty = QBal.qtyBal;
  //console.log(BalQty)
  return BalQty;
};

const checkoutWithRetry = async (fn, retries = 3) => {

  let attempt = 0;

  while (attempt < retries) {

    let transaction = null;

    try {

      attempt++;

      // NEW transaction for this attempt
      transaction = await sequelize.transaction();

      // Pass transaction into the callback
      const result = await fn(transaction);

      // Commit only after EVERYTHING succeeds
      await transaction.commit();

      return result;

    } catch (err) {

      console.error(
        `Checkout attempt ${attempt} failed:`,
        err.message
      );

      // Rollback only if transaction is still active
      if (
        transaction &&
        !transaction.finished
      ) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error(
            "Rollback error:",
            rollbackError.message
          );
        }
      }

      // Only retry deadlocks
      if (
        err.original?.code === "ER_LOCK_DEADLOCK" ||
        err.parent?.code === "ER_LOCK_DEADLOCK"
      ) {

        if (attempt >= retries) {
          throw err;
        }

        // Small delay before retry
        await new Promise((resolve) =>
          setTimeout(resolve, 150 * attempt)
        );

        continue;
      }

      // Don't retry validation/business errors
      throw err;
    }
  }
};

const checkIdempotencyKey = async (idempotency_key, clientID, transaction) => {
  if (!idempotency_key) {
    return false;
  }

  const existing = await sequelize.query(
    `
      SELECT id, invoice_no
      FROM orders
      WHERE idempotency_key = ?
        AND clt_id = ?
      LIMIT 1
    `,
    {
      replacements: [idempotency_key, clientID],
      type: sequelize.QueryTypes.SELECT,
      transaction,
    }
  );

 // return existing.length > 0;
  return existing.length > 0
    ? existing[0]
    : null;
};

const checkSubUser = async (subID) => {
  const result = await sequelize.query(
    `
      SELECT 
        s.no_of_staff,
        s.sub_space
      FROM tblsuborder so
      INNER JOIN tblsubscription s 
        ON so.sub_id = s.id
      WHERE so.id = ?;
    `,
    {
      replacements: [subID],
      type: sequelize.QueryTypes.SELECT,
     
    }
  );

//   if(result[0].no_of_staff === curentStaff){
//     return false
//   }
//  return true
  return result[0] || null;
};

module.exports = {
  ProcessTransact,
  getStockBal,
  ProcessCheckout,
  get1Col,
  checkoutWithRetry,
  QtyBal,
  getIdByColumn,
  checkIdempotencyKey ,
  checkSubUser,
};
