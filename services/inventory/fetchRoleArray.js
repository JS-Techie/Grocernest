const db = require("../../models/");
const Role = db.RoleModel;
const UserRole = db.UserRoleModel;

const getRoleList = async (user_id) => {
  const userRoles = await UserRole.findAll({
    where: { user_id, active_ind: "Y" },
    order: [["id", "asc"]],
  });

  let response = [];

  if (userRoles.length > 0) {
    const promises = userRoles.map(async (current) => {
      const currentRole = await Role.findOne({
        where: { id: current.role_id },
      });

      return {
        createdBy: currentRole.created_by,
        createdAt: currentRole.created_at,
        updatedBy: currentRole.updated_by,
        updatedAt: currentRole.created_at,
        isActive: currentRole.active_ind,
        roleId: currentRole.id,
        roleName: currentRole.role_name,
        roleDesc: currentRole.role_desc,
        userType: currentRole.user_type,
      };
    });

    response = await Promise.all(promises);
  }

  return response;
};

module.exports = getRoleList;
