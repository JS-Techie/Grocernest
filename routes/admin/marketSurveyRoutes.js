const router = require("express").Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  getMarketSurveyList,
  getMarketSurveyListByItemId,
  getMarketSurveyListByCompany,
  createNewMarketSurvey,
  editMarketSurvey,
  deleteMarketSurvey,
} = require("../../controllers/admin/marketSurveyController");

router.route("/view/all").get(authenticateAdmin, getMarketSurveyList);
router
  .route("/view/:item_id")
  .get(authenticateAdmin, getMarketSurveyListByItemId);
router
  .route("/view/:source")
  .get(authenticateAdmin, getMarketSurveyListByCompany);
router.route("/create").post(authenticateAdmin, createNewMarketSurvey);
router.route("/edit/:id").put(authenticateAdmin, editMarketSurvey);
router.route("/delete/:id").delete(authenticateAdmin, deleteMarketSurvey);

module.exports = router;
