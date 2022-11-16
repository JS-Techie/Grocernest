const { Op } = require("sequelize");
const uniq = require("uniqid");
const bcrypt = require("bcryptjs");

const db = require("../../models");

const Vendor = db.SupplierModel;
const User = db.UserModel;
const UserRole = db.UserRoleModel;
const Role = db.RoleModel;

const getAllVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.findAll({});
    if (vendors.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no vendors available",
      });
    }

    return res.status(200).send({
      success: true,
      data: vendors,
      message: "Successfully fetched all vendors",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const getVendorById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const vendor = await Vendor.findOne({
      where: { id },
    });

    if (!vendor) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested vendor not found",
      });
    }

    return res.status(200).send({
      success: true,
      data: vendor,
      message: "Successfully fetched required vendor",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const createVendor = async (req, res, next) => {
  const {
    email,
    first_name,
    last_name,
    type,
    phone_number,
    whatsapp_number,
    password,
    business_name,
  } = req.body;
  try {
    if (
      !first_name ||
      !last_name ||
      !type ||
      !whatsapp_number ||
      !password ||
      !business_name
    ) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter all required fields",
      });
    }

    const vendor = await Vendor.findOne({
      where: {
        [Op.or]: [{ whatsapp_number }, { whatsapp_number: phone_number }],
      },
    });

    let vendorExists;
    if (phone_number || phone_number !== "") {
      vendorExists = await Vendor.findOne({
        where: {
          [Op.or]: [{ phone_number }, { phone_number: whatsapp_number }],
        },
      });
    }

    if (vendor || vendorExists) {
      return res.status(400).send({
        success: false,
        data: vendor,
        message:
          "Vendor with the phone number or whatsapp number already exists, please enter a different  number",
      });
    }

    //send email
    // if (email !== null && validator.validate(email) == true) {
    // Send email here
    // }

    //send whatsapp

    let salt = bcrypt.genSaltSync(10);
    let encryptedPassword = bcrypt.hashSync(password, salt);

    const newVendor = await Vendor.create({
      email,
      first_name,
      last_name,
      type,
      phone_number,
      whatsapp_number,
      password: encryptedPassword,
      business_name,
      created_by: 1,
      active_ind: "Y"
    });

    let randomPassword = bcrypt.hashSync(uniq(), salt);

    const currentVendor = await Vendor.findOne({
      where: { whatsapp_number },
    });

    const newUser = await User.create({
      id: currentVendor.id,
      full_name: first_name + " " + last_name,
      email: uniq(),
      password: randomPassword,
      type_cd: "VENDOR",
      active_ind: "Y",
      created_by: 1,
    });

    const newUserRole = await UserRole.create({
      user_id: currentVendor.id,
      role_id: 5,
      active_ind: "Y",
      created_by: 1,
    });

    return res.status(201).send({
      success: true,
      data: {
        newVendor,
        newUser,
        newUserRole,
      },
      message: "New vendor created successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const editVendor = async (req, res, next) => {
  const { id } = req.params;
  const {
    email,
    first_name,
    last_name,
    type,
    phone_number,
    whatsapp_number,
    password,
    business_name,
  } = req.body;
  try {
    const vendor = await Vendor.findOne({
      where: { id },
    });

    if (!vendor) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested vendor not found",
      });
    }

    // let samePhoneNumberVendor = null;

    // if (
    //   vendor.phone_number !== phone_number ||
    //   vendor.whatsapp_number !== whatsapp_number
    // ) {
    //   samePhoneNumberVendor = await Vendor.findOne({
    //     where: {
    //       [Op.or]: [
    //         { phone_number },
    //         { whatsapp_number },

    //         { whatsapp_number: phone_number },

    //         { phone_number: whatsapp_number },
    //       ],
    //     },
    //   });
    // }
    let vendorExistsWithSamePhoneNumber;
    let vendorExistsWithSameWhatsappNumber;

    if (
      vendor.phone_number !== phone_number ||
      vendor.whatsapp_number !== whatsapp_number
    ) {
      vendorExistsWithSameWhatsappNumber = await Vendor.findOne({
        where: {
          [Op.or]: [{ whatsapp_number }, { whatsapp_number: phone_number }],
        },
      });

      if (phone_number || phone_number !== "") {
        vendorExists = await Vendor.findOne({
          where: {
            [Op.or]: [{ phone_number }, { phone_number: whatsapp_number }],
          },
        });
      }
    }

    if (vendorExistsWithSameWhatsappNumber || vendorExistsWithSamePhoneNumber) {
      return res.status(400).send({
        success: false,
        data: vendor,
        message:
          "Vendor with the phone number or whatsapp number already exists, please enter a different  number",
      });
    }

    // if (samePhoneNumberVendor) {
    //   return res.status(400).send({
    //     success: false,
    //     data: vendor,
    //     message:
    //       "Vendor with the phone number or whatsapp number already exists, please enter a different number",
    //   });
    // }

    let salt;
    let encryptedPassword;
    if (password) {
      salt = bcrypt.genSaltSync(10);
      encryptedPassword = bcrypt.hashSync(password, salt);
    }

    //send email
    // if (email !== null && validator.validate(email) == true) {
    // Send email here
    // }

    //send whatsapp

    const update = await Vendor.update(
      {
        email,
        first_name,
        last_name,
        type,
        phone_number,
        whatsapp_number,
        password: encryptedPassword,
        business_name,
      },
      {
        where: { id },
      }
    );

    const updatedVendor = await Vendor.findOne({
      where: { id },
    });

    return res.status(200).send({
      success: true,
      data: {
        oldVendor: vendor,
        noOfRowsUpdated: update,
        newVendor: updatedVendor,
      },
      message: "Successfully edited details of requested vendor",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const deleteVendor = async (req, res, next) => {
  const { id } = req.params;
  try {
    const vendor = await Vendor.findOne({
      where: { id },
    });

    if (!vendor) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested vendor not found",
      });
    }

    const deletedVendor = await Vendor.destroy({
      where: { id },
    });

    return res.status(200).send({
      success: true,
      data: {
        deletedVendor: vendor,
        noOfRowsUpdated: deletedVendor,
      },
      message: "Requested vendor deleted successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

module.exports = {
  getAllVendors,
  getVendorById,
  createVendor,
  editVendor,
  deleteVendor,
};
