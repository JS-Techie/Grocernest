const { AvatarGenerator } = require("random-avatar-generator");
const { generateOTP, sendOTPToPhoneNumber } = require("../services/otpService");
const db = require("../models");
const S3 = require("aws-sdk/clients/s3");
const s3Config = require("../config/s3Config");
const uniqid = require("uniqid");

const s3 = new S3(s3Config);

const Customer = db.CustomerModel;
const Cache = db.CacheModel;

const getProfile = async (req, res, next) => {
  //Get customer id from JWT
  const currentUser = req.cust_no;

  try {
    //Find profile of that user
    const currentUserProfile = await Customer.findOne({
      where: { cust_no: currentUser },
    });

    if (!currentUserProfile) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Profile for current user could not be found",
      });
    }

    const generator = new AvatarGenerator();

    return res.status(200).send({
      success: true,
      data: {
        customerNumber: currentUserProfile.cust_no,
        customerName: currentUserProfile.cust_name,
        firstName: currentUserProfile.cust_name.split(" ")[0],
        lastName: currentUserProfile.cust_name.split(" ")[1],
        emailID: currentUserProfile.email,
        contactNumber: currentUserProfile.contact_no,
        profileImage: currentUserProfile.image
          ? currentUserProfile.image
          : generator.generateRandomAvatar(),
        referral_code: currentUserProfile.referral_code,
        opt_in: currentUserProfile.opt_in == 1 ? true : false,
      },
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while fetching profile for current user, please check data field for more details",
    });
  }
};

const uploadProfile = async (req, res, next) => {
  //get current user from jwt
  const currentUser = req.cust_no;

  const { base64 } = req.body;

  try {
    const base64Data = new Buffer.from(
      base64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    //const type = base64.split(";")[0].split("/")[1];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `profile/images/${currentUser}.jpeg`,
      Body: base64Data,
      ContentEncoding: "base64",
      ContentType: `image/jpeg`,
    };

    const s3UploadResponse = await s3.upload(params).promise();
    const url = s3UploadResponse.Location;

    await Customer.update(
      {
        image: url,
      },
      {
        where: { cust_no: currentUser },
      }
    );

    return res.status(200).send({
      success: true,
      data: url,
      message: "Uploaded image of user successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while uploading image, please check data field for more details",
    });
  }
};

const editProfile = async (req, res, next) => {
  //Get current user from jwt
  const currentUser = req.cust_no;

  //for now, user can only change their name
  const enteredFirstName = req.body.firstName;
  const enteredLastName = req.body.lastName;
  const email = req.body.email;
  const { base64 } = req.body;

  let url = null;

  if (base64) {
    const base64Data = new Buffer.from(
      base64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    //const type = base64.split(";")[0].split("/")[1];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `profile/images/${currentUser}-${uniqid()}.jpeg`,
      Body: base64Data,
      ContentEncoding: "base64",
      ContentType: `image/jpeg`,
    };

    const s3UploadResponse = await s3.upload(params).promise();
    url = s3UploadResponse.Location;
  }
  try {
    const currentUserProfile = await Customer.findOne({
      where: { cust_no: currentUser },
    });

    if (!currentUserProfile) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "User profile not found",
      });
    }

    const updatedProfile = await Customer.update(
      {
        cust_name: enteredFirstName + " " + enteredLastName,
        email: email ? email : "",
        image: base64
          ? url
          : currentUserProfile.image
          ? currentUserProfile.image
          : null,
      },
      { where: { cust_no: currentUser } }
    );

    return res.status(200).send({
      success: true,
      data: {
        updatedProfile,
        url,
      },
      message: "Details of user updated successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while editing profile, please check data field for more info",
    });
  }
};

const editPhoneNumber = async (req, res, next) => {
  //Get current user from JWT
  const currentUser = req.cust_no;

  const { new_phone_number } = req.body;

  try {
    const customerExists = await Customer.findOne({
      where: { cust_no: currentUser },
    });

    if (!customerExists) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "User not found",
      });
    }

    const serverGeneratedOTP = generateOTP();

    const responseFromCustomerTable = await Customer.update(
      {
        new_phone_number,
      },
      {
        where: { cust_no: currentUser },
      }
    );

    const responseFromCacheTable = await Cache.create({
      cust_no: currentUser,
      user_details: JSON.stringify(customerExists),
      generated_otp: serverGeneratedOTP,
      created_by: 6,
    });
    return res.status(200).send({
      success: true,
      data: {
        responseFromCacheTable,
        responseFromCustomerTable,
        cust_no: currentUser,
      },
      message:
        "OTP successfully sent, validation required, get the otp from the /getToken route route",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const changePhoneNumber = async (req, res, next) => {
  //Get current user from JWT
  const currentUser = req.cust_no;
  const userEnteredOTP = req.body.otp;

  try {
    const cache = await Cache.findOne({
      where: { cust_no: currentUser },
    });

    if (!cache) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "OTP has not been entered in cache yet",
      });
    }
    const serverGeneratedOTP = cache.generated_otp;

    if (userEnteredOTP !== serverGeneratedOTP) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Incorrect OTP entered, please enter correct OTP",
      });
    }

    const response = await Customer.findOne({
      where: { cust_no: currentUser },
    });
    const newPhoneNumber = response.new_phone_number;

    const updatedPhoneNumber = await Customer.update(
      { contact_no: newPhoneNumber, new_phone_number: null },
      {
        where: { cust_no: currentUser },
      }
    );

    console.log(updatedPhoneNumber);

    const responseFromCacheTable = await Cache.destroy({
      where: { cust_no: currentUser },
    });

    return res.status(200).send({
      success: true,
      data: { updatedPhoneNumber, responseFromCacheTable },
      message: "Successfully updated phone number",
    });
  } catch (error) {
    const responseFromCacheTable = await Cache.destroy({
      where: { cust_no: currentUser },
    });
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while validating OTP, please check data field for more details",
    });
  }
};

module.exports = {
  getProfile,
  uploadProfile,
  editProfile,
  editPhoneNumber,
  changePhoneNumber,
};
