const express = require("express");
const verifyPerson = require("../verifyPerson");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const Joi = require("joi");
const cPersons = require("./persons.controller");
const Tools = require("../../shared/commonTools");
const pagination = require("../../shared/pagination");
const BadRequest400 = require("../../Exceptions/400Exception");
const idNumControlPOST = require("../../shared/idNumberControlPOST");
const idNumControl = require("../../shared/idNumberControl");
//const basicAuth = require("../shared/basicAuth");
const {PersonSchema} = require('../../validate/validatePersonInput');
const AuthRole = require('../auth_role.js');
const sequelize = require("../../config/database");
const multer = require("multer");
const path = require('path');
const fs = require("fs");
const SndMail = require("../../shared/sendMail.js")
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const verifyAdmin = require("../verifyAdmin");


router.get("/api/v1/custBal", verifyAdmin, async (req, res, next) => {

  const pid = req.query.pid;
  sequelize
    .query(
      `SELECT SUM(Debit_Amt) AS dbt, SUM(credit_Amt) AS crt, SUM(Balance_Amt) AS bal FROM transactions WHERE personid = '${pid}' AND TYPE='PA'`,
      { type: sequelize.QueryTypes.SELECT }
    )

    .then((results) => {
      // console.log('Query result:', results);
      res.status(200).json({
        success: true,
        message: "success",
        total: results.length,
        data: results,
      });
    })
    .catch((error) => {
      //console.error('Error fetching data:', error);
      res.status(200).json({
        success: false,
        data: "",
      });
    });
});

router.post("/api/v1/updtpass", verifyAdmin,async (req, res, next) => {
  //const txtEmail = req.body.email;
  // const ResetCode = req.body.resetcode;
  // const newpass = req.body.newpass;
  
  const {txtPassW,txtNewPassW,txtCNewPassW} = req.body
  const BodyDetails ={txtPassW,txtNewPassW,txtCNewPassW}

  let OldPass = req.userDtl.pass_Word 
  let Pid =req.userDtl.id 

  const schema = Joi.object({
              
          txtPassW: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (value !== OldPass) {
              return helpers.error('any.invalid', { message: 'Old password is incorrect' });
            }
            return value;
          })
          .messages({
            "string.empty": "Old password is required",
          }),

          txtNewPassW: Joi.string()
          .min(8)
          .required()
          .messages({
            "string.empty": "New password is required",
            "string.min": "New password must be at least 8 characters long",
          }),


          txtCNewPassW: Joi.string()
            .required()
            .valid(Joi.ref('txtNewPassW'))
            .messages({ 
              "any.only": "Passwords must match",
              "string.empty": "Confirm password is required",
            }),       
  
                
              
            });
    
            const { error } = schema.validate(BodyDetails);
            if (error) {
                return res.status(400).json({ success: false, message: error.details[0].message });
            }



    sequelize.query(`UPDATE persons SET pass_Word = :pass_Word WHERE id= :id`,
          {
            replacements:{pass_Word: req.body.txtNewPassW , id:Pid },
            type: sequelize.QueryTypes.UPDATE
          })
        
          .then((results) => {
            res.json({
              success: true,
              message: "Successsful",
              
            });
          })
          .catch((error) => {
            //console.error('Error fetching data:', error);
            res.status(200).json({
              success: false,
              message: "Not Successful",
              data: "",
            });
          });



  //const myRes = await cPersons.getChangePass(txtEmail, ResetCode, newpass);
  // const myRes = await cPersons.getChangePass( ResetCode, newpass);

  // if (myRes == "Failed") {
  //   res.status(200).json({
  //     success: false,
  //     message: "inValid Reset Code",
  //   });
  // }
  // res.status(200).json({
  //   success: true,
  //   message: "Password Changed, Please  Login",
  // });

});

