const { sequelize, Sequelize } = require("../services/dbSetupService");

const Item = require("../models/t_item")(sequelize, Sequelize);
const Category = require("../models/t_lkp_category")(sequelize, Sequelize);
const Subcategory = require("../models/t_lkp_sub_category")(
  sequelize,
  Sequelize
);

const getItemsInCategory = async (req, res, next) => {
  //Get category id from the request
  const categoryName = req.params.categoryId;

  try {
    const categoryIdOfCategoryName = await Category.find({
      where: { group_name: categoryName },
    });

    try {
      //Search all items with that category id in items table
      const itemsInACategory = await Item.findAll({
        where: { category_id: categoryIdOfCategoryName },
      });
      //Return all those items
      return res.status(200).json({
        success: true,
        data: itemsInACategory,
        message: "Found the items belonging to requested category",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        data: error,
        message: "Could not find items in the requested category",
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: error,
      message: "Could not find the requested category",
    });
  }
};
const getItemsInSubcategory = async (req, res, next) => {
  const categoryName = req.params.categoryId;
  const subcategoryName = req.params.subcategoryId;

  try {
    const categoryIdOfCategoryName = await Category.find({
      where: { group_name: categoryName },
    });

    try {
      const subcategoryIdOfSubcategoryName = await Subcategory.find({
        where: {
          category_id: categoryIdOfCategoryName,
          sub_cat_name: subcategoryName,
        },
      });

      try {
        const ItemsInASubcategory = await Item.findAll({
          where: { sub_category_id: subcategoryIdOfSubcategoryName },
        });

        return res.status(200).json({
          success: true,
          data: ItemsInASubcategory,
          message: "Found requested items in subcategory",
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          data: error,
          message: "Could not find requested items in sub category",
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        data: error,
        message: "Could not find requested sub-category",
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: error,
      message: "Could not find requested category",
    });
  }
};
const getItemsBySearchTerm = async (req, res, next) => {

    


};

module.exports = {
  getItemsInCategory,
  getItemsInSubcategory,
  getItemsBySearchTerm,
};
