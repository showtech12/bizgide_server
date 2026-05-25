const chat = require("./chat.model");
const NotFoundException = require("../../Exceptions/Exception");
const Tools = require("../../shared/commonTools");
const bcryptjs = require("bcryptjs");

const getAllMsg = async (mypages) => {
    const { page, size } = mypages;
    const usersWithCount = await chat.findAndCountAll({
      limit: size,
      offset: page * size,
     // where:{"acct_type":"STAFF"},
     // attributes: { exclude: ["createdAt", "Token"] },
      order: [
        ['id','DESC']
      ]
    });
  
    // console.log(usersWithCount.rows[5].dataValues.othername);
  
    return {
      success: true,
      //  data: usersWithCount.rows[5],
      data: usersWithCount.rows,
      totalPages: Math.ceil(usersWithCount.count / Number.parseInt(size)),
    };
  };

  module.exports ={
    getAllMsg}