router.post("/api/v1/updtbvn", verifyAdmin,async (req, res, next) => {
  //const txtEmail = req.body.email;
  // const ResetCode = req.body.resetcode;
  // const newpass = req.body.newpass;
  let Pid =req.userDtl.id 
  const {txtBVN} = req.body
  const BodyDetails ={txtBVN}

  let isBvn = 1;

  const schema = Joi.object({
        
        txtBVN: Joi.string()
        .length(11) 
        .pattern(/^[0-9]+$/) 
        .required()
        .messages({
          'string.length': 'BVN must be exactly 11 digits',
          'string.pattern.base': 'BVN must contain only numbers',
          'any.required': 'BVN is required',
          "string.empty": "Valid BVN is required",
        })
          
                
              
    });
    
    const { error } = schema.validate(BodyDetails);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

// ======== validate with API here  ===========
    
        await sequelize.query(`UPDATE persons SET bvn_num = :bvn_num,isveribvn =:isveribvn WHERE id= :id`,
          {
            replacements:{bvn_num: req.body.txtBVN, isveribvn: isBvn , id:Pid },
            type: sequelize.QueryTypes.UPDATE
          })
        
        const pages = await cPersons.getPerson(Pid);
            res.status(200).json({
              success:true,
              mesage:"success",
              data:pages,
            // total:pages.length,
            })
           

});


router.post("/api/v1/custsettings", verifyAdmin,async (req, res, next) => {
 
  console.log(req.body)
  const {cboActive1} = req.body
  const BodyDetails ={cboActive1}

  let Pid =req.body.CuzIdST

  const schema = Joi.object({
           
        cboActive1: Joi.string()
          //.required()
          .messages({
            "string.empty": "Active Status is required",
           // "string.min": "New password must be at least 8 characters long",
        }),


                
              
        });
    
            const { error } = schema.validate(BodyDetails);
            if (error) {
                return res.status(400).json({ success: false, message: error.details[0].message });
            }



    sequelize.query(`UPDATE persons SET isActive1 = :isActive1 WHERE id= :id`,
          {
            replacements:{isActive1: req.body.cboActive1 , id:Pid },
            type: sequelize.QueryTypes.UPDATE
          })
        
          .then((results) => {
            res.json({
              success: true,
              message: "Successsful",
              
            });
          })
          .catch((error) => {
            //console.error('Error fetching data:', error);
            res.status(200).json({
              success: false,
              message: "Not Successful",
              data: "",
            });
          });



});



router.post("/api/v1/changepasscrt", async (req, res, next) => {
  //const txtEmail = req.body.email;
  // const ResetCode = req.body.resetcode;
  // const newpass = req.body.newpass;

  const {resetcode,newpass} = req.body
  const BodyDetails ={resetcode,newpass}


          const schema = Joi.object({
                //email: Joi.string().email().required(),
              //  password: Joi.string().required()
             
              resetcode: Joi.number()
                  .min(0)  // Minimum price (e.g., 0)
                  // .max(1000000000000)  // Maximum price (e.g., 1,000,000)
                  //.required()  // Mark as required
                  .messages({
                    "number.base": " Percentage Rate must be a number",  // Error if the value is not a number
                    "number.min": " Percentage Rate cannot be less than 0",
                    //"number.max": "Sale price cannot exceed 1,000,000",
                    "any.required": " Percentage Rate is required"
                  }),
  
              
            });
    
            const { error } = schema.validate(BodyDetails);
            if (error) {
                return res.status(400).json({ success: false, message: error.details[0].message });
            }

  //const myRes = await cPersons.getChangePass(txtEmail, ResetCode, newpass);
  const myRes = await cPersons.getChangePass( ResetCode, newpass);

  if (myRes == "Failed") {
    res.status(200).json({
      success: false,
      message: "inValid Reset Code",
    });
  }
  res.status(200).json({
    success: true,
    message: "Password Changed, Please  Login",
  });

});

