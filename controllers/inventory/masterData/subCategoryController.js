const { Op } = require("sequelize");


const db = require("../../../models");
const uniq = require("uniqid")
const { uploadImageToS3, deleteImageFromS3 } = require("../../../services/s3Service");

const { sequelize } = require("../../../models");

const SubCategory = db.LkpSubCategoryModel;
const Category = db.LkpCategoryModel;

const saveSubCategory = async (req, res, next) => {
    const { subCatCode, subCatName, image, categoryId, isAvailableForEcomm } = req.body;
    const { user_id } = req;
    try {
        const sameSubCat = await SubCategory.findOne({
            where: { [Op.or]: [{ sub_cat_cd: subCatCode }, { sub_cat_name: subCatName }] }
        })
        if (sameSubCat) {
            return res.status(200).send({
                status: 403,
                message: "SubCat name or code already exists",
                data: []
            })
        }

        let url
        if (image) {
            const key = `subcategory/${uniq()}.jpeg`
            url = await uploadImageToS3(image, key);
        }


        const newSubCat = await SubCategory.create({
            sub_cat_cd: subCatCode,
            sub_cat_name: subCatName,
            category_id: categoryId,
            image: url,
            isAvailableForEcomm,
            active_ind: "Y",
            created_by: user_id
        })

        const [CategoryName, metadata] = await sequelize.query(`select t_lkp_sub_category.id ,t_lkp_sub_category.sub_cat_cd,t_lkp_sub_category.sub_cat_name,t_lkp_sub_category.category_id,t_lkp_sub_category.image,
        t_lkp_sub_category.active_ind,t_lkp_sub_category.available_for_ecomm,t_lkp_category.group_name
        from t_lkp_sub_category
        inner join t_lkp_category on t_lkp_category.id = t_lkp_sub_category.category_id where sub_cat_cd = '${subCatCode}' and sub_cat_name = '${subCatName}'`)

        // const currentSubCat = await SubCategory.findOne({
        //     where: { [Op.or]: [{ sub_cat_cd: subCatCode }, { sub_cat_name: subCatName }] }
        // })
        // const currentSub = await SubCategory.findOne({
        //     where: {
        //         sub_cat_cd:subCatCode,
        //         sub_cat_name: subCatName,
        //         category_id: categoryId,
        //         created_by: user_id
        //     }
        // })

        const responses = {
            id: CategoryName[0].id,
            subCatCode: CategoryName[0].sub_cat_cd,
            subCatName: CategoryName[0].sub_cat_name,
            categoryId: CategoryName[0].category_id,
            isActive: CategoryName[0].active_ind,
            categoryName: CategoryName[0].group_name,
            isAvailableForEcomm: CategoryName[0].available_for_ecomm,
            image: CategoryName[0].image
        }
        return res.status(200).send({
            status: 200,
            message: "Successfully saved the SubCat",
            data: responses
        })
    }
    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong , Please try again in sometimes",
            data: error.message
        })
    }
}

