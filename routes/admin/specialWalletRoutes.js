const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
    createStrategy,
    viewStrategy,
    editStrategy,
    deleteStrategy
} = require("../../controllers/admin/specialWalletController.js");

// authenticateAdmin
router.route("/create").post(createStrategy);
router.route("/view").post(viewStrategy);
router.route("/edit").post(editStrategy);
router.route("/delete").post(deleteStrategy);

module.exports = router;
