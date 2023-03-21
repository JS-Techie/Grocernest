
const { Op } = require("sequelize");
const db = require("../../../models");

const Location = db.LkpLocationModel;

const saveLocation = async (req, res, next) => {
    const { user_id } = req;
    const { locationName, address, locationDesc, contactNo, contactEmail, locationType, invoicePrefix, existingLocation, id } = req.body;
    try {
        if (!id) {

            const sameLocation = await Location.findOne({
                where: {
                    [Op.or]: [{loc_name: locationName}]
                }
            })
            if(sameLocation){
                return res.status(200).send({
                    status: 400,
                    message: "Location already exists",
                    data: []
                })
            }
            const newLocation = await Location.create({
                loc_name: locationName,
                address,
                loc_desc: locationDesc,
                contact_no: contactNo,
                contact_email: contactEmail,
                type: locationType,
                created_by: user_id,
                created_at: Date.now(),
                updated_by: user_id,
                updated_at: Date.now(),
                active_ind: "Y",
                invoice_prefix: invoicePrefix
            })
            const currentLocation = await Location.findOne({
                where: {
                    loc_name: locationName,
                    loc_desc: locationDesc,
                    address,
                    contact_no: contactNo,
                    contact_email: contactEmail,
                    type: locationType,
                    created_by: user_id,
                    active_ind: "Y",
                    invoice_prefix: invoicePrefix
                }
            })
            const response = {
                id: currentLocation.id,
                locationName: newLocation.loc_name,
                locationDesc: newLocation.loc_desc,
                address: newLocation.address,
                contactNo: newLocation.contact_no,
                contactEmail: newLocation.contact_email,
                locationType: newLocation.type,
                craetedBy: newLocation.created_by,
                createdAt: newLocation.created_at,
                updatedBy: newLocation.updated_by,
                updatedAt: newLocation.updated_at,
                isActive: newLocation.active_ind,
                invoicePrefix: newLocation.invoice_prefix
            }
            return res.status(200).send({
                status: 200,
                message: "Successfully saved the location",
                data: response
            })
        }

        const currentLocations = await Location.findOne({
            where: { id }
        })
        if (!currentLocations) {
            return res.status(200).send({
                status: 203,
                message: " The requested location doesnt exist",
                data: []
            })
        }
        const sameLocationArray = await Location.findAll({
            attributes: ['id'],
            where: {
                [Op.or]: [{loc_name: locationName}]
            }
        })
        let nameCheckFlag = false
        for (var i=0; i<sameLocationArray.length; i++){
            var location = sameLocationArray[i];
            if(!location.id===id){
                nameCheckFlag = true
            }
        }
        if(nameCheckFlag){
            return res.status(200).send({
                status:400,
                message: "Location name already exists",
                data: []
            })
        }
        const updateLocation = await Location.update({
            loc_name: locationName,
            loc_desc: locationDesc,
            address,
        }, { where: { id } }
        )
        const updatedLocation = await Location.findOne({
            where: { id }
        })

        const response = {
            id: updatedLocation.id,
            locationName: updatedLocation.loc_name,
            address: updatedLocation.address,
            contactNo: updatedLocation.contact_no,
            contactEmail: updatedLocation.contact_email,
            locationType: updatedLocation.type,
            invoicePrefix: updatedLocation.invoice_prefix,
            existingLocation: updatedLocation.active_ind
        }
        return res.status(200).send({
            status: 200,
            message: " The requested location has been updated successfully ",
            data: response
        })
    }
    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Didn't get any data",
            data: error.message
        })
    }
}

const getAllLocation = async (req, res, next) => {
    console.log("coming")
    try {
        const allLocation = await Location.findAll({})

        if (allLocation.length === 0) {
            return res.status(200).send({
                status: 200,
                message: "Requested Location doesnt exist",
                data: []
            })
        }
        const promises = allLocation.map((current) => {
            return ({
                id: current.id,
                locationName: current.loc_name,
                locationDesc: current.loc_desc,
                address: current.address,
                contactNo: current.contact_no,
                contactEmail: current.contact_email,
                isActive: current.active_ind,
                locationType: current.type,
                invoicePrefix: current.invoice_prefix
            })

        })
        const response = await Promise.all(promises)
        return res.status(200).send({
            status: 200,
            message: "Successfullly fetched all the locations",
            data: response
        })
    }
    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Didn't get any data",
            data: error.message
        })
    }
}

