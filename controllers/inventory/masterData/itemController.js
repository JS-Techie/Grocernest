const { sequelize } = require("../../../models");
const { Op } = require("sequelize");

const db = require("../../../models");
const Item = db.ItemModel;
const ItemTaxInfo = db.ItemTaxInfoModel;
const Brand = db.LkpBrandModel;
const Category = db.LkpCategoryModel;
const SubCategory = db.LkpSubCategoryModel;
const Department = db.LkpDepartmentModel;
const Size = db.LkpSizeModel
const querystring = require("querystring");

const {
  findAllActiveItems,
  findAllDeactiveItems,
  getInventoryArray,
  getItemTaxArray,
  validateItemForSaveAndUpdate,
  updateTaxTypes,
  makeTaxInfoArray,
  newTaxItemInfo,
} = require("../../../services/inventory/itemServices");

const {
  uploadImageToS3,
  deleteImageFromS3,
} = require("../../../services/s3Service");

const getAllItem = async (req, res, next) => {
  const { pageNo, pageSize } = req.body;
  try {
    // if (!active_ind) {
    //   return res.status(200).send({
    //     status: 400,
    //     message: "Please input the active ind",
    //     data: [],
    //   });
    // }

    const offset = parseInt(pageNo * pageSize);
    const limit = parseInt(pageSize);
    const [countItems, metadata1] = await sequelize.query(
      `select count(*) as count from t_item `
    );
    const [allItems, metadata] =
      await sequelize.query(`select  t_item.created_by , t_item.created_at , t_item.updated_by, t_item.updated_at , t_item.id ,t_item.name ,t_item.item_cd ,t_item.UOM ,t_item.units ,t_item.brand_id ,t_lkp_brand.brand_name ,t_item.div_id ,t_lkp_division.div_name ,t_item.category_id ,t_lkp_category.group_name ,t_lkp_category.HSN_CODE ,t_item.sub_category_id ,t_lkp_sub_category.sub_cat_name ,t_item.department_id ,t_lkp_department.dept_name ,t_item.color_id ,t_lkp_color.color_name ,t_item.size_id ,t_lkp_size.size_cd ,t_item.active_ind ,t_item.image ,t_item.description ,t_item.how_to_use ,t_item.country_of_origin ,t_item.manufacturer_name ,t_item.ingredients ,t_item.available_for_ecomm ,t_item.is_gift ,t_item.is_grocernest ,t_item.show_discount 
      from (((((((t_item 
      inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id )
      inner join t_lkp_category on t_lkp_category.id = t_item.category_id )
      inner join t_lkp_division  on t_lkp_division.id = t_item.div_id )
      inner join t_lkp_sub_category on t_lkp_sub_category.id = t_item.sub_category_id )
      inner join t_lkp_department on t_lkp_department.id = t_item.department_id )
      inner join t_lkp_color on t_lkp_color.id = t_item.color_id )
      inner join t_lkp_size on t_lkp_size.id = t_item.size_id ) limit ${limit} offset ${offset} `);

    if (allItems.length === 0) {
      return res.status(200).send({
        status: 400,
        message: "All items not found",
        data: [],
      });
    }
    // console.log("========================>>>>>>>>>>>>>>",allItems)

    const promises = allItems.map((current) => {
      return {
        id: current.id,
        name: current.name,
        itemCode: current.item_cd,
        uom: current.UOM,
        units: current.units,
        brandName: current.brand_name,
        divisionName: current.div_name,
        categoryName: current.group_name,
        hsnCode: current.HSN_CODE,
        subCategoryName: current.sub_cat_name,
        departmentName: current.dept_name,
        colour: current.color_name,
        size: current.size_cd,
        brandId: current.brand_id,
        divisionId: current.div_id,
        categoryId: current.category_id,
        subCategoryId: current.sub_category_id,
        departmentId: current.department_id,
        colourId: current.color_id,
        sizeId: current.size_id,
        isActive: current.active_ind,
        lowStockQuantity: null,
        image: current.image,
        description: current.description,
        howToUse: current.how_to_use,
        countryOfOrigin: current.country_of_origin,
        manufactureName: current.manufacturer_name,
        ingredients: current.ingredients,
        isAvailableForEcomm: current.available_for_ecomm,
        isGift: current.is_gift,
        isGrocernest: current.is_grocernest,
        showDiscount: current.show_discount,
      };
    });

    const resolved = await Promise.all(promises);

    return res.status(200).send({
      status: 200,
      message: "Successfully retrieved all item data",
      data: {
        totalItems: countItems[0].count,
        totalPages: Math.ceil(allItems.length / parseInt(pageSize)),
        currentPage: pageNo,
        items: resolved,
        //.slice(pageSize * pageNo, pageSize * pageNo + pageSize),
      },
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , Please try again in sometimes",
      data: error.message,
    });
  }
};

