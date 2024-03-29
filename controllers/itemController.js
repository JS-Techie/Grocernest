const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const { sequelize } = require("../models");
const db = require("../models");

const WishlistItems = db.WishlistItemsModel;
const Offers = db.OffersModel;
const lkp_offers = db.lkpOffersModel;
const Item = db.ItemModel;
const Inventory = db.InventoryModel;
const Coupons = db.CouponsModel;
const Batch = db.BatchModel;
const Category = db.CategoryModel;
const Brand = db.BrandModel;

const { findCustomerNumber } = require("../middleware/customerNumber");

const getItemsInCategory = async (req, res, next) => {
  //get current user if exists
  let currentUser = null;

  currentUser = await findCustomerNumber(req, res, next);

  console.log(currentUser);

  //Get category id from the request
  const category = req.params.categoryId;
  try {
    const [itemsInACategory, metadata] =
      await sequelize.query(`select distinct t_item.id, t_item.name, t_item.show_discount, t_item.brand_id,t_item.UOM, t_item.is_grocernest,t_item.category_id ,t_item.sub_category_id ,
      t_item.image ,t_item.description ,t_item.available_for_ecomm ,t_batch.batch_no ,
      t_batch.location_id ,t_batch.MRP ,t_batch.discount ,t_batch.cost_price ,t_batch.mfg_date ,t_batch.sale_price ,
      t_batch.created_at,t_lkp_color.color_name, t_lkp_brand.brand_name, t_lkp_category.group_name, t_batch.mark_selected,t_batch.id as "batch_id"
      from (((((t_item
            inner join t_batch on t_batch.item_id = t_item.id )
            inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
            inner join t_lkp_category on t_lkp_category.id = t_item.category_id)
            inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
            inner join t_inventory on t_inventory.item_id = t_item.id)
             where t_lkp_category.id = ${category} and t_inventory.location_id = 4 and t_lkp_category.available_for_ecomm = 1 and t_item.available_for_ecomm = 1 and t_batch.mark_selected = 1
             ORDER BY t_item.name ;
    `);

    if (itemsInACategory.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Could not find items in requested category",
      });
    }

    const promises = await itemsInACategory.map(async (current) => {

      let itemInWishlist;
      if (currentUser) {
        itemInWishlist = await WishlistItems.findOne({
          where: { cust_no: currentUser, item_id: current.id },
        });
      }

      const offer = await Offers.findOne({
        where: {
          is_active: 1,
          item_x: current.id, 
          [Op.or]: [
            {type_id: 1},
            {type_id:2}
          ],
          is_ecomm : 1
        },
      });

      let itemIDOfOfferItem;
      let offerItem;
      if (offer) {
        if (offer.type_id === 2) {
          itemIDOfOfferItem = offer.item_x;
        } else if(offer.type_id === 1) {
          itemIDOfOfferItem = offer.item_y;
        }
        offerItem = await Item.findOne({
          where: { id: itemIDOfOfferItem },
        });
      }

      return {
        itemName: current.name,
        showDiscount: current.show_discount,
        itemID: current.id,
        UOM: current.UOM,
        categoryName: current.group_name,
        categoryID: current.category_id,
        image: current.image,
        description: current.description,
        MRP: current.MRP,
        discount: current.discount,
        sale_price: current.sale_price,
        mfg_date: current.mfg_date,
        color: current.color_name,
        brand: current.brand_name,
        inWishlist: currentUser ? (itemInWishlist ? true : false) : "",
        isOffer: offer ? true : false,
        offerType: offer ? offer.type : "",
        itemIDOfOfferItem,
        XQuantity: offer
          ? offer.item_x_quantity
            ? offer.item_x_quantity
            : ""
          : "",
        YQuantity: offer
          ? offer.item_y_quantity
            ? offer.item_y_quantity
            : ""
          : "",
        YItemName: offerItem ? offerItem.name : "",
        amountOfDiscount: offer
          ? offer.amount_of_discount
            ? offer.amount_of_discount
            : ""
          : "",
        isPercentage: offer ? (offer.is_percentage ? true : false) : "",
        createdBy: offer ? (offer.created_by ? offer.created_by : "") : "",
        isGrocery: current.is_grocernest === 1 ? true : false,
      };
    });

    const resolved = await Promise.all(promises);
    const responseArray = [
      ...new Map(resolved.map((item) => [item["itemID"], item])).values(),
    ];

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Found the items belonging to requested category",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Error occured while fetching items belonging to requested category",
    });
  }
};

