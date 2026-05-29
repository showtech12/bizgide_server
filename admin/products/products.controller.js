const product = require("./products.model");
const NotFoundException = require("../../Exceptions/Exception");
const Tools = require("../../shared/commonTools");

const create = async (body) => {
  await product.create(body);
};

const MaxID = async (id) => {
  const maxID = await product.max(id);
  return maxID;
};

const getRecByID = async (col, colval, id) => {
  const productRec1 = await product.findOne({ where: { [col]: id } });

  productRec1.product_code = colval;
  await productRec1.save();
  // return orderRec;
};

const findByEmail = async(email)=>{
    const productDtls = await product.findOne({where: {email: email}});
    return productDtls;
};

const getAllproductsWhereUserz = async (usrId) => {
  try {
    const productsWithCount = await product.findAndCountAll({
     // where: { user_id: usrId },
      order: [["id", "DESC"]],
    });

    return {
      success: true,
      data: productsWithCount.rows,
      totalPages: Math.ceil(productsWithCount.count), // or divide by size if paginating
    };
  } catch (error) {
    console.error("🔥 Sequelize error:", error);
    return { success: false, message: error.message };
  }
};


const getAllproducts = async (mypages) => {
  const { page, size } = mypages;
  const productsWithCount = await product.findAndCountAll({
    limit: size,
    offset: page * size,
    //attributes: { exclude: ["PassWord", "createdAt", "Token"] },
  });

  // console.log(productsWithCount.rows[5].dataValues.othername);
  return {
    success: true,
    //  data: productsWithCount.rows[5],
    data: productsWithCount.rows,
    totalPages: Math.ceil(productsWithCount.count / Number.parseInt(size)),
  };
};



const getBySingleCol = async (col, colVal) => {
  const productDtls = await product.findOne({ where: { [col]: colVal } });
  return productDtls;
};

const getProduct = async (id) => {
  const OneproductDtls = await product.findOne({ where: { id: id } });
  if (!OneproductDtls) {
    throw new productnotFoundException();
  }
  //console.log(OneproductDtls)
  return OneproductDtls;
};

const Updateproduct = async (id, body) => {
  
  // id: 324,
  // txtPrdtName: 'NOREOS BISCUITS',
  // txtBarcode: '',
  // txtCostPrice: '2000',
  // txtPrice: '2100',
  // txtPriceInPcs: '0',
  //txtPcsInWhole: '24'
  const d = Tools.getNowDate();
 //console.log(body);

  const product1 = await product.findOne({ where: { id: id } });
  //console.log(product1);

  product1.product_name = body.txtPrdtName.toUpperCase().trim();
  product1.bar_code =  body.txtBarcode
  product1.mfg_date =  body.txtMfDate
  product1.expiry_date =  body.txtExpDate
  //product1.cost_price = body.txtCostPrice.trim();
 // product1.unit_sell_price = body.txtPriceInPcs.trim();
  
  //product1.bar_code = body.txtBarcode.trim();



  await product1.save();
};

const deleteproduct = async (id) => {
  //  console.log(id);
  await product.destroy({ where: { id: id } });
  //return{}
};


module.exports = {
  getAllproducts,
  getAllproductsWhereUserz,
  create,
  getProduct,
  MaxID,
  getRecByID,
  deleteproduct,
  Updateproduct,
   findByEmail,
   //getRecByID,
  getBySingleCol,
};
