const {
    saveGrn,
    grnDetails
} = require("../../services/inventory/grnService");


const saveDraftGrn = async (req, res) =>{
    console.log("RequestBody "+req);
    
    const result = await saveGrn(req);
    console.log("result "+result);
    return res.status(200).send({
        success: 200,
        data: result,
        message: "Successfully created"
    });
    
}

const editGrn = (req, res) =>{

}

const updateGrnStatus = (req, res) =>{

}

const getGrnDetails = async (req, res) =>{
    const fetchGrnDetails = await grnDetails(req);
    return res.status(200).send({
        success: 200,
        message: "Hello world!",
        data: fetchGrnDetails
    });

}

const getVendorSpecificGrn = (req, res) => {

}

const getGrnList = (req, res) =>{

}


module.exports = {
    saveDraftGrn,
    editGrn,
    updateGrnStatus,
    getGrnDetails,
    getVendorSpecificGrn,
    getGrnList
}