const updateSubCategory = async (req, res, next) => {
    const { categoryId, subCatCode, subCatName, isAvailableForEcomm, image } = req.body;
    const { subCategoryId } = req.params;
    console.log("hello1", subCategoryId);
    try {
        const currentCategory = await Category.findOne({
            where: { id: categoryId }
        })
console.log("hello2", currentCategory.id);
        if (!currentCategory) {
            return res.status(200).send({
                status: 404,
                message: "Current category not found",
                data: []
            })
        }
        // console.log("hello", currentCategory);
        const currentSubCategories = await SubCategory.findOne({
            where: { id: subCategoryId }
        })
        console.log("hello3",currentSubCategories.id);
        if (!currentSubCategories) {
            return res.status(200).send({
                status: 404,
                message: "Current Sub Categories not found",
                data: []
            })
        }
        // console.log("lalalala",currentSubCategories);
        // const currentSubCategory = await SubCategory.findOne({
        //     where: { [Op.or]: [{ sub_cat_cd: subCatCode }, { sub_cat_name: subCatName }] }
        // })
        // console.log("hello4", currentSubCategory.id);
        // if (!currentSubCategory) {
        //     return res.status(200).send({
        //         status: 404,
        //         message: "Current Sub Category not found",
        //         data: []
        //     })
        // }
        // console.log("===========>>>>>>>>>>>",currentSubCategory);
        // let abc = currentSubCategory;
        // console.log(parseInt(abc))

        if (currentSubCategories.id !== parseInt(subCategoryId)) {
            return res.status(200).send({
                status: 404,
                message: "Id of the currentSubCategory is not equal to subCategoryId",
                data: []
            })
        }

        const key = `subcategory/${uniq()}.jpeg`
        const url = await uploadImageToS3(image, key);
        const sameSubCategoryArray = await SubCategory.findAll({
            attributes: ["id"],
            where: {
                [Op.or]: [{sub_cat_cd: subCatCode, sub_cat_name:subCatName}]
            }
        })
        let sameCheckFlag = false
        for (var i=0; i<sameSubCategoryArray.length; i++){
            var subcategory = sameSubCategoryArray[i];
            // console.log("the category id from array",subcategory.id)
            // console.log("the category id from request",subCategoryId)
            if(!subcategory.id===subCategoryId){
                sameCheckFlag = true
            }
            console.log("the flag within loop is", sameCheckFlag)
        }
        if(sameCheckFlag){
            return res.status(200).send({
                status:404,
                message: "SubCategory name or code already exists",
                data: []
            })
        }

        const update = await SubCategory.update({
            sub_cat_cd: subCatCode,
            sub_cat_name: subCatName,
            available_for_ecomm: isAvailableForEcomm,
            image: url
        }, { where: { id: subCategoryId } }
        )

        



        const [updatedSubCat, metadata] = await sequelize.query(`select t_lkp_sub_category.id ,t_lkp_sub_category.sub_cat_cd,t_lkp_sub_category.sub_cat_name,t_lkp_sub_category.category_id,t_lkp_sub_category.image,
        t_lkp_sub_category.active_ind,t_lkp_sub_category.available_for_ecomm,t_lkp_category.group_name
        from t_lkp_sub_category
        inner join t_lkp_category on t_lkp_category.id = t_lkp_sub_category.category_id
        where t_lkp_sub_category.id = ${subCategoryId}`)

        return res.status(200).send({
            status: 200,
            message: "Successfully updated the Sub Category",
            data: updatedSubCat
        })
    } catch (error) {
        return res.status(200).send({
            status: 500,
            message: "something's wrong",
            data: error.message
        })
    }
}

const getAllSubCategory = async (req, res, next) => {
    try {
        const [allSubCat, metadata] = await sequelize.query(`select t_lkp_sub_category.id ,t_lkp_sub_category.sub_cat_cd,t_lkp_sub_category.sub_cat_name,t_lkp_sub_category.category_id,t_lkp_sub_category.image,
            t_lkp_sub_category.active_ind,t_lkp_sub_category.available_for_ecomm,t_lkp_category.group_name
            from t_lkp_sub_category
            inner join t_lkp_category on t_lkp_category.id = t_lkp_sub_category.category_id`)
        if (allSubCat.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "All sub cat not found",
                data: []
            })
        }

        const promises = allSubCat.map((current) => {
            return ({
                id: current.id,
                subCatCode: current.sub_cat_cd,
                subCatName: current.sub_cat_name,
                categoryId: current.category_id,
                image: current.image,
                categoryName: current.group_name,
                isActive: current.active_ind,
                isAvailableForEcomm: current.available_for_ecomm
            })
        })
        const resolved = await Promise.all(promises);

        return res.status(200).send({
            status: 200,
            message: "Successfully fetched all the sub categories",
            data: resolved
        })

    }
    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong , Please try again in sometimes",
            data: error.message
        })
    }
}

