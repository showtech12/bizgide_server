const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

class Chatz extends Model {}

Chatz.init(
  {

    person_id: {
        type: DataTypes.INTEGER,
      },

    person_name: {
      type: DataTypes.STRING,
    },

    person_type: {
      type: DataTypes.STRING,
    },

    dated: {
      type: DataTypes.STRING,
    },
    
    msg: {
      type: DataTypes.TEXT,
    },
   
    
    
  },
  {
    sequelize,
    modelName: "tblchat",
    timestamps: false,
  }
);
module.exports = Chatz;