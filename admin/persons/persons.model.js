const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

class Persons extends Model {}

Persons.init(
  {
    reg_date1: {
      type: DataTypes.STRING,
    },
    acct_type: {
      type: DataTypes.STRING,
    },
    sur_name: {
      type: DataTypes.STRING,
    },
    middle_name: {
      type: DataTypes.STRING,
    },
    other_name: {
      type: DataTypes.STRING,
    },
    e_mail: {
      type: DataTypes.STRING,
    },
    phone_num: {
      type: DataTypes.STRING,
    },
    bvn_num: {
      type: DataTypes.STRING,
    },
    pass_Word: {
      type: DataTypes.STRING,
    },
    isVerified: {
      type: DataTypes.STRING,
    },
    account_id: {
      type: DataTypes.STRING,
    },
    date_of_birth: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    local_govt: {
      type: DataTypes.STRING,
    },
    home_address: {
      type: DataTypes.TEXT,
    },
    state_adrs: {
      type: DataTypes.TEXT,
    },
    state_adrs: {
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.STRING,
    },
    last_time_login: {
      type: DataTypes.STRING,
    },
    isActive1: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.STRING,
    },
    Token: {
      type: DataTypes.TEXT,
    },

    position: {
      type: DataTypes.STRING,
    },

    passport_path: {
      type: DataTypes.STRING,
    },

    bank_acct_name: {
      type: DataTypes.STRING,
    },

    bank_acct_no: {
      type: DataTypes.STRING,
    },
    bank_name: {
      type: DataTypes.STRING,
    },
    isprof: {
      type: DataTypes.STRING,
    },

    isveribvn: {
      type: DataTypes.INTEGER,
    },
    
    
  },
  {
    sequelize,
    modelName: "persons",
    timestamps: false,
  }
);
module.exports = Persons;
