const user = require("./users.model");
const NotFoundException = require("../../Exceptions/Exception");
const Tools = require("../../shared/commonTools");
const bcryptjs = require("bcryptjs");

const create = async (body) => {
  await user.create(body);
};

const MaxID = async (id) => {
  const maxID = await user.max(id);
  return maxID;
};

const getRecByID = async (col, colval, id) => {
  const userRec1 = await user.findOne({ where: { [col]: id } });

  userRec1.acct_no = colval;
  await userRec1.save();
  // return orderRec;
};

const getChangePass = async(Email,ResetCode,newpass)=>{
  const user1 = await user.findOne({ where: { email: Email } });
  //console.log(user1.PassWord)
  if (user1.PassWord == ResetCode){
        user1.PassWord = newpass;
        await user1.save();
  }else{
    return "Failed"
  }
}



const getResetPass = async(Email,ResetCode)=>{
  
  const user1 = await user.findOne({ where: { email: Email } });
  //console.log(user1)
  user1.PassWord = ResetCode;
  await user1.save();

}


const findByEmail = async(email)=>{
    const userDtls = await user.findOne({where: {email: email}});
    return userDtls;
};

const getAllAgents = async (mypages) => {
  const { page, size } = mypages;
  const usersWithCount = await user.findAndCountAll({
    limit: size,
    offset: page * size,
    where:{"acct_type":"AGENT"},
    attributes: { exclude: ["createdAt", "Token"] },
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

const getAllUsers = async (mypages) => {
  const { page, size } = mypages;
  const usersWithCount = await user.findAndCountAll({
    limit: size,
    offset: page * size,
    where:{"acct_type":"STAFF"},
    attributes: { exclude: ["createdAt", "Token"] },
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

const getAgentVeri = async (col, colval, id) => {
  const userRec1 = await user.findOne({ where: { [col]: id } });
    if(userRec1 ){
      userRec1.isVeri = colval;
      await userRec1.save();
      // return orderRec;
    }else{
      return "false";
    }
};

const getBySingleCol = async (col, colVal) => {
  const userDtls = await user.findOne({ where: { [col]: colVal } });
  return userDtls;
};

const getUser = async (id) => {
  const OneUserDtls = await user.findOne({ where: { id: id } });
  if (!OneUserDtls) {
    throw new usernotFoundException();
  }
  //console.log(OneUserDtls)
  return OneUserDtls;
};

const UpdateUser = async (id, body) => {
  const d = Tools.getNowDate();
   //console.log(body)
  const user1 = await user.findOne({ where: { id: id } });

  //   {
//   id: 33,
//   surname: 'SDFGD',
//   othername: 'SDFGSF',
//   email: 'sdfgf@gmail.com',
//   phone: '09033445566',
//   username: 'SFDGSDF',
//   password: '12345678',
//   gender: 'MALE',
//   active: 'YES',
//   position: 'CASHIER'
// }
  user1.surname = body.surname.toUpperCase();
  user1.othername = body.othername.toUpperCase();
  user1.email = body.email;
  user1.User_Name = body.username.toUpperCase();
  user1.position = body.position.toUpperCase();
  user1.role_id = body.role_id;
  user1.phone = body.phone;
  //const hashPass = await bcryptjs.hash(body.txtPassW1, 10);
  const hashPass = body.password;
  user1.PassWord = hashPass;
  user1.IsActive = body.active.toUpperCase();
  user1.gender = body.gender.toUpperCase();
  user1.Date_Last_Modified = d;
  // user1.Time_Last_Login = d;
  // user1.Date_Last_LogOut = "";

   await user1.save();
};

const deleteUser = async (id) => {
  //  console.log(id);
  await user.destroy({ where: { id: id } });
  //return{}
};

module.exports = {
  getAllUsers,
  create,
  getUser, getChangePass,
  MaxID, getResetPass,
  getRecByID,
  deleteUser,
  UpdateUser,
   findByEmail,
   //getRecByID,
  getBySingleCol,
  getAllAgents, getAgentVeri,
};
