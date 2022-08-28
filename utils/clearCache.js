const cron = require("node-cron");

const db = require("../models");
const Cache = db.CacheModel;

const clearCache = () => {
  cron.schedule("0 0 * * * *", async () => {
    const itemsInCache = await Cache.findAll({});
    if (itemsInCache.length > 0) {
      itemsInCache.map(async (currentItem) => {
        await Cache.destroy({
          where: { cust_no: currentItem.cust_no },
        });
      });
    }
  });
};

module.exports = clearCache;
