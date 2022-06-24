const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const db = require("../models")

const Customer = db.CustomerModel;

//Password field will be added to the t_customer table

const login = async (req, res, next) => {

  //Get currentUser from JWT
  //const currentUser = req.cust_no

  //Get the user details from the form

  const { phoneNumber, password } = req.body;

  try {
    //Check if customer exists
    const currentCustomer = await Customer.findOne({
      where: { contact_no: phoneNumber },
    });
    //If customer doesnt exist, break login flow and ask to register
    if (!currentCustomer) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User does not exist, please register",
      });
    }
    //If current customer exists, check password against contact number entered
    //If passwords dont match, send error to write correct password
    if (!bcrypt.compareSync(password, currentCustomer.password)) {
      return res.status(401).json({
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
        expiresIn: "2h", //Subject to change
      }
    );

    console.log(token);

    //Send response with the token in the data field
    return res.status(200).json({
      success: true,
      data: {
        token : token,
        user : currentCustomer,
      },
      message: "Successful Login",
    });

    //After successful login, frontend will redirect to some page
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: error,
      message: "Could not login user, something went wrong",
    });
  }
};


const register = async (req, res, next) => {
  try {
    //Get the user details from the form
    const { firstName, lastName, phoneNumber, email, password } = req.body;

    //Check if all required input is recieved
    if (!phoneNumber || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "All input is required",
      });
    }

    //Check if user already exists
    const existingCustomer = await Customer.findAll({
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

    //If user does not exist, we will verify the phone number
    //verification of OTP will go here

    //Hash Password
    const encryptedPassword = bcrypt.hashSync(
      password,
      process.env.PASSWORD_SECRET
    );

    //Create new Customer
    const newCustomer = {
      cust_name: first_name + " " + last_name,
      email: email ? email.toLowerCase() : null,
      contact_no: phone_number,
      password: encryptedPassword,
    };

    try {
      //Add new customer to database
      const result = await Customer.create(newCustomer);
      console.log(result);
      res.status(201).json({
        success: true,
        data: newCustomer,
        message: "Successfully added new customer to database",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        data: error,
        message: "Error while adding new customer to database",
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
  const enteredOtp = req.body.otp;

  //Compare the entered otp and the generated otp
  
};
const forgotPassword = async (req, res, next) => {
  //Ask to enter number and send OTP to that number
  //Once done, can send a response back to frontend, when the frontend recieves that response, can redirect user to change password page

 
};

const resendToken = async (req, res, next) => {};

const verifyToken = async (req,res,next) => {};

const changePassword = async (req,res,next) => {};

module.exports = {
  login,
  register,
  verifyOTP,
  forgotPassword,
  resendToken,
  verifyToken,
  changePassword
};
