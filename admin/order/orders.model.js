const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

class Orders extends Model {}

Orders.init(
  {
    persons_id: {
      type: DataTypes.INTEGER,
    },
    invoice_no: {
      type: DataTypes.STRING,
    },
    order_mode: {
      type: DataTypes.STRING,
    },
    dates: {
      type: DataTypes.STRING,
    },
    store: {
      type: DataTypes.STRING,
    },
    users_id: {
      type: DataTypes.INTEGER,
    },
    transact_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    modelName: "orders",
    timestamps: false,

    indexes: [
      // Search by invoice number
      {
        unique: true,
        name: "uk_orders_invoice_no",
        fields: ["invoice_no"],
      },

      // Queries filtering by date and store
      {
        name: "idx_orders_store_date",
        fields: ["store", "dates"],
      },

      // Queries filtering by customer/person
      {
        name: "idx_orders_persons_id",
        fields: ["persons_id"],
      },

      // Queries filtering by user
      {
        name: "idx_orders_users_id",
        fields: ["users_id"],
      },

      // Queries filtering by transaction
      {
        name: "idx_orders_transact_id",
        fields: ["transact_id"],
      },

      // Composite index if you often search by person and date
      {
        name: "idx_orders_person_date",
        fields: ["persons_id", "dates"],
      },
    ],
  }
);
module.exports = Orders;
