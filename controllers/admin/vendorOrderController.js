const db = require("../../models");
const uniq = require("uniqid");

const Vendor = db.VendorModel;
const VendorOrders = db.VendorOrdersModel;

const getAllVendorOrders = async (req, res, next) => {};

const getVendorOrderById = async (req, res, next) => {};

const getVendorOrderByStatus = async (req, res, next) => {};

const getVendorOrdersByVendorId = async (req, res, next) => {};

const createVendorOrder = async (req, res, next) => {};

const editStatusOfVendorOrder = async (req, res, next) => {};

const editVendorOrder = async (req, res, next) => {};

const deleteVendorOrder = async (req, res, next) => {};

module.exports = {
  getAllVendorOrders,
  getVendorOrderById,
  getVendorOrderByStatus,
  getVendorOrdersByVendorId,
  createVendorOrder,
  editStatusOfVendorOrder,
  editVendorOrder,
  deleteVendorOrder,
};
