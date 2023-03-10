// const { sequelize } = require("../../../models");
// const db = require("../../../models");
// const StockTransfer = db.StockTransferModel;
// const StockTransferDetails = db.StockTransferDetailsModel;
// const Inventory = db.InventoryModel;
// const Batch = db.BatchModel;

// const { createBalance } = require("../../../services/inventory/stockMovement");

// const searchStockReq = async (req, res, next) => {
//   const { RAISE_STOCK_REQUEST, STOCK_TRANSFER_DESPATCHED } = req.body;
//   try {
//     const [getStockRequest, metadata] =
//       await sequelize.query(`select t_stock_transfer.accept_remarks , t_stock_transfer.delivery_partner , t_stock_transfer.despatched_at ,t_stock_transfer.despatch_remarks ,t_stock_transfer.received_at ,t_stock_transfer.request_despatched_by ,t_lkp_location.loc_name ,t_stock_transfer.from_loc_id,  t_stock_transfer.request_no , t_stock_transfer.request_raised_by ,t_stock_transfer.request_received_by , t_stock_transfer.request_remarks ,t_stock_transfer.to_loc_id ,t_stock_transfer.request_type ,t_stock_transfer.requested_at ,t_stock_transfer.status ,t_stock_transfer.id 
//     from ((t_stock_transfer
//     inner join t_lkp_location on t_lkp_location.id = t_stock_transfer.to_loc_id )
//     inner join t_stock_transfer_details on t_stock_transfer_details.stock_transfer_id =t_stock_transfer.id )
//     where t_stock_transfer.request_raised_by = "${RAISE_STOCK_REQUEST}" and t_stock_transfer.request_despatched_by ="${STOCK_TRANSFER_DESPATCHED}"`);
//     if (getStockRequest.length === 0) {
//       return res.status(200).send({
//         status: 400,
//         message: "Requested stock request not found",
//         data: [],
//       });
//     }
//     const [getStockTransferDetails, metadata2] =
//       await sequelize.query(`select t_stock_transfer_details.item_id 
//     from (t_stock_transfer_details
//     inner join t_item on t_item.id =t_stock_transfer_details.item_id )`);
//     const [getItemDetails, metadata1] =
//       await sequelize.query(`SELECT  t_stock_transfer.accept_remarks ,t_stock_transfer_details.batch_id ,t_batch.batch_no ,t_lkp_brand.brand_name ,t_lkp_category.group_name ,t_batch.cost_price ,t_stock_transfer_details.defective_qnty,t_lkp_department.dept_name ,t_stock_transfer.despatch_remarks ,t_stock_transfer_details.despatched_qnty ,t_batch.discount ,t_lkp_division.div_name ,t_item.item_cd ,t_lkp_color.color_name ,t_batch.item_id ,t_item.name ,t_lkp_size.size_cd ,t_stock_transfer_details.lost_qnty ,t_batch.MRP ,t_stock_transfer_details.received_qnty ,t_stock_transfer.request_remarks ,t_stock_transfer_details.REQUESTED_QNTY ,t_batch.sale_price ,t_stock_transfer.id,t_lkp_sub_category.sub_cat_name ,t_item.UOM 
//       from ((((((((((t_stock_transfer_details 
//       inner join t_stock_transfer on t_stock_transfer.id = t_stock_transfer_details.stock_transfer_id )
//       inner join t_batch on t_stock_transfer_details.batch_id = t_batch.id )
//       inner join t_item on t_item.id = t_stock_transfer_details.item_id )
//       inner join t_lkp_color on t_lkp_color.id = t_item.color_id )
//       inner join t_lkp_category on t_lkp_category.id = t_item.category_id )
//       inner join t_lkp_sub_category on t_lkp_sub_category.id  = t_item.sub_category_id )
//       inner join t_lkp_size on t_lkp_size.id  = t_item.size_id )
//       inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id )
//       inner join t_lkp_division on t_lkp_division.id  = t_item.div_id )
//       inner join t_lkp_department on t_lkp_department.id = t_item.department_id )
//       `);

