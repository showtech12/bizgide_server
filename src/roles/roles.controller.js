const roles = require("./roles.model");
//const NotFoundException = require("../../Exceptions/Exception");
// const Tools = require("../../shared/commonTools");
// const bcryptjs = require("bcryptjs");

const create = async (body) => {
  // console.log(body)
  await roles.create(body);
};

const bulkCreate = async (data, options = {}) => {
  try {
    return await roles.bulkCreate(data, options);
  } catch (error) {
    throw error;
  }
};

module.exports = { create,bulkCreate };