const getActiveItem = async (req, res, next) => {
  let { pageNo, pageSize } = req.body;
  pageNo = parseInt(pageNo);
  pageSize = parseInt(pageSize);
  try {
    const allActiveItems = await findAllActiveItems();

    if (allActiveItems.length === 0) {
      return res.status(200).send({
        status: 404,
        message: "All active items not found",
        data: [],
      });
    }
    const promises = allActiveItems.map((current) => {
      return {
        id: current.id,
        name: current.name,
        itemCode: current.item_cd,
        uom: current.UOM,
        units: current.units,
        brandName: current.brand_name,
        divisionName: current.div_name,
        categoryName: current.group_name,
        hsnCode: current.HSN_CODE,
        subCategoryName: current.sub_cat_name,
        departmentName: current.dept_name,
        colour: current.color_name,
        size: current.size_cd,
        brandId: current.brand_id,
        divisionId: current.div_id,
        categoryId: current.category_id,
        subCategoryId: current.sub_category_id,
        departmentId: current.department_id,
        colourId: current.color_id,
        sizeId: current.size_id,
        isActive: current.active_ind,
        lowStockQuantity: null,
        image: current.image,
        description: current.description,
        howToUse: current.how_to_use,
        countryOfOrigin: current.country_of_origin,
        manufactureName: current.manufacturer_name,
        ingredients: current.ingredients,
        isAvailableForEcomm: current.available_for_ecomm,
        isGift: current.is_gift,
        isGrocernest: current.is_grocernest,
        showDiscount: current.show_discount,
      };
    });

    const resolved = await Promise.all(promises);

    // console.log("Start Index", pageSize * pageNo);
    // console.log("End Index", (pageSize * pageNo) + pageSize)

    return res.status(200).send({
      status: 200,
      message: "Successfully retrieved all active item data",
      data: {
        totalItems: allActiveItems.length,
        totalPages: Math.ceil(allActiveItems.length / parseInt(pageSize)),
        currentPage: pageNo,
        items: resolved.slice(pageSize * pageNo, pageSize * pageNo + pageSize),
      },
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , please try again later",
      data: error.message,
    });
  }
};

const getDeactiveItem = async (req, res, next) => {
  let { pageNo, pageSize } = req.body;
  pageNo = parseInt(pageNo);
  pageSize = parseInt(pageSize);
  try {
    const allDeactiveItems = await findAllDeactiveItems();

    if (allDeactiveItems.length === 0) {
      return res.status(200).send({
        status: 404,
        message: "All deactive items not found",
        data: [],
      });
    }
    const promises = allDeactiveItems.map((current) => {
      return {
        id: current.id,
        name: current.name,
        itemCode: current.item_cd,
        uom: current.UOM,
        units: current.units,
        brandName: current.brand_name,
        divisionName: current.div_name,
        categoryName: current.group_name,
        hsnCode: current.HSN_CODE,
        subCategoryName: current.sub_cat_name,
        departmentName: current.dept_name,
        colour: current.color_name,
        size: current.size_cd,
        brandId: current.brand_id,
        divisionId: current.div_id,
        categoryId: current.category_id,
        subCategoryId: current.sub_category_id,
        departmentId: current.department_id,
        colourId: current.color_id,
        sizeId: current.size_id,
        isActive: current.active_ind,
        lowStockQuantity: null,
        image: current.image,
        description: current.description,
        howToUse: current.how_to_use,
        countryOfOrigin: current.country_of_origin,
        manufactureName: current.manufacturer_name,
        ingredients: current.ingredients,
        isAvailableForEcomm: current.available_for_ecomm,
        isGift: current.is_gift,
        isGrocernest: current.is_grocernest,
        showDiscount: current.show_discount,
      };
    });

    const resolved = await Promise.all(promises);

    let startIndex = 0;
    let endIndex = 0;

    if (pageNo * pageSize < allDeactiveItems.length) {
      startIndex = 0;
    } else {
      startIndex = pageNo * pageSize;
    }

    if (pageSize * pageNo + pageSize < allDeactiveItems.length) {
      endIndex = pageSize * pageNo + pageSize;
    } else {
      endIndex = allDeactiveItems.length;
    }

    return res.status(200).send({
      status: 200,
      message: "Successfully retrieved all deactive item data",
      data: {
        totalItems: allDeactiveItems.length,
        totalPages: Math.ceil(allDeactiveItems.length / parseInt(pageSize)),
        currentPage: pageNo,
        items: resolved.slice(startIndex, endIndex),
      },
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , please try again later",
      data: error.message,
    });
  }
};

const activeItem = async (req, res, next) => {
  const { itemIdList } = req.body;

  try {
    if (itemIdList.length === 0) {
      return res.status(200).send({
        status: 500,
        message: "Item id list not found",
        data: [],
      });
    }
    const promises = itemIdList.map(async (currentItem) => {
      const current = await Item.findOne({
        where: { id: currentItem },
      });
      if (current) {
        const activeItem = await Item.update(
          {
            active_ind: "Y",
          },
          {
            where: { id: currentItem },
          }
        );
        const updatedItem = await Item.findOne({
          where: { id: currentItem },
        });
      }

      return {
        id: current.id,
        name: current.name,
        itemCode: current.item_cd,
        uom: current.UOM,
        units: current.units,
        brandName: current.brand_name,
        divisionName: current.div_name,
        categoryName: current.group_name,
        hsnCode: current.HSN_CODE,
        subCategoryName: current.sub_cat_name,
        departmentName: current.dept_name,
        colour: current.color_name,
        size: current.size_cd,
        brandId: current.brand_id,
        divisionId: current.div_id,
        categoryId: current.category_id,
        subCategoryId: current.sub_category_id,
        departmentId: current.department_id,
        colourId: current.color_id,
        sizeId: current.size_id,
        isActive: "Y",
        lowStockQuantity: null,
        image: current.image,
        description: current.description,
        howToUse: current.how_to_use,
        countryOfOrigin: current.country_of_origin,
        manufactureName: current.manufacturer_name,
        ingredients: current.ingredients,
        isAvailableForEcomm: current.available_for_ecomm,
        isGift: current.is_gift,
        isGrocernest: current.is_grocernest,
        showDiscount: current.show_discount,
      };
    });
    const resolved = await Promise.all(promises);

    return res.status(200).send({
      status: 200,
      message: "Successfully activated the item",
      data: resolved,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , please try again later",
      data: error.message,
    });
  }
};

