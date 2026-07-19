const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

class User extends Model {}

User.init(
  {
    surname: {
      type: DataTypes.STRING,
    },
    othername: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    acct_no: {
      type: DataTypes.STRING,
    },
    User_Name: {
      type: DataTypes.STRING,
    },
    PassWord: {
      type: DataTypes.STRING,
    },
    position: {
      type: DataTypes.STRING,
    },
    role_id: {
      type: DataTypes.STRING,
    },
    IsActive: {
      type: DataTypes.STRING,
    },
    ISLogin: {
      type: DataTypes.STRING,
    },
    Date_Last_Login: {
      type: DataTypes.STRING,
    },
    Time_Last_Login: {
      type: DataTypes.STRING,
    },
    Date_Last_Modified: {
      type: DataTypes.STRING,
    },
    Date_Last_LogOut: {
      type: DataTypes.STRING,
    },
    store_id: {
      type: DataTypes.INTEGER,
    },
    gender: {
      type: DataTypes.STRING,
    },
    store_name: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.STRING,
    },
    Token: {
      type: DataTypes.STRING,
    },
    reg_date: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    local_gvt: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    acct_type: {
      type: DataTypes.STRING,
    },
    isVeri: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "tblusers",
    timestamps: false,

    indexes: [
      // Login (recommended if using hashed passwords)
      {
        name: "idx_users_login",
        fields: ["email", "acct_type", "role_id"],
      },
      {
        unique: true,
        name: "uk_users_email",
        fields: ["email"],
      },

      // Username login
      {
        name: "idx_users_username",
        fields: ["User_Name"],
      },

      // Phone lookup
      {
        unique: true,
        name: "idx_users_phone",
        fields: ["phone"],
      },

      // Account number lookup
      {
        unique: true,
        name: "idx_users_acct_no",
        fields: ["acct_no"],
      },

      // Role joins
      {
        name: "idx_users_role",
        fields: ["role_id"],
      },

      // Users in a store
      {
        name: "idx_users_store",
        fields: ["store_id"],
      },

      // Store + account type
      {
        name: "idx_users_store_type",
        fields: ["store_id", "acct_type"],
      },

      // Active users
      {
        name: "idx_users_active",
        fields: ["IsActive"],
      },

      // Verification status
      {
        name: "idx_users_verified",
        fields: ["isVeri"],
      },

      // Token lookup
      {
        name: "idx_users_token",
        fields: ["Token"],
      },
    ],
  },
);
module.exports = User;
