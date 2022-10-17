const router = require("express").Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  uploadMultipleImages,
} = require("../../controllers/admin/itemController");
router.route("/upload/images").post(authenticateAdmin, uploadMultipleImages);

module.exports = router;
