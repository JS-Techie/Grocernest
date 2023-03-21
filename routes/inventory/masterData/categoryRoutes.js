const express = require ("express")
const router = express.Router();

const authenticate = require("../../../middleware/authenticateAdmin") 

const {
    saveCategory,
    getAllCategory,
    getActiveCategory,
    getDeactiveCategory,
    activeCategory,
    deactiveCategory
} = require ("../../../controllers/inventory/masterData/categoryController"); 

router.route("/secure/category/saveCategory").post(authenticate, saveCategory);
router.route("/secure/category/getAllCategory").post(authenticate,getAllCategory);
router.route("/secure/category/getActiveCategory").post(authenticate,getActiveCategory);
router.route("/secure/category/getDeactiveCategory").post(authenticate,getDeactiveCategory);
router.route("/secure/category/activeCategory").post(authenticate,activeCategory);
router.route("/secure/category/deactiveCategory").post(authenticate,deactiveCategory); 

module.exports = router;