router.post("/api/v1/reset_credit", async (req, res, next) => {
  // Update

  const txtEmail = req.body.email;
  console.log(req.body)
  const ResetCode = Tools.getUniqueId();

  await cPersons.getResetPass(txtEmail, ResetCode);

  let bdymsg = "";
  let MyMail = "tristian.hickle9@ethereal.email";
  //let MyMail=req.body.txtEmail;
 // // bdymsg +='<a href="localhost:5000/verify/'+user_ID+'" > Verify </a>';

  bdymsg +=
    "<style> #link1 {background-color: #04AA6D;border: none;color: white;padding: 16px 32px;text-decoration: none;margin: 4px 2px;cursor: pointer;}</style>";

  bdymsg +=
    '<h2 style="text-align:center;font-weight:bold">Reset Password </h2>';
  bdymsg +=
    '<p style="text-align:center;font-weight:bold">Click to Change your password</p>';
  bdymsg +=
    '<a href="https://app.greenheycredit.com/changepass.php?id=' +
    ResetCode +
    '"  id="link1" style="text-align:center" class=""> Change Password </a>';

  SndMail.getSendMail(bdymsg, MyMail, "Password Reset", "");

  res.status(200).json({
    success: true,
    message: "Password Reset, Please check your mail to proceed",
  });

  
});

router.post('/api/v1/profilepix', uploadMiddleware, (req, res) => {

   // console.log(req.files)
   console.log(req.uploadedFile.path);
   const mypath = req.uploadedFile.path
   var Pid =  Number(req.body.Pid);
   sequelize.query(`UPDATE persons SET passport_path = :passport_path WHERE id= :id`,
     { 
      replacements:{passport_path: mypath , id:Pid },
      type: sequelize.QueryTypes.UPDATE 
    })

.then((results) => {
   // console.log('Query result:', results);
  
   res.json({
    success:true,
     message: "File uploaded successfully!",
     filepath: req.uploadedFile.path
   });
  })
  .catch((error) => {
    //console.error('Error fetching data:', error);
    res.status(200).json({
      success:false,
      data:""
    })
  });

    


});

router.get("/verify/:id", async (req, res, next) => {
  const id = req.params.id;
  console.log(id)

  const CredtorDtl = await cPersons.getCreditorVeri("id", "YES", id);
  //const usr_idDcode = Buffer.from(id, 'base64').toString('utf-8');
  //console.log(usr_idDcode);
  if (CredtorDtl == "false") {
    res.status(200).json({
      success: false,
      message: "Sorry Not verified",
    });
  } else {
    res.status(200).json({
      success: true,
      message: "Verified Successfully",
    });
  }
});

 router.get("/api/v1/person", verifyAdmin, async (req, res, next) => {
   const id = req.userDtl.id;

  const pages = await cPersons.getPerson(id);
    res.status(200).json({
      success:true,
      data:pages,
    // total:pages.length,
    })

//   sequelize
//     .query(
//       `SELECT * FROM persons WHERE id='${id}'`,
//       { type: sequelize.QueryTypes.SELECT }
//     )

//     .then((results) => {
//       res.status(200).json({
//         success: true,
//         message: "success",
//         data: results,
//       });
//     })
//     .catch((error) => {
//       //console.error('Error fetching data:', error);
//       res.status(200).json({
//         success: false,
//         data: "",
//       });
//     });
    
 });