const deactiveItem = async (req, res, next) => {
  const { itemIdlist } = req.body;

  try {
    if (itemIdlist.length == 0) {
      return res.status(200).send({
        status: 500,
        message: "Item id list not found",
        data: [],
      });
    }
    const promises = itemIdlist.map(async (currentItem) => {
      const current = await Item.findOne({
        where: { id: currentItem },
      });
      if (current) {
        const deactiveItem = await Item.update(
          {
            active_ind: "N",
          },
          {
            where: { id: currentItem },
          }
        );
        return {
          id: current.id,
          name: current.name,
          itemCode: current.item_cd,
          uom: current.UOM,
          units: current.units,
          brandName: current.brand_name,
          divisionName: current.div_name,
          categoryName: current.group_name,
          hsnCode: current.HSN_CODE,
          subCategoryName: current.sub_cat_name,
          departmentName: current.dept_name,
          colour: current.color_name,
          size: current.size_cd,
          brandId: current.brand_id,
          divisionId: current.div_id,
          categoryId: current.category_id,
          subCategoryId: current.sub_category_id,
          departmentId: current.department_id,
          colourId: current.color_id,
          sizeId: current.size_id,
          isActive: "N",
          lowStockQuantity: null,
          image: current.image,
          description: current.description,
          howToUse: current.how_to_use,
          countryOfOrigin: current.country_of_origin,
          manufactureName: current.manufacturer_name,
          ingredients: current.ingredients,
          isAvailableForEcomm: current.available_for_ecomm,
          isGift: current.is_gift,
          isGrocernest: current.is_grocernest,
          showDiscount: current.show_discount,
        };
      }
    });

    const resolved = await Promise.all(promises);

    return res.status(200).send({
      status: 200,
      message: "Successfully deactivated the item",
      data: resolved,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , please try again later",
      data: error.message,
    });
  }
};

const getItemByItemId = async (req, res, next) => {
  // const query = req.query;

  const searchAllLocation = req.query.searchAllLocation;
  const includeTaxDetails = req.query.includeTaxDetails;
  const itemId = req.query.itemId;
  // console.log(searchAllLocation);
  // console.log(includeTaxDetails);
  // console.log(itemId);

  try {
    if (searchAllLocation == "N" && includeTaxDetails == "Y") {
      const getItemById = await Item.findOne({
        where: { id: itemId },
      });
      if (!getItemById) {
        return res.status(200).send({
          status: 400,
          message: "Requested id  not foound",
          data: [],
        });
      }
      const inventoryResolved = await getInventoryArray(itemId);

      const response = {
        createdBy: getItemById.created_by,
        createdAt: getItemById.created_at,
        updatedBy: getItemById.updated_by,
        updatedAt: getItemById.updated_at,
        isActive: getItemById.active_ind,
        id: getItemById.id,
        name: getItemById.name,
        itemCode: getItemById.item_cd,
        uom: getItemById.UOM,
        units: getItemById.units,
        brandId: getItemById.brand_id,
        divisionId: getItemById.div_id,
        categoryId: getItemById.category_id,
        subCategoryId: getItemById.sub_category_id,
        departmentId: getItemById.department_id,
        colourId: getItemById.color_id,
        sizeId: getItemById.size_id,
        availableForEcomm: getItemById.available_for_ecomm,
        isGift: getItemById.is_gift,
        isGrocernest: getItemById.is_grocernest,
        image: getItemById.image,
        description: getItemById.description,
        howToUse: getItemById.how_to_use,
        countryOfOrigin: getItemById.country_of_origin,
        manufactureName: getItemById.manufacturer_name,
        ingredients: getItemById.ingredients,
        showDiscount: getItemById.show_discount,
        itemTaxInfoList: null,
        stockFromInventory: inventoryResolved,
        availableBatches: null,
      };
      return res.status(200).send({
        status: 200,
        message: "Successfully fetched the item by item id",
        data: response,
      });
    }
    if (searchAllLocation == "Y" && includeTaxDetails == "N") {
      const getItemById = await Item.findOne({
        where: { id: itemId },
      });
      if (!getItemById) {
        return res.status(200).send({
          status: 400,
          message: "Requested id not found",
          data: [],
        });
      }
      const inventoryResolved = await getInventoryArray(itemId);

      const response = {
        createdBy: getItemById.created_by,
        createdAt: getItemById.created_at,
        updatedBy: getItemById.updated_by,
        updatedAt: getItemById.updated_at,
        isActive: getItemById.active_ind,
        id: getItemById.id,
        name: getItemById.name,
        itemCode: getItemById.item_cd,
        uom: getItemById.UOM,
        units: getItemById.units,
        brandId: getItemById.brand_id,
        divisionId: getItemById.div_id,
        categoryId: getItemById.category_id,
        subCategoryId: getItemById.sub_category_id,
        departmentId: getItemById.department_id,
        colourId: getItemById.color_id,
        sizeId: getItemById.size_id,
        availableForEcomm: getItemById.available_for_ecomm,
        isGift: getItemById.is_gift,
        isGrocernest: getItemById.is_grocernest,
        image: getItemById.image,
        description: getItemById.description,
        howToUse: getItemById.how_to_use,
        countryOfOrigin: getItemById.country_of_origin,
        manufactureName: getItemById.manufacturer_name,
        ingredients: getItemById.ingredients,
        showDiscount: getItemById.show_discount,
        itemTaxInfoList: null,
        stockFromInventory: inventoryResolved,
        availableBatches: null,
      };
      return res.status(200).send({
        status: 200,
        message: "Successfully fetched the requested item by item id",
        data: response,
      });
    }
    if (searchAllLocation == "N" && includeTaxDetails == "N") {
      const getItemById = await Item.findOne({
        where: { id: itemId },
      });
      if (!getItemById) {
        return res.status(200).send({
          status: 400,
          message: "Requested id not found",
          data: [],
        });
      }
      const inventoryResolved = await getInventoryArray(itemId);

      const response = {
        createdBy: getItemById.created_by,
        createdAt: getItemById.created_at,
        updatedBy: getItemById.updated_by,
        updatedAt: getItemById.updated_at,
        isActive: getItemById.active_ind,
        id: getItemById.id,
        name: getItemById.name,
        itemCode: getItemById.item_cd,
        uom: getItemById.UOM,
        units: getItemById.units,
        brandId: getItemById.brand_id,
        divisionId: getItemById.div_id,
        categoryId: getItemById.category_id,
        subCategoryId: getItemById.sub_category_id,
        departmentId: getItemById.department_id,
        colourId: getItemById.color_id,
        sizeId: getItemById.size_id,
        availableForEcomm: getItemById.available_for_ecomm,
        isGift: getItemById.is_gift,
        isGrocernest: getItemById.is_grocernest,
        image: getItemById.image,
        description: getItemById.description,
        howToUse: getItemById.how_to_use,
        countryOfOrigin: getItemById.country_of_origin,
        manufactureName: getItemById.manufacturer_name,
        ingredients: getItemById.ingredients,
        showDiscount: getItemById.show_discount,
        itemTaxInfoList: null,
        stockFromInventory: inventoryResolved,
        availableBatches: null,
      };
      return res.status(200).send({
        status: 200,
        message: "Successfully fetched the requested item by item id",
        data: response,
      });
    }
    if (searchAllLocation == "Y" && includeTaxDetails == "Y") {
      const getItemById = await Item.findOne({
        where: { id: itemId },
      });
      if (!getItemById) {
        return res.status(200).send({
          status: 400,
          message: "Requested id not found",
          data: [],
        });
      }
      const inventoryResolved = await getInventoryArray(itemId);

      const response = {
        createdBy: getItemById.created_by,
        createdAt: getItemById.created_at,
        updatedBy: getItemById.updated_by,
        updatedAt: getItemById.updated_at,
        isActive: getItemById.active_ind,
        id: getItemById.id,
        name: getItemById.name,
        itemCode: getItemById.item_cd,
        uom: getItemById.UOM,
        units: getItemById.units,
        brandId: getItemById.brand_id,
        divisionId: getItemById.div_id,
        categoryId: getItemById.category_id,
        subCategoryId: getItemById.sub_category_id,
        departmentId: getItemById.department_id,
        colourId: getItemById.color_id,
        sizeId: getItemById.size_id,
        availableForEcomm: getItemById.available_for_ecomm,
        isGift: getItemById.is_gift,
        isGrocernest: getItemById.is_grocernest,
        image: getItemById.image,
        description: getItemById.description,
        howToUse: getItemById.how_to_use,
        countryOfOrigin: getItemById.country_of_origin,
        manufactureName: getItemById.manufacturer_name,
        ingredients: getItemById.ingredients,
        showDiscount: getItemById.show_discount,
        itemTaxInfoList: null,
        stockFromInventory: inventoryResolved,
        availableBatches: null,
      };
      return res.status(200).send({
        status: 200,
        message: "Successfully fetched the requested item by item id",
        data: response,
      });
    }
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong, please try again later",
      data: error.message,
    });
  }
};