//     const itemPromises = getItemDetails.map((currentItem) => {
//       return {
//         batchId: currentItem.batch_id,
//         batchNo: currentItem.batch_no,
//         brandName: currentItem.brand_name,
//         categoryName: currentItem.group_name,
//         costPrice: currentItem.cost_price,
//         defectiveQuantity: currentItem.defective_qnty,
//         departmentname: currentItem.dept_name,
//         despatchRemarks: currentItem.despatch_remarks,
//         despatchedQuantity: currentItem.despatched_qnty,
//         discount: currentItem.discount,
//         divisionName: currentItem.div_name,
//         itemCode: currentItem.item_cd,
//         itemColour: currentItem.color_name,
//         itemId: currentItem.id,
//         itemName: currentItem.name,
//         itemSize: currentItem.size_cd,
//         lostQuantity: currentItem.lost_qnty,
//         mrp: currentItem.MRP,
//         receivedQuantity: currentItem.received_qnty,
//         requestRemarks: currentItem.request_remarks,
//         requestedQuantity: currentItem.REQUESTED_QNTY,
//         salePrice: currentItem.sale_price,
//         stockTransferDetailsId: currentItem.id,
//         subCategoryname: currentItem.sub_cat_name,
//         uom: currentItem.UOM,
//       };
//     });
//     const itemResolved = await Promise.all(itemPromises);

//     const promises = getStockRequest.map((current) => {
//       return {
//         acceptRemarks: current.accept_remarks,
//         deliveryPartner: current.delivery_partner,
//         despatchRemarks: current.despatch_remarks,
//         despatchedAt: current.despatched_at,
//         itemDetails: itemResolved,
//         receivedAt: current.received_at,
//         requestDespatchedBy: current.request_despatched_by,
//         requestFromStore: current.loc_name,
//         requestFromStoreId: current.from_loc_id,
//         requestNo: current.request_no,
//         requestRaisedBy: current.request_raised_by,
//         requestReceivedBy: current.request_received_by,
//         requestRemarks: current.request_remarks,
//         requestToStoreId: current.to_loc_id,
//         requestToStore: current.loc_name,
//         requestType: current.request_type,
//         requestedAt: current.requested_at,
//         status: current.status,
//         stockTransferId: current.id,
//       };
//     });
//     const resolved = await Promise.all(promises);
//     return res.status(200).send({
//       status: 200,
//       message: "Successfully fetched the stock request",
//       data: resolved,
//     });
//   } catch (error) {
//     return res.status(200).send({
//       status: 500,
//       message: "Something went wrong , please try again later ",
//       data: error.message,
//     });
//   }
// };
// const raiseStockRequest = async (req, res, next) => {
//   const {
//     requestType,
//     despatchRemarks,
//     deliveryPartner,
//     itemDetails,
//     fromLocationId,
//     toLocationId,
//     batchId,
//     itemId,
//     despatchedQuantity,
//   } = req.body;
//   const { user_id } = req;
//   try {
//     if (requestType == "STOCK_REQUEST_ACTION_REQUESTED") {
//       let stockTransferType = [];
//       let stockTransferMap = new Map();
//       stockTransferMap["key"] = { StockTransfer };
//       if (itemDetails.length === 0) {
//         return res.status(200).send({
//           status: 400,
//           message: "Item details not found",
//           data: [],
//         });
//       }
//       const itemDetailsList = itemDetails.map((current) => {
//         return {
//           fromLocationId: current.from_loc_id,
//           toLocationId: current.to_loc_id,
//           batchId: current.batch_id,
//           despatchedQuantity: current.despatched_qnty,
//         };
//       });
//       const itemDetails = await StockTransferDetails.findOne({
//         where: {
//           item_id: itemId,
//           active_ind: "Y",
//           created_at: Date.now(),
//           created_by: user_id,
//         },
//       });
//       let StockTransferObj = {};

//       StockTransferObj["toLocationId"] = "to_loc_id";
//       StockTransferObj["fromLocationId"] = "from_loc_id";

//       if (toLocationId in StockTransferObj) {
//         const StockTransferObj = await StockTransfer.findOne({
//           where: { to_loc_id: toLocationId, from_loc_id: fromLocationId },
//         });
//       }
//       const newStockTransferObj = await StockTransfer.create({
//         request_type: requestType,
//         despatch_remarks: despatchRemarks,
//         delivery_partner: deliveryPartner,
//         from_loc_id: fromLocationId,
//         to_loc_id: toLocationId,
//         status: "STOCK_REQUESTED",
//         batch_id: batchId,
//         despatched_qnty: despatchRemarks,
//       });
//       StockTransferObj["key"] = { newStockTransferObj, stockTransferMap };
//       const stockTranferDetails = StockTransferObj.id;
//       const promises = StockTransferObj.map((current) => {
//         return {
//           requestNo:
//             CosmetixConstant.STOCK_REQUEST_NUMBER_PREFIX + stockTranferDetails,
//         };
//       });
//       const resolved = await Promise.all(promises);
//       return res.status(200).send({
//         status: 200,
//         message: "Successfully transfered the stock",
//         data: resolved,
//       });
//     }
//     if (requestType == "STOCK_TRANSFER_ACTION_DESPATCHED") {
//       let stockTransferType = [];