router.post("/api/v1/personupdt",verifyAdmin, async (req, res) => {
  
  const pid = req.body.PID;
  console.log(pid);

   const { txtDob, cboGender1, txtAcctName, txtAcctNo, cboBankName,txtAdress } =
      req.body;
    const BodyDetails = {
      txtDob,
      cboGender1,
      txtAcctName,
      txtAcctNo,
      cboBankName,
      txtAdress,
     // txtBVN,
    };
  
    const schema = Joi.object({
      //email: Joi.string().email().required(),
      //  password: Joi.string().required()
  
      txtDob: Joi.string().required().messages({
        "any.required": "Date Of Birth  is required",
        "string.empty": "Date Of Birth is required",
      }),
  
      cboGender1: Joi.string().required().messages({
        "any.required": "Gender is required",
        "string.empty": "Gender is required",
      }),
  
      txtAcctName: Joi.string().required().messages({
        "any.required": "Account Name is required",
        "string.empty": "Account Name  is required",
      }),
  
      txtAcctNo: Joi.string()
      .length(10) 
      .pattern(/^\d{10}$/) 
      .required()
      .messages({
        "any.required": "Account Number is required",
        "string.empty": "Account Number is required",
        "string.length": "Account Number must be exactly 10 digits",
        "string.pattern.base": "Account Number must contain only numbers",
      }),

      cboBankName: Joi.string().required().messages({
        "any.required": "Bank Name is required",
        "string.empty": "Bank Name is required",
      }),

      txtAdress: Joi.string().required().messages({
        "any.required": "Address is required",
        "string.empty": "Address is required",
      }),

      //  txtBVN: Joi.string()
      //     .pattern(/^\d{11}$/)
      //     .required()
      //     .messages({
      //       "string.pattern.base": "BVN must be an 11-digit number",
      //       "string.empty": "Valid BVN is required",
      //     }),

     
      
    });
  
    const { error } = schema.validate(BodyDetails);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

 const newP =  await cPersons.UpdatePerson(pid, req.body);

  res.status(200).json({
    success:true,
    message:"Record Updated",
    data:newP
  })

});