const getItemByItemCode = async (req, res, next) => {
  const searchAllLocation = req.query.searchAllLocation;
  const includeTaxDetails = req.query.includeTaxDetails;
  const itemCode = req.query.itemCode;

  try {
    if (searchAllLocation == "N" && includeTaxDetails == "Y") {
      const getItemByCode = await Item.findOne({
        where: {
          item_cd: itemCode,
        },
      });
      if (!getItemByCode) {
        return res.status(200).send({
          status: 400,
          message: "Item code not found",
          data: [],
        });
      }
      const taxInfoSolved = await getItemTaxArray(getItemByCode.id);
      const inventoryResolved = await getInventoryArray(getItemByCode.id);

      const response = {
        createdBy: getItemByCode.created_by,
        createdAt: getItemByCode.created_at,
        updatedBy: getItemByCode.updated_by,
        updatedAt: getItemByCode.updated_at,
        isActive: getItemByCode.active_ind,
        id: getItemByCode.id,
        name: getItemByCode.name,
        itemCode: getItemByCode.item_cd,
        uom: getItemByCode.UOM,
        units: getItemByCode.units,
        brandId: getItemByCode.brand_id,
        divisionId: getItemByCode.div_id,
        categoryId: getItemByCode.category_id,
        subCategoryId: getItemByCode.sub_category_id,
        departmentId: getItemByCode.department_id,
        colourId: getItemByCode.color_id,
        sizeId: getItemByCode.size_id,
        availableForEcomm: getItemByCode.available_for_ecomm,
        isGift: getItemByCode.is_gift,
        isGrocernest: getItemByCode.is_grocernest,
        image: getItemByCode.image,
        description: getItemByCode.description,
        howToUse: getItemByCode.how_to_use,
        countryOfOrigin: getItemByCode.country_of_origin,
        manufactureName: getItemByCode.manufacturer_name,
        ingredients: getItemByCode.ingredients,
        showDiscount: getItemByCode.show_discount,
        itemTaxInfoList: taxInfoSolved,
        stockFromInventory: inventoryResolved,
        availableBatches: null,
      };
      return res.status(200).send({
        status: 200,
        message: "Successfully fetched the item by item code",
        data: response,
      });
    }
    if (searchAllLocation == "N" && includeTaxDetails == "N") {
      const getItemByCode = await Item.findOne({
        where: {
          item_cd: itemCode,
        },
      });
      if (!getItemByCode) {
        return res.status(200).send({
          status: 400,
          message: "Item code not found",
          data: [],
        });
      }
      const taxInfoSolved = await getItemTaxArray(getItemByCode.id);
      const inventoryResolved = await getInventoryArray(getItemByCode.id);

      const response = {
        createdBy: getItemByCode.created_by,
        createdAt: getItemByCode.created_at,
        updatedBy: getItemByCode.updated_by,
        updatedAt: getItemByCode.updated_at,
        isActive: getItemByCode.active_ind,
        id: getItemByCode.id,
        name: getItemByCode.name,
        itemCode: getItemByCode.item_cd,
        uom: getItemByCode.UOM,
        units: getItemByCode.units,
        brandId: getItemByCode.brand_id,
        divisionId: getItemByCode.div_id,
        categoryId: getItemByCode.category_id,
        subCategoryId: getItemByCode.sub_category_id,
        departmentId: getItemByCode.department_id,
        colourId: getItemByCode.color_id,
        sizeId: getItemByCode.size_id,
        availableForEcomm: getItemByCode.available_for_ecomm,
        isGift: getItemByCode.is_gift,
        isGrocernest: getItemByCode.is_grocernest,
        image: getItemByCode.image,
        description: getItemByCode.description,
        howToUse: getItemByCode.how_to_use,
        countryOfOrigin: getItemByCode.country_of_origin,
        manufactureName: getItemByCode.manufacturer_name,
        ingredients: getItemByCode.ingredients,
        showDiscount: getItemByCode.show_discount,
        itemTaxInfoList: taxInfoSolved,
        stockFromInventory: inventoryResolved,
        availableBatches: null,
      };
      return res.status(200).send({
        status: 200,
        message: "Successfully fetched the item by item code",
        data: response,
      });
    }
    if (searchAllLocation == "Y" && includeTaxDetails == "N") {
      const getItemByCode = await Item.findOne({
        where: {
          item_cd: itemCode,
        },
      });
      if (!getItemByCode) {
        return res.status(200).send({
          status: 400,
          message: "Item code not found",
          data: [],
        });
      }
      const taxInfoSolved = await getItemTaxArray(getItemByCode.id);
      const inventoryResolved = await getInventoryArray(getItemByCode.id);

      const response = {
        createdBy: getItemByCode.created_by,
        createdAt: getItemByCode.created_at,
        updatedBy: getItemByCode.updated_by,
        updatedAt: getItemByCode.updated_at,
        isActive: getItemByCode.active_ind,
        id: getItemByCode.id,
        name: getItemByCode.name,
        itemCode: getItemByCode.item_cd,
        uom: getItemByCode.UOM,
        units: getItemByCode.units,
        brandId: getItemByCode.brand_id,
        divisionId: getItemByCode.div_id,
        categoryId: getItemByCode.category_id,
        subCategoryId: getItemByCode.sub_category_id,
        departmentId: getItemByCode.department_id,
        colourId: getItemByCode.color_id,
        sizeId: getItemByCode.size_id,
        availableForEcomm: getItemByCode.available_for_ecomm,
        isGift: getItemByCode.is_gift,
        isGrocernest: getItemByCode.is_grocernest,
        image: getItemByCode.image,
        description: getItemByCode.description,
        howToUse: getItemByCode.how_to_use,
        countryOfOrigin: getItemByCode.country_of_origin,
        manufactureName: getItemByCode.manufacturer_name,
        ingredients: getItemByCode.ingredients,
        showDiscount: getItemByCode.show_discount,
        itemTaxInfoList: taxInfoSolved,
        stockFromInventory: inventoryResolved,
        availableBatches: null,
      };
      return res.status(200).send({
        status: 200,
        message: "Successfully fetched the item by item code",
        data: response,
      });
    }
    if (searchAllLocation == "Y" && includeTaxDetails == "Y") {
      const getItemByCode = await Item.findOne({
        where: {
          item_cd: itemCode,
        },
      });
      if (!getItemByCode) {
        return res.status(200).send({
          status: 400,
          message: "Item code not found",
          data: [],
        });
      }
      const taxInfoSolved = await getItemTaxArray(getItemByCode.id);
      const inventoryResolved = await getInventoryArray(getItemByCode.id);

      const response = {
        createdBy: getItemByCode.created_by,
        createdAt: getItemByCode.created_at,
        updatedBy: getItemByCode.updated_by,
        updatedAt: getItemByCode.updated_at,
        isActive: getItemByCode.active_ind,
        id: getItemByCode.id,
        name: getItemByCode.name,
        itemCode: getItemByCode.item_cd,
        uom: getItemByCode.UOM,
        units: getItemByCode.units,
        brandId: getItemByCode.brand_id,
        divisionId: getItemByCode.div_id,
        categoryId: getItemByCode.category_id,
        subCategoryId: getItemByCode.sub_category_id,
        departmentId: getItemByCode.department_id,
        colourId: getItemByCode.color_id,
        sizeId: getItemByCode.size_id,
        availableForEcomm: getItemByCode.available_for_ecomm,
        isGift: getItemByCode.is_gift,
        isGrocernest: getItemByCode.is_grocernest,
        image: getItemByCode.image,
        description: getItemByCode.description,
        howToUse: getItemByCode.how_to_use,
        countryOfOrigin: getItemByCode.country_of_origin,
        manufactureName: getItemByCode.manufacturer_name,
        ingredients: getItemByCode.ingredients,
        showDiscount: getItemByCode.show_discount,
        itemTaxInfoList: taxInfoSolved,
        stockFromInventory: inventoryResolved,
        availableBatches: null,
      };
      return res.status(200).send({
        status: 200,
        message: "Successfully fetched the item by item code",
        data: response,
      });
    }
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , please try again later",
      data: error.message,
    });
  }
};

