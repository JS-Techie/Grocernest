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

const getMasterData = async (req, res, next) => {
  const { masterDataTypeList } = req.body;
  console.log("hiiiiii", masterDataTypeList);
  try {
    const brandPromises = masterDataTypeList.map(async(current) => {
const currentBrand = await Brand.findAll({where : {masterDataTypeList: current}})
    })
    if(current){
      return ({
        brandCode : current.brand_cd, 
            brandName : current.brand_name, 
            createdAt : current.created_at, 
            createdBy : current.created_by, 
            id : current.id,
            isActive : current.active_ind,
            updatedAt : current.updated_at,
            updatedBy : current.updated_by
      })
    }
    const brandResolved = await Promise.all(brandPromises)
    const [getBrandData, metadata] =await sequelize.query(`select * from t_lkp_brand where ${masterDataTypeList} = "BRAND"`)
    const getBrandData1 = await Brand.findAll ({where : {masterDataTypeList: "BRAND"}})
    console.log("hello1", getBrandData1);
    // const [getColorData, metadata1] = await sequelize.query(`select * from t_lkp_color where ${masterDataTypeList} = "COLOR"`)
    // const [getDivisionData, metadata2] = await sequelize.query(`select * from t_lkp_division where ${masterDataTypeList} = "DIVISION"`)

  
    // console.log("hello2", getColorData);
    // console.log("hello2", getDivisionData);
      // const getBrandData = await Brand.findAll({where: {brand_name:BRAND}})
      // const brandPromises = getBrandData.map((current)=> {
      //     return({
      //       brandCode : current.brand_cd, 
      //       brandName : current.brand_name, 
      //       createdAt : current.created_at, 
      //       createdBy : current.created_by, 
      //       id : current.id,
      //       isActive : current.active_ind,
      //       updatedAt : current.updated_at,
      //       updatedBy : current.updated_by
      //     })
      // })
      // const brandResolved = await Promise.all(brandPromises);

      // const getCategoryData = await Category.findAll({where: {group_name:CATEGORY}})
      // const categoryPromises = getCategoryData.map((current)=>{
      //     return({
      //       availableForEcomm : current.available_for_ecomm,
      //       categoryId:current.id, 
      //       createdAt  : current.created_at,
      //       createdBy: current.created_by,
      //       groupName: current.group_name, 
      //       hsnCode : current.HSN_CODE, 
      //       image: current.image,
      //       isActive:current.active_ind, 
      //       updatedAt: current.updated_at,
      //       updatedBy:current.updated_by
      //     })
      // })
      // const categoryResolved = await Promise.all(categoryPromises);

      // const getColorData= await Color.findAll({where: {color_name: COLOR}})
      // const colorPromises = getColorData.map((current) => {
      //     return({
      //       colorCode            : current.color_cd,
      //       colorName            : current.color_name,
      //       createdAt            : current.created_at,
      //       createdBy            : current.created_by,
      //       id                   : current.id,
      //       isActive             : current.active_ind,
      //       updatedAt            : current.updated_at,
      //       updatedBy            : current.updated_by
      //     })
      // })
      // const colorResolved = await Promise.all(colorPromises);

      // const getDepartmentData = await Department.findAll({where: {dept_name:DEPARTMENT}})
      // const departmentPromises = getDepartmentData.map((current)=> {
      //     return({
      //       createdAt            : current.created_at,
      //       createdBy            : current.created_by,
      //       deptCode             : current.dept_cd, 
      //       deptDesc1            : current.dept_desc1,
      //       deptDesc2            : current.dept_desc2,
      //       deptName             : current.dept_name,
      //       id                   : current.id,
      //       isActive             : current.active_ind,
      //       updatedAt            : current.updated_at,
      //       updatedBy            : current.updated_by
      //     })
      // })
      // const departmentResolved = await Promise.all(departmentPromises)

      // const getDivisionData = await Division.findAll({where:{div_name:DIVISION}})
      // const divisionPromises = getDivisionData.map((current)=>{
      //     return({
      //       createdAt            : current.created_at,
      //       createdBy            : current.created_by,
      //       divisionCode         : current.div_cd,
      //       divisionName         : current.div_name,
      //       id                   : current.id,
      //       isActive             : current.active_ind,
      //       updatedAt            : current.updated_at,
      //       updatedBy            : current.updated_by
      //     })
      // })
      // const divisionResolved = await Promise.all(divisionPromises)

      // const getSizeData = await Size.findAll({where:{size_cd:SIZE}})
      // const sizePromises = getSizeData.map((current)=>{
      //     return({
      //       createdAt            : current.created_at,
      //       createdBy            : current.created_by,
      //       id                   : current.id,
      //       isActive             : current.active_ind,
      //       sizeCode             : current.size_cd,
      //       sizeOfItem           : current.sizeOfItem,
      //       updatedAt            : current.updated_at,
      //       updatedBy            : current.updated_by
      //     })
      // })
      // const sizeResolved = await Promise.all(sizePromises);
      return res.status(200).send({
          status: 200,
          message: "Successfully fetched the master data",
          data: {
            BRAND:brandResolved,
        // CATEGORY: categoryResolved,
    // COLOR: getColorData,
// DEPARTMENT: departmentResolved,
// DIVISION: getDivisionData,
// SIZE: sizeResolved 
}
      })
  } catch (error) {
      return res.status(200).send({
          status:500,
          message: "Something went wrong, plesae try again later",
          data:error.message
      })
  }
};

module.exports = { 
  getMasterData
 };
