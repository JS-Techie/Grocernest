const db = require("../../models");

const S3 = require("aws-sdk/clients/s3");
const s3Config = require("../../config/s3Config");

const Vendor = db.VendorModel;
const VendorOrder = db.VendorOrderModel;

const s3 = new S3(s3Config);

const getVendorProfile = async (req, res, next) => {};

const editVendorProfile = async (req, res, next) => {};

const loginVendor = async (req, res, next) => {};

const forgotPasswordForVendor = async (req, res, next) => {};

const changeVendorPassword = async (req, res, next) => {};

const verifyOTPOfVendor = async (req, res, next) => {};

module.exports = {
  getVendorProfile,
  editVendorProfile,
  loginVendor,
  forgotPasswordForVendor,
  changeVendorPassword,
  verifyOTPOfVendor,
};
