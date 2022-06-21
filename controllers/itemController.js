const { sequelize, Sequelize } = require("../services/dbSetupService");

const Item = require("../models/t_item")(sequelize, Sequelize);
const Category = require("../models/t_lkp_category")(sequelize, Sequelize);
const Subcategory = require("../models/t_lkp_sub_category")(
  sequelize,
  Sequelize
);
const Brand = require("../models/t_lkp_brand")(sequelize,Sequelize)

const getItemsInCategory = async (req, res, next) => {
  //Get category id from the request
  const categoryName = req.params.categoryId;
  

  try {
    const categoryIdOfCategoryName = await Category.findOne({
      where: { group_name: categoryName },
    });

  

    try {
      //Search all items with that category id in items table
      const itemsInACategory = await Item.findAll({
        where: { category_id: categoryIdOfCategoryName.id },
      });
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
        message: "Could not find items in the requested category",
      });
    }
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Could not find the requested category",
    });
  }
};

//For subcategories, all sub_cat_id in items table is 0 and there is no subcategory with id = 0
const getItemsInSubcategory = async (req, res, next) => {
  const categoryName = req.params.categoryId;
  const subcategoryName = req.params.subcategoryId;

  try {
    const categoryIdOfCategoryName = await Category.findOne({
      where: { group_name: categoryName },
    });

    try {
      const subcategoryIdOfSubcategoryName = await Subcategory.findOne({
        where: {
          category_id: categoryIdOfCategoryName.id,
          sub_cat_name: subcategoryName,
        },
      });

      try {
        const ItemsInASubcategory = await Item.findAll({
          where: { sub_category_id: subcategoryIdOfSubcategoryName.id },
        });

        return res.status(200).send({
          success: true,
          data: ItemsInASubcategory,
          message: "Found requested items in subcategory",
        });
      } catch (error) {
        return res.status(400).send({
          success: false,
          data: error,
          message: "Could not find requested items in sub category",
        });
      }
    } catch (error) {
      return res.status(400).send({
        success: false,
        data: error,
        message: "Could not find requested sub-category",
      });
    }
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Could not find requested category",
    });
  }
};



const getItemsBySearchTerm = async (req, res, next) => {
  //get the search term, find if anything from category or subcateogry or item or brand name matches with the search term
  const searchTerm = req.params.searchTerm

  try{

    const itemFound = await Item.findAll({where : {name : searchTerm}})
    const categoryFound = await Category.findAll({where : {group_name : searchTerm}})
    const subcategoryFound = await Subcategory.findAll({where : {sub_cat_name : searchTerm}})
    const brandFound = await Brand.findAll({where : {brand_name : searchTerm}})

    if(itemFound.length == 0 && categoryFound.length == 0 && subcategoryFound.length == 0 && brandFound.length == 0) {
      return res.status(200).send({
        success : false,
        data : null,
        message : "Nothing matches the search term"
      })
    }

    return res.status(200).send({
      success : true,
      data : {
        brand : brandFound,
        item : itemFound ,
        category : categoryFound ,
        subcategory : subcategoryFound,
      },
      message : "Found item/brand/subcategory/category matching search term"
    })

  }catch(error){
    return res.status(400).send({
      success : false,
      data : error,
      message: "Error occured while fetching"
    })
  }

};

module.exports = {
  getItemsInCategory,
  getItemsInSubcategory,
  getItemsBySearchTerm,
};
