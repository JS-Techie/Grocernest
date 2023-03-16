const { Op } = require("sequelize");
const db = require("../../../models");

const Department = db.LkpDepartmentModel;

const saveDepartment = async (req, res, next) => {
    const { deptCode, deptName, existingDepartment, id } = req.body;
    const { user_id } = req;
    try {

        if (existingDepartment === "N") {

            const sameDept = await Department.findOne({
                where: { [Op.or]: [{ dept_cd: deptCode }, { dept_name: deptName }] }
            })
            if (sameDept) {
                return res.status(200).send({
                    status: 403,
                    message: "Department code or department name already exists",
                    data: []
                })
            }


            const newDepartment = await Department.create({
                dept_name: deptName,
                dept_cd: deptCode,
                // dept_desc1:deptDesc1,
                // dept_desc2:deptDesc2,
                created_by: user_id,
                created_at: Date.now(),
                updated_by: user_id,
                updated_at: Date.now(),
                active_ind: "Y",
            })
            const currentDepartment = await Department.findOne({
                where: {
                    dept_name: deptName,
                    dept_cd: deptCode,
                    // dept_desc1,
                    // dept_desc2,
                    created_by: user_id,
                    active_ind: "Y",
                }
            })
            const response = {
                id: currentDepartment.id,
                deptName: newDepartment.dept_name,
                deptCode: newDepartment.dept_cd,
                deptDesc1: newDepartment.dept_desc1,
                deptDesc2: newDepartment.dept_desc2,
                craetedBy: newDepartment.created_by,
                createdAt: newDepartment.created_at,
                updatedBy: newDepartment.updated_by,
                updatedAt: newDepartment.updated_at,
                isActive: newDepartment.active_ind
            }
            return res.status(200).send({
                status: 200,
                message: "Successfully saved the department",
                data: response
            })
        }

        const currentDepartments = await Department.findOne({
            where: { id }
        })
        if (!currentDepartments) {
            return res.status(200).send({
                status: 203,
                message: " The requested department doesnt exist",
                data: []
            })
        }

        const sameDepartmentArray = await Department.findAll({
            attributes: ["id"],
            where: {
                [Op.or]: [{ dept_cd: deptCode }, { dept_name: deptName }],
            },
        });
        let idCheckflag = false
        for (var i = 0; i < sameDepartmentArray.length; i++) {
            var item = sameDepartmentArray[i];

            if (item.id !== id) {
                idCheckflag = true
            }
        }
        if (idCheckflag) {
            return res.status(200).send({
                status: 403,
                message: "Department Name or Department code already exists",
                data: [],
            });
        }
        const updateDepartment = await Department.update({
            dept_name: deptName,
            dept_cd: deptCode
        }, { where: { id } }
        )
        const updatedDepartment = await Department.findOne({
            where: { id }
        })

        const response = {
            id: updatedDepartment.id,
            deptName: updatedDepartment.dept_name,
            deptCode: updatedDepartment.dept_cd,
            deptDesc1: updatedDepartment.dept_desc1,
            deptDesc2: updatedDepartment.dept_desc2,
            createdAt: updatedDepartment.created_at,
            craetedBy: updatedDepartment.created_by,
            updatedAt: updatedDepartment.updated_at,
            updatedBy: updatedDepartment.updated_by,
            existingDepartment: updatedDepartment.active_ind
        }
        return res.status(200).send({
            status: 200,
            message: " The requested Department has been updated successfully ",
            data: response
        })
    }

    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong , Please try again in sometimes",
            data: error.message
        })
    }
}

const getAllDepartment = async (req, res, next) => {
    try {
        const allDepartments = await Department.findAll({
        })
        if (allDepartments.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "All departments not found",
                data: []
            })
        }
        const promises = allDepartments.map((current) => {
            return ({
                id: current.id,
                deptCode: current.dept_cd,
                deptName: current.dept_name,
                deptDesc1: current.dept_desc1,
                deptDesc2: current.dept_desc2,
                isActive: current.active_ind
            })
        })
        const resolved = await Promise.all(promises)
        return res.status(200).send({
            status: 200,
            message: "Successfully fetched all the departments",
            data: resolved
        })
    }
    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong , Please try again in sometimes",
            data: error.message
        })
    }
}