const getItemsInSubcategory = async (req, res, next) => {
  //Get category and subcategory id from params
  const category = req.params.categoryId;
  const subcategory = req.params.subcategoryId;

  //Get current user if exists
  let currentUser = null;

  currentUser = await findCustomerNumber(req, res, next);

  console.log(currentUser);

  try {
    const [ItemsInASubcategory, metadata] =
      await sequelize.query(`select distinct t_item.id, t_item.show_discount, t_item.name,t_item.brand_id,t_item.UOM ,t_item.is_grocernest,t_item.category_id ,t_item.sub_category_id ,
    t_item.image ,t_item.description ,t_item.available_for_ecomm ,t_batch.batch_no ,
    t_batch.location_id ,t_batch.MRP ,t_batch.discount ,t_batch.cost_price ,t_batch.mfg_date ,t_batch.sale_price ,
    t_batch.created_at,t_lkp_color.color_name, t_lkp_brand.brand_name ,t_lkp_sub_category.sub_cat_name, t_lkp_category.group_name,t_batch.mark_selected,t_batch.id as "batch_id"
    from ((((((t_item
          inner join t_batch on t_batch.item_id = t_item.id )
          inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
          inner join t_lkp_category on t_lkp_category.id = t_item.category_id)
          inner join t_lkp_sub_category on t_lkp_sub_category.id = t_item.sub_category_id)
          inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
          inner join t_inventory on t_inventory.item_id = t_item.id)
           where t_lkp_category.id = ${category} and t_lkp_sub_category.id = ${subcategory} and t_inventory.location_id = 4 and t_lkp_category.available_for_ecomm = 1 and t_lkp_sub_category.available_for_ecomm = 1 and t_item.available_for_ecomm = 1 and t_batch.mark_selected = 1`);

    if (ItemsInASubcategory.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Could not find items in requested sub-category",
      });
    }

    const promises = ItemsInASubcategory.map(async (current) => {
      let itemInWishlist;
      if (currentUser) {
        itemInWishlist = await WishlistItems.findOne({
          where: { cust_no: currentUser, item_id: current.id },
        });
      }

      const offer = await Offers.findOne({
        where: {
          is_active: 1,
          item_x: current.id ,
          [Op.or]: [{ type_id: 1}, { type_id: 2 }],
          is_ecomm : 1
        },
      });

      let itemIDOfOfferItem;
      let offerItem;
      if (offer) {
        if (offer.type_id ===2) {
          itemIDOfOfferItem = offer.item_x;
        } else if(offer.type_id ===1){
          itemIDOfOfferItem = offer.item_y;
        }
        offerItem = await Item.findOne({
          where: { id: itemIDOfOfferItem },
        });
      }
      return {
        itemName: current.name,
        showDiscount: current.show_discount,
        itemID: current.id,
        categoryID: current.category_id,
        categoryName: current.group_name,
        subcategoryID: current.sub_category_id,
        subcategoryName: current.sub_cat_name,
        UOM: current.UOM,
        image: current.image,
        description: current.description,
        MRP: current.MRP,
        discount: current.discount,
        sale_price: current.sale_price,
        mfg_date: current.mfg_date,
        color: current.color_name,
        brand: current.brand_name,
        inWishlist: currentUser ? (itemInWishlist ? true : false) : "",
        isOffer: offer ? true : false,
        offerType: offer ? offer.type : "",
        itemIDOfOfferItem,
        XQuantity: offer
          ? offer.item_x_quantity
            ? offer.item_x_quantity
            : ""
          : "",
        YQuantity: offer
          ? offer.item_y_quantity
            ? offer.item_y_quantity
            : ""
          : "",
        YItemName: offerItem ? offerItem.name : "",
        amountOfDiscount: offer
          ? offer.amount_of_discount
            ? offer.amount_of_discount
            : ""
          : "",
        isPercentage: offer ? (offer.is_percentage ? true : false) : "",
        createdBy: offer ? (offer.created_by ? offer.created_by : "") : "",
        isGrocery: current.is_grocernest === 1 ? true : false,
      };
    });

    const resolved = await Promise.all(promises);
    const responseArray = [
      ...new Map(resolved.map((item) => [item["itemID"], item])).values(),
    ];

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Found requested items in subcategory",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error occurred while fetching requested items in sub category",
    });
  }
};

