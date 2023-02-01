const router = require("express").Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  uploadMultipleImages,
  editUploadedImages,
  deleteImage,
  referenceItem,
  getLastThreeItemBatches
} = require("../../controllers/admin/itemController");

router.route("/upload/images").post(authenticateAdmin, uploadMultipleImages);
router.route("/edit/images").post(authenticateAdmin, editUploadedImages);
router.route("/delete/images").post(authenticateAdmin, deleteImage);
router.route("/reference/image").post(authenticateAdmin, referenceItem);
router.route("/three/batches/:item_id").get(authenticateAdmin, getLastThreeItemBatches);

module.exports = router;
