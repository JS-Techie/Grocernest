const { Op } = require("sequelize");

const db = require("../../models");
const { sequelize } = require("../../models");

const MarketSurvey = db.MarketSurveyModel;

const getMarketSurveyList = async (req, res, next) => {
  try {
    const marketSurveyList = MarketSurvey.findAll({});
    if (marketSurveyList.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no market survey lists to show currently",
      });
    }

    return res.status(200).send({
      success: true,
      data: marketSurveyList,
      message: "Successfully found market survey list",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

const getMarketSurveyListByItemId = async (req, res, next) => {
  const { item_id } = req.params;
  try {
    const marketSurveyList = MarketSurvey.findAll({ where: { item_id } });
    if (marketSurveyList.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no market survey lists to show currently",
      });
    }

    return res.status(200).send({
      success: true,
      data: marketSurveyList,
      message: "Successfully found market survey list",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

const getMarketSurveyListByCompany = async (req, res, next) => {
  const { source } = req.params;

  try {
    const marketSurveyList = await MarketSurvey.findAll({
      where: {
        source: {
          [Op.like]: `%${source}%`,
        },
      },
    });

    if (marketSurveyList.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no market survey lists to show currently",
      });
    }

    return res.status(200).send({
      success: true,
      data: marketSurveyList,
      message: "Successfully found market survey list",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

const createNewMarketSurvey = async (req, res, next) => {
  const { source, item_id, sale_price, MRP, offer, discount } = req.body;
  try {
    if (!item_id) {
      return res.status(400).send({
        success: false,
        data: [],
        message:
          "Please enter the item ID you would like to create a survey for",
      });
    }
    const marketSurveyExists = await MarketSurvey.findOne({
      where: { source, item_id, sale_price, MRP, offer, discount },
    });

    if (marketSurveyExists) {
      return res.status(200).send({
        success: false,
        data: marketSurveyExists,
        message: "A market survey with all the same details already exist",
      });
    }

    const newMarketSurvey = await MarketSurvey.create({
      source,
      item_id,
      sale_price,
      MRP,
      offer,
      discount,
      created_by: 1,
      created_at: Date.now(),
    });

    return res.status(200).send({
      success: true,
      data: newMarketSurvey,
      message: "New market survey created successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

const editMarketSurvey = async (req, res, next) => {
  const { id } = req.params;
  const { source, item_id, sale_price, MRP, offer, discount } = req.body;
  try {
    if (!item_id) {
      return res.status(400).send({
        success: false,
        data: [],
        message:
          "Please enter the item ID you would like to create a survey for",
      });
    }
    const oldMarketSurvey = await MarketSurvey.findOne({
      where: { id },
    });

    if (!oldMarketSurvey) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested market survey not found",
      });
    }

    const updatedRows = await MarketSurvey.update(
      {
        source,
        item_id,
        sale_price,
        MRP,
        offer,
        discount,
      },
      {
        where: { id },
      }
    );

    const updatedMarketSurvey = await MarketSurvey.findOne({ where: { id } });

    return res.status(200).send({
      success: true,
      data: {
        oldMarketSurvey,
        updatedMarketSurvey,
        updatedRows,
      },
      message: "Updated requested market survey successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

const deleteMarketSurvey = async (req, res, next) => {
  const { id } = req.params;
  try {
    const currentMarketSurvey = await MarketSurvey.findOne({
      where: { id },
    });

    if (!currentMarketSurvey) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested market survey not found",
      });
    }

    const deletedRows = await MarketSurvey.destroy({ where: { id } });
    return res.status(200).send({
      success: true,
      data: {
        deletedMarketSurvey: currentMarketSurvey,
        deletedRows,
      },
      message: "Deleted requested market survey successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

module.exports = {
  getMarketSurveyList,
  getMarketSurveyListByItemId,
  getMarketSurveyListByCompany,
  createNewMarketSurvey,
  editMarketSurvey,
  deleteMarketSurvey,
};
