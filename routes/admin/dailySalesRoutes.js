const router = require("express").Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
    getOrdersByDate,

} = require("../../controllers/admin/dailySalesController");

router.route("/view").post(getOrdersByDate);

module.exports = router;
