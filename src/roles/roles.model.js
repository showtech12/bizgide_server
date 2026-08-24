const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

class Roles extends Model {}

Roles.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    rolename: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    clt_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    permission: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    permission_module: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "tblrole",
    modelName: "Roles",

    // Disable createdAt and updatedAt
    timestamps: false,
  }
);

module.exports = Roles;