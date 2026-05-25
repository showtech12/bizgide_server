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
      type: DataTypes.DECIMAL(11,2),
      allowNull: false
    },
    unit_sell_price: {
      type: DataTypes.DECIMAL(11,2),
      allowNull: false
    },
    cost_price: {
      type: DataTypes.DECIMAL(11,2),
      allowNull: false
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
     type: DataTypes.DECIMAL(11,2),
      allowNull: false
    },
    flag: {
      type: DataTypes.STRING,
    },
    
    piecies_value: {
      type: DataTypes.STRING,
    },
   
   
  
   
    
  },
  {
    sequelize,
    modelName: "products",
    timestamps: false,
  }
);
module.exports = Products;
