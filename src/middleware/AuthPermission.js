const { sequelize } = require("../../config/database");
const { QueryTypes } = require("sequelize");

const authorizePermission = (permission) => {
  return async (req, res, next) => {
   // console.log(req.userDtl.permissions);
    const userId = req.userDtl.id;
    const RoleName = req.userDtl.role_name;
    const permissions = req.userDtl.permissions
      .split(",")
      .map((perm) => perm.trim());
    // console.log(req.userDtl);
    // console.log(req.userDtl.id);
    //console.log(permissions);
    // console.log(permission)
    // return false;
    try {
      //   const result = await sequelize.query(
      //     `
      //     SELECT
      //       r.name AS role_name,
      //       EXISTS (
      //         SELECT 1
      //         FROM role_permissions rp
      //         INNER JOIN permissions p
      //           ON p.id = rp.permission_id
      //         WHERE rp.role_id = r.id
      //           AND p.name = :permission
      //       ) AS has_permission
      //     FROM users u
      //     INNER JOIN roles r
      //       ON r.id = u.role_id
      //     WHERE u.id = :userId
      //     LIMIT 1
      //     `,
      //     {
      //       replacements: {
      //         userId: userId,
      //         permission,
      //       },
      //       type: QueryTypes.SELECT,
      //     }
      //   );

      //   if (!result.length) {
      //     return res.status(403).json({
      //       success: false,
      //       message: "User role not found",
      //     });
      //   }
      // console.log(result[0]);
      //  const { role_name, has_permission } = result[0];

      // SUPER_ADMIN bypass
      if (RoleName === "SUPER_ADMIN") {
        return next();
      }

      //console.log(permission);

      if (permissions.includes(permission)) {
        return next();
      }

      //   if (Boolean(has_permission)) {
      //     return next();
      //   }

      return res.status(400).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    } catch (error) {
      console.error("authorizePermission:", error);

      return res.status(500).json({
        success: false,
        message: "Permission verification failed",
      });
    }
  };
};

module.exports = authorizePermission;
