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
    reg_date:{
      type: DataTypes.STRING,
    },
    state:{
      type: DataTypes.STRING,
    },
    local_gvt:{
      type: DataTypes.STRING,
    },
    country:{
      type: DataTypes.STRING,
    },
    acct_type:{
      type: DataTypes.STRING,
    },
    isVeri:{
      type: DataTypes.STRING,
    },
    
    
    
  },
  {
    sequelize,
    modelName: "tblusers",
    timestamps: false,
  }
);
module.exports = User;
