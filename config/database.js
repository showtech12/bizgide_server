const { Sequelize } = require("sequelize");

//const sequelize = new Sequelize('bizgidedbz', 'bizgideuserz', 'c6cy0UkiYkWA1Ak4Yv2l', {
const sequelize = new Sequelize('bizgidedbz', 'root', '', {
// const sequelize = new Sequelize(
//   process.env.DB,
//   process.env.USER,
//   process.env.PWD,
//   {
    //dialect: "mysql",
    //host: "mysql-accusoft.alwaysdata.net",
    //host: "localhost",
    host: "127.0.0.1",
    logging: false,
    dialect: "mysql",
    port: 3306,
  },
);

module.exports = sequelize;
