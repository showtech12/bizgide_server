const Joi = require("joi");

// {
//   store: '',
//   surname: 'erwer',
//   othername: 'wert',
//   email: 'wert',
//   phone: 'wert',
//   username: 'wert',
//   password: 'wret',
//   gender: 'MALE',
//   active: 'YES',
//   position: 'USER'
// }
const UserSchema = Joi.object({
    surname: Joi.string()
      .min(2)
      .max(200)
      //.required()
      .messages({
        'string.empty': 'Surname is required',
        "string.min": "Surname must be at least 2 characters long",
        "string.max": "Surname cannot exceed 50 characters",
        "any.required": "Surname is required",
      }),
  
      othername: Joi.string().alphanum().min(2).max(200).required().messages({
      "string.min": "othername must be at least 2 characters long",
      "string.max": "othername cannot exceed 50 characters",
      "any.required": "othername is required",
      'string.empty': 'othername is required',
    }),
  
    email: Joi.string().email().required().messages({
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
      'string.empty': 'othername is required',
    }),
  
    // txtPassW: Joi.string()
    // .pattern(/^[a-zA-Z0-9@#$%^&*]{8,20}$/)
    //   //   .min(8)
    //   //   .max(20)

    //   .required()
    //   .messages({
    //     "string.pattern.base": "Password character must be within 8 to 20",
    //     "string.empty": "Password Required",
    //     "any.required": "Password Required ",
    //     // "string.min": "Password must be at least 8 characters long",
    //     // "string.max": "Password cannot exceed 20 characters",
    //   }),
  

     password: Joi.string()
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
    
      username: Joi.string().alphanum().min(2).max(100).required().messages({
        'string.empty': 'Username is required',
      "any.required": "Username Required min of 2 and must not Exceed 50",
    }),
  
    position: Joi.string().alphanum().min(2).max(50).required().messages({
      'string.empty': 'User Role is required',
      "any.required": "User Role Required min of 2 and must not Exceed 50",
    }),
  
    gender: Joi.string().alphanum().min(2).max(50).required().messages({
      'string.empty': 'Gender is required',
      "any.required": "Gender Required min of 2 and must not Exceed 50",
    }),
  
    phone: Joi.string()
      .pattern(/^\d{11}$/)
      .required()
      .messages({
        'string.empty': 'Phone Number is required',
        "string.pattern.base": "Phone number must be an 11-digit number",
        "any.required": "Phone Required min of 2 and must not Exceed 50",
      }),
      active: Joi.string().alphanum().min(2).max(50).required().messages({
        'string.empty': 'Activity is required',
      "any.required": "ISActive Required min of 2 and must not Exceed 50",
    }),
  
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


  const UserSchemaEdit = Joi.object({
    surname: Joi.string()
      .min(2)
      .max(200)
      //.required()
      .messages({
        'string.empty': 'Surname is required',
        "string.min": "Surname must be at least 2 characters long",
        "string.max": "Surname cannot exceed 50 characters",
        "any.required": "Surname is required",
      }),
  
      othername: Joi.string().alphanum().min(2).max(200).required().messages({
      "string.min": "othername must be at least 2 characters long",
      "string.max": "othername cannot exceed 50 characters",
      "any.required": "othername is required",
      'string.empty': 'othername is required',
    }),
  
    email: Joi.string().email().required().messages({
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
      'string.empty': 'othername is required',
    }),
  
    // txtPassW: Joi.string()
    // .pattern(/^[a-zA-Z0-9@#$%^&*]{8,20}$/)
    //   //   .min(8)
    //   //   .max(20)

    //   .required()
    //   .messages({
    //     "string.pattern.base": "Password character must be within 8 to 20",
    //     "string.empty": "Password Required",
    //     "any.required": "Password Required ",
    //     // "string.min": "Password must be at least 8 characters long",
    //     // "string.max": "Password cannot exceed 20 characters",
    //   }),
  

     password: Joi.string()
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
    
      username: Joi.string().alphanum().min(2).max(100).required().messages({
        'string.empty': 'Username is required',
      "any.required": "Username Required min of 2 and must not Exceed 50",
    }),
  
    position: Joi.string().alphanum().min(2).max(50).required().messages({
      'string.empty': 'User Role is required',
      "any.required": "User Role Required min of 2 and must not Exceed 50",
    }),
  
    gender: Joi.string().alphanum().min(2).max(50).required().messages({
      'string.empty': 'Gender is required',
      "any.required": "Gender Required min of 2 and must not Exceed 50",
    }),
  
    phone: Joi.string()
      .pattern(/^\d{11}$/)
      .required()
      .messages({
        'string.empty': 'Phone Number is required',
        "string.pattern.base": "Phone number must be an 11-digit number",
        "any.required": "Phone Required min of 2 and must not Exceed 50",
      }),
      active: Joi.string().alphanum().min(2).max(50).required().messages({
        'string.empty': 'Activity is required',
      "any.required": "ISActive Required min of 2 and must not Exceed 50",
    }),
  
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

    

      module.exports={
        UserSchema,
        UserSchemaEdit
      }