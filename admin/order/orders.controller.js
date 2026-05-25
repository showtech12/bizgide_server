const orders = require("./orders.model");
//const NotFoundException = require("../../Exceptions/Exception");
const Tools = require("../../shared/commonTools");
const bcryptjs = require("bcryptjs");

const create = async (body) => {
  await orders.create(body);
};

const MaxID = async (id) => {
  const maxID = await orders.max(id);
  return maxID;
};

const getRecByID = async (col, colval, id) => {
    const OrderRec1 = await orders.findOne({ where: { [col]: id } });
  
    OrderRec1.invoice_no = colval;
    await OrderRec1.save();
    // return orderRec;
  };

  const getBySingleCol = async (col, colVal) => {
    const OrdrDtls = await orders.findOne({ where: { [col]: colVal } });
    return OrdrDtls;
  };

  const UpdateOrder = async (id, body) => {
    // const d = Tools.getNowDate();
     console.log(body)
     const order1 = await orders.findOne({ where: { id: id } });
 
      order1.gurantor_surname1 = body.txtG1_surname;
      order1.gurantor_othername1 = body.txtG1_othername;
      order1.gurantor_surname2 = body.txtG2_surname;
      order1.gurantor_othername2 = body.txtG2_othername;
  
     await order1.save();
 
 }

  const getOrder = async (id) => {
    const OneOrderDtls = await orders.findOne({ where: { id: id } });
    if (!OneOrderDtls) {
      throw new usernotFoundException();
    }
    //console.log(OneOrderDtls)
    return OneOrderDtls;
  };


const deleteOrder = async (id) => {
    //  console.log(id);
    await orders.destroy({ where: { id: id } });
    //return{}
  };


  


module.exports ={
    create,getBySingleCol,UpdateOrder,
    MaxID,deleteOrder,getRecByID,getOrder
}