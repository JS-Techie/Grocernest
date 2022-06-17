const express = require("express")
const router = express.Router();

import authenticate from "../middleware/authentication.js";

import{
    getAllTransactionsOfUser,
    getBalanceOfUser
} from "../controllers/walletController.js"

//Authenticated routes - User cannot view anything about wallet without having logged in

router.route("/view/transactions").get( getAllTransactionsOfUser)
router.route("/view/balance").get(getBalanceOfUser)

module.exports = router;

