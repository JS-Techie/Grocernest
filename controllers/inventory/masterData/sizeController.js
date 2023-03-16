const { Op } = require("sequelize");
const db = require("../../../models");

const Size = db.LkpSizeModel;

const saveSize = async (req, res, next) => {
    const { sizeCode, sizeOfItem, existingSize, detailsChangedFlag, id } = req.body;
    const { user_id } = req;

    try {

        const sameSize = await Size.findOne({
            where: {
                [Op.or]: [{ size_cd: sizeCode }, {
                    size_of_item: sizeOfItem,
                }]
            }
        })
        if (sameSize) {
            return res.status(200).send({
                status: 403,
                message: "Size code already exists",
                data: []
            })
        }



        if (existingSize === "N" && !id) {

            console.log("lalalalallalallal")

            const newSize = await Size.create({
                size_cd: sizeCode,
                size_of_item: sizeOfItem,
                active_ind: "Y",
                created_by: user_id,
                created_at: Date.now(),
                updated_by: user_id,
                updated_at: Date.now()
            })
            const currentSize = await Size.findOne({
                where: {
                    size_cd: sizeCode,
                    size_of_item: sizeOfItem,
                    created_by: user_id,
                    updated_by: user_id
                }
            })

            console.log("the resonse of CURRENT SIZE:",currentSize)
            const responses = {
                id: currentSize.id,
                sizeCode: newSize.size_cd,
                sizeOfItem: newSize.size_of_item,
                isActive: newSize.active_ind,
                createdBy: newSize.created_by,
                createdAt: newSize.created_at,
                updatedBy: newSize.updated_by,
                updatedAt: newSize.updated_at
            }
            return res.status(200).send({
                status: 200,
                message: "Successfully saved the size",
                data: responses
            })
        }
        const currentSizes = await Size.findOne({
            where: { id }
        })
        if (!currentSizes) {
            return res.status(200).send({
                status: 404,
                message: "Current sizes not found",
                data: []
            })
        }
        const updateSize = await Size.update({
            size_cd: sizeCode,
            size_of_item: sizeOfItem
        },
            { where: { id } }
        )
        const updatedSize = await Size.findOne({
            where: { id }
        })
        const responses = {
            id: updatedSize.id,
            sizeCode: updatedSize.size_cd,
            sizeOfItem: updatedSize.size_of_item,
            isActive: updatedSize.active_ind,
            createdAt: updatedSize.created_at,
            createdBy: updatedSize.created_by,
            updatedAt: updatedSize.updated_at,
            updatedBy: updatedSize.updated_by
        }
        return res.status(200).send({
            status: 200,
            message: "Requested size updated successfully",
            data: responses
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

const getAllSize = async (req, res, next) => {
    try {
        const allSizes = await Size.findAll({})
        if (allSizes.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "allsizes doesnot exist ",
                data: []
            })
        }
        const promises = await allSizes.map((current) => {
            return ({
                id: current.id,
                sizeCode: current.size_cd,
                sizeOfItem: current.size_of_item,
                isActive: current.active_ind
            })
        });
        const resolved = await Promise.all(promises);
        if (resolved)
            return res.status(200).send({
                status: 200,
                message: "Successfully fetched all the sizes",
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

const getActiveSize = async (req, res, next) => {
    try {
        const activeSize = await Size.findAll({
            where: { active_ind: "Y" }
        })
        if (activeSize.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "active size not found",
                data: []
            })
        }
        const promises = activeSize.map((current) => {
            return ({
                id: current.id,
                sizeCode: current.size_cd,
                sizeOfItem: current.size_of_item,
                isActive: current.active_ind
            })
        })
        const resolved = await Promise.all(promises)
        return res.status(200).send({
            status: 200,
            message: "Successfully fetched all the active sizes",
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

const getDeactiveSize = async (req, res, next) => {
    try {
        const deactiveSizes = await Size.findAll({
            where: { active_ind: "N" }
        })
        if (deactiveSizes.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "deactivesizes not found",
                data: []
            })
        }
        const promises = deactiveSizes.map((current) => {
            return ({
                id: current.id,
                sizeCode: current.size_cd,
                sizeOfItem: current.size_of_item,
                isActive: current.active_ind
            })
        })
        const resolved = await Promise.all(promises);
        return res.status(200).send({
            status: 200,
            message: "Successfully fetched all the deactive sizes ",
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

const activeSize = async (req, res, next) => {
    const sizeIdList = req.body;
    try {
        if (sizeIdList.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "sizeidlist not found",
                data: []
            })
        }
        const promises = sizeIdList.map(async (current) => {
            const currentSize = await Size.findOne({
                where: { id: current }
            })
            if (currentSize) {
                const updateSize = await Size.update({
                    active_ind: "Y"
                }, { where: { id: current } }
                )

                return ({
                    id: currentSize.id,
                    sizeCode: currentSize.size_cd,
                    sizeOfItem: currentSize.size_of_item,
                    isActive: "Y",
                    createdBy: currentSize.created_by,
                    createdAt: currentSize.created_at,
                    updatedBy: currentSize.updated_by,
                    updatedAt: currentSize.updated_at
                })
            }
        })
        const resolved = await Promise.all(promises);
        return res.status(200).send({
            status: 200,
            message: "Successfully activated the size",
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

const deactiveSize = async (req, res, next) => {
    const sizeIdList = req.body;
    try {
        if (sizeIdList.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "sizeidlist not found",
                data: []
            })
        }
        const promises = sizeIdList.map(async (current) => {
            const currentSize = await Size.findOne({
                where: { id: current }
            })
            if (currentSize) {
                const updateSize = await Size.update({
                    active_ind: "N"
                }, { where: { id: current } }
                )

                return ({
                    id: currentSize.id,
                    sizeCode: currentSize.size_cd,
                    sizeOfItem: currentSize.size_of_item,
                    isActive: "N",
                    createdBy: currentSize.created_by,
                    createdAt: currentSize.created_at,
                    updatedBy: currentSize.updated_by,
                    updatedAt: currentSize.updated_at
                })
            }
        })
        const resolved = await Promise.all(promises);
        return res.status(200).send({
            status: 200,
            message: "Successfully deactivated the size",
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
    saveSize,
    getAllSize,
    activeSize,
    deactiveSize,
    getActiveSize,
    getDeactiveSize,
}