//       let stockTransferMap = new Map();
//       stockTransferMap["key"] = { StockTransfer };
//       if (itemDetails.length === 0) {
//         return res.status(200).send({
//           status: 400,
//           message: "Item details not found",
//           data: [],
//         });
//       }
//       const itemDetailsList = itemDetails.map((current) => {
//         return {
//           fromLocationId: current.from_loc_id,
//           toLocationId: current.to_loc_id,
//           batchId: current.batch_id,
//           despatchedQuantity: current.despatched_qnty,
//         };
//       });
//       const newStockTransferDetails = new StockTransferDetails();
//       newStockTransferDetails.itemDetails = itemDetails;
//       newStockTransferDetails.requestedQuantity = requestedDespatched;

//       let StockTransferObj = {};

//       StockTransferObj["toLocationId"] = "to_loc_id";
//       StockTransferObj["fromLocationId"] = "from_loc_id";
//       if (toLocationId in StockTransferObj) {
//         const StockTransferObj = await StockTransferDetails.findOne({
//           where: {
//             to_loc_id: toLocationId,
//             from_loc_id: fromLocationId,
//           },
//         });
//       }
//       const newStockTransferObj = await StockTransfer.create({
//         request_type: requestType,
//         despatch_remarks: despatchRemarks,
//         delivery_partner: deliveryPartner,
//         from_loc_id: fromLocationId,
//         to_loc_id: toLocationId,
//         status: "STOCK_DESPATCHED",
//         batch_id: batchId,
//         despatched_qnty: despatchRemarks,
//       });
//       StockTransferObj[key] = { newStockTransferObj, stockTransferMap };

//       const stockTransferDetails = StockTransferObj.id;
//       const promises = StockTransferObj.map((current) => {
//         return {
//           requestNo:
//             CosmetixConstant.STOCK_REQUEST_NUMBER_PREFIX + stockTransferDetails,
//         };
//       });
//       const resolved = await Promise.all(promises);

//       // const stockTransfetDetails = await StockTransferDetails.findOne({where: {despatched_qnty:despatchedQuantity}})

//       const batchDetails = await Batch.findOne({
//         where: {
//           id: batchId,
//           item_id: itemId,
//           active_ind: "Y",
//           location_id: fromLocationId,
//         },
//       });
//       if (!batchDetails) {
//         return res.status(200).send({
//           status: 400,
//           message: "Batch details not found",
//           data: [],
//         });
//       }

//       const inventoryDetails = await Inventory.findOne({
//         where: { batch_id: batchId, item_id: itemId, balance_type: "4" },
//       });
//       if (!inventoryDetails) {
//         return res.status(200).send({
//           status: 400,
//           message: "Inventory details not found",
//           data: [],
//         });
//       }

//       if (inventoryDetails.quantity < despatchedQuantity) {
//         return res.status(200).send({
//           status: 400,
//           message: "Low stock for this item",
//           data: [],
//         });
//       } else {
//         const inventoryUpdate = inventoryDetails.quantity - despatchedQuantity;
//         if (inventoryUpdate == 0) {
//           const updatedInventory = await Inventory.update(
//             {
//               active_ind: "N",
//             },
//             { where: { item_id: itemId } }
//           );
//         }
//       }
//       const dispatchedItem = await createBalance(
//         itemId,
//         batchId,
//         locationId,
//         balanceType,
//         addQuantity,
//         caskBack,
//         cashBackIsPercentage
//       );

//       return res.status(200).send({
//         status: 200,
//         message: "Successfully transferred the stock",
//         data: resolved,
//       });
//     }
//   } catch (error) {
//     return res.status(200).send({
//       status: 500,
//       message: "Something went wrong , please try again later",
//       data: error.message,
//     });
//   }
// };
// // async function raiseStockTransferRequest(appInfo, stockTransferRequestBean) {
// //   const stockTransfers = [];
// //   const stockTransferMap = new Map();

