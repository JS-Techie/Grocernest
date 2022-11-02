const router = require("express").Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  uploadMultipleImages,
  editUploadedImages,
  deleteImage,
} = require("../../controllers/admin/itemController");

router.route("/upload/images").post(authenticateAdmin, uploadMultipleImages);
router.route("/edit/images").post(authenticateAdmin, editUploadedImages);
router.route("/delete/images").post(authenticateAdmin, deleteImage);

module.exports = router;
