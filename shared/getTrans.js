const sequelize = require("../config/database");
const ProcessTransact = async (desc1,prs_ID1,Atype1,Crdtamt1,DbtAmt1,ca_id,Usr_id,lgrID,date_Id,OrdID) => {

 // console.log(desc1 + " "+ prs_ID1 +" " +Atype1 + " "+Crdtamt1+" "+DbtAmt1+" "+ca_id+" "+Usr_id+" "+lgrID+" "+" "+date_Id+" "+OrdID )

        try {
          // First transaction details
          //let Dated = currentDate.toISOString().split("T")[0];
          const d = new Date().toISOString().split("T")[0]; // Example for date handling
          const desc = desc1 || ""; // Handle undefined Desc
          const prs_ID = prs_ID1;
          const Atype = Atype1 || "CA";
          const dsc =  0;
          const vatAmt =  0;
          const DbtAmt =  DbtAmt1;
          const Crdtamt = Crdtamt1 ;
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
            (dated, Description, PersonID, type, Discount, vatAmt, Debit_Amt, Credit_Amt, Balance_Amt, CA_ID, UserID, ledger_id, Date_Last_Modified, Month, DateID, str_id, trans_id, ord_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
              replacements: [
                d, desc, prs_ID, Atype, dsc, vatAmt, DbtAmt,
                Crdtamt, BalAmt, caID, Usrid, ledgerID, d,
                monthNum, dateId, strID, transID, Ord_ID
              ],
              type: sequelize.QueryTypes.INSERT
            }
          );

          let ResMAxID = await sequelize.query(
            `SELECT MAX(id) AS id FROM transactions`,
            { type: sequelize.QueryTypes.SELECT }
        );

        var maxID = Number(ResMAxID[0].id)
        //console.log(maxID)
        //const TrandID = 10000 + Number(maxID);
        const TrandID = 100000 + (Number(maxID) || 0);

        
        await sequelize.query(
            `UPDATE transactions SET trans_id ='${TrandID}' WHERE id ='${maxID}'`,
            { type: sequelize.QueryTypes.UPDATE }
        );

        return  TrandID;

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
          console.error('Error processing transaction:', error);
          return error;
          // res.status(500).json({
          //   success: false,
          //   message: "An error occurred while processing the transaction",
          //   error: error.message
          // });
        }
   
 

}

const getStockBal = async (prdtid,str_id) => {
  try {
    const result = await sequelize.query(
      `SELECT SUM(stock_bal) AS sbal FROM order_details d, orders o   WHERE d.product_id = ? AND d.orders_id = o.id AND o.store=?`,
      {
        replacements: [prdtid,str_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return result[0].sbal;
  } catch (error) {
    console.error('Error fetching stock balance:', error);
    throw error;
  }
}

const get1Col = async (col, table, id) => {
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
      `SELECT ${col} FROM ${table} WHERE id = ? LIMIT 1`,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return result.length ? result[0][col] : null;

  } catch (error) {
    console.error("Error fetching column:", error);
    throw error;
  }
};


const ProcessCheckout = async (desc1,prs_ID1,Atype1,Crdtamt1,DbtAmt1,ca_id,Usr_id,lgrID,date_Id,OrdID, Tdsc, Tvat) => {

 // console.log(desc1 + " "+ prs_ID1 +" " +Atype1 + " "+Crdtamt1+" "+DbtAmt1+" "+ca_id+" "+Usr_id+" "+lgrID+" "+" "+date_Id+" "+OrdID )

        try {
          // First transaction details
          //let Dated = currentDate.toISOString().split("T")[0];
          const d = new Date().toISOString().split("T")[0]; // Example for date handling
          const desc = desc1 || ""; // Handle undefined Desc
          const prs_ID = prs_ID1;
          const Atype = Atype1 || "CA";
          const dsc =  Tdsc;
          const vatAmt =  Tvat;
          const DbtAmt =  DbtAmt1;
          const Crdtamt = Crdtamt1 ;
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
            (dated, Description, PersonID, type, Discount, vatAmt, Debit_Amt, Credit_Amt, Balance_Amt, CA_ID, UserID, ledger_id, Date_Last_Modified, Month, DateID, str_id, trans_id, ord_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
              replacements: [
                d, desc, prs_ID, Atype, dsc, vatAmt, DbtAmt,
                Crdtamt, BalAmt, caID, Usrid, ledgerID, d,
                monthNum, dateId, strID, transID, Ord_ID
              ],
              type: sequelize.QueryTypes.INSERT
            }
          );

          let ResMAxID = await sequelize.query(
            `SELECT MAX(id) AS id FROM transactions`,
            { type: sequelize.QueryTypes.SELECT }
        );

        var maxID = Number(ResMAxID[0].id)
        //console.log(maxID)
        //const TrandID = 10000 + Number(maxID);
        const TrandID = 100000 + (Number(maxID) || 0);

        
        await sequelize.query(
            `UPDATE transactions SET trans_id ='${TrandID}' WHERE id ='${maxID}'`,
            { type: sequelize.QueryTypes.UPDATE }
        );

        return  maxID;

     
      
        } catch (error) {
          console.error('Error processing transaction:', error);
          return error;
          // res.status(500).json({
          //   success: false,
          //   message: "An error occurred while processing the transaction",
          //   error: error.message
          // });
        }
   
 

}

module.exports ={ProcessTransact ,getStockBal, ProcessCheckout, get1Col}