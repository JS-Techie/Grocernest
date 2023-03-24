const db = require("../../../models");
const { sequelize } = require("../../../models");

const GrnDetailsModel = db.GrnDetailsModel;
const GrnModel = db.GrnModel;

const grnDraftSaveController = async (req, res) => {

  // console.log("========= API Call Detection FLAG ==========")
  const {
    grnId,
    grnLocationId,
    supplierId,
    invoiceNo,
    invoiceAmount,
    supplierDisc,
    grnStatus,
    grnDate,
    itemDetails,
  } = req.body;
  console.log("heeeeeeeeeeey", grnId)
  let grnDedicatedNullCheckFlag = 0;
  let itemDetailsDedicatedNullCheckFlag = 0;

  if (
    !grnLocationId ||
    !supplierId ||
    !invoiceNo ||
    !invoiceAmount ||
    !grnDate ||
    !itemDetails
  ) {
    grnDedicatedNullCheckFlag = 1;
  }

  for (let i in itemDetails) {
    eachItemDetailList = itemDetails[i]
    if (
      !eachItemDetailList.batchNo ||
      !eachItemDetailList.batchName ||
      !eachItemDetailList.itemId ||
      !eachItemDetailList.orderedQuantity ||
      !eachItemDetailList.receivedQuantity ||
      !eachItemDetailList.shelfNo ||
      !eachItemDetailList.mfgDate ||
      !eachItemDetailList.mrp ||
      !eachItemDetailList.basePrice ||
      !eachItemDetailList.costPrice
    ) {
      itemDetailsDedicatedNullCheckFlag = 1;
    }
  };

  if (grnDedicatedNullCheckFlag && itemDetailsDedicatedNullCheckFlag) {
    return res.status(400).json({
      success: false,
      message: "Wrong Input Data",
    });
  }

  try {
    let grnData
    console.log("hello1", grnId)
    if (grnId === "") {
      grnData = await GrnModel.create({
        grn_location_id: grnLocationId,
        supplier_id: supplierId,
        invoice_no: invoiceNo,
        invoice_amt: invoiceAmount,
        grn_date: grnDate,
        status: grnStatus,
        active_ind: "Y",
        created_by: 1,
        created_at: Date.now(),
        supplier_disc: supplierDisc,
      });
    };

    if (grnId !== "") {
      console.log("hello2", grnId)


      const grnDataUpdate = await GrnModel.update(
        {
          grn_location_id: grnLocationId,
          supplier_id: supplierId,
          invoice_no: invoiceNo,
          invoice_amt: invoiceAmount,
          grn_date: grnDate,
          status: grnStatus,
          active_ind: "Y",
          created_by: 1,
          created_at: Date.now(),
          supplier_disc: supplierDisc,
        },
        {
          where: { id: parseInt(grnId) }
        });

      grnData = await GrnModel.findOne({
        where: { id: parseInt(grnId) }
      })

      // console.log("==========================", grnData)
    };

    const grn_ID = await sequelize.query(
      `select id from t_grn order by id desc limit 1`
    );
    // console.log("************the grn id is************* ", grn_ID[0][0].id);

    let dataItems = [];

    const dataArrayPromises = await itemDetails.map(async (itemDetailsEachList) => {

      const batchNoPresent = await GrnDetailsModel.findOne({
        where: { BATCH_NO: itemDetailsEachList.batchNo }
      })
      let data

      if (!batchNoPresent) {
        // console.log("------------9999999999999999999999------------", grn_ID[0][0].id)
        data = await GrnDetailsModel.create({
          grn_id: grn_ID[0][0].id,
          item_id: itemDetailsEachList.itemId,
          BATCH_NO: itemDetailsEachList.batchNo,
          batch_name: itemDetailsEachList.batchName,
          ordered_quantity: itemDetailsEachList.orderedQuantity,
          received_quantity: itemDetailsEachList.receivedQuantity,
          MRP: itemDetailsEachList.mrp,
          DISCOUNT: itemDetailsEachList.discount,
          COST_PRICE: itemDetailsEachList.costPrice,
          SALE_PRICE: itemDetailsEachList.salePrice,
          shelf_no: itemDetailsEachList.shelfNo,
          active_ind: "Y",
          created_by: 1,
          created_at: Date.now(),
          mfg_date: itemDetailsEachList.mfgDate,
          cgst: itemDetailsEachList.cgst,
          sgst: itemDetailsEachList.sgst,
          igst: itemDetailsEachList.igst,
          other_tax: itemDetailsEachList.otherTax,
          base_price: itemDetailsEachList.basePrice,
          supplier_disc: supplierDisc,
          expiry_date: itemDetailsEachList.expiryDate,
          cashBack_is_percentage: itemDetailsEachList.isCashBackInPercentage,
          cashback: itemDetailsEachList.cashBack,
          ecomm_quantity: 0,
        });

        // console.log("++++++++++++++++++++++++", data)

      }

      if (batchNoPresent) {
        console.log("((((((((((((((((((((((((((((()))))))))))))))))))))))))))))", itemDetailsEachList)
        const dataUpdate = await GrnDetailsModel.update({
          item_id: itemDetailsEachList.itemId,
          batch_name: itemDetailsEachList.batchName,
          ordered_quantity: itemDetailsEachList.orderedQuantity,
          received_quantity: itemDetailsEachList.receivedQuantity,
          MRP: itemDetailsEachList.mrp,
          DISCOUNT: itemDetailsEachList.discount,
          COST_PRICE: itemDetailsEachList.costPrice,
          SALE_PRICE: itemDetailsEachList.salePrice,
          shelf_no: itemDetailsEachList.shelfNo,
          active_ind: "Y",
          created_by: 1,
          created_at: Date.now(),
          mfg_date: itemDetailsEachList.mfgDate,
          cgst: itemDetailsEachList.cgst,
          sgst: itemDetailsEachList.sgst,
          igst: itemDetailsEachList.igst,
          other_tax: itemDetailsEachList.otherTax,
          base_price: itemDetailsEachList.basePrice,
          supplier_disc: supplierDisc,
          expiry_date: itemDetailsEachList.expiryDate,
          cashBack_is_percentage: itemDetailsEachList.isCashBackInPercentage,
          cashback: itemDetailsEachList.cashBack,
          ecomm_quantity: 0,
        },
          {
            where: { BATCH_NO: itemDetailsEachList.batchNo }
          });

        data = await GrnDetailsModel.findOne({
          where: { BATCH_NO: itemDetailsEachList.batchNo }
        })

        console.log("--------------------------------------======", data)

      }


      return data;
    });

    dataItems = await Promise.all(dataArrayPromises);


    // console.log("the whole data item array that is created in the table ::::",dataItems)



    let grnID
    if (grn_ID[0][0].id) {
      grnID = grn_ID[0][0].id
    }
    else {
      grnID = grnId
    }

    const grnDetailsID = await GrnDetailsModel.findAll({
      attributes: ["id"],
      where: { grn_id: grnID }
    })
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%", dataItems)
    const ItemDetailResponsePromise = await dataItems.map(async (obj, ind) => {

      console.log("###########################################", obj)


      const formattedData = {
        "createdBy": obj.created_by,
        "createdAt": obj.created_at,
        "updatedBy": obj.updated_by,
        "updatedAt": obj.updated_at,
        "isActive": obj.active_ind,
        "id": grnDetailsID[ind].id,
        "grnId": obj.grn_id,
        "itemId": obj.item_id,
        "batchNo": obj.BATCH_NO,
        "batchName": obj.batch_name,
        "orderedQuantity": parseInt(obj.ordered_quantity),
        "receivedQuantity": parseInt(obj.received_quantity),
        "ecommQuantity": obj.ecomm_quantity,
        "shelfNo": obj.shelf_no,
        "costPrice": parseFloat(obj.COST_PRICE),
        "salePrice": parseFloat(obj.SALE_PRICE),
        "discount": parseFloat(obj.DISCOUNT),
        "cgst": parseFloat(obj.cgst),
        "sgst": parseFloat(obj.sgst),
        "igst": parseFloat(obj.igst),
        "otherTax": parseFloat(obj.other_tax),
        "mfgDate": obj.mfg_date,
        "expiryDate": obj.expiry_date,
        "basePrice": parseFloat(obj.base_price),
        "supplierDisc": parseFloat(obj.supplier_disc),
        "cashBack": parseFloat(obj.cashback),
        "isCashBackInPercentage": obj.cashBack_is_percentage,
        "mrp": parseFloat(obj.MRP)
      }
      console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&", formattedData)
      return formattedData
    })

    const ItemDetailResponse = await Promise.all(ItemDetailResponsePromise)

    console.log("------------------------(((((((((()))))--------------------", ItemDetailResponse)
    const response = {
      "createdBy": grnData.created_by,
      "createdAt": grnData.created_at,
      "updatedBy": grnData.updated_by,
      "updatedAt": grnData.updated_at,
      "isActive": grnData.active_ind,
      "id": grn_ID[0][0].id,
      "grn_id": grn_ID[0][0].id,
      "grnLocationId": parseInt(grnData.grn_location_id),
      "supplierId": grnData.supplier_id,
      "invoiceNo": grnData.invoice_no,
      "invoiceAmount": grnData.invoice_amt,
      "grnDate": grnData.grn_date,
      "grnStatus": grnData.status,
      "supplierDisc": parseInt(grnData.supplier_disc),
      "itemDetails": ItemDetailResponse
    }




    res.status(200).json({
      message: "Successfully saved Grn data",
      status: 200,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Exception Met",
      data: error.message,
    });
  }
};

module.exports = grnDraftSaveController;
