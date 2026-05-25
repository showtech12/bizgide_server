const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

class Orders extends Model {}

Orders.init(
  {
    person_id: {
      type: DataTypes.INTEGER,
    },
    invoice_no: {
      type: DataTypes.STRING,
    },
    order_mode: {
      type: DataTypes.STRING,
    },
    order_date: {
      type: DataTypes.STRING,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    transact_id: {
      type: DataTypes.INTEGER,
    },
    verified_by: {
      type: DataTypes.INTEGER,
    },
    
    bank_statement_path: {
        type: DataTypes.STRING,
      },
    id_pathe: {
      type: DataTypes.STRING,
    },
    gurantor_surname1: {
      type: DataTypes.STRING,
    },
    gurantor_othername1: {
      type: DataTypes.STRING,
    },
    gurantor_id_path1: {
      type: DataTypes.STRING,
    },
    gurantor_surname2: {
      type: DataTypes.STRING,
    },
    gurantor_othername2: {
      type: DataTypes.STRING,
    },
    guarantor_id_path2: {
      type: DataTypes.TEXT,
    },
   
    company_cert_path: {
      type: DataTypes.STRING,
    },
    company_memart_path: {
      type: DataTypes.STRING,
    },
    doc_of_collatera_path: {
      type: DataTypes.STRING,
    },
    lpo_doc_pathe: {
      type: DataTypes.STRING,
    },
    loan_type: {
        type: DataTypes.STRING,
      },

    loan_amt: {
        type: DataTypes.DECIMAL(15,2),
    },

    loan_period: {
        type: DataTypes.STRING,
    },

    loan_repay_source: {
        type: DataTypes.STRING,
    },

    b_v_n: {
        type: DataTypes.STRING,
    },

    interest_pect: {
        type: DataTypes.DECIMAL(11,2),
    },

    interest_amt: {
        type: DataTypes.DECIMAL(11,2),
    },

    end_date_loan: {
        type: DataTypes.STRING,
    },
    isLetter: {
      type: DataTypes.STRING,
  },
  isCol_Loan: {
    type: DataTypes.INTEGER,
  },
  offer_l_upd: {
    type: DataTypes.STRING,
  },

  total_interest_pect: {
    type: DataTypes.DECIMAL(11,2),
  },
total_Loan_P_I: {
  type: DataTypes.DECIMAL(11,2),
},
mnth_pay: {
  type: DataTypes.DECIMAL(11,2),
},
principay_amt: {
  type: DataTypes.DECIMAL(11,2),
},
isCancel: {
  type: DataTypes.INTEGER,
},


    
  },
  {
    sequelize,
    modelName: "loan_orders",
    timestamps: false,
  }
);
module.exports = Orders;