const fetchItembyItemCode = async (req, res, next) => {
  const { itemCode } = req.params;
  try {
    if (!itemCode) {
      return res.status(200).send({
        status: 400,
        message: "Please enter the item code",
        data: [],
      });
    }

    const [getItemss, metadata] = await sequelize.query(`select 
  t_item.id, 
  t_item.name,
  t_item.item_cd,
  t_item.uom,
  t_item.units,
  t_item.active_ind,
  t_item.image,
  t_item.description,
  t_item.how_to_use,
  t_item.country_of_origin,
  t_item.manufacturer_name,
  t_item.ingredients,
  t_item.available_for_ecomm,
  t_item.is_gift,
  t_item.is_grocernest,
  t_item.show_discount,
  t_item.brand_id,
  t_lkp_brand.brand_name,
  t_item.div_id,
  t_lkp_division.div_name,
  t_item.category_id,
  t_lkp_category.group_name,
  t_lkp_category.HSN_CODE,
  t_item.sub_category_id,
  t_lkp_sub_category.sub_cat_name,
  t_item.department_id,
  t_lkp_department.dept_name,
  t_item.color_id,
  t_lkp_color.color_name,
  t_item.size_id,
  t_lkp_size.size_cd,
  t_low_stock_config.low_stock_qnty
  from 
  ((((((((t_item
    inner join t_lkp_brand on t_item.brand_id=t_lkp_brand.id)
    inner join t_lkp_division on t_item.div_id= t_lkp_division.id)
    inner join t_lkp_category on t_item.category_id= t_lkp_category.id)
    inner join t_lkp_sub_category on t_item.sub_category_id = t_lkp_sub_category.id)
    inner join t_lkp_department on t_item.department_id =t_lkp_department.id)
    inner join t_lkp_color on t_item.color_id = t_lkp_color.id)
    inner join t_lkp_size on t_item.size_id = t_lkp_size.id)
    inner join t_low_stock_config on t_item.id = t_low_stock_config.item_id)
  where t_item.item_cd = '${itemCode}'
    `);
    // console.log(typeof getItems);

    // console.log(" ================ Items array ================", getItemss);

    if (getItemss.length === 0) {
      return res.status(200).send({
        status: 400,
        message: "Requested item code doesnot exist1  ",
        data: [],
      });
    }

    const getItems = getItemss[0];

    // console.log("Item", getItems);

    const response = {
      id: getItems.id,
      name: getItems.name,
      itemCode: getItems.item_cd,
      uom: getItems.UOM,
      units: getItems.units,
      brandName: getItems.brand_name,
      divisionName: getItems.div_name,
      categoryName: getItems.group_name,
      hsnCode: getItems.HSN_CODE,
      subCategoryName: getItems.sub_cat_name,
      departmentName: getItems.dept_name,
      colour: getItems.color_name,
      size: getItems.size_cd,
      brandId: getItems.brand_id,
      divisionId: getItems.div_id,
      categoryId: getItems.category_id,
      subCategoryId: getItems.sub_category_id,
      departmentId: getItems.department_id,
      colourId: getItems.color_id,
      sizeId: getItems.size_id,
      isActive: getItems.active_ind,
      lowStockQuantity: getItems.low_stock_qnty,
      image: getItems.image,
      description: getItems.description,
      howToUse: getItems.how_to_use,
      countryOfOrigin: getItems.country_of_origin,
      manufactureName: getItems.manufacturer_name,
      ingredients: getItems.ingredients,
      isAvailableForEcomm: getItems.available_for_ecomm,
      isGift: getItems.is_gift,
      isGrocernest: getItems.is_grocernest,
      showDiscount: getItems.show_discount,
    };
    return res.status(200).send({
      status: 200,
      message: "Fetched the item by itemCode",
      data: response,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , please try again later",
      data: error.message,
    });
  }
};
const getItemData = async (req, res, next) => {
  const {
    brandIdList,
    categoryIdList,
    colorIdList,
    sizeIdList,
    departmentIdList,
    subCategoryIdList,
  } = req.body;
  try {
    const  getItemDetails = await Item.findAll({
      // where: {brand_name : brandIdList},
      include: [
        {
          model: Brand
        }
      ]
    })
    // const [getItemDetails, metadata] =
      // await sequelize.query(`select t_item.brand_id , t_lkp_brand.brand_name , t_item.category_id , t_lkp_sub_category.sub_cat_name , t_item.color_id ,t_lkp_color.color_name ,t_item.country_of_origin ,t_item.department_id , t_lkp_department.dept_name , t_item.description ,t_item.div_id , t_lkp_division.div_name , t_item.how_to_use ,t_lkp_category.HSN_CODE , t_item.id,t_item.image , t_item.ingredients , t_item.active_ind , t_item.available_for_ecomm , t_item.is_gift ,t_item.is_grocernest , t_item.item_cd , t_item.manufacturer_name , t_item.name , t_item.show_discount , t_item.size_id , t_lkp_size.size_cd , t_item.sub_category_id , t_item.units , t_item.UOM 
      // from(((((((t_item
      // inner join t_lkp_brand on t_lkp_brand.id= t_item.brand_id)
      // inner join t_lkp_color on t_lkp_color.id = t_item.color_id )
      // inner join t_lkp_category on t_lkp_category.id = t_item.category_id )
      // inner join t_lkp_department on t_lkp_department.id  = t_item.department_id )
      // inner join t_lkp_division on t_lkp_division.id  = t_item.div_id )
      // inner join t_lkp_size on t_lkp_size.id = t_item.size_id )
      // inner join t_lkp_sub_category on t_lkp_sub_category.id  = t_item.sub_category_id )
      //     where t_item.brand_id = "${brandIdList}" and t_item.category_id ="${categoryIdList}" and 
      //     t_item.sub_category_id = "${subCategoryIdList}" and t_item.department_id = "${departmentIdList}" and 
      //     t_item.size_id = "${sizeIdList}" and t_item.color_id = "${colorIdList}"
      //     `);
    console.log("hello1", getItemDetails);
    if (getItemDetails.length === 0) {
      return res.status(200).send({
        status: 400,
        message: "Requested Item not found",
        data: [],
      });
    }
    const promises = getItemDetails.map(async (current) => {
      return {
        brandId: current.brand_id,
        brandName: current.brand_name,
        categoryId: current.category_id,
        categoryName: current.group_name,
        colour: current.color_name,
        colourId: current.color_id,
        departmentId: current.department_id,
        departmentName: current.dept_name,
        divisionId: current.div_id,
        divisionName: current.div_name,
        hsnCode: current.HSN_CODE,
        id: current.id,
        isActive: current.active_ind,
        itemCode: current.item_cd,
        locationId: current.location_id,
        locationName: current.loc_name,
        // lowStockQuantity: current.low_stock_qnty,
        name: current.name,
        size: current.size_cd,
        sizeId: current.size_id,
        subCategoryId: current.sub_category_id,
        subCategoryName: current.sub_cat_name,
        units: current.units,
        uom: current.UOM,
      };
    });
    const resolved = await Promise.all(promises);
    return res.status(200).send({
      status: 200,
      message: "Successfully fetched the item details ",
      data: resolved,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wronh, please try again later",
      data: error.message,
    });
  }
};

