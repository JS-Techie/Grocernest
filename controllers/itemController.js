const { sequelize } = require("../models");
const db = require("../models");

const Item = db.ItemModel;
const Category = db.LkpCategoryModel;
const Subcategory = db.LkpSubCategoryModel;
const Brand = db.LkpBrandModel;
const Batch = db.BatchModel;
const Color = db.LkpColorModel;


const getItemsInCategory = async (req, res, next) => {
  //Get category id from the request
  const category = req.params.categoryId;
  try {
    const [itemsInACategory, metadata] =
      await sequelize.query(`select distinct t_item.id, t_item.name,t_item.brand_id,t_item.UOM ,t_item.category_id ,t_item.sub_category_id ,
      t_item.image ,t_item.description ,t_item.available_for_ecomm ,t_batch.batch_no ,
      t_batch.location_id ,t_batch.MRP ,t_batch.discount ,t_batch.cost_price ,t_batch.mfg_date ,t_batch.sale_price ,
      t_batch.created_at,t_lkp_color.color_name, t_lkp_brand.brand_name, t_lkp_category.group_name
      from (((((ecomm.t_item
            inner join t_batch on t_batch.item_id = t_item.id )
            inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
            inner join t_lkp_category on t_lkp_category.id = t_item.category_id)
            inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
            inner join t_inventory on t_inventory.item_id = t_item.id)
             where t_lkp_category.id = ${category} and t_inventory.location_id = 4 and t_lkp_category.available_for_ecomm = 1 and t_item.available_for_ecomm = 1;
    `);

    if (itemsInACategory.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Could not find items in requested category",
      });
    }

    const promises = await itemsInACategory.map(async (current) => {
      return {
        itemName: current.name,
        itemID: current.id,
        UOM: current.UOM,
        categoryName : current.group_name,
        categoryID : current.category_id,
        image: current.image,
        description: current.description,
        MRP: current.MRP,
        discount: current.discount,
        sale_price: current.sale_price,
        mfg_date: current.mfg_date,
        color: current.color_name,
        brand: current.brand_name,
      };
    });

    const responseArray = await Promise.all(promises);

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

//For subcategories, all sub_cat_id in items table is 0 and there is no subcategory with id = 0
const getItemsInSubcategory = async (req, res, next) => {
  //Get category and subcategory id from params
  const category = req.params.categoryId;
  const subcategory = req.params.subcategoryId;

  try {
    const [ItemsInASubcategory, metadata] =
      await sequelize.query(`select distinct t_item.id, t_item.name,t_item.brand_id,t_item.UOM ,t_item.category_id ,t_item.sub_category_id ,
    t_item.image ,t_item.description ,t_item.available_for_ecomm ,t_batch.batch_no ,
    t_batch.location_id ,t_batch.MRP ,t_batch.discount ,t_batch.cost_price ,t_batch.mfg_date ,t_batch.sale_price ,
    t_batch.created_at,t_lkp_color.color_name, t_lkp_brand.brand_name ,t_lkp_sub_category.sub_cat_name, t_lkp_category.group_name
    from ((((((ecomm.t_item
          inner join t_batch on t_batch.item_id = t_item.id )
          inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
          inner join t_lkp_category on t_lkp_category.id = t_item.category_id)
          inner join t_lkp_sub_category on t_lkp_sub_category.id = t_item.sub_category_id)
          inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
          inner join t_inventory on t_inventory.item_id = t_item.id)
           where t_lkp_category.id = ${category} and t_lkp_sub_category.id = ${subcategory} and t_inventory.location_id = 4 and t_lkp_category.available_for_ecomm = 1 and t_lkp_sub_category.available_for_ecomm = 1 and t_item.available_for_ecomm = 1;`);

    if (ItemsInASubcategory.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Could not find items in requested sub-category",
      });
    }

    const promises = ItemsInASubcategory.map(async (current) => {
      return {
        itemName: current.name,
        itemID: current.id,
        categoryID : current.category_id,
        categoryName : current.group_name,
        subcategoryID : current.sub_category_id,
        subcategoryName : current.sub_cat_name,
        UOM: current.UOM,
        image: current.image,
        description: current.description,
        MRP: current.MRP,
        discount: current.discount,
        sale_price: current.sale_price,
        mfg_date: current.mfg_date,
        color: current.color_name,
        brand: current.brand_name,
      };
    });

    const responseArray = await Promise.all(promises);

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

  try {
    const categories = await Category.findAll({
      where: { group_name: searchTerm },
      include: Item,
    });
    const subcategories = await Subcategory.findAll({
      where: { sub_cat_name: searchTerm },
      include: Item,
    });
    const brands = await Brand.findAll({
      where: { brand_name: searchTerm },
      include: Item,
    });
    const items = await Item.findAll({ where: { name: searchTerm } });

    if (
      items.length === 0 &&
      categories.length === 0 &&
      subcategories.length === 0 &&
      brands.length === 0
    ) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Nothing matches the search term",
      });
    }

    let categoryResponseArray;
    //let subcategoryResponseArray;
    let brandResponseArray;
    let itemResponseArray;

    if (categories.length !== 0) {
      const categoryPromises = categories[0].t_item_models.map(
        async (currentItem) => {
          const color = await Color.findOne({
            where: { id: currentItem.color_id },
          });

          const batch = await Batch.findOne({
            where: { item_id: currentItem.id },
          });

          const nameAndQuantity = await findNameAndQuantity(currentItem);
          const itemName = nameAndQuantity[0];
          const quantity = nameAndQuantity[1];
          const response = await responseFormat(
            "TBD",
            itemName,
            quantity,
            batch,
            currentItem.image,
            "TBD",
            color,
            currentItem.description
          );
          return response;
        }
      );

      categoryResponseArray = await Promise.all(categoryPromises);
    }

    if (brands.length !== 0) {
      const brandPromises = brands[0].t_item_models.map(async (currentItem) => {
        const color = await Color.findOne({
          where: { id: currentItem.color_id },
        });

        const batch = await Batch.findOne({
          where: { item_id: currentItem.id },
        });

        const nameAndQuantity = await findNameAndQuantity(currentItem);
        const itemName = nameAndQuantity[0];
        const quantity = nameAndQuantity[1];
        const response = await responseFormat(
          "TBD",
          itemName,
          quantity,
          batch,
          currentItem.image,
          "TBD",
          color,
          currentItem.description
        );
        return response;
      });

      brandResponseArray = await Promise.all(brandPromises);
    }

    if (items.length !== 0) {
      const brandPromises = items.map(async (currentItem) => {
        const color = await Color.findOne({
          where: { id: currentItem.color_id },
        });

        const batch = await Batch.findOne({
          where: { item_id: currentItem.id },
        });

        const nameAndQuantity = await findNameAndQuantity(currentItem);
        const itemName = nameAndQuantity[0];
        const quantity = nameAndQuantity[1];
        const response = await responseFormat(
          "TBD",
          itemName,
          quantity,
          batch,
          currentItem.image,
          "TBD",
          color,
          currentItem.description
        );
        return response;
      });

      itemResponseArray = await Promise.all(brandPromises);
    }

    return res.status(200).send({
      success: true,
      data: itemResponseArray
        ? itemResponseArray
        : categoryResponseArray
        ? categoryResponseArray
        : brandResponseArray
        ? brandResponseArray
        : null,
      message: "Found item/brand/subcategory/category matching search term",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error occured while fetching",
    });
  }
};

