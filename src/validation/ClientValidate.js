const Joi = require("joi");

const RegisterClientSchema = Joi.object({
  company_name: Joi.string().trim().min(2).max(150).required().messages({
    "string.empty": "Company name is required",
    "any.required": "Company name is required",
  }),

  surname: Joi.string().trim().min(2).max(150).required().messages({
    "string.empty": "Surname is required",
  }),

  othername: Joi.string().trim().min(2).max(150).required().messages({
    "string.empty": "Other name is required",
  }),

  email: Joi.string().trim().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+\-\s()]{7,20}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid phone number",
      "string.empty": "Phone number is required",
    }),

  refferByID: Joi.number().integer().allow(null).optional(),

  industry: Joi.string().trim().max(200).required().messages({
    "string.empty": "Industry is required",
  }),

  country: Joi.string().trim().max(80).required().messages({
    "string.empty": "Country is required",
  }),

  state: Joi.string().trim().max(80).required().messages({
    "string.empty": "State is required",
  }),

  city: Joi.string().trim().max(200).required().messages({
    "string.empty": "City is required",
  }),

  address: Joi.string().trim().max(255).required().messages({
    "string.empty": "Address is required",
  }),

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
  

  //   website: Joi.string()
  //     .trim()
  //     .allow("")
  //     .uri({
  //       scheme: ["http", "https"],
  //     })
  //     .messages({
  //       "string.uri": "Website must be a valid URL (https://example.com)",
  //     }),
});

module.exports = {
  RegisterClientSchema,
};