const getItemsBySearchTerm = async (req, res, next) => {
  //get the search term, find if anything from category or subcategory or item or brand name matches with the search term
  const searchTerm = req.params.searchTerm;

  //Get current user if exists
  let currentUser = null;

  currentUser = await findCustomerNumber(req, res, next);

  console.log(currentUser);

  try {
    const [results, metadata] =
      await sequelize.query(`select distinct t_item.id, t_item.name, t_item.show_discount, t_item.brand_id,t_item.UOM ,t_item.is_grocernest, t_item.category_id, t_lkp_category.group_name,t_item.sub_category_id , t_lkp_sub_category.sub_cat_name 
    ,t_item.image ,t_item.description ,t_item.available_for_ecomm ,t_batch.batch_no ,
    t_batch.location_id ,t_batch.MRP ,t_batch.discount ,t_batch.cost_price ,t_batch.mfg_date ,t_batch.sale_price ,
    t_batch.created_at,t_lkp_color.color_name,t_batch.quantity, t_lkp_brand.brand_name,t_batch.mark_selected,t_batch.id as "batch_id"
    from ((((((t_item
          inner join t_batch on t_batch.item_id = t_item.id )
          inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
          inner join t_lkp_category on t_lkp_category.id = t_item.category_id)
          left outer join t_lkp_sub_category on t_lkp_sub_category.id = t_item.sub_category_id)
          inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
          inner join t_inventory on t_inventory.item_id = t_item.id)
          where(t_item.name like "%${searchTerm}%" or t_lkp_category.group_name like "%${searchTerm}%" or t_lkp_brand.brand_name like "%${searchTerm}%" or t_lkp_sub_category.sub_cat_name like "%${searchTerm}%")  and t_inventory.location_id = 4 and t_lkp_category.available_for_ecomm = 1 and t_item.available_for_ecomm = 1 and t_batch.mark_selected = 1`);

    if (results.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "No items found based on search term",
      });
    }

    const promises = results.map(async (current) => {
      let itemInWishlist;
      if (currentUser) {
        itemInWishlist = await WishlistItems.findOne({
          where: { cust_no: currentUser, item_id: current.id },
        });
      }

      const offer = await Offers.findOne({
        where: {
          is_active: 1,
          item_x: current.id,
          [Op.or]: [{ type_id: 1 }, { type_id: 2}],
          is_ecomm : 1
        },
      });

      let itemIDOfOfferItem;
      let offerItem;
      if (offer) {
        if (offer.type_id ===2 ) {
          itemIDOfOfferItem = offer.item_x;
        } else if (offer.type_id ===1 ){
          itemIDOfOfferItem = offer.item_y;
        }
        offerItem = await Item.findOne({
          where: { id: itemIDOfOfferItem },
        });
      }
      return {
        itemName: current.name,
        showDiscount: current.show_discount,
        itemID: current.id,
        categoryID: current.category_id,
        categoryName: current.group_name,
        subcategoryID: current.sub_category_id,
        subcategoryName: current.sub_cat_name,
        UOM: current.UOM,
        image: current.image,
        description: current.description,
        MRP: current.MRP,
        discount: current.discount,
        sale_price: current.sale_price,
        mfg_date: current.mfg_date,
        color: current.color_name,
        brand: current.brand_name,
        inWishlist: currentUser ? (itemInWishlist ? true : false) : "",
        isOffer: offer ? true : false,
        offerType: offer ? offer.type : "",
        itemIDOfOfferItem,
        XQuantity: offer
          ? offer.item_x_quantity
            ? offer.item_x_quantity
            : ""
          : "",
        YQuantity: offer
          ? offer.item_y_quantity
            ? offer.item_y_quantity
            : ""
          : "",
        YItemName: offerItem ? offerItem.name : "",
        amountOfDiscount: offer
          ? offer.amount_of_discount
            ? offer.amount_of_discount
            : ""
          : "",
        isPercentage: offer ? (offer.is_percentage ? true : false) : "",
        createdBy: offer ? (offer.created_by ? offer.created_by : "") : "",
        isGrocery: current.is_grocernest === 1 ? true : false,
      };
    });

    const resolved = await Promise.all(promises);
    const responseArray = [
      ...new Map(resolved.map((item) => [item["itemID"], item])).values(),
    ];

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Successfully found items relating to search term",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Error occurred while searching for items, please check data field for more details",
    });
  }
};

