const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const Joi = require("joi");
const cPersons = require("../persons/persons.controller");
const Tools = require("../../shared/commonTools");
const jwt = require('jsonwebtoken');
const sequelize = require("../../config/database");

router.post("/api/v1/person/login", async (req, res) => {
    console.log(req.body);
    const loginDetails = req.body;
   const txtEmail =  loginDetails.txtEmail
   const txtPass =  loginDetails.txtPassWD
 // console.log(txtEmail)
    try {
        // Ensure the request body contains required fields
        const schema = Joi.object({
            txtEmail: Joi.string().email().required(),
            txtPassWD: Joi.string().required()
        });

        const { error } = schema.validate(loginDetails);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        // Use parameterized queries to prevent SQL injection
        const results = await sequelize.query(
            `SELECT * FROM persons WHERE e_mail = :email  AND  pass_Word = :pass AND acct_type = 'CREDITORS' AND isActive1 ='YES'`, 
            {
                replacements: { email: txtEmail ,pass: txtPass },
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (results.length > 0) {
            const Creditor = results[0];
            console.log(Creditor)
            const CrdtID = Creditor.id;

        

            //var qrt =`SELECT * FROM persons INNER JOIN loan_orders ON persons.id = loan_orders.person_id AND loan_orders.person_id ='2'`
            
            // Check if the password matches (assuming you hash passwords on registration)
            // const passwordMatch = await bcryptjs.compare(txtPass, user.PassWord);
            // if (!passwordMatch) {
            //     return res.status(401).json({
            //         success: false,
            //         message: "Invalid Login Details"
            //     });
            // }

           
           // console.log(agtID)
            const token = jwt.sign({ id: CrdtID }, "EP4ssWard", { expiresIn: '30m' }); // Set expiration

            let options = {
                maxAge: 30 * 60 * 1000, // 30 minutes
                httpOnly: true,
                secure: true,
                sameSite: "None",
            };

            res.cookie("MySessionIDCREDITOR", token, options);

            return res.status(200).json({
                success: true,
                message: "Login Successful",
                data: Creditor, // send user details instead of full results
                Token: token
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid Login Details",
            });
        }

    } catch (err) {
        console.error("Database query error: ", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }

});

module.exports = router;
