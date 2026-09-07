import axios from "axios";
import sequelize from "../config/database.js";
import checkTnxRef from "./checkTnxRef.js";

export const verifySubscriptionPayment = async (req, res) => {
  let transaction;

  try {
    const { reference } = req.params;

    // ============================================================
    // 1. VALIDATE REFERENCE
    // ============================================================

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required",
      });
    }

    // ============================================================
    // 2. VERIFY PAYMENT WITH PAYSTACK
    // ============================================================

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const trnx = response.data.data;

    console.log("Paystack transaction:", trnx);

    if (trnx.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Payment was not successful",
        status: trnx.status,
      });
    }

    // ============================================================
    // 3. GET PAYMENT METADATA
    // ============================================================

    const customerData = trnx.metadata?.customer;
    const subData = trnx.metadata?.subscription;

    if (!customerData?.client_id) {
      throw new Error(
        "Customer client_id is missing from payment metadata."
      );
    }

    if (!subData?.subID) {
      throw new Error(
        "Subscription ID is missing from payment metadata."
      );
    }

    const months = parseInt(subData.subPeriod, 10);

    if (!Number.isInteger(months) || months <= 0) {
      throw new Error("Invalid subscription period.");
    }

    const clientId = customerData.client_id;
    const txReference = trnx.reference;

    // ============================================================
    // 4. START DATABASE TRANSACTION
    // ============================================================

    transaction = await sequelize.transaction();

    // ============================================================
    // 5. CHECK IF PAYMENT HAS ALREADY BEEN PROCESSED
    // ============================================================

    const [existingTransaction] = await sequelize.query(
      `
        SELECT *
        FROM tblsuborder
        WHERE tnx_ref = :reference
        LIMIT 1
        FOR UPDATE
      `,
      {
        replacements: {
          reference: txReference,
        },
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    if (existingTransaction) {
      await transaction.commit();
      transaction = null;

      return res.status(200).json({
        success: true,
        alreadyProcessed: true,
        message: "This transaction has already been processed.",
        data: existingTransaction,
      });
    }

    // ============================================================
    // 6. LOCK CURRENT ACTIVE SUBSCRIPTION
    // ============================================================

    const [currentSubscription] = await sequelize.query(
      `
        SELECT
          id,
          client_id,
          due_date,
          isactive,
          sub_status
        FROM tblsuborder
        WHERE client_id = :clientId
          AND isactive = 1
        ORDER BY due_date DESC
        LIMIT 1
        FOR UPDATE
      `,
      {
        replacements: {
          clientId,
        },
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    console.log(
      "Current subscription:",
      currentSubscription
    );

    // ============================================================
    // 7. CALCULATE SUBSCRIPTION DATES
    // ============================================================

    const today = new Date();

    const startDate = today.toISOString().split("T")[0];

    let baseDate = today;

    // If customer still has an active subscription
    // and it has not expired, extend from existing due date.
    if (currentSubscription?.due_date) {
      const existingDueDate = new Date(
        currentSubscription.due_date
      );

      if (existingDueDate > today) {
        baseDate = existingDueDate;
      }
    }

    const dueDateObj = new Date(baseDate);

    dueDateObj.setMonth(
      dueDateObj.getMonth() + months
    );

    const dueDate = dueDateObj
      .toISOString()
      .split("T")[0];

    console.log("Subscription dates:", {
      startDate,
      dueDate,
    });

    // ============================================================
    // 8. DEACTIVATE CURRENT SUBSCRIPTION
    // ============================================================

    if (currentSubscription) {
      await sequelize.query(
        `
          UPDATE tblsuborder
          SET
            isactive = 0,
            sub_status = 'DEACTIVATE'
          WHERE id = :id
        `,
        {
          replacements: {
            id: currentSubscription.id,
          },
          type: sequelize.QueryTypes.UPDATE,
          transaction,
        }
      );
    }

    // ============================================================
    // 9. INSERT NEW SUBSCRIPTION
    // ============================================================

    await sequelize.query(
      `
        INSERT INTO tblsuborder
        (
          sub_id,
          client_id,
          due_date,
          isactive,
          sub_status,
          tnx_ref,
          start_date
        )
        VALUES
        (
          :subId,
          :clientId,
          :dueDate,
          1,
          'ACTIVE',
          :txRef,
          :startDate
        )
      `,
      {
        replacements: {
          subId: subData.subID,
          clientId,
          dueDate,
          txRef: txReference,
          startDate,
        },
        type: sequelize.QueryTypes.INSERT,
        transaction,
      }
    );

    // ============================================================
    // 10. COMMIT EVERYTHING
    // ============================================================

    await transaction.commit();
    transaction = null;

    console.log(
      `Subscription payment ${txReference} successfully committed.`
    );

    // ============================================================
    // 11. RESPONSE
    // ============================================================

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        transaction: trnx,
        subscription: {
          client_id: clientId,
          sub_id: subData.subID,
          start_date: startDate,
          due_date: dueDate,
          status: "ACTIVE",
        },
      },
    });

  } catch (error) {

    // ============================================================
    // 12. ROLLBACK IF ANY DATABASE OPERATION FAILED
    // ============================================================

    if (transaction && !transaction.finished) {
      try {
        await transaction.rollback();

        console.log(
          "Database transaction rolled back."
        );
      } catch (rollbackError) {
        console.error(
          "Rollback error:",
          rollbackError?.message
        );
      }
    }

    // ============================================================
    // 13. LOG ERROR
    // ============================================================

    console.error(
      "Payment verification error:",
      error?.response?.data || error?.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment",
      error:
        process.env.NODE_ENV === "development"
          ? error?.message
          : undefined,
    });
  }
};


