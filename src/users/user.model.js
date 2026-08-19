const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const { QueryTypes } = require("sequelize");

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    acct_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
      
    },
    acct_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      
    },
    surname: {
      type: DataTypes.STRING(250),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

     othername: {
      type: DataTypes.STRING(250),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    phone: {
      type: DataTypes.STRING(11),
      allowNull: true,
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING(10),
    },

    role_id:{
        type: DataTypes.INTEGER
    },

    // role: {
    //   type: DataTypes.ENUM(
    //     "SUPER_ADMIN",
    //     "ADMIN",
    //     "STAFF"
    //   ),
    //   allowNull: false,
    //   defaultValue: "STAFF",
    // },

    status: {
      type: DataTypes.ENUM(
        "ACTIVE",
        "INACTIVE",
        "SUSPENDED"
      ),
      allowNull: false,
      defaultValue: "ACTIVE",
    },

    last_login: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",

    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    underscored: true,
    freezeTableName: true,
  }
);

module.exports = User;