const getItemById = async (req, res, next) => {
  //Get the itemId from the params
  const currentItemId = req.params.itemId;

  //Get current user if exists
  let currentUser = null;

  currentUser = await findCustomerNumber(req, res, next);

  console.log(currentUser);

  try {
    //Find all the details of the item pertaining to current item id
    const [itemResults, metadata] =
      await sequelize.query(`select distinct t_item.id, t_item.name, t_item.show_discount ,t_item.brand_id, t_item.UOM ,t_item.category_id, t_item.is_grocernest,t_lkp_category.group_name,t_item.sub_category_id , t_lkp_sub_category.sub_cat_name 
      ,t_item.image ,t_item.description ,t_item.available_for_ecomm , t_batch.batch_no ,t_item.how_to_use, t_item.ingredients, t_item.country_of_origin,t_item.manufacturer_name,
      t_batch.location_id ,t_batch.MRP ,t_batch.discount ,t_batch.cost_price ,t_batch.mfg_date ,t_batch.sale_price ,
      t_batch.expiry_date,
      t_inventory.cashback, t_inventory.cashback_is_percentage,
      t_batch.created_at,t_lkp_color.color_name,t_batch.quantity, t_lkp_brand.brand_name,t_batch.mark_selected,t_batch.id as "batch_id"
      from ((((((t_item
            inner join t_batch on t_batch.item_id = t_item.id )
            inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
            inner join t_lkp_category on t_lkp_category.id = t_item.category_id)
            left outer join t_lkp_sub_category on t_lkp_sub_category.id = t_item.sub_category_id)
            inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
            inner join t_inventory on t_inventory.item_id = t_item.id)
             where t_item.id = ${currentItemId} and t_inventory.location_id = 4 and t_lkp_category.available_for_ecomm = 1 and t_item.available_for_ecomm = 1 and t_batch.mark_selected = 1 and t_inventory.balance_type =1`);

    if (itemResults.length == 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Details for requested item not found",
      });
    }
    const item = await itemResults[0];
    const currentItem = await Inventory.findOne({
      where: {
        item_id: item.id,
        batch_id: item.batch_id,
        balance_type: 1,
        location_id: 4,
      },
    });
  
    let itemInWishlist;
    if (currentUser) {
      itemInWishlist = await WishlistItems.findOne({
        where: { cust_no: currentUser, item_id: item.id },
      });
    }

    const offer = await Offers.findOne({
      where: {
        is_active: 1,
        item_x: item.id,
        is_ecomm : 1
      },
    });
   console.log("offer:  "+offer);
    let itemIDOfOfferItem;
    let yItem;
    let typeDetails;
    let xItemDetails;
    let yItemDetails;
    let zItemDetails
    let yItemName
    let yItemImage
    if (offer) {
      typeDetails = await lkp_offers.findOne({
        where:{
          id: offer.type_id
        }
      })
      switch(offer.type_id){
        case 1:
          yItem = offer.item_y? offer.item_y : null
          if(offer.item_y){
            yItemDetails = await Item.findOne({
              where: { id: offer.item_y, active_ind: 'Y'},
            });
            console.log("yItemDetails "+yItemDetails.name)
            if(yItemDetails){
              yItemName = yItemDetails.name
              yItemImage = yItemDetails.image
            }
          }
          break;
        case 2:
          yItem = offer.item_y? offer.item_y : null
          break;
        case 3:
          yItem = []
          yItemName = []
          const allOffers = await Offers.findAll({
            where: {
              is_active: 1,
              item_x: item.id,
              is_ecomm : 1,
              type_id: 3
            },
          });
          if(allOffers){
            allOffers.map(async(eachOffer)=>{
              if(eachOffer.item_y){
                yItem.push(eachOffer.item_y)
                yItemDetails = await Item.findOne({
                  where: { id: eachOffer.item_y, active_ind: 'Y'},
                });
                console.log("yItemDetails "+yItemDetails)
                console.log("yItemDetails "+yItemDetails.name)
                if(yItemDetails){
                  if(yItemDetails.name){
                   yItemName.push(yItemDetails.name)
                  }
                }
              }
            })
            
          }
          break;
        case 4:
          yItem = offer.item_y? offer.item_y : null
          if(offer.item_y){
            yItemDetails = await Item.findOne({
              where: { id: offer.item_y, active_ind: 'Y'},
            });
            console.log("yItemDetails "+yItemDetails)
            if(yItemDetails){
              yItemName = yItemDetails.name
            }
          }
          break;
        case 5:
          yItem = offer.item_y? offer.item_y : null
          if(offer.item_y){
            yItemDetails = await Item.findOne({
              where: { id: offer.item_y, active_ind: 'Y'},
            });
            console.log("yItemDetails "+yItemDetails)
            if(yItemDetails){
              yItemName = yItemDetails.name
            }
          }
          break;
        default:
          console.log("GOD")          
      }
      
      if(offer.item_x){
        xItemDetails = await Item.findOne({
          where: { id: offer.item_x, active_ind: 'Y'},
        });
        console.log("xItemDetails "+xItemDetails)
      }
      if(offer.item_z){
        zItemDetails = await Item.findOne({
          where: { id: offer.item_z, active_ind: 'Y'},
        });
        console.log("zItemDetails "+zItemDetails)
      }  
      
    }

    // const coupons = await Coupons.findAll({
    //   where: {
    //     [Op.or]: [
    //       { item_id: item.id },
    //       { brand_id: item.brand_id },
    //       { cat_id: item.category_id },
    //       { sub_cat_id: item.sub_category_id },
    //     ],
    //   },
    // });

    const [coupons, metadata2] = await sequelize.query(`select *
    from t_coupons
    where t_coupons.item_id = ${item.id} OR t_coupons.cat_id = ${item.category_id} OR t_coupons.sub_cat_id = ${item.sub_category_id} or t_coupons.brand_id = ${item.brand_id} 
    or t_coupons.assigned_user = "${currentUser}" `);

    // const [couponForCurrentItem, metadataForCoupons] = await sequelize.query(
    //   `select t_coupons.code, t_coupons.amount_of_discount ,t_coupons.is_percentage ,t_coupons.description, t_coupons.expiry_date, t_coupons.created_at
    //   from ecomm.t_coupons where t_coupons.item_id = ${item.id} OR t_coupons.cat_id = ${item.category_id} OR t_coupons.sub_cat_id = ${item.sub_category_id} or t_coupons.brand_id = ${item.brand_id}`
    // );

    //t_coupons.code, t_coupons.amount_of_discount ,t_coupons.is_percentage ,t_coupons.description,t_coupons.expiry_date
    let promises = [];
    if (coupons.length != 0) {
      promises = coupons.map((current) => {
        if (current.expiry_date !== null) {
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          if (new Date(current.expiry_date) >= yesterday) {
            return current;
          }
        }
      });
    }

    let walletBalance = 0;
    if (item.cashback) {
      if (item.cashback_is_percentage) {
        walletBalance = (item.cashback / 100) * item.sale_price;
      } else {
        walletBalance = item.cashback;
      }
    }

    const resolved = await Promise.all(promises);
    const couponForCurrentItem = resolved.filter((current) => {
      return current != undefined;
    });
    
    
    return res.status(200).send({
      success: true,
      data: {
        itemName: item.name,
        showDiscount: item.show_discount,
        itemID: item.id,
        quantity: currentItem.quantity,
        UOM: item.UOM,
        categoryName: item.group_name,
        categoryID: item.category_id,
        subcategoryName: item.sub_cat_name,
        subcategoryID: item.sub_category_id,
        image: item.image,
        description: item.description,
        MRP: item.MRP,
        discount: item.discount,
        salePrice: item.sale_price,
        mfg_date: item.mfg_date,
        exp_date: item.expiry_date,
        color: item.color_name,
        brand: item.brand_name,
        cashback: currentItem.cashback ? currentItem.cashback : 0,
        cashback_is_percentage: currentItem.cashback_is_percentage
          ? true
          : false,
        inWishlist: currentUser ? (itemInWishlist ? true : false) : "",
        isOffer: offer ? true : false,
        offerTypeId: offer ? offer.type_id : null,
        offerTypeName: typeDetails ? typeDetails.offer_type : null,
        xItemId: offer ? 
                  offer.item_x ? offer.item_x : null
                 : null ,
        xItemName: xItemDetails ? xItemDetails.name? xItemDetails.name : null : null,         
        xItemImage: xItemDetails ? xItemDetails.image : null,  
        xItemQuantity: offer
          ? offer.item_x_quantity
            ? offer.item_x_quantity
            : null
          : null,
        yItemId: yItem ,
        yItemName:yItemName, 
        yItemImage: yItemImage,
        yItemQuantity: offer
          ? offer.item_y_quantity
            ? offer.item_y_quantity
            : null
          : null,
        zItemId: offer ? 
          offer.item_z ? offer.item_z : null
         : null ,
        zItemName: "", 
        zItemName:zItemDetails ? zItemDetails.name? zItemDetails.name : null : null,
        zItemQuantity: offer
          ? offer.item_z_quantity
            ? offer.item_z_quantity
            : null
          : null,  
        amountOfDiscount: offer
          ? offer.amount_of_discount
            ? offer.amount_of_discount
            : null
          : null,
        isPercentage: offer ? (offer.is_percentage ? true : false) : null,
        createdBy: offer ? (offer.created_by ? offer.created_by : "") : "",
        coupon: couponForCurrentItem ? couponForCurrentItem : "",
        howToUse: item.how_to_use ? item.how_to_use : "",
        ingredients: item.ingredients ? item.ingredients : "",
        manufacturerName: item.manufacturer_name ? item.manufacturer_name : "",
        countryOfOrigin: item.country_of_origin ? item.country_of_origin : "",
        isGrocery: item.is_grocernest === 1 ? true : false,
        walletBalanceApplicable: walletBalance,
      },
      message: "Details for requested item found",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Error occurred while trying to fetch item details, please check data field for more details",
    });
  }
};

