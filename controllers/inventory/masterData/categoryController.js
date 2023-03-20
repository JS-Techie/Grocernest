const uniqueId = require("uniqueid");
const db = require("../../../models");
const { Op } = require("sequelize");
const uniq = require("uniqid");
const { uploadImageToS3 } = require("../../../services/s3Service");
const Category = db.LkpCategoryModel;

const saveCategory = async (req, res, next) => {
  const {
    groupName,
    existingCategory,
    availableForEcomm,
    detailsChangedFlag,
    image,
    categoryId
  } = req.body;
  const { user_id } = req;
  // console.log("the user id from the request body:::::::::::::::::::",user_id, categoryId)
  try {
    if (existingCategory === "N") {
      const currentCat = await Category.findOne({
        where: { [Op.or]: [{ group_name: groupName }] },
      });
      if (currentCat) {
        return res.status(200).send({
          status: 400,
          message: "Category with the same name already exists",
          data: [],
        });
      }
      const key = `category/${uniq()}.jpeg`;
      const url = await uploadImageToS3(image, key);
      const newCategory = await Category.create({
        group_name: groupName,
        active_ind: "Y",
        created_by: user_id,
        updated_by: user_id,
        created_at: Date.now(),
        updated_at: Date.now(),
        HSN_CODE: "hsnCode",
        image: url,
        available_for_ecomm: availableForEcomm,
      });
      const currentCatId = await Category.findOne({
        where: {
          group_name: groupName,
          active_ind: "Y",
        },
      });
      const responses = {
        categoryId: currentCatId.id,
        groupName: newCategory.group_name,
        availableForEcomm: newCategory.available_for_ecomm,
        Image: newCategory.image,
        hsnCode: newCategory.HSN_CODE,
        isActive: newCategory.active_ind,
        createdBy: newCategory.created_by,
        createdAt: newCategory.created_at,
        updatedBy: newCategory.updated_by,
        updatedAt: newCategory.updated_at,
      };
      return res.status(200).send({
        status: 200,
        message: "Successfully saved new Category",
        data: responses,
      });
    } 
    else {
      const currentCategory = await Category.findOne({
        where: { id: categoryId },
      });
      // console.log("=======>",currentCategory);
      if (!currentCategory) {
        return res.status(200).send({
          status: 404,
          message: "Current category not found",
          data: [],
        });
      }
      const sameCategoryArray = await Category.findAll({
        attributes: ["id"],
        where: {
            [Op.or]: [{group_name: groupName}]
        }
    })
    let nameCheckFlag = false
    for (var i=0; i<sameCategoryArray.length; i++){
        var category = sameCategoryArray[i];
        console.log("the category id from array",category.id)
        console.log("the category id from request",categoryId)
        if(category.id!==categoryId){
            nameCheckFlag = true
        }
        console.log("the flag within loop is", nameCheckFlag)
    }
    if(nameCheckFlag){
        return res.status(200).send({
            status:400,
            message: "Category name already exists",
            data: []
        })
    }
    const key = `category/${uniq()}.jpeg`;
      const url = await uploadImageToS3(image, key);
      const updateCategory = await Category.update(
        {
          group_name: groupName,
          image: url,
          available_for_ecomm: availableForEcomm,
        },
        { where: { id:categoryId } }
      );
      const updatedCategory = await Category.findOne({
        where: { id: categoryId },
      });
      const response = {
        categoryId: updatedCategory.id,
        groupName: updatedCategory.group_name,
        availableForEcomm: updatedCategory.available_for_ecomm,
        Image: updatedCategory.image,
        hsnCode: updatedCategory.HSN_CODE,
        Image: updatedCategory.image,
        isActive: updatedCategory.active_ind,
        createdBy: updatedCategory.created_by,
        createdAt: updatedCategory.created_at,
        updatedBy: updatedCategory.updated_by,
        updatedAt: updatedCategory.updated_at,
      };
      return res.status(200).send({
        status: 200,
        message: "Successfully updated the Category",
        data: response,
      });
    }
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , Please try again in sometimes",
      data: error.message,
    });
  }
};

const getAllCategory = async (req, res, next) => {
  try {
    const allCat = await Category.findAll({});
    if (allCat.length === 0) {
      return res.status(200).send({
        status: 404,
        message: "All category not found",
        data: [],
      });
    }
    const promises = allCat.map((current) => {
      return {
        categoryId: current.id,
        groupName: current.group_name,
        hsnCode: current.HSN_CODE,
        isActive: current.active_ind,
        image: current.image,
        isAvailableForEcomm: current.available_for_ecomm,
      };
    });
    const resolved = await Promise.all(promises);
    return res.status(200).send({
      status: 200,
      message: "Successfully fetched all the Categories",
      data: resolved,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , Please try again in sometimes",
      data: error.message,
    });
  }
};

