const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const referralCodeGenerator = require("referral-code-generator");
const bcrypt = require("bcryptjs");
const uniqid = require("uniqid");
const axios = require("axios");
const { optIn, optOut } = require("../services/whatsapp/optInOut");
const { sendOTPToWhatsapp } = require("../services/whatsapp/whatsapp");
const { sendRegistrationEmail } = require("../services/mail/mailService");
const db = require("../models");

const { generateOTP, sendOTPToPhoneNumber } = require("../services/otpService");

const {
  sendFirstCouponToUser,
} = require("../services/whatsapp/whatsappMessages");

const Customer = db.CustomerModel;
const Cache = db.CacheModel;
const Coupon = db.CouponsModel;
const wallet = db.WalletModel;

const login = async (req, res, next) => {
  //Get the user details from the form along with captcha
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
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      referral_code,
      opt_in,
      recaptchaEnteredByUser,
    } = req.body;
    let referrer_cust_id = "";
    //Check if all required input is recieved
    if (!phoneNumber || !password || !firstName || !lastName) {
      return res.status(400).send({
        success: false,
        data: null,
        message: "All input is required",
      });
    }

    //verify captcha, if success, continue else return from here
    // const responseFromGoogle = await axios.post(
    //   `https://www.google.com/recaptcha/api/siteverify?secret=6Lf2mZohAAAAAOv_tii4pRcP29HpX1HS8wCjumg6&response=${recaptchaEnteredByUser}`
    // );

    // if (responseFromGoogle.data.success == false) {
    //   return res.status(400).send({
    //     success: false,
    //     data: responseFromGoogle.data,
    //     message: "Please enter captcha",
    //   });
    // }

    console.log(firstName, lastName, password, email, phoneNumber);

    //Check if user already exists and is registered for ecomm

    const existingCustomerRegisteredForEcomm = await Customer.findOne({
      where: { contact_no: phoneNumber, registered_for_ecomm: 1 },
    });

    //If user already exists, ask them to login
    if (existingCustomerRegisteredForEcomm) {
      console.log("Current customer already registered for ecomm");
      return res.status(409).send({
        success: false,
        data: existingCustomerRegisteredForEcomm,
        message: "User already exists, please login!",
      });
    }

    const existingCustomerNotRegisteredForEcomm = await Customer.findOne({
      where: { contact_no: phoneNumber, registered_for_ecomm: null },
    });

    let salt = bcrypt.genSaltSync(10);
    //Hash Password
    let encryptedPassword = bcrypt.hashSync(password, salt);

    // check referral code valid or not

    try {
      if (referral_code != "") {
        const referrer_customer = await Customer.findOne({
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
          referrer_cust_id = referrer_customer.dataValues.cust_no;
        }
      }

      //Create new Customer
      try {
        let ref_code =
          referralCodeGenerator.alpha("uppercase", 2) +
          "-" +
          referralCodeGenerator.alpha("uppercase", 1) +
          referralCodeGenerator.alphaNumeric("uppercase", 1, 4);

        let newUser = null;

        if (existingCustomerNotRegisteredForEcomm) {
          console.log("Not registered for ecomm yet but existing");
          newUser = {
            id: existingCustomerNotRegisteredForEcomm.id,
            cust_no: existingCustomerNotRegisteredForEcomm.cust_no,
            active_ind: "Y",
            cust_name: firstName + " " + lastName,
            email: email ? email.toLowerCase() : null,
            contact_no: phoneNumber.toString(),
            password: encryptedPassword,
            created_by: 13,
            referral_code: ref_code,
            referred_by: referrer_cust_id,
            opt_in,
          };
        } else {
          console.log("New Customer");

          // opt in the user number for sending otp purpose
          const response = await Promise.resolve(
            optIn("91" + phoneNumber.toString())
          );
          if (response != 202)
            return res.status(400).send({
              success: false,
              data: "",
              message: "error occured while opt in whatsapp number",
            });
          // that's it

          newUser = {
            id: Math.floor(Math.random() * 10000 + 1),
            cust_no: uniqid(),
            active_ind: "Y",
            cust_name: firstName + " " + lastName,
            email: email ? email.toLowerCase() : null,
            contact_no: phoneNumber.toString(),
            password: encryptedPassword,
            created_by: 13,
            referral_code: ref_code,
            referred_by: referrer_cust_id,
            opt_in,
          };
        }

        const serverGeneratedOTP = generateOTP();
        // sendOTPToPhoneNumber(serverGeneratedOTP);

        try {
          const response = await Cache.create({
            cust_no: newUser.cust_no,
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
          await Cache.destroy({
            where: { cust_no: newUser.cust_no },
          });
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
  } catch (error) {
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
  const { cust_no } = req.body;

  //Compare the entered otp and the generated otp

  try {
    const CacheDetails = await Cache.findOne({
      where: { cust_no },
    });

    if (!cust_no) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter customer number in request body",
      });
    }

    const newUser = await JSON.parse(CacheDetails.user_details);
    const sentOTP = await CacheDetails.generated_otp;

    if (sentOTP !== userEnteredOTP) {
      return res.status(400).send({
        success: false,
        data: null,
        message: "Incorrect OTP entered, please enter correct OTP",
      });
    }

    // console.log("===============", newUser);

    const existingCustomerNotRegisteredForEcomm = await Customer.findOne({
      where: {
        contact_no: newUser.contact_no,
        registered_for_ecomm: null,
      },
    });

    let newCustomer = null;
    if (existingCustomerNotRegisteredForEcomm) {
      console.log("Existing customer not registered for ecomm");
      const updatedExistingCustomer = await Customer.update(
        {
          id: newUser.id,
          cust_no: newUser.cust_no,
          active_ind: newUser.active_ind,
          cust_name: newUser.cust_name,
          email: newUser.email,
          contact_no: newUser.contact_no,
          password: newUser.password,
          created_by: newUser.created_by,
          referral_code: newUser.referral_code,
          referred_by: newUser.referred_by,
          opt_in: newUser.opt_in,
          registered_for_ecomm: 1,
        },
        {
          where: { cust_no: existingCustomerNotRegisteredForEcomm.cust_no },
        }
      );

      newCustomer = await Customer.findOne({
        where: { cust_no: existingCustomerNotRegisteredForEcomm.cust_no },
      });
    } else {
      console.log("New Customer");
      newCustomer = await Customer.create({
        id: newUser.id,
        cust_no: newUser.cust_no,
        active_ind: newUser.active_ind,
        cust_name: newUser.cust_name,
        email: newUser.email,
        contact_no: newUser.contact_no,
        password: newUser.password,
        created_by: newUser.created_by,
        referral_code: newUser.referral_code,
        referred_by: newUser.referred_by,
        opt_in: newUser.opt_in,
        registered_for_ecomm: 1,
      });
    }

    // creating blank wallet while successful reg.
    const new_wallet = await wallet.create({
      wallet_id: uniqid(),
      cust_no: newUser.cust_no,
      balance: 0,
      created_by: 2,
    });

    // send email if available
    if (newUser.email !== null) sendRegistrationEmail(newUser.email.toString());

    // send whatsapp msg if available
    // if (newUser.opt_in == 1)
    // sendRegistrationWhatsapp(newUser.contact_no);

    // creating new coupon while successful reg.
    const newCoupon = await Coupon.create({
      code: "FIRSTBUY",
      amount_of_discount: 10,
      is_percentage: 1,
      assigned_user: newUser.cust_no,
      created_by: 1,
      description: "Flat 10% off on your first purchase, use code FIRSTBUY",
    });

    sendFirstCouponToUser(
      newCustomer.cust_name.split(" ")[0],
      newCustomer.contact_no,
      newCoupon.code
    );

    const deletedField = await Cache.destroy({
      where: { cust_no },
    });

    return res.status(200).send({
      success: true,
      data: {
        created: newCustomer,
        coupon: {
          code: newCoupon.code,
          amount: newCoupon.is_percentage
            ? newCoupon.amount_of_discount + "%"
            : newCoupon.amount_of_discount,
          description: newCoupon.description,
        },
        deletedFromCache: deletedField,
      },
      message: "User successfully validated and registered",
    });
  } catch (error) {
    const deletedField = await Cache.destroy({
      where: { cust_no },
    });
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while validating OTP, please check data field for more details and please register again",
    });
  }
};

