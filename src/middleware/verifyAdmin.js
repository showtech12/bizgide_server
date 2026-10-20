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

    // const userD = await sequelize.query(
    //   `	SELECT
    //       u.*,
    //       r.name AS role_name,
    //       GROUP_CONCAT(DISTINCT p.name) AS permissions
    //     FROM users u
    //     INNER JOIN roles_adm r
    //       ON r.id = u.role_id
    //     LEFT JOIN role_permissions_adm rp
    //       ON rp.role_id = r.id
    //     LEFT JOIN permissions_adm p
    //       ON p.id = rp.permission_id
    //     WHERE u.id = :id
    //     GROUP BY
    //       u.id,
    //       u.surname,
    //       u.othername,
    //       u.email,
    //       u.phone,
    //       r.name`,
    //   {
    //     replacements: { id: decoded.id },
    //     type: sequelize.QueryTypes.SELECT,
    //   },
    // );

    //console.log(userD);
    req.userDtl = decoded.userData;
    req.permissions = decoded.userData.permissions;
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