const itemByCode = async (req, res, next) => {
  try {
    const [getItemss, metadata] = await sequelize.query(`select 
  t_item.id, 
  t_item.name,
  t_item.item_cd,
  t_item.UOM,
  t_item.units,
  t_item.active_ind,
  t_item.image,
  t_item.description,
  t_item.how_to_use,
  t_item.country_of_origin,
  t_item.manufacturer_name,
  t_item.ingredients,
  t_item.available_for_ecomm,
  t_item.is_gift,
  t_item.is_grocernest,
  t_item.show_discount,
  t_item.brand_id,
  t_lkp_brand.brand_name,
  t_item.div_id,
  t_lkp_division.div_name,
  t_item.category_id,
  t_lkp_category.group_name,
  t_lkp_category.HSN_CODE,
  t_item.sub_category_id,
  t_lkp_sub_category.sub_cat_name,
  t_item.department_id,
  t_lkp_department.dept_name,
  t_item.color_id,
  t_lkp_color.color_name,
  t_item.size_id,
  t_lkp_size.size_cd,
  t_low_stock_config.low_stock_qnty
  from 
  ((((((((t_item
    inner join t_lkp_brand on t_item.brand_id=t_lkp_brand.id)
    inner join t_lkp_division on t_item.div_id= t_lkp_division.id)
    inner join t_lkp_category on t_item.category_id= t_lkp_category.id)
    inner join t_lkp_sub_category on t_item.sub_category_id = t_lkp_sub_category.id)
    inner join t_lkp_department on t_item.department_id =t_lkp_department.id)
    inner join t_lkp_color on t_item.color_id = t_lkp_color.id)
    inner join t_lkp_size on t_item.size_id = t_lkp_size.id)
    inner join t_low_stock_config on t_item.id = t_low_stock_config.item_id)
    `);
    if (getItemss.length === 0) {
      return res.status(200).send({
        status: 400,
        message: "Requested item code doesnot exist",
        data: [],
      });
    }
    const getItems = getItemss[0];
    const response = {
      id: getItems.id,
      name: getItems.name,
      itemCode: getItems.item_cd,
      uom: getItems.UOM,
      units: getItems.units,
      brandName: getItems.brand_name,
      divisionName: getItems.div_name,
      categoryName: getItems.group_name,
      hsnCode: getItems.HSN_CODE,
      subCategoryName: getItems.sub_cat_name,
      departmentName: getItems.dept_name,
      colour: getItems.color_name,
      size: getItems.size_cd,
      brandId: getItems.brand_id,
      divisionId: getItems.div_id,
      categoryId: getItems.category_id,
      subCategoryId: getItems.sub_category_id,
      departmentId: getItems.department_id,
      colourId: getItems.color_id,
      sizeId: getItems.size_id,
      isActive: getItems.active_ind,
      lowStockQuantity: getItems.low_stock_qnty,
      image: getItems.image,
      description: getItems.description,
      howToUse: getItems.how_to_use,
      countryOfOrigin: getItems.country_of_origin,
      manufactureName: getItems.manufacturer_name,
      ingredients: getItems.ingredients,
      isAvailableForEcomm: getItems.available_for_ecomm,
      isGift: getItems.is_gift,
      isGrocernest: getItems.is_grocernest,
      showDiscount: getItems.show_discount,
    };
    return res.status(200).send({
      status: 200,
      message: "Fetched the item by itemCode",
      data: response,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , please try again later",
      data: error.message,
    });
  }
};