const getAvailableQty = async (req, res, next) => {
  const { batch_id } = req.body;
  try {
    const batch = await Inventory.findOne({
      where: { batch_id, location_id: 4, balance_type: 1 },
    });

    if (!batch) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Required batch details not found",
      });
    }

    return res.status(200).send({
      success: true,
      data: batch.quantity,
      message: "Found available quantity for required batch",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Found available quantity of required item",
    });
  }
};

const getAllItemsInABrand = async (req, res, next) => {
  let currentUser = null;

  currentUser = await findCustomerNumber(req, res, next);

  console.log(currentUser);

  //Get category id from the request
  const { brandId } = req.params;
  try {
    const [itemsInACategory, metadata] =
      await sequelize.query(`select distinct t_item.id, t_item.name, t_item.show_discount,t_item.is_grocernest, t_item.brand_id,t_item.UOM, t_item.category_id ,t_item.sub_category_id ,
      t_item.image ,t_item.description ,t_item.available_for_ecomm ,t_batch.batch_no ,
      t_batch.location_id ,t_batch.MRP ,t_batch.discount ,t_batch.cost_price ,t_batch.mfg_date ,t_batch.sale_price ,
      t_batch.created_at,t_lkp_color.color_name, t_lkp_brand.brand_name, t_lkp_category.group_name, t_batch.mark_selected,t_batch.id as "batch_id"
      from (((((t_item
            inner join t_batch on t_batch.item_id = t_item.id )
            inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
            inner join t_lkp_category on t_lkp_category.id = t_item.category_id)
            inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
            inner join t_inventory on t_inventory.item_id = t_item.id)
             where t_lkp_brand.id = ${brandId} and t_inventory.location_id = 4 and t_lkp_category.available_for_ecomm = 1 and t_item.available_for_ecomm = 1 and t_batch.mark_selected = 1
             ORDER BY t_item.name;
    `);

    if (itemsInACategory.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Could not find items in requested brand",
      });
    }

    const promises = await itemsInACategory.map(async (current) => {
      let itemInWishlist;
      if (currentUser) {
        itemInWishlist = await WishlistItems.findOne({
          where: { cust_no: currentUser, item_id: current.id },
        });
      }

      const offer = await Offers.findOne({
        where: {
          is_active: 1,
          item_x: current.id,
          [Op.or]: [{ type_id: 1 }, { type_id: 2}],
          is_ecomm : 1
        },
      });

      let itemIDOfOfferItem;
      let offerItem;
      if (offer) {
        if (offer.type_id === 2) {
          itemIDOfOfferItem = offer.item_x;
        } else if (offer.type_id === 1) {
          itemIDOfOfferItem = offer.item_y;
        }
        offerItem = await Item.findOne({
          where: { id: itemIDOfOfferItem },
        });
      }

      return {
        itemName: current.name,
        showDiscount: current.show_discount,
        itemID: current.id,
        UOM: current.UOM,
        categoryName: current.group_name,
        categoryID: current.category_id,
        image: current.image,
        description: current.description,
        MRP: current.MRP,
        discount: current.discount,
        sale_price: current.sale_price,
        mfg_date: current.mfg_date,
        color: current.color_name,
        brand: current.brand_name,
        inWishlist: currentUser ? (itemInWishlist ? true : false) : "",
        isOffer: offer ? true : false,
        offerType: offer ? offer.type : "",
        itemIDOfOfferItem,
        XQuantity: offer
          ? offer.item_x_quantity
            ? offer.item_x_quantity
            : ""
          : "",
        YQuantity: offer
          ? offer.item_y_quantity
            ? offer.item_y_quantity
            : ""
          : "",
        YItemName: offerItem ? offerItem.name : "",
        amountOfDiscount: offer
          ? offer.amount_of_discount
            ? offer.amount_of_discount
            : ""
          : "",
        isPercentage: offer ? (offer.is_percentage ? true : false) : "",
        createdBy: offer ? (offer.created_by ? offer.created_by : "") : "",
        isGrocery: current.is_grocernest === 1 ? true : false,
      };
    });

    const resolved = await Promise.all(promises);
    const responseArray = [
      ...new Map(resolved.map((item) => [item["itemID"], item])).values(),
    ];

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Found the items belonging to requested brand",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Error occured while fetching items belonging to requested brand",
    });
  }
};

module.exports = {
  getItemsInCategory,
  getItemsInSubcategory,
  getItemsBySearchTerm,
  getItemById,
  getAvailableQty,
  getAllItemsInABrand,
};
