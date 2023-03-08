const { Op } = require("sequelize");
const db = require("../../../models");

const Brand = db.LkpBrandModel;

const saveBrand = async (req, res, next) => {
  const { brandName, brandCode, existingBrand, id } = req.body;
  const { user_id } = req;
  try {
    if (existingBrand === "N") {
      const sameBrand = await Brand.findOne({
        where: {
          [Op.or]: [{ brand_cd: brandCode }, { brand_name: brandName }],
        },
      });
      if (sameBrand) {
        return res.status(200).send({
          status: 403,
          message: "Brand Name or Brand code already exists",
          data: [],
        });
      }

      const newBrand = await Brand.create({
        brand_name: brandName,
        brand_cd: brandCode,
        created_by: user_id,
        created_at: Date.now(),
        updated_by: user_id,
        updated_at: Date.now(),
        active_ind: "Y",
      });
      const currentBrand = await Brand.findOne({
        where: {
          brand_name: brandName,
          brand_cd: brandCode,
          created_by: user_id,
          active_ind: "Y",
        },
      });
      const response = {
        id: currentBrand.id,
        brandName: newBrand.brand_name,
        brandCode: newBrand.brand_cd,
        craetedBy: newBrand.created_by,
        createdAt: newBrand.created_at,
        updatedBy: newBrand.updated_by,
        updatedAt: newBrand.updated_at,
        isActive: newBrand.active_ind,
      };
      return res.status(200).send({
        status: 200,
        message: "Successfully saved Brand",
        data: response,
      });
    }

    const currentBrands = await Brand.findOne({
      where: { id },
    });
    if (!currentBrands) {
      return res.status(200).send({
        status: 203,
        message: " The requested Brand doesnt exist",
        data: [],
      });
    }
    const updateBrand = await Brand.update(
      {
        brand_name: brandName,
        brand_cd: brandCode,
      },
      { where: { id } }
    );
    const updatedBrand = await Brand.findOne({
      where: { id },
    });

    const response = {
      id: updatedBrand.id,
      brandName: updatedBrand.brand_name,
      brandCode: updatedBrand.brand_cd,
      existingBrand: updatedBrand.active_ind,
    };
    return res.status(200).send({
      status: 200,
      message: " The requested Brand has been updated successfully ",
      data: response,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , Please try again in sometimes",
      data: error.message,
    });
  }
};

const getAllBrand = async (req, res, next) => {
  try {
    const allBrand = await Brand.findAll({});
    if (allBrand.length === 0) {
      return res.status(200).send({
        status: 404,
        message: "All brand not found",
        data: [],
      });
    }
    const promises = allBrand.map((current) => {
      return {
        id: current.id,
        brandName: current.brand_name,
        brandCode: current.brand_cd,
        isActive: current.active_ind,
      };
    });
    const resolved = await Promise.all(promises);

    return res.status(200).send({
      status: 200,
      message: "Successfully fetched all the brands",
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
const getActiveBrand = async (req, res, next) => {
  try {
    const activeBrands = await Brand.findAll({
      where: { active_ind: "Y" },
    });
    if (activeBrands.length === 0) {
      return res.status(200).send({
        status: 404,
        message: "Active brands not found",
        data: [],
      });
    }
    const promises = activeBrands.map((current) => {
      return {
        id: current.id,
        brandName: current.brand_name,
        brandCode: current.brand_cd,
        isActive: current.active_ind,
      };
    });
    const resolved = await Promise.all(promises);
    return res.status(200).send({
      status: 200,
      message: "Successfully fetched all the active brands",
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

const getDeactiveBrand = async (req, res, next) => {
  try {
    const deactiveBrands = await Brand.findAll({
      where: { active_ind: "N" },
    });
    if (deactiveBrands.length === 0) {
      return res.status(200).send({
        status: 404,
        message: "Deactive brands not found",
        data: [],
      });
    }
    const promises = deactiveBrands.map((current) => {
      return {
        id: current.id,
        brandName: current.brand_name,
        brandCode: current.brand_cd,
        isActive: current.active_ind,
      };
    });
    const resolved = await Promise.all(promises);
    return res.status(200).send({
      status: 200,
      message: "Successfully fetched all the deactive brands",
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

const activeBrand = async (req, res, next) => {
  const brandIdList = req.body;
  try {
    if (brandIdList.length === 0) {
      return res.status(200).send({
        status: 500,
        message: "Brand ID list not found",
        data: [],
      });
    }

    const promises = brandIdList.map(async (currentBrand) => {
      const current = await Brand.findOne({ where: { id: currentBrand } });

      if (current) {
        const update = await Brand.update(
          {
            active_ind: "Y",
          },
          {
            where: { id: currentBrand },
          }
        );

        return {
          id: current.id,
          brandName: current.brand_name,
          brandCode: current.brand_cd,
          isActive: "Y",
          updatedAt: current.updated_at,
          createdAt: current.created_at,
          createdBy: current.created_by,
          updatedBy: current.updated_by,
        };
      }
    });

    const resolved = await Promise.all(promises);

    return res.status(200).send({
      status: 200,
      message: "Activated requested brands successfully",
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

const deactiveBrand = async (req, res, next) => {
  const brandIdList = req.body;
  const { user_id } = req;
  try {
    console.log(req.body);
    if (brandIdList.length === 0) {
      return res.status(200).send({
        status: 500,
        message: "Brand ID list not found",
        data: [],
      });
    }

    const promises = brandIdList.map(async (currentBrand) => {
      const current = await Brand.findOne({ where: { id: currentBrand } });

      if (current) {
        const update = await Brand.update(
          {
            active_ind: "N",
          },
          {
            where: { id: currentBrand },
          }
        );

        return {
          id: current.id,
          brandName: current.brand_name,
          brandCode: current.brand_cd,
          isActive: "N",
          updatedAt: Date.now(),
          createdAt: current.created_at,
          createdBy: current.created_by,
          updatedBy: user_id,
        };
      }
    });

    const resolved = await Promise.all(promises);

    return res.status(200).send({
      status: 200,
      message: "deactivated requested brands successfully",
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
  saveBrand,
  getAllBrand,
  activeBrand,
  deactiveBrand,
  getActiveBrand,
  getDeactiveBrand,
};
