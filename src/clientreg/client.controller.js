const Clients = require("./client.model");
const sequelize = require("../../config/database");
const { QueryTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

const create = async (body) => {
  // Hash password
  //const hashedPassword = await bcrypt.hash(body.password, 10);

  // Replace plain password with hashed password
  //body.password = hashedPassword;

  return await Clients.create(body);
};

const MaxID = async (id) => {
  const maxID = await Clients.max(id);
  return maxID;
};

// const getBySingleCol = async (col, colVal) => {
//   const userDtls = await Clients.findOne({ where: { [col]: colVal } });
//   console.log(userDtls)
//   return userDtls;
// };

const getBySingleCol = async (col, colVal) => {
  try {
    return await Clients.findOne({
      where: {
        [col]: colVal,
      },
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    throw error;
  }
};

const getAllRecords = async (mypages) => {
  const { page, size } = mypages;
  const usersWithCount = await User.findAndCountAll({
    limit: size,
    offset: page * size,
    //where:{"acct_type":"STAFF"},
    // attributes: { exclude: ["createdAt", "Token"] },
    order: [["id", "DESC"]],
  });

  return {
    success: true,
    //  data: usersWithCount.rows[5],
    data: usersWithCount.rows,
    totalPages: Math.ceil(usersWithCount.count / Number.parseInt(size)),
  };
};

const getRecByID = async (col, colval, id) => {
  const Record = await Clients.findOne({ where: { [col]: id } });
  Record.reg_acct_id = colval;
  await Record.save();
};

const getUser = async (id) => {
  const OneUserDtls = await Clients.findOne({ where: { id: id } });
  if (!OneUserDtls) {
    throw new usernotFoundException();
  }
  //console.log(OneUserDtls)
  return OneUserDtls;
};

const getAll = async () => {
  return await Clients.findAll({
    attributes: {
      exclude: ["PassWord"],
    },
  });
};

const getOne = async (id) => {
  return await Clients.findByPk(id, {
    attributes: {
      exclude: ["PassWord"],
    },
  });
};



const update = async (id, body) => {
  const data = { ...body };

  if (data.password && data.password.trim() !== "") {
    data.password = await bcrypt.hash(data.password, 10);
  } else {
    delete data.password;
  }

  return await User.update(data, {
    where: { id },
  });
};

const remove = async (id) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error("User not found");
  }

  return await user.destroy();
};

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove,
  getBySingleCol,
  getAllRecords,
  MaxID,
  getRecByID,
  
};
