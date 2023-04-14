const db = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../models");

const Category = db.LkpCategoryModel;
const Subcategory = db.LkpSubCategoryModel;
const Item = db.ItemModel;
const Brand = db.LkpBrandModel;
const Offer = db.OffersModel;
const lkpOffers = db.lkpOffersModel

const getAllCategories = async (req, res, next) => {
  //Fetch all categories and subcategories within them
  try {
    const categories = await Category.findAll({
      order: [['group_name', 'ASC']],
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
      order: [['sub_cat_name', 'ASC']]
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
    const brands = await Brand.findAll({
      order: [['brand_name', 'ASC']]
    });

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
  let type_details = null
  let x_item_details = null
  let y_item_details = null
  let z_item_details = null

  try {

    const [promises, metadata] = 
        await sequelize.query(`select offers.id as offerID, offers.type_id as offerType, t_lkp_offer.offer_type as offerName, offers.item_x as itemX, i.name as xItemName, i.image as xItemImage, offers.item_y as itemY, i2.name as yItemName, i2.image as yItemImage, offers.item_z as itemZ, i3.name as zItemName, i3.image as zItemImage, offers.item_x_quantity as quantityOfItemX, offers.item_y_quantity as quantityOfItemY, offers.item_z_quantity as quantityOfItemZ,
        offers.amount_of_discount as amountOfDiscount, offers.is_percentage as isPercentage, offers.created_by, offers.updated_by, offers.created_at, offers.updated_at, offers.is_active as isActive, 
        offers.start_date as startDate, offers.start_time as startTime, offers.end_time as endDate, offers.is_ecomm as isEcomm, offers.is_pos as isPos, offers.is_time as isTime
        from t_offers offers inner join t_lkp_offer on offers.type_id = t_lkp_offer.id
        left join t_item i on i.id = offers.item_x 
        left join t_item i2 on i2.id = offers.item_y
        left join t_item i3 on i3.id = offers.item_z
        where offers.is_active = 1
        order by created_at desc`);
  /*  const offers = await Offer.findAll({
      where: { is_active: 1, is_ecomm: 1 },
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
    var count = 0;
    var counter = 0;
   const promises = offers.map(async (currentOffer) => {

      if(currentOffer.type_id){
        console.log(counter+ " type_id: "+ currentOffer.type_id);
        // counter = counter + 1;
        type_details = await lkpOffers.findOne({
          where:{ id: currentOffer.type_id}
        })
      }
      console.log("type_details:id "+type_details.id)
      console.log("type_details:name "+type_details.offer_type)
      const offer_name = type_details.offer_type;
      
      if(currentOffer.item_x) {
        console.log(count, currentOffer.item_x);
        count = count+1;
        x_item_details = await Item.findOne({
          where:{
            id: currentOffer.item_x
          }
        })
      } 
      console.log("x_item_details "+x_item_details)
      if(currentOffer.item_y) { 
        y_item_details = await Item.findOne({
          where:{
            id: currentOffer.item_y
          }
        })
      }  
      if(currentOffer.item_z) { 
        z_item_details = await Item.findOne({
          where:{
            id: currentOffer.item_z
          }
        })
      }  
        return {
          offerID: currentOffer.id,
          offerType: currentOffer.type_id,
          offerName: offer_name,
          itemX: currentOffer.item_x,
          xItemName: (x_item_details!==null)?x_item_details.name:null,
          xItemImage: x_item_details ? x_item_details.image : null,
          quantityOfItemX: currentOffer.item_x_quantity,
          itemY: currentOffer.item_y,
          yItemName:(y_item_details!==null)?y_item_details.name:null,
          yItemImage: y_item_details ? y_item_details.image : null,
          quantityOfItemY: currentOffer.item_y_quantity,
          itemZ: currentOffer.item_z,
          zItemName: (z_item_details!==null)?z_item_details.name:null,
          zItemImage: z_item_details ? z_item_details.image : null,
          quantityOfItemZ: currentOffer.item_z_quantity,
          amountOfDiscount: currentOffer.amount_of_discount,
          isPercentage: currentOffer.is_percentage,
          isActive: true,
          startDate: currentOffer.start_date,
          startTime: currentOffer.start_time,
          endDate: currentOffer.end_date,
          endTime: currentOffer.end_time,
          isEcomm: currentOffer.is_ecomm,
          isPos: currentOffer.is_pos,
          isTime: currentOffer.is_time
        }
        console.log("Hello world");
    });
    */

    //console.log(promises);

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