// //   if (stockTransferRequestBean.itemDetails && stockTransferRequestBean.itemDetails.length > 0) {
// //     for (const item of stockTransferRequestBean.itemDetails) {
// //       const stockTransferDetails = new StockTransferDetails(item);
// //       stockTransferDetails.isActive = true;
// //       stockTransferDetails.createdAt = new Date();
// //       stockTransferDetails.createdBy = appInfo.userId;

// //       let stockTransfer = stockTransferMap.get(`${item.fromLocationId}-${item.toLocationId}`);
// //       if (!stockTransfer) {
// //         stockTransfer = new StockTransfer(stockTransferRequestBean);
// //         stockTransfer.isActive = true;
// //         stockTransfer.createdAt = new Date();
// //         stockTransfer.createdBy = appInfo.userId;
// //         stockTransfer.fromLocationId = item.fromLocationId;
// //         stockTransfer.toLocationId = item.toLocationId;
// //         stockTransfer.requestRaisedBy = appInfo.userId;
// //         stockTransfer.requestedAt = new Date();
// //         stockTransfer.status = 'PENDING';

// //         await repository.saveStockTransfer(stockTransfer);
// //         stockTransfers.push(stockTransfer);
// //         stockTransferMap.set(`${item.fromLocationId}-${item.toLocationId}`, stockTransfer);
// //       }

// //       stockTransferDetails.stockTransferId = stockTransfer.id;
// //       stockTransfer.itemList.push(stockTransferDetails);

// //       await repository.saveStockTransferDetails(stockTransferDetails);
// //     }

// //     for (const stockTransfer of stockTransferMap.values()) {
// //       stockTransfer.requestNo = `PREFIX-${stockTransfer.id}`;
// //       await repository.saveStockTransfer(stockTransfer);
// //     }
// //   } else {
// //     return stockTransfers;
// //   }

// //   return stockTransfers;
// // }
// const getStockRequestDetails = async (req, res, next) => {
//   const { stockRequestIdList } = req.body;
//   try {
//     if (stockRequestIdList.length === 0) {
//       return res.status(200).send({
//         status: 400,
//         message: "Please enter the stock request id list",
//         data: [],
//       });
//     }
//     const [getStockRequest, metadata] =
//       await sequelize.query(`select t_stock_transfer_details.accept_remarks , t_stock_transfer_details.batch_id  , t_batch.batch_no , t_lkp_brand.brand_name , t_lkp_category.group_name ,t_batch.cost_price ,t_stock_transfer_details.defective_qnty , t_lkp_department.dept_name ,t_stock_transfer_details.despatch_remarks ,t_stock_transfer_details.despatched_qnty , t_batch.discount ,t_lkp_division.div_name ,t_item.item_cd ,t_lkp_color.color_name ,t_batch.item_id ,t_item.name ,t_lkp_size.size_cd ,t_stock_transfer_details.lost_qnty , t_batch.MRP ,t_stock_transfer_details.received_qnty ,t_stock_transfer_details.request_remarks ,t_stock_transfer_details.REQUESTED_QNTY ,t_batch.sale_price , t_stock_transfer_details.id,t_lkp_sub_category.sub_cat_name , t_item.UOM
//     from(((((((((t_item
//     inner join t_stock_transfer_details on t_stock_transfer_details.item_id = t_item.id)
//     inner join t_batch on t_batch.item_id = t_item.id)
//     left join t_lkp_sub_category on t_lkp_sub_category.id =t_item.sub_category_id )
//             left join t_lkp_size on t_lkp_size.id = t_item.size_id )
//             left join t_lkp_department on t_lkp_department.id  = t_item.department_id )
//             left join t_lkp_division on t_lkp_division.id = t_item.div_id )
//             left join t_lkp_color on t_lkp_color.id = t_item.color_id )
//             left join t_lkp_category on t_lkp_category.id= t_item.brand_id )
//             left join t_lkp_brand on t_lkp_brand.id = t_item.brand_id )
//             where t_stock_transfer_details.stock_transfer_id = '${stockRequestIdList}' and t_stock_transfer_details.active_ind = "Y"`);