const getSubCategoryByCategoryId = async (req, res, next) => {
    const { categoryId } = req.params;
    try {
        const [subCatbyCatId, metadata] = await sequelize.query(`select t_lkp_sub_category.id ,t_lkp_sub_category.sub_cat_cd,t_lkp_sub_category.sub_cat_name,t_lkp_sub_category.category_id,t_lkp_sub_category.image,
    t_lkp_sub_category.active_ind,t_lkp_sub_category.available_for_ecomm,t_lkp_category.group_name
    from (t_lkp_sub_category
    inner join t_lkp_category on t_lkp_category.id = t_lkp_sub_category.category_id)
    where t_lkp_sub_category.category_id = ${categoryId}`)

        if (subCatbyCatId.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "Sub categories by the category id not found",
                data: []
            })
        }
        const promises = subCatbyCatId.map((current) => {
            return ({
                id: current.id,
                subCatName: current.sub_cat_name,
                subCatCode: current.sub_cat_cd,
                image: current.image,
                categoryId: current.category_id,
                categoryName: current.group_name,
                isActive: current.active_ind,
                isAvailableForEcomm: current.available_for_ecomm
            })
        })
        const resolved = await Promise.all(promises);

        return res.status(200).send({
            status: 200,
            message: "Successfully fetched all the sub categories by category id",
            data: resolved
        })
    } catch (error) {
        return res.status(200).send({
            status: 500,
            message: " Something went wrong , please try again",
            data: error.message
        })
    }
}

const getActiveSubCategory = async (req, res, next) => {
    try {
        const [allActiveSubCat, metadata] = await sequelize.query(`select t_lkp_sub_category.id ,t_lkp_sub_category.sub_cat_cd,t_lkp_sub_category.sub_cat_name,t_lkp_sub_category.category_id,t_lkp_sub_category.image,
        t_lkp_sub_category.active_ind,t_lkp_sub_category.available_for_ecomm,t_lkp_category.group_name
        from (t_lkp_sub_category
        inner join t_lkp_category on t_lkp_category.id = t_lkp_sub_category.category_id)
        where t_lkp_sub_category.active_ind = 'Y'`)
        if (allActiveSubCat.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "All active sub categories not found",
                data: []
            })
        }
        const promises = allActiveSubCat.map((current) => {
            return ({
                id: current.id,
                subCatCode: current.sub_cat_cd,
                subCatName: current.sub_cat_name,
                image: current.image,
                categoryId: current.category_id,
                categoryName: current.group_name,
                isActive: current.active_ind,
                isAvailableForEcomm: current.available_for_ecomm

            })
        })
        const resolved = await Promise.all(promises)
        return res.status(200).send({
            status: 200,
            message: "Successfully fetched all the active sub categories",
            data: resolved
        })
    }
    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong , Please try again in sometimes",
            data: error.message
        })
    }
}

const getInactiveSubCategory = async (req, res, next) => {
    try {
        const [allInactiveSubCat, metadata] = await sequelize.query(`select t_lkp_sub_category.id ,t_lkp_sub_category.sub_cat_cd,t_lkp_sub_category.sub_cat_name,t_lkp_sub_category.category_id,t_lkp_sub_category.image,
        t_lkp_sub_category.active_ind,t_lkp_sub_category.available_for_ecomm,t_lkp_category.group_name
        from (t_lkp_sub_category
        inner join t_lkp_category on t_lkp_category.id = t_lkp_sub_category.category_id)
        where t_lkp_sub_category.active_ind = 'N'`)
        if (allInactiveSubCat.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "All Inactive sub categories not found",
                data: []
            })
        }
        const promises = allInactiveSubCat.map((current) => {
            return ({
                id: current.id,
                subCatCode: current.sub_cat_cd,
                subCatName: current.sub_cat_name,
                image: current.image,
                categoryId: current.category_id,
                categoryName: current.group_name,
                isActive: current.active_ind,
                isAvailableForEcomm: current.available_for_ecomm

            })
        })
        const resolved = await Promise.all(promises)
        return res.status(200).send({
            status: 200,
            message: "Successfully fetched all the Inactive sub categories",
            data: resolved
        })
    }
    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong , Please try again in sometimes",
            data: error.message
        })
    }
}

