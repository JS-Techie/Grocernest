// //tables used: 
// // grn 
// // grn details
// // batch
// // inventory


// const db = require('../../../models')

// const GrnModel = db.GrnModel
// const GrnDetailsModel = db.GrnDetailsModel
// const BatchModel = db.BatchModel
// const InventoryModel = db.InventoryModel


// const grnEditController = async (req, res) => {
//     const {
//         grnId,
//         grnStatus,
//         itemDetails,
//     } = req.body

//     if (
//         !grnId
//     ) {
//         return res.status(400).json({
//             message: "Wrong Grn Id",
//             success: false
//         })

//     }

//     try {
//         if (grnStatus === "DRAFT" || grnStatus === "PREPARED") {
//             const grnDetailsListFromDB = await GrnDetailsModel.findAll({ where: { grn_id: grnId, active_ind: 'Y' }})
//         }
//     }
//     catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "",
//             data: error.message
//         })
//     }

// }

// module.exports = grnEditController

