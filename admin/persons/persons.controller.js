const persons = require("./persons.model");
//const NotFoundException = require("../../Exceptions/Exception");
const Tools = require("../../shared/commonTools");
const bcryptjs = require("bcryptjs");

const create = async (body) => {
 // console.log(body)
  await persons.create(body);
};

const MaxID = async (id) => {
  const maxID = await persons.max(id);
  return maxID;
};

const getCreditorVeri = async (col, colval, id) => {
  const userRec1 = await persons.findOne({ where: { [col]: id } });
    if(userRec1 ){
      userRec1.isVerified = colval;
      await userRec1.save();
      // return orderRec;
    }else{
      return "false";
    }
};

const getRecByID = async (col, colval, id) => {
    const personRec1 = await persons.findOne({ where: { [col]: id } });
  
    personRec1.account_id = colval;
    await personRec1.save();
    // return orderRec;
  };

  const getBySingleCol = async (col, colVal) => {
    const userDtls = await persons.findOne({ where: { [col]: colVal } });
    return userDtls;
  };

  const getPerson = async (id) => {
    const OneUserDtls = await persons.findOne({ where: { id: id } });
    if (!OneUserDtls) {
      throw new usernotFoundException();
    }
    //console.log(OneUserDtls)
    return OneUserDtls;
  };

  const UpdatePerson = async (id, body) => {
   // const d = Tools.getNowDate();
    console.log(body)
    const person1 = await persons.findOne({ where: { id: id } });

     person1.bank_acct_name = body.txtAcctName;
     person1.bank_acct_no = body.txtAcctNo;
     person1.bank_name = body.cboBankName;
     person1.gender = body.cboGender1;
     person1.date_of_birth = body.txtDob;
     person1.isprof = "YES";
     //person1.bvn_num = body.txtBVN;
 
    await person1.save();

    return person1;

}

const deletePerson = async (id) => {
    //  console.log(id);
    await persons.destroy({ where: { id: id } });
    //return{}
  };

  const getAllCustomers = async (mypages) => {
    const { page, size } = mypages;
    const usersWithCount = await persons.findAndCountAll({
      limit: size,
      offset: page * size,
      where:{"acct_type":"CREDITORS"},
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
      total: usersWithCount.rows.length
    };
  };


 // const getChangePass = async(Email,ResetCode,newpass)=>{
  const getChangePass = async(ResetCode,newpass)=>{
    //const user1 = await persons.findOne({ where: { e_mail: Email } });
    const user1 = await persons.findOne({ where: {pass_Word: ResetCode } });
    console.log(user1)
    if (user1.pass_Word == ResetCode){
          user1.pass_Word = newpass;
          await user1.save();
    }else{
      return "Failed"
    }
   
  
  }
  
  const getResetPass = async(Email,ResetCode)=>{
    
    const user1 = await persons.findOne({ where: { e_mail: Email } });
    //console.log(user1);
    user1.pass_Word = ResetCode;
    await user1.save();
  
  }


module.exports ={
    create,getChangePass,getResetPass,getBySingleCol,getCreditorVeri,
    MaxID,deletePerson,getRecByID,getPerson,UpdatePerson,getAllCustomers
}