const activeSubCategory = async (req, res, next) => {
    const  subCategoryId = req.params.subCategoryId;
    try {
        console.log("========>", subCategoryId);
        //Check if frontend has sent correct data
        if (subCategoryId == undefined || !subCategoryId) {
            return res.status(200).send({
                status: 400,
                message: "subCategoryId not found",
                data: []
            })
        }


        //If frontend has sent correct data, lets see if this sub cat even exists
        const currentSubCat = await SubCategory.findOne({
            where: { id: subCategoryId }
        })


        //If this sub cat doesnt exist, we will throw an error
        if (!currentSubCat) {
            return res.status(200).send({
                status: 404,
                message: "Requested subCategoryId not found",
                data: []
            })
        }

        //Now we know that sub cat exists, so we will update
        const updatedSubCat = await SubCategory.update({
            active_ind: "Y"
        },
            { where: { id: subCategoryId } }
        )


        //Once updated, we will find the details of this subcategory

        const [activeSubCat, metadata] = await sequelize.query(`select t_lkp_sub_category.id ,t_lkp_sub_category.sub_cat_cd,t_lkp_sub_category.sub_cat_name,t_lkp_sub_category.category_id,t_lkp_sub_category.image,
        t_lkp_sub_category.active_ind,t_lkp_sub_category.available_for_ecomm,t_lkp_category.group_name
        from t_lkp_sub_category
        inner join t_lkp_category on t_lkp_category.id = t_lkp_sub_category.category_id
        where t_lkp_sub_category.id = ${subCategoryId}`)

        const response = {
            id: activeSubCat[0].id,
            subCatCode: activeSubCat[0].sub_cat_cd,
            subCatName: activeSubCat[0].sub_cat_name,
            categoryId: activeSubCat[0].category_id,
            isActive: activeSubCat[0].active_ind,
            categoryName: activeSubCat[0].group_name,
            isAvailableForEcomm: activeSubCat[0].available_for_ecomm,
            image: activeSubCat[0].image
        }

        return res.status(200).send({
            status: 200,
            message: "Successfully activated the requested Sub Categories",
            data: response
        })
    }
    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong , Please try again in sometimes",
            data: error.message
        })
    }
}

const deactiveSubCategory = async (req, res, next) => {
    const  subCategoryId  = req.params.subCategoryId;
    try {
        if (subCategoryId.length === 0) {
            return res.status(200).send({
                status: 404,
                message: "sub category id list not found",
                data: []
            })
        }
            const currentSubCatId = await SubCategory.findOne({
                where: { id: subCategoryId }
            })
            if (!currentSubCatId) {
                return res.status(200).send({
                    status: 400,
                    message: "Current sub Cat id not found",
                    data: []
                })
            }
                const updateSubCat = await SubCategory.update({
                    active_ind: "N"
                }, { where: { id: subCategoryId } }
                )
                const [deactivatedSubCat , metadata] = await sequelize.query(`select t_lkp_sub_category.id ,t_lkp_sub_category.sub_cat_cd,t_lkp_sub_category.sub_cat_name,t_lkp_sub_category.category_id,t_lkp_sub_category.image,
                t_lkp_sub_category.active_ind,t_lkp_sub_category.available_for_ecomm,t_lkp_category.group_name
                from t_lkp_sub_category
                inner join t_lkp_category on t_lkp_category.id = t_lkp_sub_category.category_id
                where t_lkp_sub_category.id = ${subCategoryId}`)
                const responses =  {
                    id: deactivatedSubCat[0].id,
                    subCatCode: deactivatedSubCat[0].sub_cat_cd,
                    subCatName: deactivatedSubCat[0].sub_cat_name,
                    image: deactivatedSubCat[0].image,
                    categoryId: deactivatedSubCat[0].category_id,
                    categoryName: deactivatedSubCat[0].group_name,
                    isActive: deactivatedSubCat[0].active_ind,
                    isAvailableForEcomm: deactivatedSubCat[0].available_for_ecomm
                }
            
        
        return res.status(200).send({
            status: 200,
            message: " Successfully deactivated the sub requested sub category",
            data: responses
        })
    }
    catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong , Please try again in sometimes",
            data: error.message
        })
    }
}



module.exports = {
    saveSubCategory,
    updateSubCategory,
    getAllSubCategory,
    getSubCategoryByCategoryId,
    activeSubCategory,
    deactiveSubCategory,
    getActiveSubCategory,
    getInactiveSubCategory,
}