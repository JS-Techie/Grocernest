const db = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../models");

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

    //   const [itemsInACategory, metadata] =
    //     await sequelize.query(`select distinct t_item.id, t_item.name,t_item.brand_id,t_item.UOM ,t_item.category_id ,t_item.sub_category_id ,
    //   t_item.image ,t_item.description ,t_item.available_for_ecomm ,t_batch.batch_no ,
    //   t_batch.location_id ,t_batch.MRP ,t_batch.discount ,t_batch.cost_price ,t_batch.mfg_date ,t_batch.sale_price ,
    //   t_batch.created_at,t_lkp_color.color_name, t_lkp_brand.brand_name, t_lkp_category.group_name, t_batch.mark_selected,t_batch.id as "batch_id"
    //   from (((((t_item
    //         inner join t_batch on t_batch.item_id = t_item.id )
    //         inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
    //         inner join t_lkp_category on t_lkp_category.id = t_item.category_id)
    //         inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
    //         inner join t_inventory on t_inventory.item_id = t_item.id)
    //          where t_lkp_category.id = ${category} and t_inventory.location_id = 4 and t_lkp_category.available_for_ecomm = 1 and t_item.available_for_ecomm = 1 and t_batch.mark_selected = 1;
    // `);

    //   let countOfItems = null;
    //   let promises = null;
    //   if (itemsInACategory.length !== 0) {
    //     promises = itemsInACategory.map((current) => {
    //       return {
    //         itemID: current.id,
    //       };
    //     });
    //   }

    //   const resolved = await Promise.resolve(promises);
    //   const response = [
    //     ...new Map(resolved.map((item) => [item["itemID"], item])).values(),
    //   ];

    //   countOfItems = response.length;

    const categoryPromises = categories.map(async (currentCategory) => {
      const subcategoryPromises = currentCategory.t_lkp_sub_category_models.map(
        (currentSubcategory) => {
          return {
            subName: currentSubcategory.sub_cat_name,
            id: currentSubcategory.id,
            image: currentSubcategory.image,
            nodeId: currentSubcategory.sub_cat_cd,
          };
        }
      );

      const subcategoryResponseArray = await Promise.all(subcategoryPromises);

      return {
        nodeId: currentCategory.id,
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
        data: {
          response: [],
          number: 0,
        },
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
