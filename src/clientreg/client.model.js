const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const { QueryTypes } = require("sequelize");

class Client extends Model {}

Client.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    company_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    surname: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    othername: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    reg_acct_id: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    reffer_by: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(220),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    PassWord: {
      type: DataTypes.STRING,
      field: "PassWord",
    },

    phone: {
      type: DataTypes.STRING(11),
      allowNull: false,
    },

    industry: {
      type: DataTypes.STRING(180),
      allowNull: true,
    },

    // subscription_plan: {
    //   type: DataTypes.STRING(150),
    //   allowNull: true,
    // },

    // subscription_plan: {
    //   type: DataTypes.ENUM(
    //     "Starter",
    //     "Standard",
    //     "Professional",
    //     "Enterprise"
    //   ),
    //   allowNull: true,
    //   defaultValue: "Starter",
    // },

    status: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    // due_date: {
    //   type: DataTypes.STRING(25),
    //   allowNull: true,
    // },
    suborder_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // status: {
    //   type: DataTypes.ENUM(
        // "Trial",
        // "Active",
        // "Suspended",
        // "Expired",
        // "Cancelled"
    //   ),
    //   defaultValue: "Trial",
    // },

    domain: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },

    country: {
      type: DataTypes.STRING(180),
      allowNull: true,
    },

    state: {
      type: DataTypes.STRING(180),
      allowNull: true,
    },

    city: {
      type: DataTypes.STRING(180),
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    trial_ends_at: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    subscription_starts_at: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    subscription_expires_at: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "clients",
    modelName: "Client",

    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
  },
);

module.exports = Client;