const getItemById = async (req, res, next) => {
  //Get the itemId from the params
  const currentItemId = req.params.itemId;

  try {
    //Find all the details of the item pertaining to current item id
    const [itemResults, metadata] =
      await sequelize.query(`select distinct t_item.id, t_item.name,t_item.brand_id,t_item.UOM ,t_item.category_id, t_lkp_category.group_name,t_item.sub_category_id , t_lkp_sub_category.sub_cat_name 
      ,t_item.image ,t_item.description ,t_item.available_for_ecomm ,t_batch.batch_no ,
      t_batch.location_id ,t_batch.MRP ,t_batch.discount ,t_batch.cost_price ,t_batch.mfg_date ,t_batch.sale_price ,
      t_batch.created_at,t_lkp_color.color_name,t_batch.quantity, t_lkp_brand.brand_name
      from ((((((ecomm.t_item
            inner join t_batch on t_batch.item_id = t_item.id )
            inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
            inner join t_lkp_category on t_lkp_category.id = t_item.category_id)
            INNER join t_lkp_sub_category on t_lkp_sub_category.id = t_item.sub_category_id)
            inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
            inner join t_inventory on t_inventory.item_id = t_item.id)
             where t_item.id = ${currentItemId} and t_inventory.location_id = 4 and t_lkp_category.available_for_ecomm = 1 and t_item.available_for_ecomm = 1 order by t_batch.created_at;`);

    if (itemResults.length == 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Details for requested item not found",
      });
    }
    const item = await itemResults[0];
    let quantity = 0;
    itemResults.map((current) => {
      quantity += current.quantity;
    });

    return res.status(200).send({
      success: true,
      data: {
        itemName: item.name,
        itemID: item.id,
        quantity: quantity,
        UOM: item.UOM,
        categoryName: item.group_name,
        categoryID: item.category_id,
        subcategoryName: item.sub_cat_name,
        subcategoryID: item.sub_category_id,
        image: item.image,
        description: item.description,
        MRP: item.MRP,
        discount: item.discount,
        sale_price: item.sale_price,
        mfg_date: item.mfg_date,
        color: item.color_name,
        brand: item.brand_name,
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

module.exports = {
  getItemsInCategory,
  getItemsInSubcategory,
  getItemsBySearchTerm,
  getItemById,
};
