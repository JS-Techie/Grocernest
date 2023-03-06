const db = require("../../../models")

const GrnDetailsModel = db.GrnDetailsModel
const GrnModel = db.GrnModel

const grnDraftSaveController = async (req, res) => {
    console.log("hello hello")
    const {
        grnId,
        grnLocationId,
        supplierId,
        invoiceNo,
        invoiceAmount,
        supplierDisc,
        grnStatus,
        grnDate,
        itemDetails
    } = req.body

    var grnDedicatedNullCheckFlag = 0
    var itemDetailsDedicatedNullCheckFlag = 0

    if (
        !grnId ||
        !grnLocationId ||
        !supplierId ||
        !invoiceNo ||
        !invoiceAmount ||
        !grnDate
    ) {
        grnDedicatedNullCheckFlag = 1
    }
    itemDetails.forEach((ele) => {
        if (
            !ele.batchNo ||
            !ele.batchName ||
            !ele.itemId ||
            !ele.orderedQuantity ||
            !ele.receivedQuantity ||
            !ele.shelfNo ||
            !ele.mfgDate ||
            !ele.mrp ||
            !ele.basePrice ||
            !ele.costPrice
        ) {
            itemDetailsDedicatedNullCheckFlag = 1
        }
    })


    if (grnDedicatedNullCheckFlag && itemDetailsDedicatedNullCheckFlag) {
        return res.status(400).json({
            success: false,
            message: "Wrong Input Data"
        })
    }


    try {
        const grnData= await GrnModel.create({
            id: grnId,
            grn_location_id: grnLocationId,            supplier_id: supplierId,
            invoice_no: invoiceNo,
            invoice_amt: invoiceAmount,
            grn_date: grnDate,
            status: grnStatus,
            active_ind: "Y",
            created_by: 1,
            created_at: Date.now(),
            supplier_disc: supplierDisc
        })
        
        itemDetails.forEach(async (ele) => {
            await GrnDetailsModel.create({
                grn_id: grnId,
                item_id: ele.itemId,
                BATCH_NO: ele.batchNo,
                batch_name: ele.batchName,
                ordered_quantity: ele.orderedQuantity,
                received_quantity: ele.receivedQuantity,
                MRP: ele.mrp,
                DISCOUNT: ele.discount,
                COST_PRICE: ele.costPrice,
                SALE_PRICE: ele.salePrice,
                shelf_no: ele.shelfNo,
                active_ind: "Y",
                created_by: 1,
                created_at: Date.now(),
                mfg_date: ele.mfgDate,
                cgst: ele.cgst,
                sgst: ele.sgst,
                igst: ele.igst,
                other_tax: ele.otherTax,
                base_price: ele.basePrice,
                supplier_disc: supplierDisc,
                expiry_date: ele.expiryDate,
                cashBack_is_percentage: ele.isCashBackInPercentage,
                cashback: ele.cashBack,
                ecomm_quantity:0 
            })
        })
        res.status(200).json({
            success: true,
            message: "Successfully saved Grn DETAILS Data",
        })

    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Exception Met",
            data: error.message
        })
    }
}

module.exports = grnDraftSaveController


