const Joi = require("joi");

const OrdersSchema = Joi.object({


    cboLoanType: Joi.string()
    .min(2)
    .max(200)
    //.required()
    .messages({
      "string.empty": "Loan Type is required",
      "string.min": "Loan Type must be at least 2 characters long",
      "string.max": "Loan Type cannot exceed 50 characters",
      "any.required": "Loan Type is required",
    }),

    txtLAmt: Joi.number()
    //.precision(2) // Ensures two decimal places
    .min(20000) // Minimum loan amount (adjust as needed)
    .max(20000000) // Maximum loan amount (adjust as needed)
    .required()
    .messages({
      "number.base": "Loan amount must be a valid number.",
      "number.min": "Loan amount must be at least 20000.",
      "number.max": "Loan amount must not exceed 20,000,000.",
      "any.required": "Loan amount is required.",
    }),
  
  txtBVN: Joi.string()
    .pattern(/^\d{11}$/)
    .required()
    .messages({
      "string.pattern.base": "BVN must be an 11-digit number",
    "string.empty": "Valid BVN is required",
    }),

 
    txtLPeriod: Joi.string().min(2).required().messages({
    "string.empty": "Period or Tenor Required",
    "any.required": "Period Required min of 2 and must not Exceed 50",
  }),

  cboRepaySource: Joi.string().min(2).required().messages({
    "string.empty": "Repay Source is Required",
    "any.required": "Repay Source Required min of 2 and must not Exceed 50",
  }),

  

  //     cboGender: Joi.string().min(2).max(50).required().messages({
  //         "string.empty": "Gender Required",
  //         "any.required": "Gender Required min of 2 and must not Exceed 50",
  //       }),

  //     cboLga_gvt: Joi.string().min(2).max(150).required().messages({
  //         "string.empty": "Local government Required",
  //         "any.required": "Local government Required min of 2 and must not Exceed 50",
  //     }),

  //   cboState: Joi.string().min(2).max(50).required().messages({
  //     "any.required": "Username Required min of 2 and must not Exceed 50",
  //   }),

  // surname: Joi.string().alphanum().min(2).max(50).required(),
  // othername: Joi.string().alphanum().min(2).max(50).required(),
  // email: Joi.string().email().required(),
  // PassWord: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{8,20}$")).required(),
  // User_Name: Joi.string().alphanum().min(2).max(50).required(),
  // position: Joi.string().alphanum().min(2).max(50).required(),
  // gender: Joi.string().alphanum().min(2).max(50).required(),
  // phone: Joi.string().pattern(/^\d{11}$/).required(),
  // IsActive : Joi.string().alphanum().min(2).max(50).required(),
}).unknown();

module.exports = {
  OrdersSchema,
  //UserSchemaEdit
};
