const db = require("../../models");
const uniq = require("uniqid");

const Vendor = db.VendorModel;
//const VendorOrders = db.VendorOrdersModel;

const getAllVendorOrders = async (req, res, next) => {
  try {
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getVendorOrderById = async (req, res, next) => {
  try {
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getVendorOrderByStatus = async (req, res, next) => {
  try {
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getVendorOrdersByVendorId = async (req, res, next) => {
  try {
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const createVendorOrder = async (req, res, next) => {
  try {
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const editStatusOfVendorOrder = async (req, res, next) => {
  try {
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const editVendorOrder = async (req, res, next) => {
  try {
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const deleteVendorOrder = async (req, res, next) => {
  try {
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getAllInvoices = async (req, res, next) => {
  try {
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getInvoiceByOrderId = async (req, res, next) => {
  try {
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const updatePaymentStatus = async (req, res, next) => {
  try {
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

module.exports = {
  getAllVendorOrders,
  getVendorOrderById,
  getVendorOrderByStatus,
  getVendorOrdersByVendorId,
  createVendorOrder,
  editStatusOfVendorOrder,
  editVendorOrder,
  deleteVendorOrder,
  getAllInvoices,
  getInvoiceByOrderId,
  updatePaymentStatus,
};