//     if (getStockRequest.length === 0) {
//       return res.status(200).send({
//         status: 400,
//         message: "Requested stock doesnot exist",
//         data: [],
//       });
//     }
//     const promises = getStockRequest.map((currentItem) => {
//       return {
//         acceptRemarks: currentItem.accept_remarks,
//         batchId: currentItem.batch_id,
//         batchNo: currentItem.batch_no,
//         brandName: currentItem.brand_name,
//         categoryName: currentItem.group_name,
//         costPrice: currentItem.cost_price,
//         defectiveQuantity: currentItem.defective_qnty,
//         departmentname: currentItem.dept_name,
//         despatchRemarks: currentItem.despatch_remarks,
//         despatchedQuantity: currentItem.despatched_qnty,
//         discount: currentItem.discount,
//         divisionName: currentItem.div_name,
//         itemCode: currentItem.item_cd,
//         itemColour: currentItem.color_name,
//         itemId: currentItem.id,
//         itemName: currentItem.name,
//         itemSize: currentItem.size_cd,
//         lostQuantity: currentItem.lost_qnty,
//         mrp: currentItem.MRP,
//         receivedQuantity: currentItem.received_qnty,
//         requestRemarks: currentItem.request_remarks,
//         requestedQuantity: currentItem.REQUESTED_QNTY,
//         salePrice: currentItem.sale_price,
//         stockTransferDetailsId: currentItem.id,
//         subCategoryname: currentItem.sub_cat_name,
//         uom: currentItem.UOM,
//       };
//     });
//     const resolved = await Promise.all(promises);
//     return res.status(200).send({
//       status: 200,
//       message: "Successfully fetched the stock request details",
//       data: resolved,
//     });
//   } catch (error) {
//     return res.status(200).send({
//       status: 500,
//       message: "Something went wrong , please try again later ",
//       data: error.message,
//     });
//   }
// };
// const updateStockRequest = async (req, res, next) => {
//   const {
//     requestType,
//     stockTransferId,
//     acceptRemarks,
//     stockTransferDetailsId,
//     batchId,
//     itemId,
//     lostQuantity,
//     defectiveQuantity,
//     receivedQuantity,
//   } = req.body;
//   try {
//     const [currentStockReq, metadata] = await sequelize.query(`select 
//       t_stock_transfer_details.stock_transfer_id, 
//       t_stock_transfer_details.id, 
//       t_stock_transfer.created_by, 
//       t_stock_transfer.created_at, 
//       t_stock_transfer.updated_by, 
//       t_stock_transfer.updated_at, 
//       t_stock_transfer.active_ind, 
//       t_stock_transfer.id, 
//       t_stock_transfer.request_type, 
//       t_stock_transfer.request_no, 
//       t_stock_transfer.status, 
//       t_stock_transfer.from_loc_id, 
//       t_stock_transfer.to_loc_id, 
//       t_stock_transfer.delivery_partner, 
//       t_stock_transfer.request_raised_by, 
//       t_stock_transfer.request_despatched_by, 
//       t_stock_transfer.request_received_by, 
//       t_stock_transfer.requested_at, 
//       t_stock_transfer.despatched_at, 
//       t_stock_transfer.received_at, 
//       t_stock_transfer.request_remarks, 
//       t_stock_transfer.despatch_remarks, 
//       t_stock_transfer.accept_remarks ,
//       t_inventory.quantity
//     from 
//     ((
//       t_inventory
//       inner join t_stock_transfer_details on t_inventory.batch_id = t_stock_transfer_details.batch_id )
//       inner join t_stock_transfer on t_stock_transfer.id = t_stock_transfer_details.stock_transfer_id )
//     where 
//       t_stock_transfer.request_type = ${requestType} 
//       and t_stock_transfer_details.stock_transfer_id = ${stockTransferId} 
//       and t_stock_transfer.accept_remarks = ${acceptRemarks} 
//       and t_stock_transfer_details.id = ${stockTransferDetailsId} 
//       and t_stock_transfer_details.batch_id = ${batchId} 
//       and t_stock_transfer_details.item_id = ${itemId} 
//       and t_stock_transfer_details.lost_qnty = ${lostQuantity} 
//       and t_stock_transfer_details.received_qnty = ${receivedQuantity} 
//       and t_stock_transfer_details.defective_qnty = ${defectiveQuantity}`);