const saveItem = async (req, res, next) => {
  const { user_id } = req;
  const {
    id,
    brandId,
    categoryId,
    cgst,
    colourId,
    departmentId,
    detailsChangedFlag,
    divisionId,
    existingItem,
    igst,
    itemCode,
    name,
    otherTax,
    sgst,
    sizeId,
    uom,
    units,
    isGift,
    isGrocernest,
    howToUse,
    availableForEcomm,
    availableForGift,
    typeOfItem,
    subCategoryId,
    description,
    image,
    countryOfOrigin,
    manufactureName,
    ingredients,
    showDiscount,
  } = req.body;

  let response = {};
  let cgstProcessed = false;
  let sgstProcessed = false;
  let igstProcessed = false;
  let otherTaxProcessed = false;

  try {
    if (existingItem == "Y") {
      const itemExists = await Item.findOne({ where: { id } });
      if (!itemExists) {
        return res.status(500).send({
          status: 404,
          message: "Requested item not found",
          data: [],
        });
      }

      if (!name || name > 250 || !itemCode || itemCode > 200) {
        return res.status(200).send({
          status: 400,
          message: "Please enter correct details for item name and item code",
          data: [],
        });
      }

      if (detailsChangedFlag == "Y") {
        const updatedRows = await Item.update(
          {
            brand_id: brandId,
            category_id: categoryId,
            color_id: colourId,
            department_id: departmentId,
            division_id: divisionId,
            item_cd: itemCode,
            name,
            size_id: sizeId,
            UOM: uom,
            units,
            is_gift: isGift,
            is_grocernest: isGrocernest,
            how_to_use: howToUse,
            available_for_ecomm: availableForEcomm,
            sub_category_id: subCategoryId,
            description,
            image,
            country_of_origin: countryOfOrigin,
            manufacturer_name: manufactureName,
            ingredients,
            show_discount: showDiscount,
            active_ind: "Y",
            created_by: user_id,
            // created_by: "1",
            updated_by: user_id,
            created_at: Date.now(),
            updated_at: Date.now(),
          },
          {
            where: { id },
          }
        );
      } else {
        const newItem = await Item.create({
          name,
          item_cd: itemCode,
          uom,
          units,
          brand_id: brandId,
          div_id: divisionId,
          category_id: categoryId,
          sub_category_id: subCategoryId,
          department_id: departmentId,
          color_id: colourId,
          size_id: sizeId,
          active_ind: "Y",
          created_by: user_id,
          updated_by: user_id,
          created_at: Date.now(),
          updated_at: Date.now(),
          // image,
          description,
          available_for_ecomm: availableForEcomm,
          is_gift: isGift,
          is_grocernest: isGrocernest,
          how_to_use: howToUse,
          country_of_origin: countryOfOrigin,
          manufacturer_name: manufactureName,
          ingredients,
          show_discount: showDiscount,
        });
        // console.log("the new item from the creation query :::::::::::::", newItem);
        const currentItem = await Item.findOne({
          where: { item_cd: itemCode, name },
        });
        // console.log("the current item from the Item query Find ONE =======>", currentItem);

        const taxItemInfoArray = makeTaxInfoArray(
          igst,
          cgst,
          sgst,
          otherTax,
          user_id,
          currentItem.id
        );
        // console.log("<<<<<<<<<<<==the tax info array is ==>>>>>>>>>>>", taxItemInfoArray);
        const newTaxItemInfo = await ItemTaxInfo.bulkCreate(taxItemInfoArray);
      }
    }
    const newItem = await Item.create({
      brand_id: brandId,
      category_id: categoryId,
      color_id: colourId,
      department_id: departmentId,
      division_id: divisionId,
      item_cd: itemCode,
      name,
      size_id: sizeId,
      UOM: uom,
      units,
      is_gift: isGift,
      is_grocernest: isGrocernest,
      how_to_use: howToUse,
      available_for_ecomm: availableForEcomm,
      sub_category_id: subCategoryId,
      description,
      image,
      country_of_origin: countryOfOrigin,
      manufacturer_name: manufactureName,
      ingredients,
      show_discount: showDiscount,
      active_ind: "Y",
      created_by: user_id,
      updated_by: user_id,
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    // console.log("the new item from the create query from the item table ::::::===>", newItem);
    const newItemFromDB = await Item.findOne({
      where: { item_cd: itemCode, name },
    });

    // console.log("NEW ITEM FROM DB AFTER FIND ONE QUERY: ----->>> :", newItemFromDB);
    const taxItemInfoArray = await makeTaxInfoArray(
      igst,
      cgst,
      sgst,
      otherTax,
      user_id,
      newItemFromDB.id
    );

    const newTaxItemInfo = await ItemTaxInfo.bulkCreate(taxItemInfoArray);

    const taxResolved = await getItemTaxArray(newItemFromDB.id);
    const inventoryResolved = await getInventoryArray(newItemFromDB.id);
    response = {
      id: newItemFromDB.id,
      createdBy: newItem.created_by,
      createdAt: newItem.created_at,
      updatedBy: newItem.updated_by,
      updatedAt: newItem.updated_at,
      isActive: "Y",
      name: newItem.name,
      itemCode: newItem.item_cd,
      uom: newItem.UOM,
      units: newItem.units,
      brandId: newItem.brand_id,
      divisionId: newItem.div_id,
      categoryId: newItem.category_id,
      subCategoryId: newItem.sub_category_id,
      departmentId: newItem.department_id,
      colourId: newItem.color_id,
      sizeId: newItem.size_id,
      availableForEcomm: newItem.available_for_ecomm,
      isGift: newItem.is_gift,
      isGrocernest: newItem.is_grocernest,
      image: newItem.image,
      description: newItem.description,
      howToUse: newItem.how_to_use,
      countryOfOrigin: newItem.country_of_origin,
      manufactureName: newItem.manufacturer_name,
      ingredients: newItem.ingredients,
      showDiscount: newItem.show_discount,
      itemTaxInfoList: taxResolved,
      stockFromInventory: inventoryResolved,
      availableBatches: null,
    };
    return res.status(200).send({
      status: 200,
      message: "Successfully saved ithe item",
      data: response,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong, please try again in sometime",
      data: error.message,
    });
  }
};

module.exports = {
  saveItem,
  getAllItem,
  getActiveItem,
  getDeactiveItem,
  activeItem,
  deactiveItem,
  getItemByItemId,
  getItemByItemCode,
  fetchItembyItemCode,
  getItemData,
  itemByCode,
};
