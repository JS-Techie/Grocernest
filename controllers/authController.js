const jwt = require("jsonwebtoken");
const referralCodeGenerator = require('referral-code-generator')
const bcrypt = require("bcryptjs");
const uniqid = require("uniqid");

const db = require("../models");

const { generateOTP, sendOTPToPhoneNumber } = require("../services/otpService");

const Customer = db.CustomerModel;
const Cache = db.CacheModel;

const login = async (req, res, next) => {
  //Get the user details from the form
  const { phoneNumber, password } = req.body;

  try {
    //Check if customer exists
    const currentCustomer = await Customer.findOne({
      where: { contact_no: phoneNumber },
    });

    console.log(currentCustomer);
    //If customer doesnt exist, break login flow and ask to register
    if (!currentCustomer) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "User does not exist, please register",
      });
    }
    //If current customer exists, check password against contact number entered
    //If passwords dont match, send error to write correct password
    if (!bcrypt.compareSync(password, currentCustomer.password)) {
      return res.status(401).send({
        success: false,
        data: null,
        message: "Please enter correct password for phone number entered",
      });
    }

    //Get customer details from currentCustomer
    const { cust_no, cust_name, contact_no } = currentCustomer;

    //If passwords match, user can be logged in, so we generate token

    const token = jwt.sign(
      {
        contact_no,
        cust_name,
        cust_no,
      },
      "hello hello hello",
      {
        expiresIn: "300d", //Subject to change
      }
    );

    console.log(token);

    //Send response with the token in the data field
    return res.status(200).send({
      success: true,
      data: {
        token: token,
        currentUser: currentCustomer,
      },
      message: "Successful Login",
    });

    //After successful login, frontend will redirect to some page
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Could not login user, check data field for error message",
    });
  }
};

const register = async (req, res, next) => {
  try {
    //Get the user details from the form
    const { firstName, lastName, phoneNumber, email, password, referral_code } = req.body;
    let referrer_cust_id = "";
    //Check if all required input is recieved
    if (!phoneNumber || !password || !firstName || !lastName) {
      return res.status(400).send({
        success: false,
        data: null,
        message: "All input is required",
      });
    }

    console.log(firstName, lastName, password, email, phoneNumber);

    //Check if user already exists
    const existingCustomer = await Customer.findOne({
      where: { contact_no: phoneNumber },
    });

    //If user already exists, ask them to login
    if (existingCustomer) {
      return res.status(409).send({
        success: false,
        data: existingCustomer,
        message: "User already exists, please login!",
      });
    }

    let salt = bcrypt.genSaltSync(10);
    //Hash Password
    let encryptedPassword = bcrypt.hashSync(password, salt);

    // check referel code valid or not

    try {
      if (referral_code != "") {
        const referrer_customer = await Customer.findOne(
          {
            attributes: ["cust_no"],
            where: { referral_code: referral_code },
          });

        if (!referrer_customer) {
          return res.status(404).send({
            success: false,
            data: null,
            message: "Referral code is not valid",
          });
        } else {
          referrer_cust_id = referrer_customer.dataValues.cust_no
        }
      }


      //Create new Customer
      try {
        let ref_code = referralCodeGenerator.alpha('uppercase', 2) + "-" + referralCodeGenerator.alpha('uppercase', 1) + referralCodeGenerator.alphaNumeric('uppercase', 1, 4)
        const newUser = {
          id: Math.floor(Math.random() * 10000 + 1),
          cust_no: uniqid(),
          active_ind: "Y",
          cust_name: firstName + " " + lastName,
          email: email ? email.toLowerCase() : null,
          contact_no: phoneNumber.toString(),
          password: encryptedPassword,
          created_by: 13,
          referral_code: ref_code,
          referred_by: referrer_cust_id
        };

        const serverGeneratedOTP = generateOTP();
        // sendOTPToPhoneNumber(serverGeneratedOTP);

        try {
          const response = await Cache.create({
            user_details: JSON.stringify(newUser),
            generated_otp: serverGeneratedOTP,
            created_by: 6, //hardcoded for now
          });

          return res.status(200).send({
            success: true,
            data: {
              newUser,
              response,
            },
            message:
              "User created and OTP successfully sent, find the OTP from getOTP route",
          });
        } catch (error) {
          return res.status(400).send({
            success: false,
            data: error.message,
            message:
              "Could not store the user and OTP in cache, check data field for more details",
          });
        }
      } catch (error) {
        return res.status(401).send({
          success: false,
          data: error.message,
          message: "Could not create new user and send OTP",
        });
      }
      //Catch other errors and throw them
    } catch (error) {
      return res.status(400).send({
        success: false,
        data: error.message,
        message: "Could not register user",
      });
    }
  }
  catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Could not register user",
    });
  }
};

