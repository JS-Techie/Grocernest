const { sequelize } = require("sequelize/lib/model");
const db = require("../../../models");
const Item = db.ItemModel;
const ItemTaxInfo = db.ItemTaxInfoModel;
const Brand = db.LkpBrandModel;
const Category = db.LkpCategoryModel;
const SubCategory = db.LkpSubCategoryModel;
const Department = db.LkpDepartmentModel;
const Color = db.LkpColorModel;
const Division = db.LkpDivisionModel;
const Size = db.LkpSizeModel;
const Role = db.RoleModel

const getMasterData = async (req, res, next) => {
  const { masterDataTypeList } = req.body;
  try {
    let brandResolved;
    let colorResolved;
    let departmentResolved;
    let categoryResolved;
    let divisionResolved;
    let sizeResolved;
    let roleResolved;

    if (masterDataTypeList.includes("BRAND")) {
      const getBrandData = await Brand.findAll({
        where: { active_ind: "Y" },
        order: [["brand_name", "asc"]],
      });
      const brandPromises = getBrandData.map((current) => {
        return {
          brandCode: current.brand_cd,
          brandName: current.brand_name,
          createdAt: current.created_at,
          createdBy: current.created_by,
          id: current.id,
          isActive: current.active_ind,
          updatedAt: current.updated_at,
          updatedBy: current.updated_by,
        };
      });
      brandResolved = await Promise.all(brandPromises);
      // return res.status(200).send({
      //   status: 200,
      //   message: "Successfully retrieved the masterData",
      //   data: {
      //     BRAND:brandResolved,
      //   }
      // })
    }
    if (masterDataTypeList.includes("COLOR")) {
      const getColorData = await Color.findAll({ where: { active_ind: "Y" } });
      const colorPromises = getColorData.map((current) => {
        return {
          colorCode: current.color_cd,
          colorName: current.color_name,
          createdAt: current.created_at,
          createdBy: current.created_by,
          id: current.id,
          isActive: current.active_ind,
          updatedAt: current.updated_at,
          updatedBy: current.updated_by,
        };
      });
      colorResolved = await Promise.all(colorPromises);
      // return res.status(200).send({
      //   status: 200,
      //   message: "Successfully retrieved the masterData",
      //   data: {
      //     COLOR:colorResolved,
      //   }
      // })
    }
    if (masterDataTypeList.includes("DEPARTMENT")) {
      const getDepartmentData = await Department.findAll({
        where: { active_ind: "Y" },
      });
      const departmentPromises = getDepartmentData.map((current) => {
        return {
          createdAt: current.created_at,
          createdBy: current.created_by,
          deptCode: current.dept_cd,
          deptDesc1: current.dept_desc1,
          deptDesc2: current.dept_desc2,
          deptName: current.dept_name,
          id: current.id,
          isActive: current.active_ind,
          updatedAt: current.updated_at,
          updatedBy: current.updated_by,
        };
      });
      departmentResolved = await Promise.all(departmentPromises);
      // return res.status(200).send({
      //   status: 200,
      //   message: "Successfully retrieved the masterData",
      //   data: {
      //     DEPARTMENT: departmentResolved,
      //   }
      // })
    }
    if (masterDataTypeList.includes("CATEGORY")) {
      const getCategoryData = await Category.findAll({
        where: { active_ind: "Y" },
      });
      const categoryPromises = getCategoryData.map((current) => {
        return {
          availableForEcomm: current.available_for_ecomm,
          categoryId: current.id,
          createdAt: current.created_at,
          createdBy: current.created_by,
          groupName: current.group_name,
          hsnCode: current.HSN_CODE,
          image: current.image,
          isActive: current.active_ind,
          updatedAt: current.updated_at,
          updatedBy: current.updated_by,
        };
      });
      categoryResolved = await Promise.all(categoryPromises);
    }
    if (masterDataTypeList.includes("DIVISION")) {
      const getDivisionData = await Division.findAll({
        where: { active_ind: "Y" },
      });
      const divisionPromises = getDivisionData.map((current) => {
        return {
          createdAt: current.created_at,
          createdBy: current.created_by,
          divisionCode: current.div_cd,
          divisionName: current.div_name,
          id: current.id,
          isActive: current.active_ind,
          updatedAt: current.updated_at,
          updatedBy: current.updated_by,
        };
      });
      divisionResolved = await Promise.all(divisionPromises);
    }
    if(masterDataTypeList.includes("ROLE")){
      const getRoleData = await Role.findAll({ where : {active_ind: "Y"},
      order: [["role_name", "asc"]]})
      const rolePromises = getRoleData.map((current) => {
        return {
          createdAt: current.created_at,
          createdBy: current.created_by,
          id: current.id,
          isActive: current.active_ind,
          updatedAt: current.updated_at,
          updatedBy: current.updated_by,
          roleName : current.role_name,
          roleDesc :current.role_desc,
          type: current.user_type
        }
      })
      roleResolved = await Promise.all(rolePromises)
    }
    if (masterDataTypeList.includes("SIZE")) {
      const getSizeData = await Size.findAll({ where: { active_ind: "Y" } });
      const sizePromises = getSizeData.map((current) => {
        return {
          createdAt: current.created_at,
          createdBy: current.created_by,
          id: current.id,
          isActive: current.active_ind,
          sizeCode: current.size_cd,
          sizeOfItem: current.sizeOfItem,
          updatedAt: current.updated_at,
          updatedBy: current.updated_by,
        };
      });
      sizeResolved = await Promise.all(sizePromises);
    }
if(masterDataTypeList.includes("SUBCATEGORY")){
  const getSubCategoryData = await SubCategory.findAll({where: {active_ind: "Y"}})
  const subCatPromises = getSubCategoryData.map(async(current) => {
  //   const [getCategory , metadata] = await sequelize.query(`select * from (t_lkp_category 
  //     inner join t_lkp_sub_category on t_lkp_sub_category.category_id  = t_lkp_category.id )`)
  //     const categoryPromises = getCategory.map(async(currentCat) => {
  //       return ({
  //         availableForEcomm: current.available_for_ecomm,
  //         categoryId: current.id,
  //         createdAt: current.created_at,
  //         createdBy: current.created_by,
  //         groupName: current.group_name,
  //         hsnCode: current.HSN_CODE,
  //         image: current.image,
  //         isActive: current.active_ind,
  //         updatedAt: current.updated_at,
  //         updatedBy: current.updated_by
  //       })
  //     })
  //     const categoryResolved = await Promise.all(categoryPromises)
    return {
      createdAt: current.created_at,
          createdBy: current.created_by,
          id: current.id,
          isActive: current.active_ind,
          updatedAt: current.updated_at,
          updatedBy: current.updated_by,
          subCatCode: current.sub_cat_cd,
          subCatName: current.sub_cat_name,
          availableForEcomm: current.available_for_ecomm,
          image:current.image,
          categoryId: categoryResolved
    }
  })
  subCatResolved = await Promise.all(subCatPromises)
}
    const resultObj = {
      BRAND: brandResolved,
      COLOR: colorResolved,
      DEPARTMENT: departmentResolved,
      CATEGORY: categoryResolved,
      DIVISION: divisionResolved,
      SIZE: sizeResolved,
      ROLE: roleResolved,
      SUBCATEGORY: subCatResolved
    };
    return res.status(200).send({
      status: 200,
      message: "Successfully retrieved the masterData",
      data: resultObj,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "error",
      data: error.message,
    });
  }
};

module.exports = {
  getMasterData,
};
