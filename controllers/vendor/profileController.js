const db = require("../../models");
const { Op } = require("sequelize");
const uniqid = require("uniqid");

const S3 = require("aws-sdk/clients/s3");
const s3Config = require("../../config/s3Config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { generateOTP } = require("../../services/otpService");

const Vendor = db.SupplierModel;
const Cache = db.CacheModel;
const VendorItem = db.VendorItemModel;
const Item = db.ItemModel;
const LowStock = db.LowStockConfigModel;
const Batch = db.BatchModel;
const Inventory = db.InventoryModel;
const Brand = db.LkpBrandModel;
const Category = db.LkpCategoryModel;

const s3 = new S3(s3Config);

const loginVendor = async (req, res, next) => {
  const { whatsapp_number, password } = req.body;

  try {
    if (!whatsapp_number || !password) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter all required fields",
      });
    }

    const vendor = await Vendor.findOne({
      where: { whatsapp_number },
    });

    if (!vendor) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "This phone number does not exist, please register",
      });
    }
    if (!bcrypt.compareSync(password, vendor.password)) {
      return res.status(401).send({
        success: false,
        data: null,
        message: "Please enter correct password for phone number entered",
      });
    }

    if (!vendor.login_attempt) {
      return res.status(200).send({
        success: true,
        data: {
          vendor,
          token: null,
          first_login: true,
        },
        message:
          "Since this is your first login, you have to change your password",
      });
    }

    const userType = "VENDOR";

    if (vendor.business_name == "PRESTIGE"){
      userType = "PRESTIGE";
    }
    
    const { id } = vendor;
    const token = jwt.sign(
      {
        USERID: id.toString(),
        aud: "4",
        userType,
        sub: whatsapp_number.toString(),
        CURRENTLOCALE: null,
        USERTYPEID: null,
        iss: "VENDOR",
        USERROLELIST: [{ roleName: "VENDOR", roleDesc: "VENDOR", roleId: 5 }],
        USERMODULELIST: [
          {
            moduleName: "VENDOR",
            moduleDesc: "VENDOR",
          },
        ],
        jti: 5,
      },
      "cosmetixkey",
      {
        expiresIn: "300d", //Subject to change
      }
    );

    await Vendor.update(
      {
        login_attempt: vendor.login_attempt ? vendor.login_attempt + 1 : 1,
      },
      {
        where: { id },
      }
    );

    //Send welcome email

    return res.status(200).send({
      success: true,
      data: {
        vendor,
        token,
        first_login: false,
        userType,
      },
      message: "Successfully logged in",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const getVendorProfile = async (req, res, next) => {
  const { id } = req;
  try {
    const vendor = await Vendor.findOne({
      where: { id },
    });

    if (!vendor) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested vendor profile not found",
      });
    }

    return res.status(200).send({
      success: true,
      data: vendor,
      message: "Requested vendor details fetched successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const editVendorProfile = async (req, res, next) => {
  const { id } = req;
  const {
    gst,
    aadhar,
    billing_address,
    current_address,
    pan,
    cin,
    base64,
    email,
    first_name,
    last_name,
    phone_number,
    business_name,
    image_status,
  } = req.body;

  try {
    const vendor = await Vendor.findOne({
      where: { id },
    });

    if (!vendor) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Required vendor details not found",
      });
    }

    let vendorWithSamePhoneNumber;

    if (phone_number) {
      if (phone_number !== vendor.phone_number) {
        vendorWithSamePhoneNumber = await Vendor.findOne({
          where: {
            [Op.or]: [{ phone_number }, { whatsapp_number: phone_number }],
          },
        });
      }
    }

    if (vendorWithSamePhoneNumber) {
      return res.status(400).send({
        success: false,
        data: vendor,
        message:
          "Vendor with the phone number or whatsapp number already exists, please enter a different  number",
      });
    }

    if (!gst || !billing_address || !current_address) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter all required details",
      });
    }

    let url;
    if (base64) {
      const base64Data = new Buffer.from(
        base64.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `vendor/profile/images/${id}-${uniqid()}.jpeg`,
        Body: base64Data,
        ContentEncoding: "base64",
        ContentType: `image/jpeg`,
      };

      const s3UploadResponse = await s3.upload(params).promise();
      url = s3UploadResponse.Location;
    }

    const update = await Vendor.update(
      {
        gst,
        aadhar,
        billing_address,
        current_address,
        pan,
        cin,
        image: base64 ? url : image_status === "e" ? vendor.image : null,
        email,
        first_name,
        last_name,
        business_name,
        phone_number,
      },
      {
        where: { id },
      }
    );

    const updated = await Vendor.findOne({
      where: { id },
    });

    //send email if changed email
    return res.status(200).send({
      success: true,
      data: updated,
      message: "Updated vendor details successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const forgotPasswordForVendor = async (req, res, next) => {
  const { whatsapp_number } = req.body;

  try {
    const vendor = await Vendor.findOne({
      where: { whatsapp_number },
    });

    if (!vendor) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested details not found for entered phone number",
      });
    }

    const serverGeneratedOTP = generateOTP();
    //send otp to vendor phone number
    //send otp to vendor email ID

    const cacheDetails = await Cache.create({
      user_details: JSON.stringify(vendor),
      generated_otp: serverGeneratedOTP,
      created_by: 1,
      cust_no: vendor.id,
    });

    return res.status(200).send({
      success: true,
      data: {
        //cacheDetails,
        serverGeneratedOTP,
        id: vendor.id,
      },
      message: "OTP generated and sent successfully",
    });
  } catch (error) {
    await Cache.destroy({
      where: { id },
    });
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const verifyOTPOfVendor = async (req, res, next) => {
  const { otp, id } = req.body;

  try {
    if (!id) {
      return res.status(400).send({
        success: false,
        data: [],
        devMessage: "Please enter user ID",
        message: "Something went wrong, please try again in sometime",
      });
    }
    const vendor = await Vendor.findOne({
      where: { id },
    });

    if (!vendor) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested details not found for current vendor",
      });
    }

    const cacheDetails = await Cache.findOne({
      where: { cust_no: id },
    });

    if (!cacheDetails) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "There is no record of current user for which OTP was sent",
      });
    }

    if (otp !== cacheDetails.generated_otp) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter correct OTP",
      });
    }

    await Cache.destroy({
      where: { id },
    });
    return res.status(200).send({
      success: true,
      data: cacheDetails.cust_no,
      message:
        "Verified OTP successfully, user can proceed to change their password",
    });
  } catch (error) {
    await Cache.destroy({
      where: { id },
    });
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const changeVendorPassword = async (req, res, next) => {
  const { new_password, id } = req.body;

  try {
    if (!id) {
      return res.status(400).send({
        success: false,
        data: [],
        devMessage: "Please enter user ID",
        message: "Something went wrong, please try again in sometime",
      });
    }
    if (!new_password) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter all required fields",
      });
    }
    const vendor = await Vendor.findOne({
      where: { id },
    });

    if (!vendor) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested vendor details not found",
      });
    }

    let salt = bcrypt.genSaltSync(10);
    let encryptedPassword = bcrypt.hashSync(new_password, salt);

    const update = await Vendor.update(
      {
        password: encryptedPassword,
        login_attempt: vendor.login_attempt ? vendor.login_attempt + 1 : 1,
      },
      {
        where: { id },
      }
    );

    const updated = await Vendor.findOne({
      where: { id },
    });

    return res.status(200).send({
      success: true,
      data: updated,
      message: "Succesfully changed password, you can proceed to login",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const editPhoneNumber = async (req, res, next) => {
  const { id } = req;
  const { new_phone_number } = req.body;
  try {
    const vendor = await Vendor.findOne({
      where: {
        [Op.or]: [
          { whatsapp_number: new_phone_number },
          { phone_number: new_phone_number },
        ],
      },
    });

    if (vendor) {
      return res.status(400).send({
        success: false,
        data: vendor,
        message:
          "A user with this phone number already exists, please use a different one",
      });
    }

    const currentVendor = await Vendor.findOne({
      where: { id },
    });

    if (!currentVendor) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Requested user not found",
      });
    }

    const update = await Vendor.update(
      {
        new_phone_number,
      },
      {
        where: { id },
      }
    );

    const updated = await Vendor.findOne({
      where: { id },
    });

    const serverGeneratedOTP = generateOTP();

    const cacheDetails = await Cache.create({
      user_details: JSON.stringify(updated),
      cust_no: id,
      generated_otp: serverGeneratedOTP,
      created_by: 1,
    });

    return res.status(200).send({
      success: true,
      data: cacheDetails,
      message: "OTP successfully sent",
    });
  } catch (error) {
    await Cache.destroy({
      where: { cust_no: id },
    });
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const changePhoneNumber = async (req, res, next) => {
  const { otp } = req.body;
  const { id } = req;

  try {
    const vendor = await Vendor.findOne({
      where: { id },
    });

    if (!vendor) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested user not found",
      });
    }

    const cacheDetails = await Cache.findOne({
      where: { cust_no: id },
    });

    if (!cacheDetails) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "No details for current user found",
      });
    }

    if (otp !== cacheDetails.generated_otp) {
      return res.status(400).send({
        success: false,
        data: cacheDetails,
        message: "Please enter correct OTP",
      });
    }

    const vendorDetails = JSON.parse(cacheDetails.user_details);

    await Vendor.update(
      {
        whatsapp_number: vendorDetails.new_phone_number,
      },
      {
        where: { id },
      }
    );

    await Cache.destroy({
      where: { cust_no: id },
    });

    const updated = await Vendor.findOne({
      where: { id },
    });

    return res.status(200).send({
      success: true,
      data: updated,
      message: "Successfully changed phone number of user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const getAllItemsMappedToVendor = async (req, res, next) => {
  const { id } = req;
  try {
    const vendorItems = await VendorItem.findAll({
      where: { vendor_id: id },
    });

    if (vendorItems.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no items mapped to current vendor",
      });
    }

    const promises = vendorItems.map(async (current) => {
      const item = await Item.findOne({
        where: { id: current.item_id },
      });

      const brand = await Brand.findOne({
        where: { id: item.brand_id },
      });

      const category = await Category.findOne({
        where: { id: item.category_id },
      });

      const lowStock = await LowStock.findOne({
        where: { item_id: current.item_id },
      });

      let availableQuantity = 0;
      let isLow = false;
      const batches = await Batch.findAll({
        where: { item_id: current.item_id },
      });

      if (batches.length > 0) {
        batches.map(async (currentBatch) => {
          const currentInventory = await Inventory.findOne({
            where: {
              item_id: current.item_id,
              batch_id: currentBatch.id,
              location_id: 4,
              balance_type: 1,
            },
          });

          if (currentInventory) {
            availableQuantity += currentInventory.quantity;
          }
        });
      }

      if (lowStock) {
        if (availableQuantity <= lowStock.low_stock_qnty) {
          isLow = true;
        }
      }

      let single_item = {
        ...item.dataValues,
        isLow: isLow,
        brandName: brand.brand_name,
        categoryName: category.group_name,
      };

      return {
        single_item,
        isLow,
      };
    });

    const response = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: response,
      message: "Found all items mapped to current vendor",
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
  getVendorProfile,
  editVendorProfile,
  loginVendor,
  forgotPasswordForVendor,
  changeVendorPassword,
  verifyOTPOfVendor,
  editPhoneNumber,
  changePhoneNumber,
  getAllItemsMappedToVendor,
};
