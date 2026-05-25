
const Joi = require("joi");


    const ProductSchema = Joi.object({

    // txtPrdtName: 'sdfs',
    // txtBarcode: '',
    // txtCostPrice: '32',
    // txtPrice: '2332',
    // txtPriceInPcs: '23',
    // txtPcsInWhole: '33'

      

        txtPrdtName : Joi.string()
          .min(2)
          .max(200)
          .required()
          .messages({
            'string.empty': 'Product name is required',
            //"any.empty": "Product name cannot be empty",
            "string.min": "Product Name must be at least 2 characters long",
            "string.max": "Product Name cannot exceed 50 characters",
            "any.required": "Product Name is required",
          }),

          txtCostPrice: Joi.number()
          .min(0)  // Minimum price (e.g., 0)
         // .max(1000000000000)  // Maximum price (e.g., 1,000,000)
          //.required()  // Mark as required
          .messages({
            "number.base": "Cost Price must be a number",  // Error if the value is not a number
            "number.min": "Cost Price cannot be less than 0",
            //"number.max": "Sale price cannot exceed 1,000,000",
            "any.required": "Cost Price is required"
          }),
      
          txtPrice: Joi.number()
          .min(0)  // Minimum price (e.g., 0)
         // .max(1000000000000)  // Maximum price (e.g., 1,000,000)
          //.required()  // Mark as required
          .messages({
            "number.base": " Price must be a number",  // Error if the value is not a number
            "number.min": " Price cannot be less than 0",
            //"number.max": "Sale price cannot exceed 1,000,000",
            "any.required": " Price is required"
          }),

        //   txtPriceInPcs: Joi.number()
        //   .min(0)  // Minimum price (e.g., 0)
        //  // .max(1000000000000)  // Maximum price (e.g., 1,000,000)
        //   //.required()  // Mark as required
        //   .messages({
        //     "number.base": " Price in Peices must be a number",  // Error if the value is not a number
        //     "number.min": "  Price in Peices cannot be less than 0",
        //     //"number.max": "Sale price cannot exceed 1,000,000",
        //     "any.required": "  Price in Peices is required"
        //   }),
      
          
         
        // txtPcsInWhole: Joi.string().required().messages({
        //    "string.empty": "Please Enter Pieces In Whole",
        //     "any.required": "Pieces In Whole is Required",
        // }),

  
      }).unknown();



      const ProductSchemaEdit = Joi.object({

       
          txtPrdtName : Joi.string()
          .min(2)
          .max(200)
          .required()
          .messages({
            'string.empty': 'Product name is required',
            //"any.empty": "Product name cannot be empty",
            "string.min": "Product Name must be at least 2 characters long",
            "string.max": "Product Name cannot exceed 50 characters",
            "any.required": "Product Name is required",
          }),

          txtCostPrice: Joi.number()
          .min(0)  // Minimum price (e.g., 0)
         // .max(1000000000000)  // Maximum price (e.g., 1,000,000)
          //.required()  // Mark as required
          .messages({
            "number.base": "Cost Price must be a number",  // Error if the value is not a number
            "number.min": "Cost Price cannot be less than 0",
            //"number.max": "Sale price cannot exceed 1,000,000",
            "any.required": "Cost Price is required"
          }),
      
          txtPrice: Joi.number()
          .min(0)  // Minimum price (e.g., 0)
         // .max(1000000000000)  // Maximum price (e.g., 1,000,000)
          //.required()  // Mark as required
          .messages({
            "number.base": " Price must be a number",  // Error if the value is not a number
            "number.min": " Price cannot be less than 0",
            //"number.max": "Sale price cannot exceed 1,000,000",
            "any.required": " Price is required"
          }),

        //   txtPriceInPcs: Joi.number()
        //   .min(0)  // Minimum price (e.g., 0)
        //  // .max(1000000000000)  // Maximum price (e.g., 1,000,000)
        //   //.required()  // Mark as required
        //   .messages({
        //     "number.base": " Price in Peices must be a number",  // Error if the value is not a number
        //     "number.min": "  Price in Peices cannot be less than 0",
        //     //"number.max": "Sale price cannot exceed 1,000,000",
        //     "any.required": "  Price in Peices is required"
        //   }),
      
          
         
        // txtPcsInWhole: Joi.string().required().messages({
        //    "string.empty": "Please Enter Pieces In Whole",
        //     "any.required": "Pieces In Whole is Required",
        // }),

        
      
        
      }).unknown();



module.exports ={
  ProductSchema,
  ProductSchemaEdit
}