const verifyOTP = async (req, res, next) => {
  //Get the user entered otp
  const userEnteredOTP = req.body.otp;

  //Compare the entered otp and the generated otp

  try {
    const CacheDetails = await Cache.findAll();

    const newUser = await JSON.parse(CacheDetails[0].user_details);
    const sentOTP = await CacheDetails[0].generated_otp;

    if (sentOTP !== userEnteredOTP) {
      return res.status(400).send({
        success: false,
        data: null,
        message: "Incorrect OTP entered, please enter correct OTP",
      });
    }

    const response = await Customer.create({
      id: newUser.id,
      cust_no: newUser.cust_no,
      active_ind: newUser.active_ind,
      cust_name: newUser.cust_name,
      email: newUser.email,
      contact_no: newUser.contact_no,
      password: newUser.password,
      created_by: newUser.created_by,
      referral_code: newUser.referral_code,
      referred_by: newUser.referred_by
    });

    const deletedField = await Cache.destroy({
      where: { generated_otp: userEnteredOTP },
    });

    return res.status(200).send({
      success: true,
      data: {
        created: response,
        deletedFromCache: deletedField,
      },
      message: "User successfully validated and registered",
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

const forgotPassword = async (req, res, next) => {
  //Get Phone number of user
  const { phoneNumber } = req.body;

  try {
    //Check if the phone number exists
    const customerExists = await Customer.findOne({
      where: { contact_no: phoneNumber },
    });

    console.log(customerExists);

    if (!customerExists) {
      return res.status(404).send({
        sucess: false,
        data: null,
        message: "The phone number is not registered, please register",
      });
    }

    //sendOTP to phone number
    const serverGeneratedOTP = generateOTP();
    //sendOTPToPhoneNumber(serverGeneratedOTP)

    const response = await Cache.create({
      user_details: JSON.stringify(customerExists),
      generated_otp: serverGeneratedOTP,
      created_by: 6,
    });

    return res.status(200).send({
      success: true,
      data: response,
      message:
        "OTP successfully sent, validation required, get the otp from the /getToken route route",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Error occured while sending OTP or getting phone number, check data field for more details",
    });
  }
};

const verifyToken = async (req, res, next) => {
  //get the user entered OTP
  const userEnteredOTP = req.body.otp;

  try {
    const CacheDetails = await Cache.findAll();
    const serverGeneratedOTP = await CacheDetails[0].generated_otp;

    if (serverGeneratedOTP !== userEnteredOTP) {
      return res.status(400).send({
        success: false,
        data: null,
        message: "OTP entered is incorrect, please enter correct OTP",
      });
    }

    return res.status(200).send({
      success: true,
      data: JSON.parse(CacheDetails[0].user_details),
      message:
        "OTP successfully validated, user can proceed to change password",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while validating OTP, check data field for more details",
    });
  }
};

const changePassword = async (req, res, next) => {
  //Get the customer number from the body
  const { newPassword } = req.body;
  const customer = await Cache.findAll();
  const customerDetails = JSON.parse(customer[0].user_details);

  const customerNumber = customerDetails.cust_no;

  try {
    const currentUser = await Customer.findOne({
      where: { cust_no: customerNumber },
    });

    if (!currentUser) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "User for whom password has to be changed not found",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const encryptedPassword = bcrypt.hashSync(newPassword, salt);

    const updatedUser = await Customer.update(
      {
        password: encryptedPassword,
      },
      {
        where: {
          cust_no: customerNumber,
        },
      }
    );

    const deletedField = await Cache.destroy({
      where: { generated_otp: customer[0].generated_otp },
    });

    return res.status(200).send({
      success: true,
      data: {
        updatedUser,
        deletedField,
      },
      message: "Password successfully changed, user can now proceed to login",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while changing password, please check data field for more details",
    });
  }
};

const getOTP = async (req, res, next) => {
  //For testing purposes
  const CacheDetails = await Cache.findAll();

  if (CacheDetails.length !== 0) {
    return res.status(200).send({
      success: true,
      data: {
        // user: await JSON.parse(CacheDetails[0].user_details),
        otp: await CacheDetails[0].generated_otp,
      },
      message:
        "OTP generated and user created, waiting to store new user in DB",
    });
  }

  return res.status(400).send({
    success: false,
    data: null,
    message: "OTP not generated and sent",
  });
};

const resendToken = async (req, res, next) => { };

module.exports = {
  login,
  register,
  verifyOTP,
  forgotPassword,
  resendToken,
  verifyToken,
  changePassword,
  getOTP,
};