//     const updateInventory = await StockTransferDetails.update(
//       {
//         lost_qnty: lostQuantity,
//         defective_qnty: defectiveQuantity,
//         received_qnty: receivedQuantity,
//       },
//       {
//         where: { id: stockTransferDetailsId },
//       }
//     );
//     const [updatedStockReq, metadata1] = await sequelize.query(`select 
// t_stock_transfer_details.stock_transfer_id, 
// t_stock_transfer_details.id, 
// t_stock_transfer.created_by, 
// t_stock_transfer.created_at, 
// t_stock_transfer.updated_by, 
// t_stock_transfer.updated_at, 
// t_stock_transfer.active_ind, 
// t_stock_transfer.id, 
// t_stock_transfer.request_type, 
// t_stock_transfer.request_no, 
// t_stock_transfer.status, 
// t_stock_transfer.from_loc_id, 
// t_stock_transfer.to_loc_id, 
// t_stock_transfer.delivery_partner, 
// t_stock_transfer.request_raised_by, 
// t_stock_transfer.request_despatched_by, 
// t_stock_transfer.request_received_by, 
// t_stock_transfer.requested_at, 
// t_stock_transfer.despatched_at, 
// t_stock_transfer.received_at, 
// t_stock_transfer.request_remarks, 
// t_stock_transfer.despatch_remarks, 
// t_stock_transfer.accept_remarks ,
// t_inventory.quantity
// from 
// ((
// t_inventory
// inner join t_stock_transfer_details on t_inventory.batch_id = t_stock_transfer_details.batch_id )
// inner join t_stock_transfer on t_stock_transfer.id = t_stock_transfer_details.stock_transfer_id )
// where 
// t_stock_transfer.request_type = ${requestType} 
// and t_stock_transfer_details.stock_transfer_id = ${stockTransferId} 
// and t_stock_transfer.accept_remarks = ${acceptRemarks} 
// and t_stock_transfer_details.id = ${stockTransferDetailsId} 
// and t_stock_transfer_details.batch_id = ${batchId} 
// and t_stock_transfer_details.item_id = ${itemId} 
// and t_stock_transfer_details.lost_qnty = ${lostQuantity} 
// and t_stock_transfer_details.received_qnty = ${receivedQuantity} 
// and t_stock_transfer_details.defective_qnty = ${defectiveQuantity} `);

//     const promises = updatedStockReq.map((current) => {
//       return {
//         createdBy: updatedStockReq.created_by,
//         createdAt: updatedStockReq.created_at,
//         updatedBy: updatedStockReq.updated_by,
//         updatedAt: updatedStockReq.updated_at,
//         isActive: updatedStockReq.active_ind,
//         id: updatedStockReq.stock_transfer_id,
//         requestType: updatedStockReq.request_type,
//         requestNo: updatedStockReq.request_no,
//         status: updatedStockReq.status,
//         fromLocationId: updatedStockReq.from_loc_id,
//         toLocationId: updatedStockReq.to_loc_id,
//         deliveryPartner: updatedStockReq.delivery_partner,
//         requestRaisedBy: updatedStockReq.request_raised_by,
//         requestDespatchedBy: updatedStockReq.request_despatched_by,
//         requestReceivedBy: updatedStockReq.request_despatched_by,
//         requestedAt: updatedStockReq.requested_at,
//         despatchedAt: updatedStockReq.despatched_at,
//         receivedAt: updatedStockReq.received_at,
//         requestRemarks: updatedStockReq.request_remarks,
//         despatchRemarks: updatedStockReq.despatch_remarks,
//         acceptRemarks: updatedStockReq.accept_remarks,
//         // "itemList":
//       };
//     });
//     const response = await Promise.all();
//     return res.status(200).send({
//       status: 200,
//       message: "Success",
//       data: response,
//     });
//   } catch (error) {
//     return res.status(200).send({
//       status: 500,
//       message: "Something went wrong, please try agin later",
//       data: error.message,
//     });
//   }
// };
// // const updateStock = async(req,res,next) => {
// // const {requestType,stockTransferId, acceptRemarks,stockTransferDetailsId,batchId,itemId,lostQuantity,defectiveQuantity,receivedQuantity} = req.body;
// // const {user_id} = req;
// // try {
// //   if(requestType &&stockTransferId && acceptRemarks && stockTransferDetailsId && batchId && itemId && lostQuantity && defectiveQuantity && receivedQuantity){
// //     const returnData = []
// //     if(requestType =="STOCK_REQUEST_REJECTED"){
// //       const stockTransferObj = await StockTransfer.findAll({where: {id: stockTransferId}})
// //       if(!stockTransferObj){
// //         return res.status(200).send({
// //           status: 400,
// //           message: "Stock transfer obj not found",
// //           data : []
// //         })
// //       }
// //       const stockTransferDetails = await StockTransferDetails.findAll({stock_transfer_id:stockTransferId, active_ind: "Y"})
// //       if(requestType == "STOCK_REQUEST_REJECTED"){
// //         const objectPromises = stockTransferObj.map((current) => {
// //           return ({
// //             requestType: current.request_type,
// //             stockTransferId: current.id,
// //             requestNo: current.request_no,
// //             status: current.status,
// //             fromLocation: current.from_loc_id,
// //             toLocation: current.to_loc_id,
// //             deliveryPartner : current.delivery_partner,
// //             requestRaisedBy: current.request_raised_by,
// //             requestDespatchedBy: current.request_despatched_by,
// //             requestReceivedBy: current.request_received_by,
// //             requestedAt: current.requested_at,
// //             despatchedAt: current.despatched_at,
// //             receivedAt: current.received_at,
// //             requestRemarks: current.request_remarks,
// //             despatchRemarks: current.despatch_remarks,
// //             acceptRemarks: current.accept_remarks,
// //             isActive: current.active_ind,
// //           })
// //         })
// //         const objectResolved = await Promise.all(objectPromises)
// //         const itemPromises = stockTransferDetails.map((current) => {
// //           return ({
// //             stockTransferDetailsId: current.id,
// //             batchId: current.batch_id,
// //             itemId: current.item_id,
// //             lostQuantity: current.lost_qnty,
// //             defectiveQuantity: current.defective_qnty,
// //             receivedQuantity: current.received_qnty
// //           })
// //         })
// //         const itemResolved = await Promise.all(itemPromises)
// //         const
// //       }
// //     }
// //   }
// // } catch (error) {

