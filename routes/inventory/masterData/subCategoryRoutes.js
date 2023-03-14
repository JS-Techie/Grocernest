const express = require ("express")
const router = express.Router();

const authenticate = require("../../../middleware/authenticateAdmin") 

const {
    saveSubCategory,
    updateSubCategory,
    getAllSubCategory,
    getSubCategoryByCategoryId,
    getActiveSubCategory,
    getInactiveSubCategory,
    activeSubCategory,
    deactiveSubCategory
} = require ("../../../controllers/inventory/masterData/subCategoryController"); 

router.route("/secure/subCategory/save").post(authenticate, saveSubCategory);
router.route("/secure/subCategory/all").post(authenticate,getAllSubCategory);
router.route("/secure/subCategory/:categoryId").post(authenticate,getSubCategoryByCategoryId);
router.route("/secure/subCategory/update/:subCategoryId").post(authenticate,updateSubCategory);
router.route("/secure/subCategory/all/active").post(authenticate,getActiveSubCategory);
router.route("/secure/subCategory/all/inactive").post(authenticate,getInactiveSubCategory);
router.route("/secure/subCategory/activate/:subCategoryId").post(authenticate,activeSubCategory);
router.route("/secure/subCategory/deactivate/:subCategoryId").post(authenticate,deactiveSubCategory); 

module.exports = router;