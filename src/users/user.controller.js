const User = require("./user.model");
const sequelize = require("../../config/database");
const { QueryTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

const create = async (body) => {
   // Hash password
  //const hashedPassword = await bcrypt.hash(body.password, 10);

  // Replace plain password with hashed password
  //body.password = hashedPassword;

  return await User.create(body);
};

const getBySingleCol = async (col, colVal) => {
  const userDtls = await User.findOne({ where: { [col]: colVal } });
  return userDtls;
};

const getAllUsers = async (mypages) => {
  const { page, size } = mypages;
  const usersWithCount = await User.findAndCountAll({
    limit: size,
    offset: page * size,
    //where:{"acct_type":"STAFF"},
   // attributes: { exclude: ["createdAt", "Token"] },
    order: [
      ['id','DESC']
    ]
  });


  return {
    success: true,
    //  data: usersWithCount.rows[5],
    data: usersWithCount.rows,
    totalPages: Math.ceil(usersWithCount.count / Number.parseInt(size)),
  };
};

const getRecByID = async (col, colval, id) => {
  const userRec1 = await User.findOne({ where: { [col]: id } });

  userRec1.acct_no = colval;
  await userRec1.save();
  // return orderRec;
};


const getAll = async () => {
  return await User.findAll({
    attributes: {
      exclude: ["password"],
    },
  });
};

const getOne = async (id) => {
  return await User.findByPk(id, {
    attributes: {
      exclude: ["password"],
    },
  });
};
const MaxID = async (id) => {
  const maxID = await User.max(id);
  return maxID;
};

const UpdateUser = async (id, body) => {
  const d = Tools.getNowDate();
   //console.log(body)
  const updateData = await User.findOne({ where: { id: id } });

 console.log(updateData);
//   user1.surname = body.surname.toUpperCase();
//   user1.othername = body.othername.toUpperCase();
//   user1.email = body.email;
//   user1.User_Name = body.username.toUpperCase();
//   user1.position = body.position.toUpperCase();
//   user1.phone = body.phone;
//   //const hashPass = await bcryptjs.hash(body.txtPassW1, 10);
//   const hashPass = body.password;
//   user1.PassWord = hashPass;
//   user1.IsActive = body.active.toUpperCase();
//   user1.gender = body.gender.toUpperCase();
//   user1.Date_Last_Modified = d;
//   // user1.Time_Last_Login = d;
//   // user1.Date_Last_LogOut = "";

   await user1.save();
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
  getAllUsers,
  MaxID,
  getRecByID,
  UpdateUser
};