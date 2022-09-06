const router = require("express").Router();

const authenticate = require("../middleware/authentication");

const {
  getAllFeedbacks,
  getFeedbackById,
  createFeedback,
  editFeedback,
  deleteFeedback,
} = require("../controllers/feedbackController");

router.route("/view/all/:item_id").get(authenticate, getAllFeedbacks);
router.route("/view/:id/").get(authenticate, getFeedbackById);
router.route("/create/:item_id").post(authenticate, createFeedback);
router.route("/edit/:id/").patch(authenticate, editFeedback);
router.route("/delete/:id/").delete(authenticate, deleteFeedback);

module.exports = router;
