const Joi = require("joi");

const createUserSchema = Joi.object({
  surname: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Surname is required",
    "any.required": "Surname is required",
  }),

  othername: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Other name is required",
    "any.required": "Other name is required",
  }),

  userType: Joi.string().trim().min(2).max(20).required().messages({
    "string.empty": "Account Type is required",
    "any.required": "Account Type is required",
  }),

  email: Joi.string().trim().email().required().messages({
    "string.email": "Please enter a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  phone: Joi.string()
    .pattern(/^[0-9]{11}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 11 digits",
      "string.empty": "Phone number is required",
      "any.required": "Phone number is required",
    }),

  //   username: Joi.string()
  //     .trim()
  //     .min(3)
  //     .max(50)
  //     .required()
  //     .messages({
  //       "string.empty": "Username is required",
  //       "any.required": "Username is required",
  //     }),

  password: Joi.string().min(8).max(200).required().messages({
    "string.min": "Password must be at least 8 characters",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),

  role_id: Joi.number().integer().positive().required().messages({
    "number.base": "Role ID must be a number",
    "any.required": "Role ID is required",
  }),

  status: Joi.string().valid("YES", "NO").required().messages({
    "any.only": "Status must be either YES or NO",
    "any.required": "Status is required",
  }),

  gender: Joi.string().valid("MALE", "FEMALE").required().messages({
    "any.only": "Gender must be either MALE or FEMALE",
    "any.required": "Gender is required",
  }),
});

const EditUserSchema = Joi.object({
  surname: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Surname is required",
    "any.required": "Surname is required",
  }),

  othername: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Other name is required",
    "any.required": "Other name is required",
  }),

  userType: Joi.string().trim().min(2).max(20).required().messages({
    "string.empty": "Account Type is required",
    "any.required": "Account Type is required",
  }),

  // userType: Joi.string()
  //   .min(8)
  //   .max(20)
  //   .optional()
  //   .allow(""),

  email: Joi.string().trim().email().required().messages({
    "string.email": "Please enter a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  phone: Joi.string()
    .pattern(/^[0-9]{11}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 11 digits",
      "string.empty": "Phone number is required",
      "any.required": "Phone number is required",
    }),

  //   password: Joi.string().min(8).max(200).required().messages({
  //     "string.min": "Password must be at least 8 characters",
  //     "string.empty": "Password is required",
  //     "any.required": "Password is required",
  //   }),

  password: Joi.string().min(8).max(100).optional().allow(""),

  role_id: Joi.number().integer().positive().required().messages({
    "number.base": "Role ID must be a number",
    "any.required": "Role ID is required",
  }),

  status: Joi.string().valid("YES", "NO").required().messages({
    "any.only": "Status must be either YES or NO",
    "any.required": "Status is required",
  }),

  gender: Joi.string().valid("MALE", "FEMALE").required().messages({
    "any.only": "Gender must be either MALE or FEMALE",
    "any.required": "Gender is required",
  }),
});

//module.exports = createUserSchema;
module.exports = {
  createUserSchema,
  EditUserSchema,
};