//router.post("/api/v1/person",verifyPerson, AuthRole('ADMIN'),
router.post("/api/v1/person",async (req, res, next) => {
    //const { error, value } = schema.validate(req.body, { abortEarly: false });
    const { error, value } = PersonSchema.validate(req.body);
    console.log(req.body);

    if (error) {
      console.log(error);
      //const errorMessages = error.details.map((detail) => detail.message);
      // return res.status(400).json({ errors: errorMessages });
      //throw new BadRequest400(error.details[0].message);
      //throw new Error(error.details[0].message)
      // BadRequest400
      return res.status(200).json({
        code: 200,
        success:false,
        message: error.details[0].message.replace(/\"/g, ""),
      });
    } else {
      //console.log(value);
      //console.log(req.body);

      const PrsRecP = await cPersons.getBySingleCol("phone_num", req.body.txtPhone_no);
      if (PrsRecP) {
        return res.status(200).json({
          code: 200,
          message: "Phone Number Already in used",
        });
      }
      
      const PrsRecE = await cPersons.getBySingleCol("e_mail", req.body.txtEmail);
      if (PrsRecE) {
        return res.status(200).json({
          code: 200,
          message: "Email Already in used",
        });
      }

      const token = Tools.getUniqueId();
      // const d = "2024-04-29";
      const d = new Date().toISOString().split("T")[0];
      const dd = Tools.getNowDate()
    //  const hashPass = await bcryptjs.hash(req.body.txtPassW, 10);
      const hashPass = req.body.txtPassW;
      // var myData = {}; getUniqueId
      // const Uid = Tools.getNowDate()
      // console.log(d);

    

      myData = {
        
        reg_date1: d,
        acct_type: "CREDITORS",
        sur_name: req.body.txtSurname.toUpperCase(),
        middle_name: "",
        other_name: req.body.txtOthername.toUpperCase(),
        e_mail: req.body.txtEmail,
        phone_num: req.body.txtPhone_no,
        bvn_num: "",
        pass_Word: hashPass,
        isVerified: "NO",
        account_id: "",
        position:"CREDITOR",
       // pass_Word: req.body.txtUsername.toUpperCase(),
        date_of_birth: '',
        city: "",
        local_govt: req.body.cboLga_gvt,
        home_address: req.body.txtAdress,
        state_adrs: req.body.cboState,
        gender: req.body.cboGender,
        last_time_login:dd,
        isActive1:"YES",
        createdAt: d,
        Token: token,
        isveribvn:0,
        isprof:"NO",
       
        
      };

      await cPersons.create(myData);
      const user_ID = await cPersons.MaxID("id");

      const act_no1 = 200100 + user_ID;
      //console.log(act_no1);
      await cPersons.getRecByID("id", act_no1, user_ID);
      const prsDtls = await cPersons.getPerson(user_ID);
      // console.log(prsDtls.dataValues);
      //  res.status(200).json({ message: "Success" });

       let bdymsg ='';
             //let MyMail="showtechitconcept@gmail.com";
            let MyMail=prsDtls.e_mail;
            // bdymsg +='<a href="localhost:5000/verify/'+user_ID+'" > Verify </a>';
            bdymsg += `
                  <style>
                    .email-container {
                      font-family: Arial, sans-serif;
                      padding: 20px;
                      color: #333;
                      background-color: #f9f9f9;
                    }
                    .email-heading {
                      text-align: center;
                      font-weight: bold;
                      font-size: 16px;
                      color: #2c3e50;
                    }
                    .email-subheading {
                      text-align: center;
                      font-weight: bold;
                      font-size: 18px;
                      margin-top: 20px;
                      color: #34495e;
                    }
                    .verify-button {
                      display: block;
                      width: fit-content;
                      margin: 20px auto;
                      background-color: #04AA6D;
                      border: none;
                      color: white;
                      padding: 7px 18px;
                      text-align: center;
                      text-decoration: none;
                      font-size: 16px;
                      border-radius: 6px;
                      cursor: pointer;
                    }
                    .email-footer {
                      text-align: center;
                      font-weight: bold;
                      margin-top: 10px;
                    }
                  </style>`;

    bdymsg += `<div class="email-container">
                <h2 class="email-heading"> Account Verification</h2>
                <p class="email-subheading">Loan Details</p>
                <a href="https://greenheyscredit.com/veri_account.php?id=${user_ID}" class="verify-button">Verify</a>
                <p class="email-footer">Please click above to verify your account</p>
              </div>
            `;

      
            SndMail.getSendMail(bdymsg,MyMail,"Verify Account",req.body.txtSurname.toUpperCase())

      res.status(200).json({
        success: true,
        message:"Please check your mail to verify your account",
        //data:prsDtls.dataValues
        // data: {
        //   id: prsDtls.dataValues.id,
        //   surname: prsDtls.dataValues.surname,
        //   othername: prsDtls.dataValues.othername,
        //   email: prsDtls.dataValues.email,
        //   acct_no: act_no1.toString(),
        //   Date_Last_Modified: prsDtls.dataValues.Date_Last_Modified,
        //   createdAt: prsDtls.dataValues.createdAt,
        //   account_data: prsDtls.dataValues,
        // },
      });
      // const UsrzID = await UserService.MaxID("id");

     
    }
  }
);

router.get("/api/v1/customers",verifyAdmin, pagination, AuthRole('ADMIN','CREDITOR','USER'),
  async (req, res) => {
  const pages = await cPersons.getAllCustomers(req.mypages);
  res.status(200).json({
    success:true,
    data:pages,
   // total:pages.length,
  })
  //res.send(pages);
});

router.get("/api/v1/userDDd", verifyAdmin, async (req, res, next) => {
  const id = req.userDtl.id;

  sequelize
    .query(
      `SELECT * , persons.id AS p_id, loan_orders.id AS o_id FROM persons INNER JOIN loan_orders ON persons.id = loan_orders.person_id ORDER BY o_id DESC`,
      { type: sequelize.QueryTypes.SELECT }
    )

    .then((results) => {
      // console.log('Query result:', results);
      res.status(200).json({
        success: true,
        message: "success",
        total: results.length,
        data: results,
      });
    })
    .catch((error) => {
      //console.error('Error fetching data:', error);
      res.status(200).json({
        success: false,
        data: "",
      });
    });

});



module.exports = router;