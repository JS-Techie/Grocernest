const express = require ("express")
   const router = express.Router();
   
   const authenticate = require("../../../middleware/authenticateAdmin") 

const {
       saveItem,
       getAllItem,
       getActiveItem,
       getDeactiveItem,
       activeItem,
       deactiveItem,
       getItemByItemId,
      getItemByItemCode,
       fetchItembyItemCode,
       getItemData,
       itemByCode

    } = require ("../../../controllers/inventory/masterData/itemController"); 
  

router.route("/secure/item/saveItem").post(authenticate, saveItem);
router.route("/secure/item/getAllItem").post(authenticate,getAllItem);
router.route("/secure/item/getActiveItem").post(authenticate,getActiveItem);
router.route("/secure/item/getDeactiveItem").post(authenticate,getDeactiveItem);
router.route("/secure/item/activeItem").post(authenticate,activeItem);
router.route("/secure/item/deactiveItem").post(authenticate,deactiveItem);
router.route("/secure/item/searchItemDetailsByItemId").post(authenticate,getItemByItemId);
router.route("/secure/item/searchItemDetailsByItemCode").post(authenticate,getItemByItemCode);
router.route("/secure/item/:itemCode").post(authenticate, fetchItembyItemCode);
router.route("/secure/item/getItemData").post(authenticate,getItemData);
// router.route("/secure/item/:itemCode").post(authenticate,itemByCode);
module.exports = router;