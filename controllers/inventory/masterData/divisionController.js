const { Op } = require("sequelize");
const db = require("../../../models");

const Division = db.LkpDivisionModel;

const saveDivision = async (req, res, next) => {
    const { user_id } = req;
    const {
        divisionCode,
        divisionName,
        existingDivision } = req.body;

    try {       


        if (existingDivision == "N") {
            const sameDivision = await Division.findOne({
                where: { [Op.or]: [{ div_cd: divisionCode }, { div_name: divisionName }] }
            })
    
            if (sameDivision) {
                return res.status(200).send({
                    status: 403,
                    message: "Division code or division name already exists",
                    data: sameDivision
                })
            }

            const newDivision = await Division.create({
                div_cd: divisionCode,
                div_name: divisionName,
                active_ind: "Y",
                created_by: user_id,
                created_at: Date.now(),
                // updated_at,
                // updated_by
            })

            const currentDivision = await Division.findOne({
                where: {
                    div_cd: divisionCode,
                    div_name: divisionName,
                    active_ind: "Y",
                    created_by: user_id
                }
            })
            const response = {
                id: currentDivision.id,
                divisionCode: newDivision.div_cd,
                divisionName: newDivision.div_name,
                isActive: newDivision.active_ind,
                createdBy: newDivision.created_by,
                createdAt: newDivision.created_at,
                updatedAt: newDivision.updated_at,
                updatedBy: newDivision.updated_by

            }

            return res.status(200).send({
                status: 200,
                message: "Successfully saved the division",
                data: response
            })
        }
        else {
            const { id, detailsChangedFlag } = req.body;
            const currentDivision = await Division.findOne({
                where: { id }
            })
            if (!currentDivision) {
                return res.status(200).send({
                    status: 404,
                    message: "Division doesnt exist",
                    data: []
                })
            }

            const sameDivisionArray = await Division.findAll({
                attributes: ["id"],
                where: {
                    [Op.or]: [{ div_cd: divisionCode }, { div_name: divisionName }],
                },
            });
            let idCheckflag = false
            for (var i = 0; i < sameDivisionArray.length; i++) {
                var item = sameDivisionArray[i];

                if (item.id !== id) {
                    idCheckflag = true
                }
            }
            if (idCheckflag) {
                return res.status(200).send({
                    status: 403,
                    message: "Division Name or Division code already exists",
                    data: [],
                });
            }

            const updateDivision = await Division.update({
                div_cd: divisionCode,
                div_name: divisionName
            }, { where: { id } }
            )
            const updatedDivision = await Division.findOne({
                where: { id }
            })
            const response = {
                id: updatedDivision.id,
                divisionCode: updatedDivision.div_cd,
                divisionName: updatedDivision.div_name,
                isActive: updatedDivision.active_ind,
                createdBy: updatedDivision.created_by,
                createdAt: updatedDivision.created_at,
                updatedBy: updatedDivision.updated_by,
                updatedAt: updatedDivision.updated_at,
            }
            return res.status(200).send({
                status: 200,
                message: "Updated successfully",
                data: response
            })
        }
    }
    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Didn't get the data",
            data: error.message
        });
    }
}

const getAllDivision = async (req, res, next) => {
    try {
        const allDivision = await Division.findAll({})
        if (allDivision.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "No division found",
                data: []
            })
        }
        // console.log("All the divisions are::::::::::::::::: ", allDivision);
        const promises = allDivision.map((current) => {
            return ({
                id: current.id,
                divisionCode: current.div_cd,
                divisionName: current.div_name,
                isActive: current.active_ind
            })
        })
        const response = await Promise.all(promises)

        return res.status(200).send({
            status: 200,
            message: "Got all the divisions",
            data: response
        })

    } catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Didn't get the data",
            data: error.message
        });
    }
}

const getActiveDivision = async (req, res, next) => {
    try {
        const allActiveDivision = await Division.findAll({
            where: { active_ind: "Y" }
        })
        if (allActiveDivision.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "The requested division doesnot exist"
            })
        }
        const promises = allActiveDivision.map((current) => {
            return ({
                id: current.id,
                divisionCode: current.div_cd,
                divisionName: current.div_name,
                isActive: current.active_ind
            })
        })
        const response = await Promise.all(promises)
        return res.status(200).send({
            status: 200,
            message: " Got all the activated Divisions",
            data: response
        })
    } catch (error) {
        return res.status(200).send({
            status: 500,
            message: "couldnt get the activated division",
            data: error.message
        });
    }
}

const getDeactiveDivision = async (req, res, next) => {
    try {
        const allDeactivateDivision = await Division.findAll({
            where: { active_ind: "N" }
        })
        if (allDeactivateDivision.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "The requested division doesnt exist",
                data: []
            })
        }
        const promises = allDeactivateDivision.map((current) => {
            return ({
                id: current.id,
                divisionCode: current.div_cd,
                divisionName: current.div_name,
                isActive: current.active_ind
            })
        })
        const response = await Promise.all(promises)
        return res.status(200).send({
            status: 200,
            message: "Successfully fetched all the deactivated divisions",
            data: response
        })
    } catch (error) {
        return res.status(200).send({
            status: 500,
            message: "couldn't get the deactivated division",
            data: error.message
        });
    }
}

const activeDivision = async (req, res, next) => {
    const id = req.body;
    try {
        const currentDivision = await Division.findOne({
            where: { id }
        })
        // console.log("the current division from the query :::::::::::::::", currentDivision);
        if (!currentDivision) {
            return res.status(200).send({
                status: 404,
                message: "Requested division not exist",
                data: []
            })
        }
        const activate = await Division.update(
            { active_ind: "Y" }, { where: { id } }
        )


        const updatedDivision = await Division.findOne({
            where: { id }
        })
        const response = {
            id: updatedDivision.id,
            divisionCode: updatedDivision.div_cd,
            divisionName: updatedDivision.div_name,
            isActive: updatedDivision.active_ind
        }

        return res.status(200).send({
            status: 200,
            message: "Successfully activated the requested division",
            data: response
        })
    }
    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Didn't get the data",
            data: error.message
        });
    }
}

const deactiveDivision = async (req, res, next) => {
    const id = req.body
    // console.log("the id from the request body  ::::======>", id);
    try {
        const currentDivision = await Division.findOne({
            where: { id }
        })
        // console.log("The 2nd print from the query of the division table ::::::", currentDivision);
        if (!currentDivision) {
            return res.status(200).send({
                status: 404,
                message: "This division doesnt exist",
                data: []
            })
        }
        const deactivate = await Division.update({
            active_ind: "N"
        }, { where: { id } }
        )
        const updatedDivision = await Division.findOne({
            where: { id }
        })
        const response = {
            id: updatedDivision.id,
            divisionCode: updatedDivision.div_cd,
            divisionName: updatedDivision.div_name,
            isActive: updatedDivision.active_ind
        }
        return res.status(200).send({
            status: 200,
            message: "Requested division has been successfully deactivated",
            data: response
        })
    } catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Couldnt deactivate the requested division",
            data: error.message
        });
    }
}

module.exports = {
    saveDivision,
    getAllDivision,
    getActiveDivision,
    getDeactiveDivision,
    activeDivision,
    deactiveDivision
}