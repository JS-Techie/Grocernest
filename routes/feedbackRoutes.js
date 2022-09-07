const router = require("express").Router();

const authenticate = require("../middleware/authentication");

const {
  getAllFeedbacks,
  getFeedbackById,
  createFeedback,
  editFeedback,
  deleteFeedback,
  getMyFeedback
} = require("../controllers/feedbackController");

router.route("/view/all/:item_id").get(getAllFeedbacks);
router.route("/view/:id").get(getFeedbackById);

router.route("/my/:item_id").get(authenticate, getMyFeedback);
router.route("/create/:item_id").post(authenticate, createFeedback);
router.route("/edit/:id").patch(authenticate, editFeedback);
router.route("/delete/:id").delete(authenticate, deleteFeedback);


module.exports = router;
