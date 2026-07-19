const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

class Products extends Model {}

Products.init(
  {
    product_name: {
      type: DataTypes.STRING,
    },

    bar_code: {
      type: DataTypes.STRING,
    },

    size: {
      type: DataTypes.STRING,
    },

    selling_price: {
      type: DataTypes.DECIMAL(11, 2),
      allowNull: false,
    },

    unit_sell_price: {
      type: DataTypes.DECIMAL(11, 2),
      allowNull: false,
    },

    cost_price: {
      type: DataTypes.DECIMAL(11, 2),
      allowNull: false,
    },

    model: {
      type: DataTypes.STRING,
    },

    brand: {
      type: DataTypes.STRING,
    },

    category: {
      type: DataTypes.STRING,
    },

    store_id: {
      type: DataTypes.INTEGER,
    },

    product_code: {
      type: DataTypes.STRING,
    },

    quantity: {
      type: DataTypes.STRING,
    },

    dateid: {
      type: DataTypes.INTEGER,
    },

    user_id: {
      type: DataTypes.INTEGER,
    },

    vat_amtz: {
      type: DataTypes.DECIMAL(11, 2),
      allowNull: false,
    },

    flag: {
      type: DataTypes.STRING,
    },

    piecies_value: {
      type: DataTypes.STRING,
    },

    mfg_date: {
      type: DataTypes.STRING,
    },

    expiry_date: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "products",
    timestamps: false,

    indexes: [
      // Product code lookup
      {
        name: "idx_products_code",
        fields: ["product_code"],
      },

      // Barcode scanning
      {
        name: "idx_products_barcode",
        fields: ["bar_code"],
      },

      // Product name search
      {
        name: "idx_products_name",
        fields: ["product_name"],
      },

      // Store products
      {
        name: "idx_products_store",
        fields: ["store_id"],
      },

      // Category filtering
      {
        name: "idx_products_category",
        fields: ["category"],
      },

      // Brand filtering
      {
        name: "idx_products_brand",
        fields: ["brand"],
      },

      // Expiry reports
      {
        name: "idx_products_expiry",
        fields: ["expiry_date"],
      },

      // Active/Inactive products
      {
        name: "idx_products_flag",
        fields: ["flag"],
      },

      // Products by store and category
      {
        name: "idx_products_store_category",
        fields: ["store_id", "category"],
      },

      // Products by store and barcode
      {
        name: "idx_products_store_barcode",
        fields: ["store_id", "bar_code"],
      },

      // Products by store and product code
      {
        name: "idx_products_store_code",
        fields: ["store_id", "product_code"],
      },
    ],
  }
);
module.exports = Products;
