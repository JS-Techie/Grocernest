const { AvatarGenerator } = require("random-avatar-generator");

const { uploadToS3, getFromS3 } = require("../services/s3Service");
const db = require("../models");

const Customer = db.CustomerModel;

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
        emailID: currentUserProfile.email,
        contactNumber: currentUserProfile.contact_no,
        profileImage: generator.generateRandomAvatar(),
        referral_code: currentUserProfile.referral_code
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

const uploadProfile = async (req, res, next) => { };

const editProfile = async (req, res, next) => {
  //Get current user from jwt
  const currentUser = req.cust_no;

  //for now, user can only change their name
  const enteredFirstName = req.body.firstName;
  const enteredLastName = req.body.lastName;
 


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
      },
      { where: { cust_no: currentUser } }
    );

    const generator = new AvatarGenerator();

    return res.status(200).send({
      success: true,
      data: {
        customerNumber: currentUserProfile.cust_no,
        customerName: enteredFirstName + " " + enteredLastName,
        emailID: currentUserProfile.email,
        contactNumber: currentUserProfile.contact_no,
        profileImage: generator.generateRandomAvatar(),
        updatedUser: updatedProfile,
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

module.exports = {
  getProfile,
  uploadProfile,
  editProfile,
};
