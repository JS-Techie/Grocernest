const db = require('../models')
const { Op } = require("sequelize")


const UserRoleModel = db.UserRoleModel
const ModuleRoleModel = db.ModuleRoleModel
const ModuleModel = db.ModuleModel
const RoleModel = db.RoleModel


const fetchRoleArray = require('../services/inventory/fetchRoleArray')

const getUserRoles = async (user_id) => {
    const roleOutput = await fetchRoleArray(user_id)
    console.log("the fetch role array output is ", roleOutput)

    return roleOutput
}

const getModuleList = async (user_id) => {

    const roleArrayOutput = await fetchRoleArray(user_id)
    console.log("The Role Array Output", roleArrayOutput)


    const dataArrayPromises = roleArrayOutput.map(async (roleArrayIndividualOutput) => {
        return roleArrayIndividualOutput.roleId
    })

    const role_id = await Promise.all(dataArrayPromises)



    console.log("the role id is", role_id)
    const moduleRoleResult = await ModuleRoleModel.findAll({
        attributes: ["module_id"],
        in: { role_id },
        raw: true
    })


    console.log("the module model result", moduleRoleResult)

    const moduleModelResult = await ModuleModel.findAll({
        in: { id: moduleRoleResult.module_id }
    })

    console.log(moduleModelResult)
    const moduleModelReturnPromises = moduleModelResult.map((objectElement) => {
        const responseFormat = {
            createdBy: objectElement.created_by,
            createdAt: objectElement.created_at,
            updatedBy: objectElement.updated_by,
            updatedAt: objectElement.updated_at,
            isActive: objectElement.active_ind,
            moduleId: objectElement.id,
            moduleName: objectElement.module_name,
            moduleDesc: objectElement.module_desc
        }
        return responseFormat
    })

    const moduleModelResponse= await Promise.all(moduleModelReturnPromises)

    console.log("========================== DUMMY LINE =========================")
    console.log(moduleModelResponse)
    return moduleModelResponse;
}

module.exports = { getUserRoles, getModuleList }