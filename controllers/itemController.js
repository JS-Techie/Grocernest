const { sequelize } = require("../models");
const db = require("../models");

const Item = db.ItemModel;
const Category = db.LkpCategoryModel;
const Subcategory = db.LkpSubCategoryModel;
const Brand = db.LkpBrandModel;
const Batch = db.BatchModel;
const Color = db.LkpColorModel;

const {
  responseFormat,
  //findNameAndQuantity,
} = require("../services/itemsResponse");

const getItemsInCategory = async (req, res, next) => {
  //Get category id from the request
  const category = req.params.categoryId;
  try {
    //Search all items with that category id in items table
    const itemsInACategory = await Item.findAll({
      where: { category_id: category },
    });

    if (itemsInACategory.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Could not find items in requested category",
      });
    }

    const itemPromises = itemsInACategory.map(async (currentItem) => {
      const color = await Color.findOne({
        where: { id: currentItem.color_id },
      });

      const batch = await Batch.findOne({
        where: { item_id: currentItem.id },
      });

      const brand = await Brand.findOne({
        where : {id : currentItem.brand_id}
      })

      const response = await responseFormat(
        currentItem.id,
        currentItem.UOM,
        "TBD",
        currentItem.name,
        batch,
        currentItem.image,
        "TBD",
        color,
        currentItem.description,
        brand
      );

      return response;
    });

    const responseArray = await Promise.all(itemPromises);

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
    //search in items field using the params
    const ItemsInASubcategory = await Item.findAll({
      where: {
        sub_category_id: subcategory,
        category_id: category,
      },
    });

    if (ItemsInASubcategory.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Could not find items in requested sub-category",
      });
    }

    const itemPromises = ItemsInASubcategory.map(async (currentItem) => {
      const color = await Color.findOne({
        where: { id: currentItem.color_id },
      });

      const batch = await Batch.findOne({
        where: { item_id: currentItem.id },
      });

      const brand = await Brand.findOne({
        where : {id : currentItem.brand_id}
      })

    

      const response = await responseFormat(
        currentItem.id,
        currentItem.UOM,
        "TBD",
        currentItem.name,
        batch,
        currentItem.image,
        "TBD",
        color,
        currentItem.description,
        brand
      );

      return response;
    });

    const responseArray = await Promise.all(itemPromises);

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
      await sequelize.query(`select t_item.id, t_item.name,t_item.brand_id,t_item.category_id ,t_item.sub_category_id ,t_item.color_id ,t_item.image ,t_item.description ,t_item.available_for_ecomm ,t_batch.batch_no ,t_batch.location_id ,t_batch.MRP ,t_batch.discount ,t_batch.cost_price ,t_batch.mfg_date ,t_batch.sale_price ,t_batch.created_at ,t_inventory.quantity  from ((ecomm.t_item
      inner join t_batch on t_batch.item_id = t_item.id )
      inner join t_inventory on t_inventory.item_id = t_item.id) where t_item.id = ${currentItemId} AND t_batch.location_id = 4 ORDER by t_batch.created_at`);

    if (itemResults.length == 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Details for requested item not found",
      });
    }

    const item = itemResults[0];

    const color = await Color.findOne({
      where: { id: item.color_id },
    });

    const category = await Category.findOne({
      where: { id: item.category_id },
    });

    const subcategory = await Subcategory.findOne({
      where: { id: item.sub_category_id },
    });

    const brand = await Brand.findOne({
      where: { id: item.brand_id },
    });

    let quantity = 0;
    itemResults.map((current) => {  
      quantity+= current.quantity;
    });

    return res.status(200).send({
      success: true,
      data: {
        itemId: item ? item.id : "Could not find item",
        itemName: item ? item.name : "No name for item",
        quantity: quantity,
        category : category ? category.group_name : "Could not find category name",
        subcategory : subcategory ? subcategory.sub_cat_name : "Could not find subcategory for requested item",
        color : color.color_name,
        brand : brand ? brand.brand_name : "Could not find brand name",
        image: item ? item.image : "Could not find image",
        description: item
          ? item.description
          : "Could not find description",
        MRP: item ? item.MRP : "No MRP",
        discount: item ? item.discount : "NO discount",
        mfg: item? item.mfg_date : "NO MFG date",
       
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
