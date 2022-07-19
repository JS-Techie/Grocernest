const { AvatarGenerator } = require("random-avatar-generator");

const { uploadToS3, getFromS3 } = require("../services/s3Service");
const { generateOTP, sendOTPToPhoneNumber } = require("../services/otpService");
const db = require("../models");

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
        profileImage: generator.generateRandomAvatar(),
        referral_code: currentUserProfile.referral_code,
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

const uploadProfile = async (req, res, next) => {};

const editProfile = async (req, res, next) => {
  //Get current user from jwt
  const currentUser = req.cust_no;

  //for now, user can only change their name
  const enteredFirstName = req.body.firstName;
  const enteredLastName = req.body.lastName;
  const email = req.body.email;

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
        email: email ? "" : email,
      },
      { where: { cust_no: currentUser } }
    );

    const generator = new AvatarGenerator();

    return res.status(200).send({
      success: true,
      data: {
        updatedProfile,
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
      user_details: JSON.stringify(customerExists),
      generated_otp: serverGeneratedOTP,
      created_by: 6,
    });
    return res.status(200).send({
      success: true,
      data: {
        responseFromCacheTable,
        responseFromCustomerTable,
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
    const cache = await Cache.findAll();
    const serverGeneratedOTP = cache[0].generated_otp;

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
      where: { generated_otp: userEnteredOTP },
    });

    return res.status(200).send({
      success: true,
      data: { updatedPhoneNumber, responseFromCacheTable },
      message: "Successfully updated phone number",
    });
  } catch (error) {
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