const getActiveDepartment = async (req, res, next) => {
    try {
        const activeDept = await Department.findAll({
            where: { active_ind: "Y" }
        })
        if (activeDept.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "Active departments not found",
                data: []
            })
        }
        const promises = activeDept.map((current) => {
            return ({
                id: current.id,
                deptCode: current.dept_cd,
                deptName: current.dept_name,
                deptDesc1: current.dept_desc1,
                deptDesc2: current.deptDesc2,
                isActive: current.active_ind
            })
        })
        const resolved = await Promise.all(promises)
        return res.status(200).send({
            status: 200,
            message: "Successfully fetched all the active departments",
            data: resolved
        })
    }
    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong , Please try again in sometimes",
            data: error.message
        })
    }
}

const getDeactiveDepartment = async (req, res, next) => {
    try {
        const deactiveDept = await Department.findAll({
            where: { active_ind: "N" }
        })
        if (deactiveDept.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "Deactive departments not found",
                data: []
            })
        }
        const promises = deactiveDept.map((current) => {
            return ({
                id: current.id,
                deptCode: current.dept_cd,
                deptName: current.dept_name,
                deptDesc1: current.dept_desc1,
                deptDesc2: current.dept_desc2,
                isActive: current.active_ind
            })
        })
        const resolved = await Promise.all(promises)
        return res.status(200).send({
            status: 200,
            message: "Successfully fetched all the deactive departments",
            data: resolved
        })
    }
    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong , Please try again in sometimes",
            data: error.message
        })
    }
}

const activeDepartment = async (req, res, next) => {
    const deptIdList = req.body;
    const { user_id } = req;
    try {
        if (deptIdList.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "Department id list not found",
                data: []
            })
        }
        const promises = deptIdList.map(async (current) => {
            const currentDept = await Department.findOne({
                where: { id: current }
            })
            if (currentDept) {
                const update = await Department.update({
                    active_ind: "Y"
                }, { where: { id: current } }
                )
                return ({
                    "id": currentDept.id,
                    "deptName": currentDept.dept_name,
                    "deptCode": currentDept.dept_cd,
                    "isActive": "Y",
                    "updatedAt": currentDept.updated_at,
                    "createdAt": currentDept.created_at,
                    "createdBy": currentDept.created_by,
                    "updatedBy": currentDept.updated_by
                })
            }
        })
        const resolved = await Promise.all(promises)
        return res.status(200).send({
            status: 200,
            message: "Activated requested departments successfully",
            data: resolved
        })

    }
    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong , Please try again in sometimes",
            data: error.message
        })
    }
}

const deactiveDepartment = async (req, res, next) => {
    const { user_id } = req;
    const deptIdList = req.body;
    try {
        if (deptIdList.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "Department id list not found",
                data: []
            })
        }
        const promises = deptIdList.map(async (current) => {
            const currentDept = await Department.findOne({
                where: { id: current }
            })
            if (currentDept) {
                const update = await Department.update({
                    active_ind: "N"
                }, { where: { id: current } }
                )
                return ({
                    "id": currentDept.id,
                    "deptName": currentDept.dept_name,
                    "deptCode": currentDept.dept_cd,
                    "isActive": "N",
                    "updatedAt": currentDept.updated_at,
                    "createdAt": currentDept.created_at,
                    "createdBy": currentDept.created_by,
                    "updatedBy": currentDept.updated_by
                })
            }
        })
        const resolved = await Promise.all(promises)
        return res.status(200).send({
            status: 200,
            message: "deactivated requested departments successfully",
            data: resolved
        })

    }
    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong , Please try again in sometimes",
            data: error.message
        })
    }
}



module.exports = {
    saveDepartment,
    getAllDepartment,
    activeDepartment,
    deactiveDepartment,
    getActiveDepartment,
    getDeactiveDepartment,
}