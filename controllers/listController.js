const db = require("../models");
const { Op } = require("sequelize");

const Category = db.LkpCategoryModel;
const Subcategory = db.LkpSubCategoryModel;
const Item = db.ItemModel;
const Brand = db.LkpBrandModel;
const Offer = db.OffersModel;

const getAllCategories = async (req, res, next) => {
  //Fetch all categories and subcategories within them
  try {
    const categories = await Category.findAll({
      where: { available_for_ecomm: 1 },
      include: [
        {
          model: Subcategory,
          //where : {available_for_ecomm : 1},
        },
      ],
    });

    const categoryPromises = categories.map(async (currentCategory) => {
      const subcategoryPromises = currentCategory.t_lkp_sub_category_models.map(
        (currentSubcategory) => {
          return {
            subName: currentSubcategory.sub_cat_name,
            id: currentSubcategory.id,
            image: currentSubcategory.image,
          };
        }
      );

      const subcategoryResponseArray = await Promise.all(subcategoryPromises);

      return {
        catName: currentCategory.group_name,
        categoryId: currentCategory.id,
        img: currentCategory.image,
        subCategory: subcategoryResponseArray,
      };
    });

    const responseArray = await Promise.all(categoryPromises);

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Found all categories",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error occured while fetching categories",
    });
  }
};

const getAllSubcategoriesInCategory = async (req, res, next) => {
  //Get category id from params
  const categoryId = req.params.categoryId;

  try {
    //Find all subcategories which match category ID.
    const subcategories = await Subcategory.findAll({
      where: {
        category_id: categoryId,
      },
    });

    const category = await Category.findOne({
      where: { id: categoryId },
    });

    if (subcategories.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Requested subcategory not found",
      });
    }

    const subcategoryPromises = subcategories.map(async (current) => {
      return {
        subName: current.sub_cat_name,
        id: current.id,
        image: current.image,
      };
    });

    const subcategoryResponseArray = await Promise.all(subcategoryPromises);

    return res.status(200).send({
      success: true,
      data: {
        catName: category.group_name,
        img: category.image,
        subCategory: subcategoryResponseArray,
      },
      message: "Found requested subcategory",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error occurred while fetching subcategories",
    });
  }
};

const getAllBrands = async (req, res, next) => {
  try {
    const brands = await Brand.findAll({});

    if (brands.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no brands",
      });
    }

    let response = brands;

    if (brands.length > 100) {
      response = brands.slice(0, 100);
    }

    return res.status(200).send({
      success: true,
      data: {
        response,
        number: response.length,
      },
      message: "Found all brands",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Check data field for more details",
    });
  }
};

const getAllOffers = async (req, res, next) => {
  try {
    const offers = await Offer.findAll({
      where: { is_active: 1 },
      order: [["created_at", "DESC"]],
    });

    if (offers.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no offers",
      });
    }

    const promises = offers.map(async (currentOffer) => {
      if (currentOffer.item_id) {
        const discountItem = await Item.findOne({
          where: { id: currentOffer.item_id },
        });

        return {
          type: "discount",
          discountItem,
          amountOfDiscount: currentOffer.amount_of_discount,
          isPercentage: currentOffer.is_percentage,
        };
      } else {
        const xItem = await Item.findOne({
          where: { id: currentOffer.item_id_1 },
        });
        const yItem = await Item.findOne({
          where: { id: currentOffer.item_id_2 },
        });

        return {
          type: "offer",
          xItem,
          yItem,
          xItemQuantity: currentOffer.item_1_quantity,
          yItemQuantity: currentOffer.item_2_quantity,
        };
      }
    });

    console.log(promises);

    const resolved = await Promise.all(promises);
    console.log(resolved);

    let response = resolved;
    if (resolved.length > 10) {
      response = resolved.slice(0, 10);
    }

    return res.status(200).send({
      success: true,
      data: {
        response,
        number: response.length,
      },
      message: "Found all offers",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Check data field for more details",
    });
  }
};

module.exports = {
  getAllCategories,
  getAllSubcategoriesInCategory,
  getAllBrands,
  getAllOffers,
};
