const { Op } = require("sequelize");
const db = require("../../../models");

const Color = db.LkpColorModel;

const saveColor = async (req, res, next) => {

    const { user_id } = req;
    const { colorId, colorCode, colorName, existingColor } = req.body;
    try {
        // const existingColor = await Color.findOne({
        //     where: { id:colorId }
        // })

        if (existingColor === "N") {
            const sameColor = await Color.findOne({
                where: { [Op.or]: [{ color_cd: colorCode }, { color_name: colorName }] }
            })
            if (sameColor) {
                return res.status(200).send({
                    status: 403,
                    message: "The color code or color name alreary exists",
                    data: []
                })
            }

            const newColor = await Color.create({
                color_cd: colorCode,
                color_name: colorName,
                active_ind: "Y",
                created_by: user_id,
                created_at: Date.now(),
                updated_by: user_id,
                updated_at: Date.now()
            })
            const response = {
                colorId,
                colorCode: newColor.color_cd,
                colorName: newColor.color_name,
                isActive: newColor.active_ind,
                createdBy: newColor.created_by,
                createdAt: newColor.created_at,
                updatedBy: newColor.updated_by,
                updatedAt: newColor.updated_by
            }
            return res.status(200).send({
                status: 200,
                message: "Successfully created the color",
                data: response
            })
        }

        else {

            const currentColor = await Color.findOne({
                where: { id: colorId }
            })
            if (!currentColor) {
                return res.status(200).send({
                    status: 200,
                    message: "This color does not exist",
                    data: []
                })
            }

            const sameColorArray = await Color.findAll({
                attributes: ["id"],
                where: {
                    [Op.or]: [{ color_cd: colorCode }, { color_name: colorName }],
                    [Op.not]: [{id: colorId}]
                },
            });
            if (sameColorArray.length!==0 ) {
                return res.status(200).send({
                    status: 403,
                    message: "Color Name or Color code already exists",
                    data: [],
                });
            }




            const updateColor = await Color.update({
                color_cd: colorCode,
                color_name: colorName
            },
                { where: { id: colorId } }
            )
            const updatedColour = await Color.findOne({
                where: { id: colorId }
            })
            const response = {
                colorId: updatedColour.id,
                colorCode: updatedColour.color_cd,
                colorName: updatedColour.color_name,
                isActive: updatedColour.active_ind
            }
            return res.status(200).send({
                status: 200,
                message: "Successfully updated the color",
                data: response
            })
        }
    }

    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Could not save the color",
            data: error.message
        })
    }
}
const getAllColor = async (req, res, next) => {
    try {
        const allColors = await Color.findAll({

        });
        if (allColors.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "No colors available",
                data: []
            })
        }
        const promises = allColors.map((current) => {
            return ({
                colorId: current.id,
                colorCode: current.color_cd,
                colorName: current.color_name,
                isActive: current.active_ind

            })
        })
        const response = await Promise.all(promises)

        return res.status(200).send({
            status: 200,
            message: "Successfully fetched all the colors",
            data: response
        });
    } catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Could not get the colors",
            data: error.message
        })
    }
}
const activeColor = async (req, res, next) => {
    const id = req.body;
    try {
        const currentColour = await Color.findOne({
            where: { id }
        })
        if (!currentColour) {
            return res.status(200).send({
                status: 404,
                message: "requested color ot found",
                data: []
            })
        }

        const activate = await Color.update({
            active_ind: "Y"
        }, {
            where: { id }
        })

        const updatedColour = await Color.findOne({
            where: { id }
        })
        const response = {
            colorId: updatedColour.id,
            colorCode: updatedColour.color_cd,
            colorName: updatedColour.color_name,
            isActive: updatedColour.active_ind
        }
        return res.status(200).send({
            status: 200,
            message: "successfully activated",
            data: response
        })
    } catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong, please try again in sometime",
            data: error.message
        })
    }
}
const deactiveColor = async (req, res, next) => {
    const id = req.body;
    try {
        const currentColour = await Color.findOne({
            where: { id }
        })
        if (!currentColour) {
            return res.status(200).send({
                status: 404,
                message: "not found the requested color",
                data: []
            })
        }
        const deactivate = await Color.update({
            active_ind: "N"
        },
            {
                where: { id }
            });
        const updatedColour = await Color.findOne({
            where: { id }
        })


        const response = {
            colorId: updatedColour.id,
            colorCode: updatedColour.color_cd,
            colorName: updatedColour.color_name,
            isActive: updatedColour.active_ind
        }

        return res.status(200).send({
            status: 200,
            message: "Deactivated the requested colors",
            data:
                response
        })

    } catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong , please try again later",
            data: error.message
        })
    }
}
const getActiveColor = async (req, res, next) => {
    try {
        const activeColors = await Color.findAll({
            where: { active_ind: "Y" }
        })
        if (activeColors.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "No active colors available",
                data: []
            })
        }
        const promises = activeColors.map((current) => {
            return ({
                colorId: current.id,
                colorCode: current.color_cd,
                colorName: current.color_name,
                isActive: current.active_ind
            })
        })
        const response = await Promise.all(promises)

        return res.status(200).send({
            status: 200,
            message: "Got all the active colors",
            data: response
        })
    } catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Did not get the active colors",
            data: error.message
        })
    }
}
const getDeactiveColor = async (req, res, next) => {
    try {
        const deactivateColors = await Color.findAll({
            where: { active_ind: "N" }
        })
        if (deactivateColors.length === 0) {
            return res.status(200).send({
                status: 203,
                message: "No deactivate colors available",
                data: []
            })
        }
        const promises = deactivateColors.map((current) => {
            return ({
                colorId: current.id,
                colorCode: current.color_cd,
                colorName: current.color_name,
                isActive: current.active_ind
            })
        })
        const response = await Promise.all(promises)
        return res.status(200).send({
            status: 200,
            message: "Got all the deactivate colors",
            data: response
        });
    } catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Did not get the deactivate colors",
            data: error.message
        })
    }
}

module.exports = {
    saveColor,
    getAllColor,
    activeColor,
    deactiveColor,
    getActiveColor,
    getDeactiveColor,
}