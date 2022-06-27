const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const db = require("../models");

const { generateOTP, sendOTPToPhoneNumber } = require("../services/otpService");

const Customer = db.CustomerModel;

//We should be using a cache to store both of these as global variables can lead to massive memory leaks.
let newUser;
let serverGeneratedOTP;

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
      process.env.JWT_SECRET,
      {
        expiresIn: "24h", //Subject to change
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
    const { firstName, lastName, phoneNumber, email, password } = req.body;

    //Check if all required input is recieved
    if (!phoneNumber || !password || !firstName || !lastName) {
      return res.status(400).send({
        success: false,
        data: null,
        message: "All input is required",
      });
    }

    //Check if user already exists
    const existingCustomer = await Customer.findOne({
      where: { contact_no: phoneNumber },
    });

    //If user already exists, ask them to login
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        data: existingCustomer,
        message: "User already exists, please login!",
      });
    }

    //Hash Password
    const encryptedPassword = bcrypt.hashSync(
      password,
      process.env.PASSWORD_SECRET
    );

    //Create new Customer

    try {
      newUser = await Customer.create({
        cust_name: firstName + " " + lastName,
        email: email ? email.toLowerCase() : null,
        contact_no: phoneNumber,
        password: encryptedPassword,
      });

      serverGeneratedOTP = generateOTP();
      // sendOTPToPhoneNumber(serverGeneratedOTP);

      return res.status(200).send({
        success: true,
        data: {newUser,serverGeneratedOTP},
        message: "Created new user and sent OTP to user entered phone number",
      });
    } catch (error) {
      return res.status(401).send({
        success: false,
        data: error.message,
        message: "Could not create new user and send OTP",
      });
    }

    //Catch other errors and throw them
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: error,
      message: "Could not register user",
    });
  }
};

const verifyOTP = async (req, res, next) => {
  //Get the user entered otp
  const userEnteredOTP = req.body.otp;

  //Compare the entered otp and the generated otp
  if (userEnteredOTP !== parseInt(serverGeneratedOTP)) {

    //reset the OTP
    serverGeneratedOTP = null

    return res.status(401).send({
      success: false,
      data: null,
      message: "OTP entered was incorrect, please enter correct OTP",
    });
  }

  //If the otp entered by the user is the same as the server generated OTP
  //We save the new user to the database and set the newUser and the serverGeneratedOTP to be null again
  try {
  
    const response = await newUser.save();
    
  //Reset the new user and the otp
    newUser = null
    serverGeneratedOTP = null

    return res.status(201).send({
      success: true,
      data: response,
      message: "New user successfully added to the database",

    });
  } catch (error) {
    
  //Reset the new user and the otp
    newUser = null
    serverGeneratedOTP = null

    return res.status(401).send({
      success: false,
      data: error.message,
      message:
        "Could not add the new user to the database, please check data field for more details",
    });
  }



};
const forgotPassword = async (req, res, next) => {

  //Get Phone number of user

  const {phoneNumber} = req.body

  //Check if the phone number exists
};

const resendToken = async (req, res, next) => {};

const verifyToken = async (req, res, next) => {};

const changePassword = async (req, res, next) => {};

module.exports = {
  login,
  register,
  verifyOTP,
  forgotPassword,
  resendToken,
  verifyToken,
  changePassword,
};
