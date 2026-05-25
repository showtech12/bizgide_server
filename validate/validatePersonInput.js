const Joi = require("joi");

const PersonSchema = Joi.object({
    txtSurname: Joi.string()
    .min(2)
    .max(200)
    //.required()
    .messages({
      "string.empty": "Surname is required",
      "string.min": "Surname must be at least 2 characters long",
      "string.max": "Surname cannot exceed 50 characters",
      "any.required": "Surname is required",
    }),

    txtOthername: Joi.string().alphanum().min(2).max(200).required().messages({
    "string.min": "othername must be at least 2 characters long",
    "string.max": "othername cannot exceed 50 characters",
    "any.required": "othername is required",
    "string.empty": "othername is required",
  }),

  txtEmail: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
    "string.empty": "Email is required",
  }),

  txtPhone_no: Joi.string()
  .pattern(/^\d{11}$/)
  .required()
  .messages({
    "string.pattern.base": "Phone number must be an 11-digit number",
    "any.required": "Phone number Required min of 2 and must not Exceed 50",
    "string.empty": "Phone Number is required",
  }),

  txtPassW: Joi.string()
    //.pattern(/^[a-zA-Z0-9@#$%^&*]{8,20}$/)
       .min(8)
       .max(20)

    .required()
    .messages({
     // "string.pattern.base": "Password character must be within 8 to 20",
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password cannot exceed 20 characters",
      "string.empty": "Password Required",
      "any.required": "Password Required ",
    }),




    txtAdress: Joi.string().min(2).required().messages({
        "string.empty": "Address Required",
        "any.required": "Address Required min of 2 and must not Exceed 50",
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



const customerSchema = Joi.object({

  fullname: Joi.string().min(3).required().messages({
    "string.empty": "Fullname is required",
    "string.min": "Fullname must be at least 3 characters"
  }),

  phone: Joi.string()
    .pattern(/^[0-9]{11}$/) // Nigerian format 11 digits (adjust if needed)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Phone number must be 11 digits"
    }),

  // allow others but optional
  email: Joi.string().allow(""),
  gender: Joi.string().allow(""),
  address: Joi.string().allow(""),
  city: Joi.string().allow("")
}).unknown();


module.exports = {
    PersonSchema,
    customerSchema,
  //UserSchemaEdit
};
