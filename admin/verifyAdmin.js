const jwt = require('jsonwebtoken');
const UserService = require("./users/users.controller")
const PersonService = require("./persons/persons.controller")

module.exports = async (req, res, next) => {
  try {

    //console.log(req)

      let accessToken = getToken(req);
      //console.log(accessToken)

      if (!accessToken) {
          return res.status(401).json({
              success: false,
              message: "Not Authorized",
          });
      }

     // const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      const decoded = jwt.verify(accessToken, 'EP4ssWard');
     // console.log(decoded.id)
      
      let userD = "";
    //   if (req.cookies.MySessionIDCREDITOR) {
    //      // console.log("Creditor");
    //       userD = await PersonService.getPerson(decoded.id);
    //      // req.userDtl = userD.dataValues;
    //   } else if (req.cookies.MySessionIDCool) {
    //       //console.log("Admin");
    //       userD = await UserService.getUser(decoded.id);
    //   }else if(req.headers['authorization']?.split(' ')[1]){
    //      console.log("Admin");
           userD = await UserService.getUser(decoded.id);
    //   }else if (req.headers['authorization-creditor']?.split(' ')[1]) {  // Case-insensitive
    //       //console.log("Creditor (from Header)");
    //      // userD = await PersonService.getPerson(decoded.id);
    //   } 
      // else if (req.headers['authorization-admin']?.split(' ')[1]) {  // Case-insensitive
      //     console.log("Admin (from Header)");
      //     userD = await UserService.getUser(decoded.id);
      // } 
    //   else {
    //       console.log("No valid session or token found.");
    //       return res.status(401).json({ message: "Unauthorized" });
    //   }

     
      req.userDtl = userD.dataValues;
      req.currentToken = accessToken;

      next();
  } catch (error) {
      console.error("Authentication Error:", error.message);
     // return res.redirect("/logout");
     return res
      .status(401)
      .json({ success: false, message: error.message });
  }
};

function getToken(req) {
    //console.log(req)
  return req.cookies.MySessionIDCREDITOR ||
         req.cookies.MySessionIDCool ||
         req.headers["authorization"]?.split(" ")[1] || req.headers['Authorization-Creditor']?.split(' ')[1];
}

