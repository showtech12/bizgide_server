const { Sequelize } = require("sequelize");

//const sequelize = new Sequelize('asademo', 'asademouser', '9gDxr7q#JRoBTdYr#u8M', {
const sequelize = new Sequelize('bizgide_db', 'root', '', {
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