const forgotPassword = async (req, res, next) => {
  //Get Phone number of user
  const { phoneNumber } = req.body;

  try {
    //Check if the phone number exists
    const customerExists = await Customer.findOne({
      where: { contact_no: phoneNumber, registered_for_ecomm: 1 },
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
      cust_no: customerExists.cust_no,
      user_details: JSON.stringify(customerExists),
      generated_otp: serverGeneratedOTP,
      created_by: 6,
    });

    return res.status(200).send({
      success: true,
      data: {
        response,
        cust_no: customerExists.cust_no,
      },
      message:
        "OTP successfully sent, validation required, get the otp from the /getToken route route",
    });
  } catch (error) {
    const cacheExists = await Cache.findOne({
      where: { cust_no },
    });

    if (cacheExists) {
      await Cache.destroy({
        where: { cust_no },
      });
    }
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
  const { cust_no } = req.body;

  try {
    const CacheDetails = await Cache.findOne({
      where: { cust_no },
    });
    const serverGeneratedOTP = await CacheDetails.generated_otp;

    console.log(CacheDetails.generated_otp);
    console.log(userEnteredOTP);

    if (serverGeneratedOTP !== userEnteredOTP) {
      return res.status(400).send({
        success: false,
        data: null,
        message: "OTP entered is incorrect, please enter correct OTP",
      });
    }

    return res.status(200).send({
      success: true,
      data: CacheDetails,
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
  const { newPassword, cust_no } = req.body;

  const customer = await Cache.findOne({
    where: { cust_no },
  });
  const customerDetails = JSON.parse(customer.user_details);

  try {
    const currentUser = await Customer.findOne({
      where: { cust_no },
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
          cust_no,
        },
      }
    );

    const deletedField = await Cache.destroy({
      where: { cust_no },
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

  const { cust_no } = req.body;

  if (!cust_no) {
    return res.status(400).send({
      success: false,
      data: [],
      message: "Please enter the cust_no in req.body",
    });
  }

  const CacheDetails = await Cache.findOne({
    where: { cust_no },
  });

  console.log(CacheDetails);
  try {
    if (CacheDetails) {
      let cacheParseData = JSON.parse(CacheDetails.user_details);

      if (
        cacheParseData.new_phone_number !== "" ||
        cacheParseData.new_phone_number !== null
      ) {
        // sending OTP to whatsapp for now.
        sendOTPToWhatsapp(
          cacheParseData.new_phone_number.toString(),
          await CacheDetails.generated_otp
        );
        console.log(cacheParseData.new_phone_number.toString());
        console.log(cacheParseData.contact_no.toString());
      } else {
        sendOTPToWhatsapp(
          cacheParseData.contact_no.toString(),
          await CacheDetails.generated_otp
        );
      }

      return res.status(200).send({
        success: true,
        data: {
          // user: await JSON.parse(CacheDetails[0].user_details),
          otp: await CacheDetails.generated_otp,
          user: cacheParseData,
          new_phone_number: cacheParseData.new_phone_number
            ? cacheParseData.new_phone_number.toString()
            : null,
          contact_no: cacheParseData.contact_no
            ? cacheParseData.contact_no.toString()
            : null,
        },
        message:
          "OTP generated and user created, waiting to store new user in DB",
      });
    }
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "OTP not generated and sent",
    });
  }
};

const resendToken = async (req, res, next) => {};

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