const getActiveLocation = async (req, res, next) => {
    try {
        const activeLocations = await Location.findAll({
            where: { active_ind: "Y" }
        })

        if (activeLocations.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "No active location found",
                data: []
            })
        }
        const promises = activeLocations.map((current) => {
            return ({

                "id": current.id,
                "locationName": current.loc_name,
                "locationDesc": current.loc_desc,
                "address": current.address,
                "contactNo": current.contact_no,
                "contactEmail": current.contact_email,
                "isActive": current.active_ind,
                "locationType": current.type,
                "invoicePrefix": current.invoice_prefix

            })
        })

        const resolved = await Promise.all(promises);

        return res.status(200).send({
            status: 200,
            message: "Found all active locations",
            data: resolved
        })
    }
    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Didn't get any data",
            data: error.message
        })
    }
}

const getDeactiveLocation = async (req, res, next) => {
    try {

        const activeLocations = await Location.findAll({
            where: { active_ind: "N" }
        })

        if (activeLocations.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "No deactive location found",
                data: []
            })
        }
        const promises = activeLocations.map((current) => {
            return ({

                "id": current.id,
                "locationName": current.loc_name,
                "locationDesc": current.loc_desc,
                "address": current.address,
                "contactNo": current.contact_no,
                "contactEmail": current.contact_email,
                "isActive": current.active_ind,
                "locationType": current.type,
                "invoicePrefix": current.invoice_prefix

            })
        })

        const resolved = await Promise.all(promises);

        return res.status(200).send({
            status: 200,
            message: "Found all deactive locations",
            data: resolved
        })

    }
    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Didn't get any data",
            data: error.message
        })
    }
}

const activeLocation = async (req, res, next) => {
    const locationIdList = req.body;
    try {
        if(locationIdList.length === 0){
            return res.status(200).send({
                status: 400,
                message: "Location ID list not found",
                data : []
            })
        }
        const promises = locationIdList.map(async(current) => {
            const currentLocation = await Location.findOne({where : {id: current}})
            if (current){
const updateLocation = await Location.update({
    active_ind: "Y"},{
        where : {
            id: current
        }
})
const updatedLocation = await Location.findOne({
    where : {id: current}
})
 return ({
    "id": updatedLocation.id,
                    "locationName": updatedLocation.loc_name,
                    "locationDesc": updatedLocation.loc_desc,
                    "address": updatedLocation.address,
                    "contactNo": updatedLocation.contact_no,
                    "contactEmail": updatedLocation.contact_email,
                    "isActive": "Y",
                    "locationType": updatedLocation.type,
                    "invoicePrefix": updatedLocation.invoice_prefix
 })
            }
         } )
         const resolved = await Promise.all(promises)
         return res.status(200).send({
            status: 200,
            message: "Successfully activated the location",
            data : resolved
         })
        }
     catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong , please try again later",
            data : error.message
        })
    }
}

const deactiveLocation = async (req, res, next) => {
    const locationIdList = req.body;
    try {
        if(locationIdList.length === 0){
            return res.status(200).send({
                status: 400,
                message: "Location ID list not found",
                data : []
            })
        }
        const promises = locationIdList.map(async(current) => {
            const currentLocation = await Location.findOne({where : {id: current}})
            if (current){
const updateLocation = await Location.update({
    active_ind: "N"},{
        where : {
            id: current
        }
})
const updatedLocation = await Location.findOne({
    where : {id: current}
})
 return ({
    "id": updatedLocation.id,
                    "locationName": updatedLocation.loc_name,
                    "locationDesc": updatedLocation.loc_desc,
                    "address": updatedLocation.address,
                    "contactNo": updatedLocation.contact_no,
                    "contactEmail": updatedLocation.contact_email,
                    "isActive": "N",
                    "locationType": updatedLocation.type,
                    "invoicePrefix": updatedLocation.invoice_prefix
 })
            }
         } )
         const resolved = await Promise.all(promises)
         return res.status(200).send({
            status: 200,
            message: "Successfully deactivated the location",
            data : resolved
         })
        }
     catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong , please try again later",
            data : error.message
        })
    }
}

module.exports = {
    saveLocation,
    getAllLocation,
    activeLocation,
    deactiveLocation,
    getActiveLocation,
    getDeactiveLocation,
}