const getActiveCategory = async (req, res, next) => {
  try {
    const activeCategory = await Category.findAll({
      where: { active_ind: "Y" },
    });
    if (activeCategory.length === 0) {
      return res.status(200).send({
        status: 404,
        message: " Successfully fetched all the active categories",
        data: [],
      });
    }
    const promises = activeCategory.map((current) => {
      return {
        categoryId: current.id,
        groupName: current.group_name,
        hsnCode: current.HSN_CODE,
        isActive: current.active_ind,
        image: current.image,
        isAvailableForEcomm: current.available_for_ecomm,
      };
    });
    const resolved = await Promise.all(promises);
    return res.status(200).send({
      status: 200,
      message: "Successfully fetched all the active categories",
      data: resolved,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , Please try again in sometimes",
      data: error.message,
    });
  }
};

const getDeactiveCategory = async (req, res, next) => {
  try {
    const deactiveCategory = await Category.findAll({
      where: { active_ind: "N" },
    });
    if (deactiveCategory.length === 0) {
      return res.status(200).send({
        status: 404,
        message: "Deactive categories not found",
        data: [],
      });
    }
    const promises = deactiveCategory.map((current) => {
      return {
        categoryId: current.id,
        groupName: current.group_name,
        hsnCode: current.HSN_CODE,
        isActive: current.active_ind,
        image: current.image,
        isAvailableForEcomm: current.available_for_ecomm,
      };
    });
    const resolved = await Promise.all(promises);
    return res.status(200).send({
      status: 200,
      message: "Successfully fetched all the deactive categories",
      data: resolved,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , Please try again in sometimes",
      data: error.message,
    });
  }
};

const activeCategory = async (req, res, next) => {
  const categoryIdList = req.body;
  try {
    if (categoryIdList.length === 0) {
      return res.status(200).send({
        status: 400,
        message: "Category id list not found",
        data: [],
      });
    }
    const promises = categoryIdList.map(async (current) => {
      const currentCategory = await Category.findOne({
        where: { id: categoryIdList },
      });
      const updateCategory = await Category.update(
        {
          active_ind: "Y",
        },
        {
          where: {
            id: categoryIdList,
          },
        }
      );
      const updatedCategory = await Category.findOne({
        where: { id: categoryIdList },
      });
      return {
        categoryId: updatedCategory.id,
        createdBy: updatedCategory.created_by,
        createdAt: updatedCategory.created_at,
        updatedBy: updatedCategory.updated_by,
        updatedAt: updatedCategory.updated_at,
        isActive: "Y",
        groupName: updatedCategory.group_name,
        hsnCode: updatedCategory.HSN_CODE,
        image: updatedCategory.image,
        availableForEcomm: updatedCategory.available_for_ecomm,
      };
    });
    const resolved = await Promise.all(promises);
    return res.status(200).send({
      status: 200,
      message: "Successfully activated the category",
      data: resolved,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , Please try again in sometimes",
      data: error.message,
    });
  }
};

const deactiveCategory = async (req, res, next) => {
  const categoryIdList = req.body;
  try {
    if (categoryIdList.length === 0) {
      return res.status(200).send({
        status: 400,
        message: "Category id list not found",
        data: [],
      });
    }
    const promises = categoryIdList.map(async (current) => {
      const currentCategory = await Category.findOne({
        where: { id: categoryIdList },
      });
      const updateCategory = await Category.update(
        {
          active_ind: "N",
        },
        {
          where: {
            id: categoryIdList,
          },
        }
      );
      const updatedCategory = await Category.findOne({
        where: {
          id: categoryIdList,
        },
      });
      return {
        categoryId: updatedCategory.id,
        createdBy: updatedCategory.created_by,
        createdAt: updatedCategory.created_at,
        updatedBy: updatedCategory.updated_by,
        updatedAt: updatedCategory.updated_at,
        isActive: "N",
        groupName: updatedCategory.group_name,
        hsnCode: updatedCategory.HSN_CODE,
        image: updatedCategory.image,
        availableForEcomm: updatedCategory.available_for_ecomm,
      };
    });
    const resolved = await Promise.all(promises);
    return res.status(200).send({
      status: 200,
      message: "Successfully deactivated the category",
      data: resolved,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , Please try again in sometimes",
      data: error.message,
    });
  }
};

module.exports = {
  saveCategory,
  getAllCategory,
  activeCategory,
  deactiveCategory,
  getActiveCategory,
  getDeactiveCategory,
};