// // }
// // }
// const getStockRequestDetailsById = async (req, res, next) => {
//   const { stockTransferId } = req.params;
//   try {
//     if (!stockTransferId) {
//       return res.status(200).send({
//         status: 400,
//         message: "Please enter the proper id",
//         data: [],
//       });
//     }
//     const [getStockRequest, metadata] = await sequelize.query(`select 
//       t_stock_transfer_details.accept_remarks, 
//         t_stock_transfer.delivery_partner,
//        t_stock_transfer_details.despatch_remarks,
//          t_stock_transfer.despatched_at, 
//         t_stock_transfer.received_at, 
//         t_stock_transfer.request_despatched_by,
//          t_lkp_location.loc_name, 
//           t_stock_transfer.from_loc_id, 
//            t_stock_transfer.request_no, 
//       t_stock_transfer.request_raised_by, 
//       t_stock_transfer.request_received_by, 
//     t_stock_transfer.request_remarks, 
//        t_stock_transfer.to_loc_id, 
//       t_stock_transfer.request_type, 
//       t_stock_transfer.requested_at, 
//       t_stock_transfer.status, 
//         t_stock_transfer_details.stock_transfer_id
//     from 
//       (
//         (
//           (
//                             t_item 
//                             inner join t_stock_transfer_details on t_stock_transfer_details.item_id = t_item.id
//                           ) 
//                           inner join t_stock_transfer on t_stock_transfer.id = t_stock_transfer_details.stock_transfer_id
//                         ) 
//                         inner join t_lkp_location on t_lkp_location.id = t_stock_transfer.to_loc_id
//                                       ) 
    
    
//               where t_stock_transfer_details.stock_transfer_id = "${stockTransferId}"`);

