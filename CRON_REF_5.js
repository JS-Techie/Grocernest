// require("dotenv").config()

// const cron = require("node-cron")
// const { sequelize } = require("./models");
// const { Op } = require("sequelize");
// const db = require("./models")
// const Offers = db.OffersModel


// const OfferManagementJOB = async () => {
//     // schedule time is 11:50pm
//     cron.schedule("50 23 * * *", async () => {
//         console.log("Running scheduled CRON-JOB.....");

//         // offer activation
//         await activationJob();

//     });
// };

// const activationJob = async () => {
//     try {

//         const today = Date.now()
//         const todayDate = Date.now(today)
//         const queryStatement = `SELECT * FROM t_offers WHERE is_active=1 AND end_date>${todayDate}`
//         const activeOffers = await sequelize.query(queryStatement)

//         let idArray = []
//         for (var i in activeOffers) {
//             idArray.push(activeOffers[i].id)
//         }
//         let update
//         if (idArray.length != 0) {
//             update = await Offers.update({
//                 is_active: 1,
//                 where: { id: idArray }
//             })
//         }
//         if (update) {
//             console.log("cron_ref_5 : Success || OFFER: DEACTIVATED");
//         }
//         else{
//             console.log("cron_ref_5 : No CHANGE || NO CHANGE TO MAKE")
//         }
//     }
//     catch (error) {
//         console.log(`cron_ref_5 : FAILURE || PROBLEM: ${error.message}`)
//     }

// }

// module.exports = OfferManagementJOB;


