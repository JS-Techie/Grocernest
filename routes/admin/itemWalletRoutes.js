const router = require("express").Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  getAllItemWallet,
  getItemWalletById,
  editWallet,
  activateWallet,
  deactivateWallet,
} = require("../../controllers/admin/itemWalletController");

router.route("/wallet/view/all").get(authenticateAdmin, getAllItemWallet);
router.route("/wallet/view/:id").get(authenticateAdmin, getItemWalletById);
router.route("/wallet/create").post(authenticateAdmin, getItemWalletById);
router.route("/wallet/edit/:id").patch(authenticateAdmin, editWallet);
router.route("/wallet/active/:id").patch(authenticateAdmin, activateWallet);
router.route("/wallet/deactive/:id").patch(authenticateAdmin, deactivateWallet);

module.exports = router;
