
const { sequelize, Sequelize } = require("../services/dbSetupService");

const Category = require("../models/t_lkp_category")(sequelize, Sequelize);
const Subcategory = require("../models/t_lkp_sub_category")(
  sequelize,
  Sequelize
);

const getAllCategories = async(req,res,next) => {
    //Fetch all categories
  try{
        const categories = await Category.findAll();
          res.status(200).send({
            success : true,
            data : categories,
            message : "Found all categories"
        })
  }catch(error){
    return res.status(400).send({
        success : false,
        data : error,
        message : "Could not find categories"
    })
  }
}

const getAllSubcategoriesInCategory = async(req,res,next) => {

    //Get all subcategories
    const categoryName = req.params.categoryId;

    try{    
        const categoryIdFromCategoryName = await Category.findOne({where : {group_name : categoryName}})
        try{
           
            const subcategories = await Subcategory.findAll({where : {category_id : categoryIdFromCategoryName.id}})
         
            return res.status(200).send({
                success : true,
                data : subcategories,
                message : "Found requested subcategory",
            })
        }catch(error){
            return res.status(400).send({
                success : false,
                data : error,
                message : "Could not find requested sub-category",
    
            })
        }
         
    }catch(error){
        return res.status(400).send({
            success : false,
            data : error,
            message : "Could not find requested category",

        })
    }


}

module.exports = {
    getAllCategories,
    getAllSubcategoriesInCategory
}