const jwt = require("jsonwebtoken");
const UserService = require("./users/users.controller");
const PersonService = require("./persons/persons.controller");
const { sequelize } = require("./users/users.model");

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
    const decoded = jwt.verify(accessToken, "EP4ssWard");
    // console.log(decoded.id)

    //let userD = "";

    const userD = await sequelize.query(
      `SELECT 
                    u.*,
                    r.rolename,
                    r.permission,
                    r.permission_module
                FROM tblusers u
                INNER JOIN tblrole r 
                    ON u.role_id = r.id
                WHERE 
                    u.id = :id;`,
      {
        replacements: { id: decoded.id },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    //console.log(userD);

    //   if (req.cookies.MySessionIDCREDITOR) {
    //      // console.log("Creditor");
    //       userD = await PersonService.getPerson(decoded.id);
    //      // req.userDtl = userD.dataValues;
    //   } else if (req.cookies.MySessionIDCool) {
    //       //console.log("Admin");
    //       userD = await UserService.getUser(decoded.id);
    //   }else if(req.headers['authorization']?.split(' ')[1]){
    //      console.log("Admin");
    //userD = await UserService.getUser(decoded.id);
    //userD = results;
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

    req.userDtl = userD;
    req.currentToken = accessToken;

    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);
    // return res.redirect("/logout");
    return res.status(401).json({ success: false, message: error.message });
  }
};

function getToken(req) {
  //console.log(req)
  return (
    req.cookies.MySessionIDCREDITOR ||
    req.cookies.MySessionIDCool ||
    req.headers["authorization"]?.split(" ")[1] ||
    req.headers["Authorization-Creditor"]?.split(" ")[1]
  );
}
