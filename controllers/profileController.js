const fs = require("fs");
const axios = require("axios");

const { uploadToS3, getFromS3 } = require("../services/s3Service");
const db = require("../models");

const Profile = db.ProfileModel;
const Customer = db.CustomerModel;

const getProfile = async (req, res, next) => {
  //Get currentUser from the JWT
  //const currentUser = req.cust_no

  //Find associated profile with currentUser

  try {
    const userProfile = await Profile.findOne({
      where: {
        //cust_no : currentUser,
      },
    });

    //If the profile doesnt exist then return
    if (!userProfile) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Could not find requested profile",
      });
    }

    //Find what s3 has

    //const key = `${currentUser}_profile_image`
    //put key into params for getFromS3()

    const responseFromS3 = await getFromS3();

    return res.status(200).send({
      success: true,
      data: {
        userProfile,
        responseFromS3,
      },
      message: "User profile successfully fetched",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Could not fetch user profile",
    });
  }
};

//refactoring required

const uploadProfile = async (req, res, next) => {
  //Find currentUser from the JWT
  //const currentUser = req.cust_no

  //Get the filename from req.body
  const fileName = req.body.fileName;

  if (fileName !== null) {
    //Get the fileContents from the file
    const fileContents = fs.readFile(fileName);

    //const key = `${currentUser}_profile_image`

    try {
      //Push the image to s3
      const responseFromS3 = await uploadToS3(
        fileContents
        //key
      );
      const currentCustomer = await Customer.findOne({
        where: {
          //cust_no : currentUser
        },
      });
      //   if (currentCustomer.length === 0) {
      //     return res.status(404).send({
      //       success: false,
      //       data: null,
      //       message: "Customer not found",
      //     });
      //   }
      const newProfile = await Profile.create({
        //cust_no : current_user
        cust_name: currentCustomer.name,
        //cust_picture : `${currentUser}_profile_image`
      });

      return res.status(200).send({
        success: true,
        data: {
          responseFromS3,
          newProfile,
        },
        message: "Uploaded image to s3 and created a new profile successfully",
      });
    } catch (error) {
      return res.status(400).send({
        success: false,
        data: error,
        message: "Could not upload image to s3",
      });
    }
  }
};
const editProfile = async (req, res, next) => {
  //Find currentUser from the JWT
  //const currentUser = req.cust_no

  const userProfile = await Profile.findOne({
    where: {
      // cust_no : currentUser
    },
  });

  if (!userProfile) {
    return res.status(404).send({
      success: false,
      data: null,
      message: "Could not fetch user profile",
    });
  }

  const newFileName = req.body.fileName;
  const newFileContent = fs.readFileSync(newFileName);

  //const key = `${currentUser}_profile_image`

  try {
    const responseFromS3 = await uploadToS3(
      newFileContent
      //key
    );

    try {
      const updated = await Profile.update({
        //cust_picture : key
      });

      if (!updated) {
        return res.status(400).send({
          success: false,
          data: null,
          message: "Error occurred during updating",
        });
      }

      const updatedProfile = Profile.findOne({
        where: {
          //cust_no : currentUser
        },
      });

      return res.status(200).send({
        success: true,
        data: updatedProfile,
        message: "profile successfully updated",
      });
    } catch (error) {
      return res.status(400).send({
        success: false,
        data: error,
        message: "could not update user profile",
      });
    }
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "could not upload to s3",
    });
  }
};

module.exports = {
  getProfile,
  uploadProfile,
  editProfile,
};
