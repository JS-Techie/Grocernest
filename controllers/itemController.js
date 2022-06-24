const db = require("../models");

const Item = db.ItemModel;
const Category = db.LkpCategoryModel;
const Subcategory = db.LkpSubCategoryModel;
const Brand = db.LkpBrandModel;
const Batch = db.BatchModel;
const Color = db.LkpColorModel;

const{
  responseFormat,
  findNameAndQuantity
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

module.exports = {
  getItemsInCategory,
  getItemsInSubcategory,
  getItemsBySearchTerm,
};
