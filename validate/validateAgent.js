const Joi = require("joi");

const AgentSchema = Joi.object({
    txtSurname: Joi.string()
      .min(2)
      .max(200)
      //.required()
      .messages({
        'string.empty': 'Surname is required',
        "string.min": "Surname must be at least 2 characters long",
        "string.max": "Surname cannot exceed 50 characters",
        "any.required": "Surname is required",
      }),
  
      txtOthername: Joi.string().alphanum().min(2).max(200).required().messages({
      "string.min": "othername must be at least 2 characters long",
      "string.max": "othername cannot exceed 50 characters",
      "any.required": "othername is required",
      'string.empty': 'othername is required',
    }),
  
    txtEmail: Joi.string().email().required().messages({
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
      'string.empty': 'othername is required',
    }),
  
    txtPassW: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{8,20}$"))
    //   .min(8)
    //   .max(20)

      .required()
      .messages({
        "string.pattern.base":"Password character must be within 8 to 20",
        "string.empty":"Password Required",
        "any.required": "Password Required ",
       // "string.min": "Password must be at least 8 characters long",
       // "string.max": "Password cannot exceed 20 characters",
      }),
  
    //   txtUsername: Joi.string().alphanum().min(2).max(200).required().messages({
    //   "any.required": "Username Required min of 2 and must not Exceed 50",
    // }),

    txtCompany: Joi.string().min(2).max(200).required().messages({
        "any.required": "Company name Required min of 2 and must not Exceed 50",
        "string.empty":"Company name Required",
      }),

    
  
    // cboPosition: Joi.string().alphanum().min(2).max(50).required().messages({
    //   "any.required": "Username Required min of 2 and must not Exceed 50",
    // }),

    cboState: Joi.string().min(2).max(200).required().messages({
        "any.required": "State Required min of 2 and must not Exceed 50",
        "string.empty":"State  Required",
      }),

      cboLgv: Joi.string().min(2).max(200).required().messages({
        "any.required": "Local Government Required min of 2 and must not Exceed 200",
        "string.empty":"Local Government  Required",
      }),

      cboCountry: Joi.string().min(2).max(200).required().messages({
        "any.required": "Country Required min of 2 and must not Exceed 200",
        "string.empty":"Country  Required",
      }),

      
    cboGender: Joi.string().alphanum().min(2).max(50).required().messages({
      "any.required": "Gender Required min of 2 and must not Exceed 200",
      "string.empty":"Gender  Required",
    }),
  
    txtPhone: Joi.string()
      .pattern(/^\d{11}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be an 11-digit number",
        "any.required": "Phone Required min of 2 and must not Exceed 50",
      }),


    //   cboActive: Joi.string().alphanum().min(2).max(50).required().messages({
    //   "any.required": "ISActive Required min of 2 and must not Exceed 50",
    // }),


  //})
  }).unknown();

    
    module.exports={
        AgentSchema,
        
    }