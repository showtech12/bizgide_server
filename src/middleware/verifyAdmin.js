const jwt = require("jsonwebtoken");
const UserService = require("../users/user.controller");

const { sequelize } = require("../users/user.model");

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
   //  console.log(decoded.id)

    //let userD = "";
    if (decoded.auth_type !== "BizAdmn") {
      return res.status(403).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const userD = await sequelize.query(
      `SELECT 
          u.*,
          r.rolename,
          r.permission
      FROM users u
      INNER JOIN tblrole r
          ON u.role_id = r.id
      WHERE u.id = :id;`,
      {
        replacements: { id: decoded.id },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    req.userDtl = userD;
    req.currentToken = accessToken;

    next();
  } catch (error) {
    console.error("Admin Authentication Error:", error.message);
    // return res.redirect("/logout");
    return res.status(401).json({ success: false, message: error.message });
  }
};

function getToken(req) {
  //console.log(req)
  return (
    req.cookies.BizGAdm_SOFTiD || req.headers["authorization"]?.split(" ")[1]
  );
}