// export const verifySubscriptionPayment = async (req, res) => {
//  // console.log("A here now");
//   try {
//     const { reference } = req.params;

//     if (!reference) {
//       return res.status(400).json({
//         success: false,
//         message: "Payment reference is required",
//       });
//     }
//     //sequelize

//     const response = await axios.get(
//       `https://api.paystack.co/transaction/verify/${encodeURIComponent(
//         reference,
//       )}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         },
//       },
//     );

//     const trnx = response.data.data;

//     console.log("Paystack transaction:", trnx);

//     if (trnx.status !== "success") {
//       return res.status(400).json({
//         success: false,
//         message: "Payment was not successful",
//         status: trnx.status,
//       });
//     }

//     //=================== Check if not in databas ================
//     const existingTransaction = await checkTnxRef(trnx.reference);

//     if (existingTransaction) {
//       return res.status(200).json({
//         success: true,
//         alreadyProcessed: true,
//         message: "This transaction has already been processed.",
//         data: existingTransaction,
//       });
//     }
//     //=================== Check if not in databas ================
//      const customerData = trnx.metadata.customer;
//     const subData = trnx.metadata.subscription;
//     // ==========================================
//     // DEACTIVATE SUBSCRIPTION
//     // ==========================================

//     const qry = `
//       UPDATE tblsuborder
//       SET 
//         isactive = 0,
//         sub_status = 'DEACTIVATE'
//       WHERE client_id = :cid
//     `;

//     const [results] = await sequelize.query(qry, {
//       replacements: { cid : customerData.client_id },
//       type: sequelize.QueryTypes.UPDATE,
//     });

//     //=================================================
   

//     // Get subscription period from Paystack metadata
//     const months = parseInt(subData.subPeriod, 10);

//     if (!Number.isInteger(months) || months <= 0) {
//       throw new Error("Invalid subscription period.");
//     }

//     // Calculate due date
//     const today = new Date();
//     const myToday = today.toISOString().split("T")[0];
//     const LaterDay = new Date(today);
//     LaterDay.setMonth(LaterDay.getMonth() + months);

//     const Duedate = LaterDay.toISOString().split("T")[0];

//     //==============================================================
//     // Insert subscription order
//     //==============================================================
//     const [subOrderMaxID] = await sequelize.query(
//       `
//     INSERT INTO tblsuborder
//     (
//       sub_id,
//       client_id,
//       due_date,
//       isactive,
//       sub_status,
//       tnx_ref,
//       start_date
//     )
//     VALUES
//     (
//       :sub_id,
//       :client_id,
//       :due_date,
//       :isactive,
//       :sub_status,
//       :txRef,
//       :startDate
//     )
//   `,
//       {
//         replacements: {
//           sub_id: subData.subID,
//           client_id: customerData.client_id,
//           due_date: Duedate,
//           isactive: 1,
//           sub_status: "ACTIVE",
//           txRef: trnx.reference,
//           startDate: myToday,
//         },
//         type: sequelize.QueryTypes.INSERT,
//       },
//     );

//     // Then activate subscription in database.

//     return res.json({
//       success: true,
//       message: "Payment verified successfully",
//       data: trnx,
//     });
//   } catch (error) {
//     console.error(
//       "Payment verification error:",
//       error?.response?.data || error?.message,
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Unable to verify payment",
//     });
//   }
// };
