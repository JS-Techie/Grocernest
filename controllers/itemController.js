const db = require("../models");

const Item = db.ItemModel;
const Category = db.LkpCategoryModel;
const Subcategory = db.LkpSubCategoryModel;
const Brand = db.LkpBrandModel;

const getItemsInCategory = async (req, res, next) => {
  //Get category id from the request
  const category = req.params.categoryId;
  try {
    //Search all items with that category id in items table
    const itemsInACategory = await Item.findAll({
      where: { category_id: category },
    });

    if(itemsInACategory.length === 0){
      return res.status(404).send({
        success : false,
        data : null,
        message : "Could not find items in requested category"
      })
    }
    //Return all those items
    return res.status(200).send({
      success: true,
      data: itemsInACategory,
      message: "Found the items belonging to requested category",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Error occured while fetching items belonging to requested category",
    });
  }
};

//For subcategories, all sub_cat_id in items table is 0 and there is no subcategory with id = 0
const getItemsInSubcategory = async (req, res, next) => {
  //Get category and subcategory id from params
  const category = req.params.categoryId;
  const subcategory = req.params.subcategoryId;

  try {
    //search in items field using the params
    const ItemsInASubcategory = await Item.findAll({
      where: {
        sub_category_id: subcategory,
        category_id: category,
      },
    });

    
    if(ItemsInASubcategory.length === 0){
      return res.status(404).send({
        success : false,
        data : null,
        message : "Could not find items in requested sub-category"
      })
    }

    return res.status(200).send({
      success: true,
      data: ItemsInASubcategory,
      message: "Found requested items in subcategory",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Error occurred while fetching requested items in sub category",
    });
  }
};

const getItemsBySearchTerm = async (req, res, next) => {
  //get the search term, find if anything from category or subcategory or item or brand name matches with the search term
  const searchTerm = req.params.searchTerm;

  try {
    const itemFound = await Item.findAll({ where: { name: searchTerm } });
 
    const categoryFound = await Category.findAll({
      where: { group_name: searchTerm },
    });
    const subcategoryFound = await Subcategory.findAll({
      where: { sub_cat_name: searchTerm },
    });
    const brandFound = await Brand.findAll({
      where: { brand_name: searchTerm },
    });

    if (
      itemFound.length === 0 &&
      !categoryFound.length === 0 &&
      !subcategoryFound.length === 0  &&
      !brandFound.length === 0
    ) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Nothing matches the search term",
      });
    }

    return res.status(200).send({
      success: true,
      data: {
        brand: brandFound,
        item: itemFound,
        category: categoryFound,
        subcategory: subcategoryFound,
      },
      message: "Found item/brand/subcategory/category matching search term",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Error occured while fetching",
    });
  }
};

module.exports = {
  getItemsInCategory,
  getItemsInSubcategory,
  getItemsBySearchTerm,
};
