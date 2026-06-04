function authorizePermission(...requiredPermissions) {
  return (req, res, next) => {
    try {
      const userPermissions = req.userDtl[0].permission
        ? req.userDtl[0].permission.split(",").map((p) => p.trim())
        : [];

      //console.log(requiredPermissions);
     // console.log(userPermissions);

      const hasPermission = requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

      //console.log(hasPermission);

      if (!hasPermission) {
        return res.status(400).json({
          success: false,
          message: "Access denied",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Permission validation failed",
      });
    }
  };
}

module.exports = authorizePermission;