//     if (getStockRequest.length === 0) {
//       return res.status(200).send({
//         status: 400,
//         message: "Requested stock doesnot exist",
//         data: [],
//       });
//     }
//     const [getItemDetails, metadata1] =
//       await sequelize.query(`SELECT  t_stock_transfer.accept_remarks ,t_stock_transfer_details.batch_id ,t_batch.batch_no ,t_lkp_brand.brand_name ,t_lkp_category.group_name ,t_batch.cost_price ,t_stock_transfer_details.defective_qnty,t_lkp_department.dept_name ,t_stock_transfer.despatch_remarks ,t_stock_transfer_details.despatched_qnty ,t_batch.discount ,t_lkp_division.div_name ,t_item.item_cd ,t_lkp_color.color_name ,t_batch.item_id ,t_item.name ,t_lkp_size.size_cd ,t_stock_transfer_details.lost_qnty ,t_batch.MRP ,t_stock_transfer_details.received_qnty ,t_stock_transfer.request_remarks ,t_stock_transfer_details.REQUESTED_QNTY ,t_batch.sale_price ,t_stock_transfer.id,t_lkp_sub_category.sub_cat_name ,t_item.UOM 
//       from ((((((((((t_stock_transfer_details 
//       inner join t_stock_transfer on t_stock_transfer.id = t_stock_transfer_details.stock_transfer_id )
//       inner join t_batch on t_stock_transfer_details.batch_id = t_batch.id )
//       inner join t_item on t_item.id = t_stock_transfer_details.item_id )
//       inner join t_lkp_color on t_lkp_color.id = t_item.color_id )
//       inner join t_lkp_category on t_lkp_category.id = t_item.category_id )
//       inner join t_lkp_sub_category on t_lkp_sub_category.id  = t_item.sub_category_id )
//       inner join t_lkp_size on t_lkp_size.id  = t_item.size_id )
//       inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id )
//       inner join t_lkp_division on t_lkp_division.id  = t_item.div_id )
//       inner join t_lkp_department on t_lkp_department.id = t_item.department_id )
//       `);
//     const itemPromises = getItemDetails.map((currentItem) => {
//       return {
//         acceptRemarks: currentItem.accept_remarks,
//         batchId: currentItem.batch_id,
//         batchNo: currentItem.batch_no,
//         brandName: currentItem.brand_name,
//         categoryName: currentItem.group_name,
//         costPrice: currentItem.cost_price,
//         defectiveQuantity: currentItem.defective_qnty,
//         departmentname: currentItem.dept_name,
//         despatchRemarks: currentItem.despatch_remarks,
//         despatchedQuantity: currentItem.despatched_qnty,
//         discount: currentItem.discount,
//         divisionName: currentItem.div_name,
//         itemCode: currentItem.item_cd,
//         itemColour: currentItem.color_name,
//         itemId: currentItem.id,
//         itemName: currentItem.name,
//         itemSize: currentItem.size_cd,
//         lostQuantity: currentItem.lost_qnty,
//         mrp: currentItem.MRP,
//         receivedQuantity: currentItem.received_qnty,
//         requestRemarks: currentItem.request_remarks,
//         requestedQuantity: currentItem.REQUESTED_QNTY,
//         salePrice: currentItem.sale_price,
//         stockTransferDetailsId: currentItem.id,
//         subCategoryname: currentItem.sub_cat_name,
//         uom: currentItem.UOM,
//       };
//     });
//     const itemResolved = await Promise.all(itemPromises);
//     const promises = getStockRequest.map((current) => {
//       return {
//         acceptRemarks: current.accept_remarks,
//         deliveryPartner: current.delivery_partner,
//         despatchRemarks: current.despatch_remarks,
//         despatchedAt: current.despatched_at,
//         itemDetails: itemResolved,
//         receivedAt: current.received_at,
//         requestFromStore: current.loc_name,
//         requestFromStoreId: current.from_loc_id,
//         requestNo: current.request_no,
//         requestRaisedBy: current.request_raised_by,
//         requestReceivedBy: current.request_received_by,
//         requestRemarks: current.request_remarks,
//         requestToStore: current.loc_name,
//         requestToStoreId: current.to_loc_id,
//         requestType: current.request_type,
//         requestedAt: current.requested_at,
//         status: current.status,
//         stockTransferId: current.stock_transfer_id,
//       };
//     });
//     const resolved = await Promise.all(promises);
//     return res.status(200).send({
//       status: 200,
//       message: "Successfully fetched the stock request details",
//       data: resolved,
//     });
//   } catch (error) {
//     return res.status(200).send({
//       status: 500,
//       message: "Something went wrong , please try again later",
//       data: error.message,
//     });
//   }
// };
// module.exports = {
//   searchStockReq,
//   raiseStockRequest,
//   // raiseStockTransferRequest,
//   getStockRequestDetails,
//   getStockRequestDetailsById,
//   updateStockRequest,
//   // updateStock
// };
