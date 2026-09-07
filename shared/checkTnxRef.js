import sequelize from "../config/database.js";

const checkTnxRef = async (tnxRef, transaction = null) => {
  if (!tnxRef) {
    throw new Error("Transaction reference is required.");
  }

  const result = await sequelize.query(
    `
      SELECT id, tnx_ref, client_id, sub_id, due_date, isactive, sub_status
      FROM tblsuborder
      WHERE tnx_ref = :tnx_ref
      LIMIT 1
    `,
    {
      replacements: {
        tnx_ref: tnxRef,
      },
      type: sequelize.QueryTypes.SELECT,
      transaction,
    }
  );

  return result.length > 0 ? result[0] : null;
};

export default checkTnxRef;