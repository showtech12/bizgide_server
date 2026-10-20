const express = require("express");
//const verifyPerson = require("../verifyPerson");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const Joi = require("joi");
const AuthPermission = require("../middleware/AuthPermission");
const sequelize = require("../../config/database");
const { QueryTypes } = require("sequelize");
//const uploadMiddleware = require("../middleware/uploadMiddleware");
const verifyAdmin = require("../middleware/verifyAdmin");

router.get(
  "/api/v2/roles",
  verifyAdmin,
  AuthPermission("settings_view"),
  async (req, res, next) => {
    try {
      const permissions = await sequelize.query(
        `
       SELECT
          id,
          name,
          description,
          status
        FROM roles_adm
        WHERE status = 1
        ORDER BY name ASC
      `,
        { type: sequelize.QueryTypes.SELECT },
      );

      return res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      console.error("Get permissions error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch permissions",
      });
    }
  },
);

router.get(
  "/api/v2/permissions",
 verifyAdmin,
 AuthPermission("settings_view"),
  async (req, res, next) => {
    try {
      const permissions = await sequelize.query(
        `
       SELECT
          id,
          name,
          module,
          action,
          description
        FROM permissions_adm
        ORDER BY module ASC, id ASC
      `,
        { type: sequelize.QueryTypes.SELECT },
      );

      return res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      console.error("Get permissions error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch permissions",
      });
    }
  },
);

router.get(
  "/api/v2/roles/:roleId/permissions",
  verifyAdmin,
 AuthPermission("settings_view"),
  async (req, res, next) => {
    try {
      const { roleId } = req.params;

      const result = await sequelize.query(
        `
      SELECT
            rp.id,
            rp.role_id,
            rp.permission_id,
            p.name AS permission_name,
            p.module,
            p.action
        FROM role_permissions_adm rp
        INNER JOIN permissions_adm p
            ON p.id = rp.permission_id
        WHERE rp.role_id = :roleId
        ORDER BY p.module, p.id
      `,
        {
          replacements: {
            roleId,
          },
          type: sequelize.QueryTypes.SELECT,
        },
      );

      if (!result.length) {
        return res.status(404).json({
          success: false,
          message: "Role not found",
        });
      }

      const role = {
        id: result[0].role_id,
        name: result[0].role_name,
        permissions: result
          .filter((item) => item.permission_id !== null)
          .map((item) => ({
            id: item.permission_id,
            name: item.permission_name,
            module: item.module,
            action: item.action,
          })),
      };

      return res.status(200).json({
        success: true,
        data: role,
      });
    } catch (error) {
      console.error("Get role permissions error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch role permissions",
      });
    }
  },
);

router.put(
  "/api/v2/roles/:roleId/permissions",
  verifyAdmin,
  AuthPermission("settings_update"),
  async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const roleId = Number(req.params.roleId);
      const { permission_ids = [] } = req.body;

      if (!roleId || !Number.isInteger(roleId)) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "Invalid role ID",
        });
      }

      if (!Array.isArray(permission_ids)) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "permission_ids must be an array",
        });
      }

      // Remove duplicate IDs
      const permissionIds = [
        ...new Set(
          permission_ids
            .map(Number)
            .filter((id) => Number.isInteger(id) && id > 0),
        ),
      ];

      // Check role exists
      const roles = await sequelize.query(
        `
        SELECT id, name
        FROM roles_adm
        WHERE id = :roleId
        LIMIT 1
        `,
        {
          replacements: { roleId },
          type: sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      if (!roles.length) {
        await transaction.rollback();

        return res.status(404).json({
          success: false,
          message: "Role not found",
        });
      }

      // Validate permission IDs
      if (permissionIds.length > 0) {
        const permissions = await sequelize.query(
          `
          SELECT id
          FROM permissions_adm
          WHERE id IN (:permissionIds)
          `,
          {
            replacements: {
              permissionIds,
            },
            type: sequelize.QueryTypes.SELECT,
            transaction,
          },
        );

        if (permissions.length !== permissionIds.length) {
          await transaction.rollback();

          return res.status(400).json({
            success: false,
            message: "One or more permissions are invalid",
          });
        }
      }

      // Remove current role permissions
      await sequelize.query(
        `
        DELETE FROM role_permissions_adm
        WHERE role_id = :roleId
        `,
        {
          replacements: {
            roleId,
          },
          type: sequelize.QueryTypes.DELETE,
          transaction,
        },
      );

      // Insert new permissions
      if (permissionIds.length > 0) {
        const values = permissionIds.map(() => "(?, ?)").join(", ");

        const replacements = [];

        permissionIds.forEach((permissionId) => {
          replacements.push(roleId, permissionId);
        });

        await sequelize.query(
          `
          INSERT INTO role_permissions_adm
            (role_id, permission_id)
          VALUES ${values}
          `,
          {
            replacements,
            type: sequelize.QueryTypes.INSERT,
            transaction,
          },
        );
      }

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Role permissions updated successfully",
        data: {
          role_id: roleId,
          permission_ids: permissionIds,
        },
      });
    } catch (error) {
      await transaction.rollback();

      console.error("Update role permissions:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update role permissions",
      });
    }
  },
);

module.exports = router;
